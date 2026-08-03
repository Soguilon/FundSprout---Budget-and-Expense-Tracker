/* ==========================================================================
   FundSprout — Utilities
   ========================================================================== */

const Utils = {
  currency() { return DB.data.settings.currency || '₱'; },

  formatMoney(n, opts = {}) {
    const num = Number(n) || 0;
    const sign = opts.forceSign && num > 0 ? '+' : '';
    const abs = Math.abs(num);
    const formatted = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const negSign = num < 0 ? '-' : '';
    return `${sign}${negSign}${this.currency()}${formatted}`;
  },

  formatCompact(n) {
    const num = Number(n) || 0;
    const abs = Math.abs(num);
    if (abs >= 1_000_000) return `${this.currency()}${(num / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${this.currency()}${(num / 1_000).toFixed(1)}K`;
    return this.formatMoney(num);
  },

  todayISO() {
    return new Date().toISOString().slice(0, 10);
  },

  nowTime() {
    return new Date().toTimeString().slice(0, 5);
  },

  formatDate(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    if (isNaN(d)) return iso;
    const today = this.todayISO();
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (iso === today) return 'Today';
    if (iso === yest) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  },

  formatDateTime(iso, time) {
    return `${this.formatDate(iso)} · ${this.formatTime(time)}`;
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  debounce(fn, wait = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  },

  uid() { return Math.random().toString(36).slice(2, 10); },

  clamp(n, min, max) { return Math.min(Math.max(n, min), max); },

  isValidAmount(v) {
    const n = Number(v);
    return v !== '' && v !== null && v !== undefined && !isNaN(n) && n > 0;
  },

  animateCount(el, from, to, duration = 700, formatter = (v) => Utils.formatMoney(v)) {
    if (!el) return;
    if (!DB.data.settings.animations) {
      el.textContent = formatter(to);
      return;
    }
    const start = performance.now();
    const diff = to - from;
    function tick(now) {
      const progress = Utils.clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = from + diff * eased;
      el.textContent = formatter(val);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = formatter(to);
    }
    requestAnimationFrame(tick);
  },

  startOfWeek(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  },

  inRange(iso, range) {
    const d = new Date(`${iso}T00:00:00`);
    const now = new Date();
    if (range === 'daily') {
      return iso === this.todayISO();
    }
    if (range === 'weekly') {
      const start = this.startOfWeek(new Date());
      start.setHours(0, 0, 0, 0);
      return d >= start;
    }
    if (range === 'monthly') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (range === 'yearly') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  }
};
