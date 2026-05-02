// ── PRACTICAL EXAMPLES - E-HOSPITAL SYSTEM ──

// Example 1: Search Doctors with Real-time Filtering
function searchDoctorsExample() {
  const query = document.getElementById('search').value;
  const dept = document.getElementById('dept').value;

  // Search
  let results = SearchUtils.search(DB.doctors, query, ['name', 'spec', 'dept']);
  
  // Filter by department
  if (dept) {
    results = SearchUtils.filter(results, { dept });
  }

  // Sort by fee
  results = SearchUtils.sort(results, 'fee', 'asc');

  // Show results with notification
  if (results.length) {
    Toast.success(`Found ${results.length} doctors`);
    renderDoctors(results);
  } else {
    Toast.warning('No doctors found');
  }
}

// Example 2: Book Appointment with Validation
function bookAppointmentExample() {
  // Get form data
  const formData = FormUtils.getFormData('appointmentForm');

  // Validate
  const rules = {
    date: { required: 'Date' },
    time: { required: 'Time' },
    reason: { required: 'Reason', min: 3 }
  };
  const errors = FormUtils.validate(formData, rules);

  // Show errors if any
  if (Object.keys(errors).length) {
    FormUtils.setErrors('appointmentForm', errors);
    Toast.error('Please fix the errors');
    return;
  }

  // Check if slot is available
  const bookedSlots = DB.appointments.filter(a => 
    a.doctorId === currentDoctorId && 
    a.date === formData.date && 
    a.status !== 'rejected'
  ).map(a => a.time);

  if (bookedSlots.includes(formData.time)) {
    Toast.error('Slot already booked');
    return;
  }

  // Create appointment
  const appointment = {
    patientId: currentUser.patientId,
    doctorId: currentDoctorId,
    date: formData.date,
    time: formData.time,
    reason: formData.reason,
    status: 'pending'
  };

  CRUD.add('appointments', appointment);
  Toast.success('Appointment booked successfully!');
  Modal.close();

  // Store data
  Storage.save('appData', DB);
}

// Example 3: Generate and Export Appointment Report
function generateAppointmentReportExample() {
  // Get appointments
  const appts = CRUD.list('appointments', { status: 'confirmed' });

  if (!appts.length) {
    Toast.warning('No confirmed appointments');
    return;
  }

  // Generate header
  const header = Reports.generateHeader('Confirmed Appointments Report');

  // Generate table
  const table = Reports.generateTable(appts, [
    'id', 'patientName', 'doctorName', 'date', 'time'
  ]);

  // Add statistics
  const stats = `
    <div style="margin-top: 20px;">
      <h3>Statistics</h3>
      ${Reports.generateStats('Total Appointments', appts.length)}
      ${Reports.generateStats('This Week', appts.filter(a => 
        DateUtils.isSameDay(a.date, DateUtils.today()) ||
        new Date(a.date) > new Date(DateUtils.today())
      ).length)}
    </div>
  `;

  const fullReport = header + table + stats;

  // Show in modal
  Modal.show('Appointment Report', fullReport, {
    footer: `
      <button class="btn btn-primary" onclick="Reports.printReport('Appointments', '${fullReport}')">
        🖨️ Print
      </button>
      <button class="btn btn-success" onclick="Export.downloadJSON(${JSON.stringify(appts)}, 'appointments.json')">
        📥 Export JSON
      </button>
      <button class="btn btn-warning" onclick="Export.downloadCSV(${JSON.stringify(appts)}, ['id','patientName','doctorName','date','time'], 'appointments.csv')">
        📊 Export CSV
      </button>
    `
  });
}

// Example 4: Manage Inventory with Low Stock Alerts
function manageInventoryExample() {
  // Get all inventory
  const inventory = CRUD.getAll('inventory');

  // Find low stock items
  const lowStock = Analytics.getLowStockItems();

  // Show alerts
  if (lowStock.length) {
    Toast.warning(`${lowStock.length} items running low on stock`);
    
    // Show modal with low stock items
    const items = lowStock.map(item => `
      <div style="padding: 10px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
        <div>
          <strong>${item.name}</strong>
          <div style="font-size: 12px; color: var(--text-muted);">Stock: ${item.stock}/${item.threshold}</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="reorderMedicine('${item.id}')">Reorder</button>
      </div>
    `).join('');

    Modal.show('Low Stock Items', items);
  } else {
    Toast.success('All items have sufficient stock');
  }
}

