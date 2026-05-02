# E-Hospital System - Enhanced Edition

## Overview
A fully dynamic and interactive digital hospital management platform with multi-role support (Patient, Doctor, Pharmacist, Lab Admin, Billing, Admin). Now enhanced with production-ready features like state management, persistence, validation, and utilities.

## 🎯 Key Features

### ✅ New Enhancements
- **Local Storage Persistence** - Data persists between sessions
- **Toast Notifications** - Real-time user feedback notifications
- **Form Validation** - Built-in form validation and error handling
- **CRUD Operations** - Complete data management with Create, Read, Update, Delete
- **Analytics Engine** - Dashboard stats and insights
- **Search & Filter** - Advanced search with real-time filtering
- **Data Export** - Export data as JSON or CSV
- **Responsive Design** - Works on all device sizes
- **Keyboard Shortcuts** - Escape to close modals, Ctrl+K for search
- **Enhanced Modal System** - Better modal dialogs with reusable components

### 🔧 Core Modules
- **Patient Portal** - Find doctors, book appointments, view prescriptions and bills
- **Doctor Portal** - Manage appointments, write prescriptions, view lab orders
- **Pharmacy Portal** - Manage inventory, prescriptions, and deliveries
- **Lab Portal** - Manage lab tests and upload results
- **Billing Portal** - Track bills and transactions
- **Admin Portal** - System-wide management and reports

---

## 📚 Usage Guide

### 1. Login & Session Management
```javascript
// User login with validation
// Username & password validation built-in
// Session persists with Storage API

// Logout clears session safely
logout(); // Clears all data and returns to login

// Current session data
console.log(currentUser);    // { name, role, loginTime }
console.log(currentRole);    // Current user role
```

### 2. Notifications

#### In-App Notifications
```javascript
// Add notifications to notification center
Notif.add('New appointment booked', 'success');  // Shows in notification panel
Notif.add('Low stock warning', 'warning');
Notif.add('Error occurred', 'danger');

// Types: 'info', 'success', 'warning', 'danger'
```

#### Toast Notifications (Temporary)
```javascript
// Show temporary toast notifications
Toast.success('Operation completed successfully!');
Toast.error('Something went wrong');
Toast.warning('Please review this');
Toast.info('New message received');

// Custom duration (milliseconds)
Toast.success('Saved!', 3000);  // Shows for 3 seconds
```

### 3. Data Management (CRUD Operations)

```javascript
// CREATE - Add new item
const newAppointment = {
  patientId: 101,
  doctorId: 1,
  date: '2026-04-25',
  time: '10:00',
  reason: 'Check-up'
};
CRUD.add('appointments', newAppointment);

// READ - Get single item
const appointment = CRUD.get('appointments', 1001);

// READ - Get by field
const patientAppts = CRUD.getBy('appointments', 'patientId', 101);

// READ - Get all
const allAppointments = CRUD.getAll('appointments');

// READ - List with filters
const pendingAppts = CRUD.list('appointments', { status: 'pending' });

// UPDATE - Modify item
CRUD.update('appointments', 1001, { status: 'confirmed' });

// DELETE - Remove item
CRUD.delete('appointments', 1001);

// BULK - Update multiple
CRUD.bulkUpdate('appointments', [1001, 1002], { status: 'completed' });

// BULK - Delete multiple
CRUD.bulkDelete('appointments', [1001, 1002]);
```

### 4. Analytics & Reports

```javascript
// Get dashboard statistics
const stats = Analytics.getDashboardStats('patient');
// Returns: { total, pending, completed, warning }

// Calculate revenue
const revenue = Analytics.getRevenue('2026-04-01', '2026-04-30');

// Appointment statistics
const apptStats = Analytics.getAppointmentStats();

// Low stock items in inventory
const lowStock = Analytics.getLowStockItems();

// Top doctors by appointments
const topDoctors = Analytics.getTopDoctors();
```

### 5. Search, Filter & Sort

```javascript
// SEARCH - Find items by query across multiple fields
const results = SearchUtils.search(
  DB.doctors, 
  'cardiology',           // Search query
  ['name', 'spec', 'dept'] // Fields to search in
);

// FILTER - Filter by specific criteria
const available = SearchUtils.filter(
  DB.doctors,
  { available: true, dept: 'Cardiology' }
);

// SORT - Sort items
const sorted = SearchUtils.sort(DB.doctors, 'fee', 'asc');  // asc or desc
```

