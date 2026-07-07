// ============================================================
// ticker-link.js — 股票代码 → 多源 K 线 / 个股页 URL 转换
// ============================================================
// 数据源（已 curl -L 验证 200，覆盖 A 股 SH/SZ + 港股 HK 4-5 位）：
//   雪球      https://xueqiu.com/S/SH600988  | .../SZ002156  | .../00700 | .../02498
//   东方财富  https://quote.eastmoney.com/sh600988.html  | sz002156.html  | hk/00700.html  | hk/02498.html
//   同花顺    http://stockpage.10jqka.com.cn/600988/  | 002156/  | 0700/  | 02498/
//
// 设计原则：
//   - 三源并列注册到 TICKER_BROKERS，单点 ticker 跳默认 broker（雪球）
//   - 全局共享一个 context menu DOM，避免每个 <a> 复制 DOM
//   - 桌面端 contextmenu / 移动端 long-press 触发；Esc / 点外 / 滚动自动关闭
//
// 暴露：
//   window.xueqiuUrl(ticker)        → string | null
//   window.eastmoneyUrl(ticker)     → string | null
//   window.tonghuashunUrl(ticker)   → string | null
//   window.tickerUrl(broker, ticker) → string | null
//   window.initTickerContextMenu()   → 绑定全局 context menu（幂等）
// ============================================================

