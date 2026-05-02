// ── CORE APP CONTROLLER ──
let currentRole = null;
let currentUser = null;
let currentPage = null;
let selectedRole = null;
let selectedRoleSignup = null;
let appState = { isLoading: false, errors: [], filters: {} };

// ── STORAGE & PERSISTENCE ──
const Storage = {
  save(key, data) { localStorage.setItem(`eh_${key}`, JSON.stringify(data)); },
  load(key) { const d = localStorage.getItem(`eh_${key}`); return d ? JSON.parse(d) : null; },
  clear(key) { localStorage.removeItem(`eh_${key}`); },
  clearAll() { Object.keys(localStorage).filter(k => k.startsWith('eh_')).forEach(k => localStorage.removeItem(k)); }
};

// ── PERSIST DATA ON EVERY CHANGE ──
setInterval(() => { if (currentRole) Storage.save('appData', DB); }, 5000);

// Role configuration
const ROLES = {
  patient:  { label: 'Patient Portal',     color: '#00b4d8', pages: ['dashboard','find-doctor','my-appointments','my-prescriptions','my-bills','notifications'] },
  doctor:   { label: 'Doctor Portal',      color: '#06d6a0', pages: ['dashboard','appointments','write-prescription','prescriptions','lab-orders','reports'] },
  pharmacy: { label: 'Pharmacist Portal',  color: '#ffd166', pages: ['dashboard','prescriptions','inventory','deliveries','reports'] },
  lab:      { label: 'Lab Admin Portal',   color: '#48cae4', pages: ['dashboard','lab-orders','upload-results','reports'] },
  billing:  { label: 'Billing Portal',     color: '#ef476f', pages: ['dashboard','billing','transactions','reports'] },
  admin:    { label: 'Admin Portal',       color: '#c77dff', pages: ['dashboard','doctors','patients','appointments','reports'] },
};

const PAGE_ICONS = {
  dashboard: '📊', 'find-doctor': '🔍', 'my-appointments': '📅', 'my-prescriptions': '📋',
  'my-bills': '💳', notifications: '🔔', appointments: '📅', 'write-prescription': '✏️',
  prescriptions: '📋', 'lab-orders': '🧪', reports: '📈', inventory: '📦', deliveries: '🚚',
  'upload-results': '⬆️', billing: '💰', transactions: '📊', doctors: '👨‍⚕️', patients: '👥',
};

const PAGE_LABELS = {
  dashboard: 'Dashboard', 'find-doctor': 'Find Doctor', 'my-appointments': 'My Appointments',
  'my-prescriptions': 'My Prescriptions', 'my-bills': 'My Bills', notifications: 'Notifications',
  appointments: 'Appointments', 'write-prescription': 'Write Prescription',
  prescriptions: 'Prescriptions', 'lab-orders': 'Lab Orders', reports: 'Reports',
  inventory: 'Inventory', deliveries: 'Deliveries', 'upload-results': 'Upload Results',
  billing: 'Billing', transactions: 'Transactions', doctors: 'Doctors', patients: 'Patients',
};

function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('#role-grid .role-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`#role-grid [data-role="${role}"]`).classList.add('selected');
}

function selectRoleSignup(role) {
  selectedRoleSignup = role;
  document.querySelectorAll('#role-grid-signup .role-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`#role-grid-signup [data-role="${role}"]`).classList.add('selected');
}

function switchAuthTab(e) {
  e.preventDefault();
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  
  loginTab.classList.toggle('active');
  signupTab.classList.toggle('active');
  
  // Clear forms
  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  selectedRole = null;
  selectedRoleSignup = null;
}

// ── REGISTRATION & USER MANAGEMENT ──
function handleRegister(e) {
  e.preventDefault();
  try {
    if (!selectedRoleSignup) { Toast.error('Please select a role first'); return; }
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate
    let errors = {};
    
    if (!fullname || fullname.length < 2) errors.fullname = 'Name must be at least 2 characters';
    if (!Validate.email(email)) errors.email = 'Enter a valid email address';
    if (!username || username.length < 3 || username.length > 20) errors.username = 'Username must be 3-20 characters';
    if (!Validate.username(username)) errors.username = 'Username can only contain letters, numbers, and underscores';
    if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errors.confirm = 'Passwords do not match';

    // Check if username already exists
    if (DB.users.find(u => u.username === username)) {
      errors.username = 'Username already taken';
    }
    if (DB.users.find(u => u.email === email)) {
      errors.email = 'Email already registered';
    }

    // Show errors if any
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, msg]) => {
        const el = document.getElementById(`${field}-error`);
        if (el) el.textContent = msg;
      });
      Toast.error('Please fix the errors');
      return;
    }

    // Create user
    const newUser = {
      id: DB.nextId(DB.users),
      fullname,
      email,
      username,
      password: btoa(password), // Simple base64 encoding (not secure for production)
      role: selectedRoleSignup,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    DB.users.push(newUser);
    Storage.save('users', DB.users);

    Toast.success('Account created successfully! Please login.');
    setTimeout(() => switchAuthTab({ preventDefault: () => {} }), 500);

  } catch (err) {
    Toast.error('Registration failed: ' + err.message);
  }
}