// Example 5: Update Prescription Status
function updatePrescriptionStatusExample(prescriptionId, newStatus) {
  // Validate status
  const validStatuses = ['pending', 'dispensed', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    Toast.error('Invalid status');
    return;
  }

  // Update
  const updated = CRUD.update('prescriptions', prescriptionId, { 
    status: newStatus,
    updatedAt: new Date().toISOString()
  });

  if (updated) {
    Toast.success(`Prescription updated to ${newStatus}`);
    
    // Send notification
    const rx = updated;
    Notif.add(`Prescription ${rx.id} status changed to ${newStatus}`, 'info', 'pharmacy');
  }

  // Persist
  Storage.save('appData', DB);
}

// Example 6: Create Prescription from Template
function createPrescriptionFromTemplateExample(patientId, doctorId) {
  // Template prescriptions for common cases
  const templates = {
    fever: [
      { name: 'Paracetamol 500mg', dosage: '1-1-1', days: 3 },
      { name: 'Amoxicillin 500mg', dosage: '1-0-1', days: 5 }
    ],
    cough: [
      { name: 'Cough Syrup', dosage: '2-0-2', days: 7 },
      { name: 'Strepsils', dosage: '1-1-1', days: 10 }
    ]
  };

  // Show template selection
  const options = Object.keys(templates).map(key => 
    `<option value="${key}">${key.toUpperCase()}</option>`
  ).join('');

  Modal.show('Select Prescription Template', `
    <div class="form-group">
      <label>Choose Template</label>
      <select id="templateSelect" class="input-field">
        <option value="">-- Select --</option>
        ${options}
      </select>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="prescNotes" class="input-field" placeholder="Additional notes"></textarea>
    </div>
  `, {
    footer: `
      <button class="btn btn-danger" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="applyTemplate()">Create</button>
    `
  });

  window.applyTemplate = function() {
    const templateKey = document.getElementById('templateSelect').value;
    const notes = document.getElementById('prescNotes').value;

    if (!templateKey) {
      Toast.error('Please select a template');
      return;
    }

    const prescription = {
      patientId,
      doctorId,
      date: DateUtils.today(),
      medicines: templates[templateKey],
      notes,
      status: 'pending'
    };

    CRUD.add('prescriptions', prescription);
    Toast.success('Prescription created from template');
    Modal.close();
  };
}