(function () {
  'use strict';

  // ── URL 转换器（纯函数） ──────────────────────────────
  function xueqiuUrl(ticker) {
    if (typeof ticker !== 'string') return null;
    const m = /^(\d{4,6})\.(SH|SZ|HK)$/.exec(ticker.trim());
    if (!m) return null;
    const code = m[1], market = m[2];
    if (market === 'HK') return `https://xueqiu.com/S/${code}`;
    return `https://xueqiu.com/S/${market}${code}`;
  }

  function eastmoneyUrl(ticker) {
    if (typeof ticker !== 'string') return null;
    const m = /^(\d{4,6})\.(SH|SZ|HK)$/.exec(ticker.trim());
    if (!m) return null;
    const code = m[1], market = m[2];
    if (market === 'HK') return `https://quote.eastmoney.com/hk/${code.padStart(5, '0')}.html`;
    return `https://quote.eastmoney.com/${market.toLowerCase()}${code}.html`;
  }

  function tonghuashunUrl(ticker) {
    if (typeof ticker !== 'string') return null;
    const m = /^(\d{4,6})\.(SH|SZ|HK)$/.exec(ticker.trim());
    if (!m) return null;
    return `http://stockpage.10jqka.com.cn/${m[1]}/`;
  }

  // ── Broker registry ────────────────────────────────────
  const TICKER_BROKERS = [
    { id: 'xueqiu',      label: '雪球',      fn: xueqiuUrl,        default: true },
    { id: 'eastmoney',   label: '东方财富',  fn: eastmoneyUrl },
    { id: 'tonghuashun', label: '同花顺',    fn: tonghuashunUrl },
  ];

  function tickerUrl(broker, ticker) {
    const b = TICKER_BROKERS.find(x => x.id === broker);
    return b ? b.fn(ticker) : null;
  }

  function defaultBroker() {
    return TICKER_BROKERS.find(b => b.default) || TICKER_BROKERS[0];
  }

  // ── Context Menu（全局共享 DOM） ─────────────────────
  let menuEl = null;
  let currentAnchor = null;  // 当前打开菜单对应的 <a.ticker-link>

  function ensureMenu() {
    if (menuEl) return menuEl;
    menuEl = document.createElement('div');
    menuEl.className = 'ticker-context-menu';
    menuEl.setAttribute('role', 'menu');
    menuEl.hidden = true;
    menuEl.innerHTML = `
      <div class="tcm-header">在以下行情源查看</div>
      ${TICKER_BROKERS.map(b => `
        <button type="button" class="tcm-item" role="menuitem" data-broker="${b.id}">
          <span class="tcm-label">${b.label}${b.default ? ' <span class="tcm-default">默认</span>' : ''}</span>
          <span class="tcm-host"></span>
        </button>
      `).join('')}
      <div class="tcm-footer">右键 / 长按 ticker 触发</div>
    `;
    document.body.appendChild(menuEl);

    // 菜单项点击 → 新窗口打开
    menuEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.tcm-item');
      if (!btn || !currentAnchor) return;
      const broker = btn.dataset.broker;
      const ticker = currentAnchor.dataset.ticker;
      const url = tickerUrl(broker, ticker);
      if (url) {
        window.open(url, '_blank', 'noopener');
      }
      hideMenu();
    });

    return menuEl;
  }

  function showMenu(anchor, x, y) {
    const m = ensureMenu();
    currentAnchor = anchor;
    const ticker = anchor.dataset.ticker;
    // 填每个菜单项的 host 预览
    m.querySelectorAll('.tcm-item').forEach(btn => {
      const url = tickerUrl(btn.dataset.broker, ticker);
      const hostEl = btn.querySelector('.tcm-host');
      if (url) {
        try {
          hostEl.textContent = '· ' + new URL(url).host.replace(/^www\./, '');
        } catch (_) { hostEl.textContent = ''; }
      } else {
        hostEl.textContent = '· 不支持';
        btn.disabled = true;
      }
    });
    // 默认 broker 高亮
    const def = defaultBroker();
    m.querySelectorAll('.tcm-item').forEach(btn => {
      btn.classList.toggle('is-default', btn.dataset.broker === def.id);
    });

    m.hidden = false;
    // 定位：避免溢出视口
    const rect = m.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const px = (x + rect.width  > vw) ? x - rect.width  : x;
    const py = (y + rect.height > vh) ? y - rect.height : y;
    m.style.left = Math.max(4, px) + 'px';
    m.style.top  = Math.max(4, py) + 'px';
  }

  function hideMenu() {
    if (menuEl) menuEl.hidden = true;
    currentAnchor = null;
  }

  // 长按检测（移动端）
  let pressTimer = null;
  let pressStart = null;

  function clearPress() {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    pressStart = null;
  }

  // ── 全局事件绑定（幂等） ──────────────────────────────
  let bound = false;
  function initTickerContextMenu() {
    if (bound) return;
    bound = true;

    // 桌面：contextmenu
    document.addEventListener('contextmenu', (e) => {
      const a = e.target.closest('a.ticker-link');
      if (!a || !a.dataset.ticker) return;
      e.preventDefault();
      showMenu(a, e.clientX, e.clientY);
    });

    // 移动端：long-press（500ms，touch 起点偏移 < 10px 才算 press）
    document.addEventListener('touchstart', (e) => {
      const a = e.target.closest('a.ticker-link');
      if (!a || !a.dataset.ticker) return;
      const t = e.touches[0];
      pressStart = { x: t.clientX, y: t.clientY, anchor: a };
      pressTimer = setTimeout(() => {
        if (pressStart) {
          showMenu(pressStart.anchor, pressStart.x, pressStart.y);
          clearPress();
        }
      }, 500);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!pressStart) return;
      const t = e.touches[0];
      if (Math.hypot(t.clientX - pressStart.x, t.clientY - pressStart.y) > 10) {
        clearPress();
      }
    }, { passive: true });

    document.addEventListener('touchend', clearPress);
    document.addEventListener('touchcancel', clearPress);

    // 全局关闭：Esc / 点外 / 滚动 / 窗口尺寸变化
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideMenu(); });
    document.addEventListener('click', (e) => {
      if (!menuEl || menuEl.hidden) return;
      if (e.target.closest('.ticker-context-menu')) return;
      hideMenu();
    }, true);
    document.addEventListener('scroll', hideMenu, true);
    window.addEventListener('resize', hideMenu);
    window.addEventListener('blur', hideMenu);
  }

  // ── 暴露 ──────────────────────────────────────────────
  window.xueqiuUrl = xueqiuUrl;
  window.eastmoneyUrl = eastmoneyUrl;
  window.tonghuashunUrl = tonghuashunUrl;
  window.tickerUrl = tickerUrl;
  window.TICKER_BROKERS = TICKER_BROKERS;
  window.initTickerContextMenu = initTickerContextMenu;
})();
