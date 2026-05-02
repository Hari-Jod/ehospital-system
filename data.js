// ── SHARED DATA STORE ──
const DB = {
  users: [
    // Default demo accounts
    { id: 1, fullname: 'Ravi Gupta', email: 'ravi@demo.com', username: 'ravi', password: btoa('123456'), role: 'patient', createdAt: '2026-04-01', status: 'active' },
    { id: 2, fullname: 'Dr. Ananya Sharma', email: 'ananya@demo.com', username: 'ananya', password: btoa('123456'), role: 'doctor', createdAt: '2026-04-01', status: 'active' },
    { id: 3, fullname: 'Pharmacy Manager', email: 'pharma@demo.com', username: 'pharmacy1', password: btoa('123456'), role: 'pharmacy', createdAt: '2026-04-01', status: 'active' },
  ],
  doctors: [
    { id: 1, name: 'Dr. Ananya Sharma', spec: 'Cardiologist', dept: 'Cardiology', available: true, slots: ['09:00','09:30','10:00','11:00','14:00','15:00'], fee: 800, avatar: '👩‍⚕️' },
    { id: 2, name: 'Dr. Rajesh Kumar', spec: 'Neurologist', dept: 'Neurology', available: true, slots: ['10:00','10:30','11:30','14:30','16:00'], fee: 900, avatar: '👨‍⚕️' },
    { id: 3, name: 'Dr. Priya Mehta', spec: 'Pediatrician', dept: 'Pediatrics', available: false, slots: ['09:00','11:00','15:00'], fee: 600, avatar: '👩‍⚕️' },
    { id: 4, name: 'Dr. Vikram Nair', spec: 'Orthopedic', dept: 'Orthopedics', available: true, slots: ['08:30','09:30','10:30','14:00'], fee: 850, avatar: '👨‍⚕️' },
    { id: 5, name: 'Dr. Sunita Rao', spec: 'Dermatologist', dept: 'Dermatology', available: true, slots: ['10:00','11:30','13:00','15:30'], fee: 700, avatar: '👩‍⚕️' },
    { id: 6, name: 'Dr. Amit Patel', spec: 'Oncologist', dept: 'Oncology', available: true, slots: ['09:00','11:00','14:00','16:00'], fee: 1200, avatar: '👨‍⚕️' },
  ],
  patients: [
    { id: 101, name: 'Ravi Gupta',    age: 45, gender: 'Male',   blood: 'B+', phone: '9876543210', dept: 'Cardiology' },
    { id: 102, name: 'Meera Singh',   age: 32, gender: 'Female', blood: 'A+', phone: '9876543211', dept: 'Neurology' },
    { id: 103, name: 'Suresh Verma',  age: 60, gender: 'Male',   blood: 'O+', phone: '9876543212', dept: 'Orthopedics' },
    { id: 104, name: 'Kavya Reddy',   age: 28, gender: 'Female', blood: 'AB-', phone: '9876543213', dept: 'Dermatology' },
    { id: 105, name: 'Arjun Naik',    age: 55, gender: 'Male',   blood: 'A-', phone: '9876543214', dept: 'Oncology' },
  ],
  appointments: [
    { id: 1001, patientId: 101, patientName: 'Ravi Gupta',   doctorId: 1, doctorName: 'Dr. Ananya Sharma', date: '2026-04-22', time: '09:00', status: 'pending',  dept: 'Cardiology',   reason: 'Chest pain' },
    { id: 1002, patientId: 102, patientName: 'Meera Singh',  doctorId: 2, doctorName: 'Dr. Rajesh Kumar',  date: '2026-04-22', time: '10:00', status: 'confirmed', dept: 'Neurology',    reason: 'Headache' },
    { id: 1003, patientId: 103, patientName: 'Suresh Verma', doctorId: 4, doctorName: 'Dr. Vikram Nair',   date: '2026-04-23', time: '08:30', status: 'confirmed', dept: 'Orthopedics',  reason: 'Knee pain' },
    { id: 1004, patientId: 104, patientName: 'Kavya Reddy',  doctorId: 5, doctorName: 'Dr. Sunita Rao',    date: '2026-04-23', time: '10:00', status: 'pending',  dept: 'Dermatology',  reason: 'Skin rash' },
    { id: 1005, patientId: 105, patientName: 'Arjun Naik',   doctorId: 6, doctorName: 'Dr. Amit Patel',    date: '2026-04-24', time: '09:00', status: 'rejected', dept: 'Oncology',     reason: 'Follow-up' },
  ],
  prescriptions: [
    { id: 2001, patientId: 101, patientName: 'Ravi Gupta',  doctorId: 1, doctorName: 'Dr. Ananya Sharma', date: '2026-04-20', dept: 'Cardiology',
      medicines: [{ name: 'Aspirin 75mg', dosage: '1-0-1', days: 30 }, { name: 'Atorvastatin 20mg', dosage: '0-0-1', days: 30 }],
      notes: 'Avoid fatty food. Follow up in 4 weeks.', status: 'dispensed' },
    { id: 2002, patientId: 102, patientName: 'Meera Singh', doctorId: 2, doctorName: 'Dr. Rajesh Kumar',  date: '2026-04-21', dept: 'Neurology',
      medicines: [{ name: 'Sumatriptan 50mg', dosage: '1-0-0', days: 10 }, { name: 'Amitriptyline 10mg', dosage: '0-0-1', days: 30 }],
      notes: 'Avoid bright light. Stay hydrated.', status: 'pending' },
    { id: 2003, patientId: 103, patientName: 'Suresh Verma', doctorId: 4, doctorName: 'Dr. Vikram Nair',  date: '2026-04-21', dept: 'Orthopedics',
      medicines: [{ name: 'Diclofenac 50mg', dosage: '1-1-1', days: 7 }, { name: 'Calcium + D3', dosage: '1-0-1', days: 90 }],
      notes: 'Apply ice pack. Limit stair climbing.', status: 'pending' },
  ],
  labTests: [
    { id: 3001, patientId: 101, patientName: 'Ravi Gupta',  doctorId: 1, doctorName: 'Dr. Ananya Sharma', date: '2026-04-21', test: 'Lipid Profile',       status: 'completed', result: { TC: '210 mg/dL', HDL: '45 mg/dL', LDL: '145 mg/dL', TG: '150 mg/dL' }, remarks: 'Borderline high cholesterol' },
    { id: 3002, patientId: 102, patientName: 'Meera Singh', doctorId: 2, doctorName: 'Dr. Rajesh Kumar',  date: '2026-04-21', test: 'MRI Brain',            status: 'pending',  result: null, remarks: '' },
    { id: 3003, patientId: 103, patientName: 'Suresh Verma', doctorId: 4, doctorName: 'Dr. Vikram Nair',  date: '2026-04-22', test: 'X-Ray Knee (AP/Lat)',  status: 'completed', result: { finding: 'Moderate OA changes', bone_density: 'Normal' }, remarks: 'Grade II osteoarthritis' },
    { id: 3004, patientId: 104, patientName: 'Kavya Reddy', doctorId: 5, doctorName: 'Dr. Sunita Rao',    date: '2026-04-22', test: 'CBC',                  status: 'pending',  result: null, remarks: '' },
  ],
  inventory: [
    { id: 'M001', name: 'Aspirin 75mg',         category: 'Cardiovascular', stock: 450, unit: 'tabs', threshold: 100, price: 2.5,  supplier: 'PharmaCo' },
    { id: 'M002', name: 'Atorvastatin 20mg',    category: 'Cardiovascular', stock: 320, unit: 'tabs', threshold: 80,  price: 8,    supplier: 'MediSupply' },
    { id: 'M003', name: 'Sumatriptan 50mg',     category: 'Neurology',      stock: 60,  unit: 'tabs', threshold: 50,  price: 35,   supplier: 'NeuroPharma' },
    { id: 'M004', name: 'Amitriptyline 10mg',   category: 'Neurology',      stock: 200, unit: 'tabs', threshold: 60,  price: 5,    supplier: 'PharmaCo' },
    { id: 'M005', name: 'Diclofenac 50mg',      category: 'Analgesic',      stock: 380, unit: 'tabs', threshold: 100, price: 3,    supplier: 'GenMed' },
    { id: 'M006', name: 'Calcium + D3',         category: 'Supplement',     stock: 30,  unit: 'tabs', threshold: 50,  price: 12,   supplier: 'NutriMed' },
    { id: 'M007', name: 'Paracetamol 500mg',    category: 'Analgesic',      stock: 900, unit: 'tabs', threshold: 200, price: 1.5,  supplier: 'GenMed' },
    { id: 'M008', name: 'Metformin 500mg',      category: 'Diabetes',       stock: 410, unit: 'tabs', threshold: 100, price: 4,    supplier: 'DiaCare' },
  ],
  deliveries: [
    { id: 'D001', prescriptionId: 2001, patientName: 'Ravi Gupta',  date: '2026-04-20', items: ['Aspirin 75mg x30', 'Atorvastatin 20mg x30'], status: 'delivered', total: 315 },
    { id: 'D002', prescriptionId: 2002, patientName: 'Meera Singh', date: '2026-04-21', items: ['Sumatriptan 50mg x10'], status: 'pending',   total: 350 },
  ],
  bills: [
    { id: 'B001', patientId: 101, patientName: 'Ravi Gupta',  date: '2026-04-20', items: [{ desc: 'Consultation – Cardiology', amt: 800 }, { desc: 'Lipid Profile Test', amt: 600 }, { desc: 'Medicines', amt: 315 }], status: 'paid',    total: 1715 },
    { id: 'B002', patientId: 102, patientName: 'Meera Singh', date: '2026-04-21', items: [{ desc: 'Consultation – Neurology', amt: 900 }, { desc: 'MRI Brain', amt: 3500 }],                                           status: 'pending', total: 4400 },
    { id: 'B003', patientId: 103, patientName: 'Suresh Verma', date: '2026-04-22', items: [{ desc: 'Consultation – Orthopedics', amt: 850 }, { desc: 'X-Ray Knee', amt: 400 }, { desc: 'Medicines', amt: 291 }],       status: 'pending', total: 1541 },
  ],
  notifications: []
};