function handleLogin(e) {
  e.preventDefault();
  try {
    if (!selectedRole) { Toast.error('Please select a role first'); return; }
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username) { Toast.error('Please enter username'); return; }
    if (!password) { Toast.error('Please enter password'); return; }

    // Check if user exists
    const user = DB.users.find(u => u.username === username && u.role === selectedRole);
    
    if (!user) {
      Toast.error('Invalid username or role');
      return;
    }

    // Verify password
    const storedPassword = atob(user.password); // Decode base64
    if (storedPassword !== password) {
      Toast.error('Incorrect password');
      return;
    }

    // Check user status
    if (user.status !== 'active') {
      Toast.error('Your account has been deactivated');
      return;
    }

    // Login successful
    currentRole = selectedRole;
    currentUser = { 
      id: user.id,
      name: user.fullname, 
      username: user.username,
      email: user.email,
      role: selectedRole, 
      loginTime: new Date(),
      isRegistered: true
    };
    Storage.save('currentUser', currentUser);
    Storage.save('currentRole', currentRole);
    Toast.success(`Welcome back, ${user.fullname}!`);
    setTimeout(initApp, 500);
  } catch (err) {
    Toast.error('Login failed: ' + err.message);
  }
}

function initApp() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');

  // Load persisted data
  const savedData = Storage.load('appData');
  if (savedData) Object.assign(DB, savedData);

  // Load registered users
  const savedUsers = Storage.load('users');
  if (savedUsers) DB.users = savedUsers;

  // Set user info
  document.getElementById('user-name-display').textContent = currentUser.name;
  document.getElementById('user-role-display').textContent = ROLES[currentRole].label;
  document.getElementById('sidebar-role-label').textContent = ROLES[currentRole].label;
  document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.body.style.setProperty('--primary', ROLES[currentRole].color);

  // Build nav
  buildNav();

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Initialize notifications
  if (!DB.notifications.length) Notif.seed();
  Notif.updateBadge();
  Notif.renderList();

  // Load dashboard
  navigateTo('dashboard');
  Toast.info(`Logged in as ${currentUser.name}`);
}

function buildNav() {
  const menu = document.getElementById('nav-menu');
  const pages = ROLES[currentRole].pages;
  menu.innerHTML = pages.map(p => `
    <li class="nav-item">
      <div class="nav-link" id="nav-${p}" onclick="navigateTo('${p}')">
        <span class="nav-icon">${PAGE_ICONS[p] || '▸'}</span>
        <span>${PAGE_LABELS[p]}</span>
      </div>
    </li>`).join('');
}

function navigateTo(page) {
  currentPage = page;
  // Update active nav
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navEl = document.getElementById(`nav-${page}`);
  if (navEl) navEl.classList.add('active');
  // Update title
  document.getElementById('page-title').textContent = PAGE_LABELS[page] || page;
  document.getElementById('page-breadcrumb').textContent = `Home / ${PAGE_LABELS[page] || page}`;
  // Render content
  renderPage(page);
  // Close notif panel
  document.getElementById('notif-panel').classList.remove('open');
}