### 6. Modals & Dialogs

```javascript
// Simple modal
Modal.show('Appointment Details', `
  <div>
    <p><strong>Date:</strong> 2026-04-25</p>
    <p><strong>Time:</strong> 10:00 AM</p>
  </div>
`);

// Modal with footer buttons
Modal.show('Confirm', 'Are you sure?', {
  footer: `
    <button class="btn btn-danger" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" onclick="handleConfirm()">Yes</button>
  `
});

// Confirmation dialog
Modal.confirm('Delete', 'Delete this appointment?', 
  () => { console.log('Confirmed'); },
  () => { console.log('Cancelled'); }
);

// Alert dialog
Modal.alert('Success', 'Appointment booked successfully!');

// Close modal
Modal.close();
```

### 7. Form Utilities

```javascript
// Get form data
const formData = FormUtils.getFormData('myForm');

// Validate form data
const rules = {
  email: { required: 'Email', pattern: /.+@.+/ },
  phone: { required: 'Phone', min: 10 },
  password: { required: 'Password', min: 6 }
};
const errors = FormUtils.validate(formData, rules);

// Show validation errors
if (Object.keys(errors).length) {
  FormUtils.setErrors('myForm', errors);
  Toast.error('Please fix the errors');
}
```

### 8. Date & Time Utilities

```javascript
// Get today's date (YYYY-MM-DD)
const today = DateUtils.today();

// Get tomorrow
const tomorrow = DateUtils.tomorrow();

// Get date N days from now
const future = DateUtils.daysFromNow(7);

// Format date
const formatted = DateUtils.format('2026-04-25', 'DD-MM-YYYY');

// Format time
const timeStr = DateUtils.timeFormat('14:30');

// Time ago string
const timeAgo = DateUtils.ago('2026-04-20');  // "5 days ago"

// Check date conditions
DateUtils.isToday('2026-04-30');   // true if today
DateUtils.isPast('2026-04-20');    // true if past
DateUtils.isFuture('2026-05-01');  // true if future
```

### 9. Money & Currency

```javascript
// Format money
Money.format(1500);        // "₹ 1,500.00"
Money.format(1500, '$');   // "$ 1,500.00"

// Calculate total
const total = Money.calculate(billItems, 'amount');

// Calculate discount
const afterDiscount = Money.discount(1000, 10);  // 10% off = 900

// Calculate tax
const taxAmount = Money.tax(1000, 18);  // 18% tax = 180
```

### 10. Export Data

```javascript
// Export as JSON
DataExport.downloadJSON();

// Export collection as CSV
DataExport.downloadCSV('appointments');

// Or use Export utility
Export.downloadJSON(DB, 'hospital_backup.json');
Export.downloadCSV(DB.doctors, 
  ['id', 'name', 'spec', 'fee'], 
  'doctors.csv'
);
```

### 11. Validation

```javascript
// Email validation
Validate.email('user@example.com');  // true

// Phone validation (10 digits)
Validate.phone('9876543210');  // true

// Password strength
Validate.password('myPass123');  // true if >= 6 chars

// URL validation
Validate.url('https://example.com');  // true

// String length
Validate.minLength('hello', 3);  // true
Validate.maxLength('hello', 10);  // true

// Required field
Validate.required('');  // false
Validate.required('value');  // true
```

### 12. Utility Functions

```javascript
// String utilities
StrUtils.capitalize('hello');       // "Hello"
StrUtils.truncate('Long text...', 20);  // "Long text..."
StrUtils.slug('Hello World');       // "hello-world"

// Data grouping
const grouped = DataUtils.group(DB.appointments, 'status');
// { pending: [...], confirmed: [...], ... }

// Get unique items
const unique = DataUtils.unique(DB.appointments, 'patientId');

// Aggregate data
const total = DataUtils.aggregate(DB.bills, 'total', 'sum');
const avg = DataUtils.aggregate(DB.bills, 'total', 'avg');
const max = DataUtils.aggregate(DB.bills, 'total', 'max');
```

### 13. Cache System

```javascript
// Set cache with TTL (seconds)
Cache.set('userPrefs', { theme: 'dark' }, 3600);

// Get from cache
const prefs = Cache.get('userPrefs');

// Clear specific cache
Cache.clear('userPrefs');

// Clear all cache
Cache.clearAll();
```