// helper – next available id
DB.nextId = (arr) => Math.max(...arr.map(x => x.id), 0) + 1;

// ── USER MANAGEMENT ──
const UserManager = {
  register(fullname, email, username, password, role) {
    // Validate
    if (DB.users.find(u => u.username === username)) return { error: 'Username already taken' };
    if (DB.users.find(u => u.email === email)) return { error: 'Email already registered' };

    const user = {
      id: DB.nextId(DB.users),
      fullname,
      email,
      username,
      password: btoa(password), // Base64 encoding
      role,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    DB.users.push(user);
    Notif.add(`New user registered: ${fullname}`, 'success', 'admin');
    return { success: true, user };
  },

  login(username, password, role) {
    const user = DB.users.find(u => u.username === username && u.role === role);
    if (!user) return { error: 'User not found' };
    if (user.status !== 'active') return { error: 'Account deactivated' };
    if (atob(user.password) !== password) return { error: 'Incorrect password' };
    return { success: true, user };
  },

  getUser(userId) {
    return DB.users.find(u => u.id === userId);
  },

  updateProfile(userId, updates) {
    const user = this.getUser(userId);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  },

  changePassword(userId, oldPassword, newPassword) {
    const user = this.getUser(userId);
    if (!user) return { error: 'User not found' };
    if (atob(user.password) !== oldPassword) return { error: 'Incorrect current password' };
    user.password = btoa(newPassword);
    return { success: true };
  },

  deactivateAccount(userId) {
    const user = this.getUser(userId);
    if (!user) return false;
    user.status = 'deactivated';
    Notif.add(`User account deactivated: ${user.fullname}`, 'warning', 'admin');
    return true;
  },

  getUsersByRole(role) {
    return DB.users.filter(u => u.role === role && u.status === 'active');
  },

  getUserCount(role) {
    return role ? this.getUsersByRole(role).length : DB.users.filter(u => u.status === 'active').length;
  }
};

// ── CRUD OPERATIONS ──
const CRUD = {
  // CREATE
  add(collection, item) {
    if (!DB[collection]) return null;
    if (!item.id) item.id = DB.nextId(DB[collection]);
    if (!item.createdAt) item.createdAt = new Date().toISOString();
    DB[collection].unshift(item);
    Notif.add(`New ${collection.slice(0,-1)} created`, 'success');
    return item;
  },

  // READ
  get(collection, id) {
    if (!DB[collection]) return null;
    return DB[collection].find(item => item.id === id);
  },

  getBy(collection, field, value) {
    if (!DB[collection]) return null;
    return DB[collection].find(item => item[field] === value);
  },

  getAll(collection) {
    return DB[collection] || [];
  },

  list(collection, filters = {}) {
    let items = this.getAll(collection);
    Object.entries(filters).forEach(([key, val]) => {
      if (val) items = items.filter(item => item[key] === val);
    });
    return items;
  },

  // UPDATE
  update(collection, id, updates) {
    const item = this.get(collection, id);
    if (!item) return null;
    Object.assign(item, { ...updates, updatedAt: new Date().toISOString() });
    Notif.add(`${collection.slice(0,-1)} updated`, 'success');
    return item;
  },

  // DELETE
  delete(collection, id) {
    if (!DB[collection]) return false;
    const idx = DB[collection].findIndex(item => item.id === id);
    if (idx === -1) return false;
    DB[collection].splice(idx, 1);
    Notif.add(`${collection.slice(0,-1)} deleted`, 'info');
    return true;
  },

  bulkUpdate(collection, ids, updates) {
    const updated = [];
    ids.forEach(id => {
      const result = this.update(collection, id, updates);
      if (result) updated.push(result);
    });
    return updated;
  },

  bulkDelete(collection, ids) {
    let deleted = 0;
    ids.forEach(id => {
      if (this.delete(collection, id)) deleted++;
    });
    return deleted;
  }
};

// ── ANALYTICS ──
const Analytics = {
  getDashboardStats(role) {
    const stats = {
      total: 0, pending: 0, completed: 0, warning: 0
    };
    
    if (role === 'patient') {
      stats.total = DB.appointments.length;
      stats.pending = DB.appointments.filter(a => a.status === 'pending').length;
      stats.completed = DB.appointments.filter(a => a.status === 'confirmed').length;
      stats.warning = DB.bills.filter(b => b.status === 'pending').length;
    } else if (role === 'doctor') {
      stats.total = DB.appointments.length;
      stats.pending = DB.appointments.filter(a => a.status === 'pending').length;
      stats.completed = DB.appointments.filter(a => a.status === 'confirmed').length;
      stats.warning = DB.labTests.filter(t => t.status === 'pending').length;
    } else if (role === 'pharmacy') {
      stats.total = DB.inventory.length;
      stats.pending = DB.prescriptions.filter(p => p.status === 'pending').length;
      stats.completed = DB.deliveries.length;
      stats.warning = DB.inventory.filter(i => i.stock < i.threshold).length;
    } else if (role === 'billing') {
      stats.total = DB.bills.length;
      stats.pending = DB.bills.filter(b => b.status === 'pending').length;
      stats.completed = DB.bills.filter(b => b.status === 'paid').length;
      stats.warning = 0;
    }
    
    return stats;
  },

  getRevenue(startDate, endDate) {
    return DB.bills
      .filter(b => b.date >= startDate && b.date <= endDate && b.status === 'paid')
      .reduce((sum, b) => sum + b.total, 0);
  },

  getAppointmentStats() {
    return {
      total: DB.appointments.length,
      confirmed: DB.appointments.filter(a => a.status === 'confirmed').length,
      pending: DB.appointments.filter(a => a.status === 'pending').length,
      rejected: DB.appointments.filter(a => a.status === 'rejected').length,
    };
  },

  getLowStockItems() {
    return DB.inventory.filter(i => i.stock < i.threshold);
  },

  getTopDoctors() {
    const doctorAppointments = {};
    DB.appointments.forEach(a => {
      doctorAppointments[a.doctorId] = (doctorAppointments[a.doctorId] || 0) + 1;
    });
    return Object.entries(doctorAppointments)
      .map(([id, count]) => ({ doctorId: parseInt(id), appointments: count }))
      .sort((a, b) => b.appointments - a.appointments);
  }
};

// ── EXPORT / IMPORT ──
const DataExport = {
  exportJSON() {
    return JSON.stringify(DB, null, 2);
  },

  exportCSV(collection) {
    if (!DB[collection] || !DB[collection].length) return '';
    const headers = Object.keys(DB[collection][0]);
    const rows = DB[collection].map(item => headers.map(h => JSON.stringify(item[h])).join(','));
    return [headers.join(','), ...rows].join('\n');
  },

  downloadJSON() {
    const data = this.exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadCSV(collection) {
    const data = this.exportCSV(collection);
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