// Example 7: Dashboard Stats Display
function displayDashboardStatsExample(role) {
  const stats = Analytics.getDashboardStats(role);
  
  // Calculate percentages for display
  const confirmed = stats.completed;
  const pending = stats.pending;
  const total = stats.total || 1;

  const confirmedPercent = Math.round((confirmed / total) * 100);
  const pendingPercent = Math.round((pending / total) * 100);

  // Build dashboard
  const dashboard = `
    <div class="stats-grid">
      ${statCard('📊', 'blue', stats.total, 'Total Items')}
      ${statCard('⏳', 'yellow', stats.pending, 'Pending')}
      ${statCard('✓', 'green', stats.completed, 'Completed')}
      ${statCard('⚠️', 'red', stats.warning, 'Warnings')}
    </div>

    <div class="section-card">
      <div class="section-title">Status Overview</div>
      <div style="margin-top: 20px;">
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Confirmed</span>
            <span>${confirmedPercent}%</span>
          </div>
          <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${confirmedPercent}%; background: var(--success);"></div>
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Pending</span>
            <span>${pendingPercent}%</span>
          </div>
          <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${pendingPercent}%; background: var(--warning);"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  return dashboard;
}

// Example 8: Validate Phone and Send Appointment Confirmation
function sendAppointmentConfirmationExample(appointmentId) {
  const appt = CRUD.get('appointments', appointmentId);
  if (!appt) {
    Toast.error('Appointment not found');
    return;
  }

  const patient = CRUD.getBy('patients', 'id', appt.patientId);
  if (!patient) {
    Toast.error('Patient not found');
    return;
  }

  // Validate phone
  if (!Validate.phone(patient.phone)) {
    Toast.error('Invalid patient phone number');
    return;
  }

  // Format phone
  const formattedPhone = Contact.formatPhone(patient.phone);

  // Show confirmation modal
  Modal.show('Send Confirmation', `
    <p>Send appointment confirmation to <strong>${patient.name}</strong>?</p>
    <p>Phone: ${formattedPhone}</p>
    <div class="form-group">
      <label>Message Preview</label>
      <textarea class="input-field" readonly>
Hi ${patient.name},

Your appointment with ${appt.doctorName} is confirmed!

📅 Date: ${DateUtils.format(appt.date)}
🕐 Time: ${appt.time}
📍 Department: ${appt.dept}

Thank you!
      </textarea>
    </div>
  `, {
    footer: `
      <button class="btn btn-danger" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="confirmSendMessage()">Send SMS</button>
    `
  });

  window.confirmSendMessage = function() {
    // In real app, integrate with SMS API
    Notif.add(`Confirmation sent to ${patient.name}`, 'success');
    Toast.success('SMS sent successfully');
    Modal.close();
  };
}

// Example 9: Generate Revenue Report
function generateRevenueReportExample(startDate, endDate) {
  // Validate dates
  if (!Validate.date(startDate) || !Validate.date(endDate)) {
    Toast.error('Invalid date format');
    return;
  }

  // Get revenue
  const revenue = Analytics.getRevenue(startDate, endDate);
  
  // Get bills in date range
  const bills = DB.bills.filter(b => 
    b.date >= startDate && b.date <= endDate
  );

  // Calculate breakdown
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0);
  const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.total, 0);

  // Generate report
  const report = `
    <div style="padding: 20px;">
      <h2>Revenue Report</h2>
      <p>Period: ${DateUtils.format(startDate)} to ${DateUtils.format(endDate)}</p>

      <div class="stats-grid" style="margin: 20px 0;">
        ${statCard('💰', 'green', Money.format(revenue), 'Total Paid')}
        ${statCard('⏳', 'yellow', Money.format(totalPending), 'Pending')}
        ${statCard('📋', 'blue', bills.length, 'Total Bills')}
      </div>

      <h3 style="margin-top: 30px;">Bill Details</h3>
      ${Reports.generateTable(bills, ['id', 'patientName', 'date', 'total', 'status'])}
    </div>
  `;

  Modal.show('Revenue Report', report, {
    footer: `
      <button class="btn btn-primary" onclick="Reports.printReport('Revenue Report', '${report}')">
        🖨️ Print
      </button>
      <button class="btn btn-success" onclick="Export.downloadJSON(${JSON.stringify(bills)}, 'revenue_report.json')">
        📥 Download
      </button>
    `
  });
}

// Example 10: Real-time Inventory Sync
function monitorInventorySyncExample() {
  // Check inventory every 30 seconds
  setInterval(() => {
    const lowStock = Analytics.getLowStockItems();
    
    if (lowStock.length) {
      // Show badge or indicator
      const badge = document.querySelector('[data-inventory-alert]');
      if (badge) {
        badge.textContent = lowStock.length;
        badge.style.display = 'flex';
      }

      // Log for monitoring
      Log.warn(`${lowStock.length} items low on stock`, lowStock);
    }
  }, 30000);

  // Save state periodically
  setInterval(() => {
    Storage.save('appData', DB);
    Log.log('Data synced to storage');
  }, 60000);
}

// ── HELPER FUNCTIONS (Already Available) ──

// All of these are ready to use:
// - Toast.success/error/warning/info()
// - CRUD.add/get/update/delete/list()
// - SearchUtils.search/filter/sort()
// - Modal.show/confirm/alert/close()
// - FormUtils.validate/setErrors/getFormData()
// - DateUtils.format/today/ago/isPast/isFuture()
// - Money.format/calculate/discount/tax()
// - Validate.email/phone/required/date()
// - Analytics.getDashboardStats/getRevenue()
// - Cache.set/get/clear()
// - Export.downloadJSON/downloadCSV()

console.log('✅ Examples loaded! Use these functions in your modules.');
