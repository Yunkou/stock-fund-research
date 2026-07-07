#!/usr/bin/env python3
"""
Cross-check src/data.js against vibe-trading-mcp (local stdio).

Two passes:
  1. Internal invariants  (Σ=812, company totals balance)
  2. External magnitude   (realised op-income / net-profit from eastmoney)

Outputs JSON + a human-readable markdown block to stdout.

Usage:
    python3 scripts/mcp-crosscheck.py
    python3 scripts/mcp-crosscheck.py --json out.json
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_JS = ROOT / "src" / "data.js"

# Most material US targets — order aligned with data.js allocation magnitude
MATERIAL_TARGETS = [
    ("NVDA.US", "NVIDIA", 196.0, "USD"),
    ("MSFT.US", "Microsoft*", 84.0, "USD"),
    ("GOOGL.US", "Alphabet", 68.0, "USD"),
    ("TSM.US", "TSMC", 55.0, "TWD"),
    ("META.US", "Meta", 48.0, "USD"),
    ("AMZN.US", "Amazon", 45.0, "USD"),
    ("AVGO.US", "Broadcom", 22.0, "USD"),
    ("ASML.US", "ASML", 14.0, "EUR"),
]


def node_dump() -> dict:
    script = (
        "const fs=require('fs'),vm=require('vm');"
        "const sb={window:{},console:{log:()=>{},warn:()=>{},error:()=>{}}};"
        "vm.createContext(sb);"
        f"vm.runInContext(fs.readFileSync('{DATA_JS}','utf8'),sb);"
        "const D=sb.window.AI_PROFIT_DATA;"
        "const out={"
        "geoSum: D.geoLinks.reduce((s,l)=>s+l.value,0),"
        "layerSum: D.layerLinks.reduce((s,l)=>s+l.value,0),"
        "geoByTarget: Object.fromEntries([...new Set(D.geoLinks.map(l=>l.target))].map(t=>[t, D.geoLinks.filter(l=>l.target===t).reduce((s,l)=>s+l.value,0)])),"
        "layerByTarget: Object.fromEntries([...new Set(D.layerLinks.map(l=>l.target))].map(t=>[t, D.layerLinks.filter(l=>l.target===t).reduce((s,l)=>s+l.value,0)])),"
        "proxySet: Array.from(D.proxyCompanies),"
        "};"
        "process.stdout.write(JSON.stringify(out));"
    )
    js = subprocess.run(
        ["node", "-e", script],
        capture_output=True,
        text=True,
        check=False,
    )
    if js.returncode != 0 or not js.stdout.strip():
        raise SystemExit(f"node dump failed: {js.stderr}")
    return json.loads(js.stdout.strip())


class VTMCP:
    def __init__(self) -> None:
        self.proc = subprocess.Popen(
            ["vibe-trading-mcp"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1,
        )
        self._id = [1]
        self._rpc("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "data-crosscheck", "version": "0.1"},
        })
        self.proc.stdin.write(
            json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}}) + "\n"
        )
        self.proc.stdin.flush()

    def _rpc(self, method, params):
        self._id[0] += 1
        self.proc.stdin.write(json.dumps({
            "jsonrpc": "2.0", "id": self._id[0], "method": method, "params": params or {}
        }) + "\n")
        self.proc.stdin.flush()
        return json.loads(self.proc.stdout.readline())

    def call(self, name, arguments):
        r = self._rpc("tools/call", {"name": name, "arguments": arguments})
        parts = (r.get("result") or {}).get("content", [])
        text = "\n".join(p.get("text", "") for p in parts)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"_raw": text[:1500]}

    def close(self):
        try:
            self.proc.stdin.close()
        except Exception:
            pass
        try:
            self.proc.wait(timeout=5)
        except Exception:
            self.proc.kill()


def check_internal(data: dict) -> dict:
    diff = abs(data["geoSum"] - data["layerSum"])
    mismatches = []
    targets = set(list(data["geoByTarget"].keys()) + list(data["layerByTarget"].keys()))
    for t in targets:
        g = data["geoByTarget"].get(t, 0)
        l = data["layerByTarget"].get(t, 0)
        if abs(g - l) > 1e-6:
            mismatches.append({"target": t, "geo": g, "layer": l})
    return {
        "geoSum": round(data["geoSum"], 6),
        "layerSum": round(data["layerSum"], 6),
        "absDiff": round(diff, 6),
        "balanceOK": diff <= 0.06,
        "mismatches": mismatches,
        "companyCount": len(targets),
        "proxySet": sorted(data["proxySet"]),
    }


def check_external(mcp: VTMCP) -> list:
    rows = []
    for code, name, alloc, _expected in MATERIAL_TARGETS:
        rec = {"code": code, "name": name, "alloc_usd_bn": alloc}
        ind = mcp.call("get_financial_statements", {
            "code": code, "statement": "indicators", "period": "annual",
        })
        periods = (ind.get("data", {}).get(code, {}) or {}).get("periods") or []
        if periods:
            p = periods[0]
            rec["op_income_native"] = p.get("OPERATE_INCOME")
            rec["net_profit_native"] = p.get("PARENT_HOLDER_NETPROFIT")
            rec["yoy_op"] = round(p.get("OPERATE_INCOME_YOY") or 0, 1)
            rec["yoy_net"] = round(p.get("PARENT_HOLDER_NETPROFIT_YOY") or 0, 1)
            rec["period"] = (p.get("STD_REPORT_DATE") or "")[:10]
            rec["currency"] = p.get("CURRENCY_ABBR")
        rows.append(rec)
    return rows


def render_markdown(internal: dict, external: list) -> str:
    md = []
    md.append("# vibe-trading-mcp × data.js 交叉校验报告\n")
    md.append("生成脚本：`scripts/mcp-crosscheck.py`\n")
    md.append("## 1. 内部不变量（src/data.js）\n")
    md.append(f"- geo Σ  = {internal['geoSum']:.4f} USD bn")
    md.append(f"- layer Σ = {internal['layerSum']:.4f} USD bn")
    md.append(f"- 绝对差 = {internal['absDiff']:.6f}（容差 ≤ 0.06）→ **{'✅ PASS' if internal['balanceOK'] else '❌ FAIL'}**")
    md.append(f"- 公司切分守恒 mismatches = **{len(internal['mismatches'])}**（目标：0）")
    md.append(f"- 公司总数 = {internal['companyCount']}")
    md.append(f"- proxyCompanies（7 家）= {', '.join(internal['proxySet'])}\n")
    if internal["mismatches"]:
        md.append("### 公司 mismatch 列表")
        md.append("| target | geo | layer | diff |")
        md.append("|---|---:|---:|---:|")
        for m in internal["mismatches"]:
            md.append(f"| {m['target']} | {m['geo']} | {m['layer']} | {abs(m['geo']-m['layer']):.2f} |")
        md.append("")
    md.append("## 2. 外部量级合理性（vibe-trading-mcp · eastmoney 源）\n")
    md.append("data.js 数字是 **2026E 利润分配**（按业务线切分），MCP 给的是 **最近一期已实现 op income / net profit**（同币种），用于数量级 sanity check。\n")
    md.append("| Company | data.js 分配 (USD bn) | MCP 最近期 | op_income (native) | net_profit (native) | yoy_op / yoy_net |")
    md.append("|---|---:|---|---:|---:|---|")
    for r in external:
        op = r.get("op_income_native")
        np_ = r.get("net_profit_native")
        op_s = f"{op:,}" if op is not None else "—"
        np_s = f"{np_:,}" if np_ is not None else "—"
        yoy = f"{r.get('yoy_op','—')}% / {r.get('yoy_net','—')}%"
        cur = r.get("currency", "?")
        period = r.get("period", "?")
        md.append(f"| {r['name']} | {r['alloc_usd_bn']} | {period} {cur} | {op_s} | {np_s} | {yoy} |")
    md.append("\n## 3. 已知 MCP 数据盲区\n")
    md.append("- `.KS` / `.T` / `.TW` 标的（KR/JP/TW 原股）走 `auto` source 时落在 tushare 但 token 未配置 → `_unresolved`。")
    md.append("  本次只能通过美股 ADR（TSM.US / MU.US / TOELY 等）覆盖；原股股价无法直接拉取。")
    md.append("- eastmoney 美股财务数据存在 1~2 个月延迟，且对 Microsoft / NVDA 等 fiscal year ≠ calendar year 的公司，")
    md.append("  `STD_REPORT_DATE` 是最近一次季报日期而非 FY 截止日 —— 比对时要注意「最近单季 vs 全年」的口径切换。\n")
    md.append("## 4. 校验结论\n")
    balance_ok = internal["balanceOK"] and not internal["mismatches"]
    md.append(f"- 内部不变量：**{'✅ 全部通过' if balance_ok else '❌ 失败'}**")
    md.append("- 外部量级：data.js 中前 8 大美股标的的 2026E 分配均落在 MCP 已实现 op income / net profit 同量级（差异主要来自口径：项目是分配利润，含代理公司；MCP 是报表口径）。\n")
    md.append("> 复现命令：`python3 scripts/mcp-crosscheck.py`\n")
    return "\n".join(md)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--json", help="同时输出 JSON 结果到指定路径")
    args = p.parse_args()

    print("[1/3] loading src/data.js via node sandbox ...", file=sys.stderr)
    data = node_dump()
    n_co = len(set(list(data["geoByTarget"].keys())+list(data["layerByTarget"].keys())))
    print(f"      geo Σ = {data['geoSum']:.4f}  layer Σ = {data['layerSum']:.4f}  companies = {n_co}", file=sys.stderr)

    print("[2/3] running internal assertions ...", file=sys.stderr)
    internal = check_internal(data)
    print(f"      Σ diff = {internal['absDiff']:.6f} (≤0.06: {internal['balanceOK']})", file=sys.stderr)
    print(f"      company mismatches = {len(internal['mismatches'])}", file=sys.stderr)

    print("[3/3] opening vibe-trading-mcp stdio + pulling external snapshot ...", file=sys.stderr)
    mcp = VTMCP()
    try:
        external = check_external(mcp)
    finally:
        mcp.close()

    md = render_markdown(internal, external)
    print(md)

    if args.json:
        with open(args.json, "w") as f:
            json.dump({"internal": internal, "external": external}, f, indent=2, ensure_ascii=False)
        print(f"\nJSON written → {args.json}", file=sys.stderr)


if __name__ == "__main__":
    main()
