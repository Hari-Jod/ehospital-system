// ── UTILITY FUNCTIONS & HELPERS ──

// ── STRING UTILITIES ──
const StrUtils = {
  capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); },
  truncate(str, len = 50) { return str.length > len ? str.substring(0, len) + '...' : str; },
  slug(str) { return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''); },
  highlight(str, query) { const regex = new RegExp(`(${query})`, 'gi'); return str.replace(regex, '<mark>$1</mark>'); }
};

// ── DATE/TIME UTILITIES ──
const DateUtils = {
  today() { return new Date().toISOString().split('T')[0]; },
  tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; },
  daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; },
  format(date, format = 'DD-MM-YYYY') {
    const d = new Date(date);
    return format.replace('DD', String(d.getDate()).padStart(2, '0'))
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('YYYY', d.getFullYear());
  },
  timeFormat(time) { return time ? new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) : time; },
  ago(date) {
    const ms = Date.now() - new Date(date);
    const secs = Math.floor(ms / 1000); if (secs < 60) return secs + 's ago';
    const mins = Math.floor(secs / 60); if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60); if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24); if (days < 7) return days + 'd ago';
    return new Intl.DateTimeFormat('en-IN').format(new Date(date));
  },
  isSameDay(date1, date2) { return new Date(date1).toDateString() === new Date(date2).toDateString(); },
  isToday(date) { return this.isSameDay(date, new Date()); },
  isPast(date) { return new Date(date) < new Date(); },
  isFuture(date) { return new Date(date) > new Date(); }
};

// ── CURRENCY & MONEY ──
const Money = {
  format(amount, currency = '₹') { return currency + ' ' + Number(amount).toLocaleString('en-IN', {minimumFractionDigits: 2}); },
  parse(str) { return parseFloat(str.replace(/[^\d.-]/g, '')); },
  calculate(items, field) { return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0); },
  discount(amount, percent) { return amount - (amount * percent / 100); },
  tax(amount, percent) { return amount * percent / 100; }
};

// ── PHONE & CONTACT ──
const Contact = {
  formatPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 ? `+91 ${digits.substring(0, 5)} ${digits.substring(5)}` : phone;
  },
  isValidPhone(phone) { return /^[0-9]{10}$/.test(phone.replace(/\D/g, '')); },
  isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
};

// ── MEDICAL UTILITIES ──
const Medical = {
  parseAge(dob) { return new Date().getFullYear() - new Date(dob).getFullYear(); },
  dosageString(dosage) { 
    const parts = dosage.split('-');
    return `${parts[0]} morning, ${parts[1]} afternoon, ${parts[2]} evening`;
  },
  getDaysCount(str) { const match = str.match(/(\d+)\s*days?/i); return match ? parseInt(match[1]) : 30; },
  bloodTypeAB(type) { return type === 'O+' || type === 'O-'; },
  universalDonor(type) { return type === 'O+'; },
  universalRecipient(type) { return type === 'AB+'; }
};

