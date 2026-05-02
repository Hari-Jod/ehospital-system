// ── NOTIFICATION ENGINE ──
const Notif = {
  types: { info: '🔵', success: '🟢', warning: '🟡', danger: '🔴' },

  add(msg, type = 'info', target = 'all') {
    const n = { id: Date.now(), msg, type, target, time: new Date().toLocaleTimeString(), read: false };
    DB.notifications.unshift(n);
    this.updateBadge();
    this.renderList();
    return n;
  },

  updateBadge() {
    const badge = document.getElementById('notif-badge');
    const count = DB.notifications.filter(n => !n.read).length;
    if (badge) { badge.textContent = count; badge.style.display = count ? 'flex' : 'none'; }
  },

  renderList() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    if (!DB.notifications.length) {
      list.innerHTML = '<div class="empty-state" style="padding:20px"><div class="empty-icon">🔔</div><p>No notifications</p></div>';
      return;
    }
    list.innerHTML = DB.notifications.slice(0, 12).map(n => `
      <div class="notif-item">
        <div class="notif-dot" style="background:${n.type==='danger'?'var(--danger)':n.type==='success'?'var(--success)':n.type==='warning'?'var(--warning)':'var(--primary)'}"></div>
        <div>
          <div class="notif-text">${n.msg}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>`).join('');
  },

  // Seeded notifications on load
  seed() {
    this.add('Welcome to E-Hospital System', 'info');
    this.add('Patient Ravi Gupta booked appointment with Dr. Ananya Sharma', 'info', 'doctor');
    this.add('Lab result ready for Ravi Gupta – Lipid Profile', 'success', 'doctor');
    this.add('Medicine stock low: Calcium + D3 (30 units)', 'warning', 'pharmacy');
    this.add('Bill B002 pending payment – Meera Singh', 'danger', 'billing');
  }
};

// ── TOAST NOTIFICATION SYSTEM ──
const Toast = {
  show(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;font-family:Inter,sans-serif;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColor = {
      success: '#06d6a0',
      error: '#ef476f',
      warning: '#ffd166',
      info: '#00b4d8'
    }[type] || '#00b4d8';

    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

    toast.style.cssText = `
      background: ${bgColor}20;
      border: 1px solid ${bgColor};
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 10px;
      color: white;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    toast.innerHTML = `
      <span style="font-size:18px;font-weight:bold;color:${bgColor}">${icons[type] || '•'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg, duration = 3000) { this.show(msg, 'success', duration); },
  error(msg, duration = 3000) { this.show(msg, 'error', duration); },
  warning(msg, duration = 3000) { this.show(msg, 'warning', duration); },
  info(msg, duration = 3000) { this.show(msg, 'info', duration); },
};

// ── ADD TOAST ANIMATIONS TO CSS ──
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