function renderPage(page) {
  const area = document.getElementById('content-area');
  area.innerHTML = '';
  const fn = window[`render_${page.replace(/-/g,'_')}`];
  if (fn) fn(area);
  else area.innerHTML = `<div class="empty-state"><div class="empty-icon">🚧</div><h4>Coming Soon</h4><p>${PAGE_LABELS[page]}</p></div>`;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleNotifications() {
  const panel = document.getElementById('notif-panel');
  panel.classList.toggle('open');
  DB.notifications.forEach(n => n.read = true);
  Notif.updateBadge();
}

function clearNotifications() {
  DB.notifications = [];
  Notif.renderList();
  Notif.updateBadge();
  document.getElementById('notif-panel').classList.remove('open');
}

function logout() {
  Storage.save('appData', DB);
  Storage.save('users', DB.users);
  currentRole = null; currentUser = null; selectedRole = null;
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  
  // Show login tab
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  if (!loginTab.classList.contains('active')) {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
  }
  
  Toast.info('Logged out successfully');
}

function updateClock() {
  const el = document.getElementById('topbar-time');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── SHARED RENDER HELPERS ──
function statCard(icon, colorClass, value, label) {
  return `<div class="stat-card"><div class="stat-icon ${colorClass}">${icon}</div><div class="stat-info"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div></div>`;
}

function badge(text, type) {
  return `<span class="badge badge-${type}">${text}</span>`;
}

function statusBadge(status) {
  const map = { confirmed: 'success', pending: 'warning', rejected: 'danger', completed: 'success', dispensed: 'success', paid: 'success', delivered: 'success', 'in-progress': 'info' };
  return badge(status, map[status] || 'muted');
}

function showModal(title, bodyHTML, onConfirm) {
  let overlay = document.getElementById('global-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'global-modal';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="modal fade-in">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div class="modal-title">${title}</div>
      ${bodyHTML}
    </div>`;
  overlay.classList.add('open');
}

function closeModal() {
  const m = document.getElementById('global-modal');
  if (m) m.classList.remove('open');
}

// ── DASHBOARD ROUTER ──
function render_dashboard(area) {
  const fn = window[`render_${currentRole}_dashboard`];
  if (fn) fn(area);
}

// ── FORM UTILITIES ──
const FormUtils = {
  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return null;
    const fd = new FormData(form);
    return Object.fromEntries(fd);
  },
  
  setErrors(formId, errors) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.form-error').forEach(e => e.remove());
    Object.entries(errors).forEach(([field, msg]) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) {
        const error = document.createElement('div');
        error.className = 'form-error';
        error.textContent = msg;
        input.parentNode.appendChild(error);
      }
    });
  },
  
  validate(data, rules) {
    const errors = {};
    Object.entries(rules).forEach(([field, rule]) => {
      const value = data[field];
      if (rule.required && !value) errors[field] = `${rule.required} is required`;
      if (rule.min && value && value.length < rule.min) errors[field] = `Min ${rule.min} characters`;
      if (rule.max && value && value.length > rule.max) errors[field] = `Max ${rule.max} characters`;
      if (rule.pattern && value && !rule.pattern.test(value)) errors[field] = 'Invalid format';
    });
    return errors;
  }
};

// ── UTILITY FUNCTIONS ──
function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function formatDate(d) { return new Date(d).toLocaleDateString('en-IN'); }
function formatTime(t) { return t ? new Date(`2000-01-01T${t}`).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) : t; }
function debounce(fn, ms = 300) { let timer; return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; }
function throttle(fn, ms = 300) { let last = 0; return function(...args) { if (Date.now() - last >= ms) { last = Date.now(); fn(...args); } }; }

// ── SEARCH & FILTER UTILITIES ──
const SearchUtils = {
  search(items, query, fields) {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(item => fields.some(f => String(item[f]).toLowerCase().includes(q)));
  },
  
  filter(items, filters) {
    return items.filter(item => Object.entries(filters).every(([key, val]) => !val || item[key] === val));
  },
  
  sort(items, field, order = 'asc') {
    return [...items].sort((a, b) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
};

// ── DATA UTILITIES ──
const DataUtils = {
  group(items, key) {
    return items.reduce((acc, item) => {
      const group = item[key];
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  },
  
  unique(items, key) {
    const seen = new Set();
    return items.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },
  
  aggregate(items, field, operation) {
    if (operation === 'count') return items.length;
    if (operation === 'sum') return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
    if (operation === 'avg') return this.aggregate(items, field, 'sum') / items.length;
    if (operation === 'max') return Math.max(...items.map(i => Number(i[field]) || 0));
    if (operation === 'min') return Math.min(...items.map(i => Number(i[field]) || 0));
  }
};

// ── CHART UTILITIES ──
const ChartUtils = {
  drawBar(canvasId, data, labels) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length;
    const maxVal = Math.max(...data);
    ctx.fillStyle = '#00b4d8';
    data.forEach((val, i) => {
      const barHeight = (val / maxVal) * (height - 40);
      ctx.fillRect(i * barWidth + 5, height - barHeight - 20, barWidth - 10, barHeight);
    });
    labels.forEach((label, i) => {
      ctx.fillStyle = '#888';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label, i * barWidth + barWidth / 2, height - 5);
    });
  },
  
  drawPie(canvasId, data, labels, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const total = data.reduce((a, b) => a + b, 0);
    let angle = 0;
    data.forEach((val, i) => {
      const slice = (val / total) * 2 * Math.PI;
      ctx.fillStyle = colors[i] || '#00b4d8';
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.arc(50, 50, 40, angle, angle + slice);
      ctx.closePath();
      ctx.fill();
      angle += slice;
    });
  }
};