// ── EXPORT UTILITIES ──
const Export = {
  downloadJSON(data, filename = 'data.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this._download(blob, filename);
  },

  downloadCSV(data, headers, filename = 'data.csv') {
    const rows = data.map(item => headers.map(h => `"${item[h]}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    this._download(blob, filename);
  },

  downloadPDF(element, filename = 'document.pdf') {
    const printWindow = window.open('', '', 'height=400,width=800');
    printWindow.document.write('<pre>' + element.innerHTML + '</pre>');
    printWindow.document.close();
    printWindow.print();
  },

  _download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// ── VALIDATION UTILITIES ──
const Validate = {
  email(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); },
  phone(phone) { return /^[0-9]{10}$/.test(phone.replace(/\D/g, '')); },
  username(name) { return /^[a-zA-Z0-9_]{3,20}$/.test(name); },
  password(pwd) { return pwd.length >= 6; },
  url(url) { try { new URL(url); return true; } catch { return false; } },
  required(val) { return val !== null && val !== undefined && val !== ''; },
  minLength(str, min) { return str.length >= min; },
  maxLength(str, max) { return str.length <= max; },
  numeric(val) { return !isNaN(val) && val !== ''; },
  date(date) { return !isNaN(new Date(date)); }
};

// ── REPORT UTILITIES ──
const Reports = {
  generateHeader(title, date = new Date().toLocaleDateString()) {
    return `<div class="report-header" style="margin-bottom:20px;"><h2>${title}</h2><small>${date}</small></div>`;
  },

  generateTable(data, headers) {
    if (!data.length) return '<p>No data available</p>';
    const rows = data.map(item => `<tr>${headers.map(h => `<td>${item[h]}</td>`).join('')}</tr>`).join('');
    return `<table style="width:100%;border-collapse:collapse;"><thead><tr>${headers.map(h => `<th style="border:1px solid #ddd;padding:8px;">${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  },

  generateStats(label, value, unit = '') {
    return `<div style="display:inline-block;margin:10px;text-align:center;"><h3>${value} ${unit}</h3><small>${label}</small></div>`;
  },

  printReport(title, content) {
    const win = window.open('', '', 'height=600,width=800');
    win.document.write(`
      <html><head><title>${title}</title>
      <style>body { font-family: Arial; margin: 20px; }</style>
      </head><body>
      <h1>${title}</h1>
      <div>${content}</div>
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  }
};

// ── CACHE UTILITIES ──
const Cache = {
  data: {},
  set(key, value, ttl = null) {
    this.data[key] = { value, expires: ttl ? Date.now() + ttl * 1000 : null };
  },
  get(key) {
    const item = this.data[key];
    if (!item) return null;
    if (item.expires && Date.now() > item.expires) { delete this.data[key]; return null; }
    return item.value;
  },
  clear(key) { delete this.data[key]; },
  clearAll() { this.data = {}; }
};

// ── API UTILITIES (Mock/Ready for real API) ──
const API = {
  async get(url) {
    try {
      // Simulate API call (replace with actual fetch)
      return new Promise(resolve => setTimeout(() => resolve({ data: null }), 500));
    } catch (err) {
      Toast.error('API Error: ' + err.message);
      return null;
    }
  },

  async post(url, data) {
    try {
      // Simulate API call
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    } catch (err) {
      Toast.error('API Error: ' + err.message);
      return null;
    }
  },

  async put(url, data) {
    try {
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    } catch (err) {
      Toast.error('API Error: ' + err.message);
      return null;
    }
  },

  async delete(url) {
    try {
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    } catch (err) {
      Toast.error('API Error: ' + err.message);
      return null;
    }
  }
};

// ── COLOR UTILITIES ──
const Colors = {
  getRoleColor(role) {
    const colors = {
      patient: '#00b4d8', doctor: '#06d6a0', pharmacy: '#ffd166',
      lab: '#48cae4', billing: '#ef476f', admin: '#c77dff'
    };
    return colors[role] || '#00b4d8';
  },

  statusColor(status) {
    const colors = {
      success: '#06d6a0', pending: '#ffd166', danger: '#ef476f',
      warning: '#ffd166', info: '#00b4d8', confirmed: '#06d6a0',
      rejected: '#ef476f', completed: '#06d6a0', dispensed: '#06d6a0'
    };
    return colors[status] || '#8892a4';
  },

  lighten(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    return '#' + (((num >> 16) + amt) << 16) + (((num >> 8) + amt) << 8) + (amt + num & 0xff).toString(16).padStart(2, '0');
  }
};

// ── LOGGER ──
const Log = {
  log(...args) { console.log('[APP]', ...args); },
  error(...args) { console.error('[ERROR]', ...args); },
  warn(...args) { console.warn('[WARN]', ...args); },
  info(...args) { console.info('[INFO]', ...args); },
  debug(...args) { if (window.DEBUG) console.debug('[DEBUG]', ...args); }
};

// ── DOM UTILITIES ──
const DOM = {
  id(id) { return document.getElementById(id); },
  select(selector) { return document.querySelector(selector); },
  selectAll(selector) { return document.querySelectorAll(selector); },
  class(el, name) { return el.classList.contains(name); },
  addClass(el, name) { el.classList.add(name); },
  removeClass(el, name) { el.classList.remove(name); },
  toggleClass(el, name) { el.classList.toggle(name); },
  on(el, event, handler) { el.addEventListener(event, handler); },
  off(el, event, handler) { el.removeEventListener(event, handler); },
  once(el, event, handler) { el.addEventListener(event, handler, { once: true }); },
  html(el, content) { el.innerHTML = content; },
  text(el, content) { el.textContent = content; }
};