---

## 🎨 UI Components

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-sm">Small Button</button>
```

### Badges
```html
<span class="badge badge-success">Confirmed</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Rejected</span>
<span class="badge badge-info">Info</span>
```

### Forms
```html
<div class="form-group">
  <label class="field-label">Name</label>
  <input type="text" class="input-field" placeholder="Enter name" />
  <div class="input-hint">Required field</div>
</div>

<div class="form-row">
  <div class="form-group">...</div>
  <div class="form-group">...</div>
</div>
```

### Cards & Sections
```html
<div class="section-card">
  <div class="section-header">
    <div>
      <div class="section-title">Title</div>
      <div class="section-sub">Subtitle</div>
    </div>
  </div>
  <!-- Content -->
</div>
```

---

## 💾 Data Persistence

Data is automatically saved to localStorage every 5 seconds. The system persists:
- Current user session
- All database records
- User preferences

**To clear all data:**
```javascript
Storage.clearAll();
```

---

## 🔐 Demo Credentials

- **Role:** Select any role (Patient, Doctor, Pharmacy, Lab, Billing, Admin)
- **Username:** Any username (min 2 characters)
- **Password:** Any password (min 1 character)

---

## 📱 Responsive Features

- **Mobile:** Collapses sidebar to icons, stacks grid layouts
- **Tablet:** Optimized layout with 2-column grids
- **Desktop:** Full 3-column layouts with expanded sidebars

---

## 🚀 Performance Tips

1. **Debounce Search** - Already implemented with 300ms delay
2. **Lazy Load Data** - Load data on demand, not all at once
3. **Cache Results** - Use Cache.set() for frequently accessed data
4. **Batch Updates** - Use bulkUpdate() instead of multiple updates

---

## 🔌 API Integration Ready

The `API` object is ready for real backend integration:

```javascript
// Replace mock API calls with real endpoints
const result = await API.get('/api/doctors');
const created = await API.post('/api/appointments', appointmentData);
const updated = await API.put('/api/appointments/1', updates);
await API.delete('/api/appointments/1');
```

---

## 🛠️ Customization

### Change Primary Color
```javascript
// In selectRole function or after login:
document.body.style.setProperty('--primary', '#color');
```

### Add New Role
```javascript
// In app.js ROLES object:
ROLES.customRole = {
  label: 'Custom Portal',
  color: '#color',
  pages: ['dashboard', 'page1', 'page2']
};
```

### Create New Page
1. Add to `ROLES[role].pages`
2. Create `render_page_name` function in appropriate module
3. Add icon and label to PAGE_ICONS and PAGE_LABELS

---

## 📝 Notes

- All data is stored locally (no server required for demo)
- Use `console.log(DB)` to view entire database
- Check browser console for logs: `Log.log()`, `Log.error()`, etc.
- Press `Escape` to close modals
- Use `Toast` for temporary notifications, `Notif` for persistent ones

---

## 🎓 Examples

### Complete Appointment Booking Flow
```javascript
// 1. Search doctors
const doctors = SearchUtils.search(DB.doctors, 'cardiologist', ['spec']);

// 2. Select doctor and validate
if (doctors.length === 0) {
  Toast.warning('No doctors found');
  return;
}

// 3. Show booking modal
Modal.show('Book Appointment', `
  <div class="form-group">
    <label>Date</label>
    <input type="date" id="apptDate" class="input-field" />
  </div>
  <div class="form-group">
    <label>Time Slot</label>
    <select id="apptTime" class="input-field">
      ${doctors[0].slots.map(s => `<option>${s}</option>`).join('')}
    </select>
  </div>
`, {
  footer: `
    <button class="btn btn-danger" onclick="Modal.close()">Cancel</button>
    <button class="btn btn-primary" onclick="confirmBooking()">Book</button>
  `
});

// 4. Handle booking
function confirmBooking() {
  const appointment = {
    patientId: currentUser.patientId,
    doctorId: doctors[0].id,
    date: document.getElementById('apptDate').value,
    time: document.getElementById('apptTime').value,
    status: 'pending',
    reason: 'General check-up'
  };
  
  CRUD.add('appointments', appointment);
  Toast.success('Appointment booked successfully!');
  Modal.close();
}
```

---

## 📞 Support

For issues or questions, check the console for error messages and refer to this documentation.

**Happy Coding! 🏥**
