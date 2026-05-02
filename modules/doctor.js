// ── DOCTOR MODULE ──

function render_doctor_dashboard(area) {
  const today     = getTodayStr();
  const todayAppt = DB.appointments.filter(a => a.date === today);
  const pending   = DB.appointments.filter(a => a.status === 'pending');
  const myRx      = DB.prescriptions.filter(p => p.doctorId === 1);
  area.innerHTML = `
    <div class="fade-in">
      <div class="report-header" style="background:linear-gradient(135deg,#0a3d2e,#06d6a0)">
        <h2>Good day, ${currentUser.name} 🩺</h2>
        <p>Doctor Dashboard – Manage your appointments and patients</p>
      </div>
      <div class="stats-grid">
        ${statCard('📅','blue', todayAppt.length,       "Today's Appointments")}
        ${statCard('⏳','yellow', pending.length,       'Pending Approvals')}
        ${statCard('📋','green', myRx.length,           'Prescriptions Written')}
        ${statCard('🧪','purple', DB.labTests.filter(l=>l.doctorId===1).length, 'Lab Orders')}
      </div>
      <div class="two-col">
        <div class="section-card">
          <div class="section-header">
            <div><div class="section-title">Pending Appointment Requests</div></div>
          </div>
          ${pending.length ? pending.map(a=>`
            <div class="lab-result">
              <div class="lab-result-header">
                <div><strong>${a.patientName}</strong><div style="font-size:12px;color:var(--text-muted)">${a.dept} · ${a.date} ${a.time}</div></div>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-success btn-sm" onclick="updateApptStatus(${a.id},'confirmed')">✓ Accept</button>
                  <button class="btn btn-danger btn-sm"  onclick="updateApptStatus(${a.id},'rejected')">✗ Reject</button>
                </div>
              </div>
              <div style="font-size:13px;color:var(--text-muted)">Reason: ${a.reason}</div>
            </div>`).join('')
          : '<div class="empty-state"><div class="empty-icon">✅</div><p>All caught up!</p></div>'}
        </div>
        <div class="section-card">
          <div class="section-header">
            <div><div class="section-title">Today's Schedule</div></div>
            <span style="font-size:12px;color:var(--text-muted)">${today}</span>
          </div>
          ${todayAppt.length ? `<div class="timeline">` + todayAppt.map(a=>`
            <div class="timeline-item">
              <div class="timeline-title">${a.patientName} <small style="color:var(--text-muted)">· ${a.time}</small></div>
              <div class="timeline-body">${a.reason}</div>
              <div style="margin-top:4px">${statusBadge(a.status)}</div>
            </div>`).join('') + `</div>`
          : '<div class="empty-state"><div class="empty-icon">📅</div><p>No appointments today</p></div>'}
        </div>
      </div>
    </div>`;
}

function updateApptStatus(apptId, status) {
  const a = DB.appointments.find(x => x.id === apptId);
  if (!a) return;
  a.status = status;
  const msg = status === 'confirmed'
    ? `Appointment confirmed for ${a.patientName} on ${a.date} at ${a.time}`
    : `Appointment rejected for ${a.patientName}`;
  Notif.add(msg, status === 'confirmed' ? 'success' : 'warning');
  // re-render current page
  renderPage(currentPage);
}

function render_appointments(area) {
  const appts = DB.appointments;
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">All Appointments</div><div class="section-sub">Accept or reject patient requests</div></div>
          <div style="display:flex;gap:8px">
            <select class="search-input" id="appt-filter" style="max-width:160px" onchange="filterAppts()">
              <option value="">All Status</option>
              <option>pending</option><option>confirmed</option><option>rejected</option>
            </select>
          </div>
        </div>
        <div class="table-wrap" id="appts-table">${renderApptsTable(appts)}</div>
      </div>
    </div>`;
}

function filterAppts() {
  const f = document.getElementById('appt-filter').value;
  const filtered = f ? DB.appointments.filter(a=>a.status===f) : DB.appointments;
  document.getElementById('appts-table').innerHTML = renderApptsTable(filtered);
}

function renderApptsTable(appts) {
  if (!appts.length) return '<div class="empty-state"><div class="empty-icon">📅</div><p>No appointments found</p></div>';
  return `<table>
    <thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Dept</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${appts.map(a=>`
      <tr>
        <td>${a.id}</td><td><strong>${a.patientName}</strong></td><td>${a.doctorName}</td>
        <td>${a.dept}</td><td>${a.date}</td><td>${a.time}</td><td>${a.reason}</td>
        <td>${statusBadge(a.status)}</td>
        <td>
          ${a.status==='pending'?`
            <button class="btn btn-success btn-sm" onclick="updateApptStatus(${a.id},'confirmed');filterAppts()">✓</button>
            <button class="btn btn-danger btn-sm"  onclick="updateApptStatus(${a.id},'rejected');filterAppts()">✗</button>`
          : '—'}
        </td>
      </tr>`).join('')}
    </tbody></table>`;
}

function render_write_prescription(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-title" style="margin-bottom:20px">✏️ Write New Prescription</div>
        <div class="form-row">
          <div class="form-group">
            <label class="field-label">Patient</label>
            <select id="rx-patient" class="input-field">
              ${DB.patients.map(p=>`<option value="${p.id}">${p.name} (ID:${p.id})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="field-label">Department</label>
            <select id="rx-dept" class="input-field">
              ${[...new Set(DB.doctors.map(d=>d.dept))].map(d=>`<option>${d}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="med-list">
          <div class="field-label" style="margin-bottom:8px">Medicines</div>
          <div id="med-rows">
            ${medRow(0)}
          </div>
          <button class="btn btn-sm" style="background:var(--bg-card2);margin-top:10px" onclick="addMedRow()">+ Add Medicine</button>
        </div>
        <div class="form-group" style="margin-top:16px">
          <label class="field-label">Doctor's Notes</label>
          <textarea id="rx-notes" class="input-field" rows="3" placeholder="Follow-up instructions, diet advice..."></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="savePrescription()">💾 Save Prescription</button>
        </div>
      </div>
    </div>`;
  window._medCount = 1;
}

function medRow(i) {
  return `<div class="form-row" id="med-row-${i}" style="margin-bottom:10px">
    <div class="form-group"><input class="input-field" id="med-name-${i}" placeholder="Medicine name"/></div>
    <div class="form-group" style="max-width:130px"><input class="input-field" id="med-dose-${i}" placeholder="Dosage (1-0-1)"/></div>
    <div class="form-group" style="max-width:100px"><input class="input-field" id="med-days-${i}" placeholder="Days" type="number"/></div>
  </div>`;
}

function addMedRow() {
  document.getElementById('med-rows').insertAdjacentHTML('beforeend', medRow(window._medCount));
  window._medCount++;
}

function savePrescription() {
  const pId   = parseInt(document.getElementById('rx-patient').value);
  const dept  = document.getElementById('rx-dept').value;
  const notes = document.getElementById('rx-notes').value.trim();
  const meds  = [];
  for (let i = 0; i < window._medCount; i++) {
    const name = document.getElementById(`med-name-${i}`)?.value.trim();
    const dose = document.getElementById(`med-dose-${i}`)?.value.trim();
    const days = document.getElementById(`med-days-${i}`)?.value.trim();
    if (name) meds.push({ name, dosage: dose || '1-0-1', days: parseInt(days)||7 });
  }
  if (!meds.length) { alert('Add at least one medicine.'); return; }
  const patient = DB.patients.find(p=>p.id===pId);
  const rx = {
    id: DB.nextId(DB.prescriptions), patientId: pId, patientName: patient.name,
    doctorId: 1, doctorName: currentUser.name, date: getTodayStr(), dept,
    medicines: meds, notes, status: 'pending'
  };
  DB.prescriptions.push(rx);
  Notif.add(`Prescription written for ${patient.name} – ${meds.length} medicine(s)`, 'success');
  Notif.add(`New prescription available for ${patient.name} from ${currentUser.name}`, 'info', 'pharmacy');
  alert('Prescription saved successfully!');
  navigateTo('prescriptions');
}

function render_prescriptions(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">All Prescriptions</div><div class="section-sub">Viewable by all departments</div></div>
        </div>
        ${DB.prescriptions.map(r=>`
          <div class="rx-card">
            <div class="rx-header">
              <div>
                <div class="rx-patient">👤 ${r.patientName} <span style="font-size:12px;color:var(--text-muted)">ID:${r.patientId}</span></div>
                <div class="rx-doctor">Dr. ${r.doctorName} · ${r.dept} · ${r.date}</div>
              </div>
              ${statusBadge(r.status)}
            </div>
            <div class="rx-meds">${r.medicines.map(m=>`<span class="rx-med">💊 ${m.name} – ${m.dosage} for ${m.days}d</span>`).join('')}</div>
            <div style="margin-top:10px;font-size:13px;color:var(--text-muted)">📝 ${r.notes}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function render_lab_orders(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">Lab Orders</div><div class="section-sub">Tests ordered for patients</div></div>
          <button class="btn btn-primary btn-sm" onclick="openLabOrderModal()">+ New Order</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Patient</th><th>Test</th><th>Doctor</th><th>Date</th><th>Status</th><th>Result</th></tr></thead>
          <tbody>${DB.labTests.map(t=>`
            <tr>
              <td>${t.id}</td><td><strong>${t.patientName}</strong></td><td>${t.test}</td>
              <td>${t.doctorName}</td><td>${t.date}</td><td>${statusBadge(t.status)}</td>
              <td style="font-size:12px;color:var(--text-muted)">${t.remarks || '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>`;
}

function openLabOrderModal() {
  showModal('🧪 New Lab Order', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-group">
        <label class="field-label">Patient</label>
        <select id="lo-patient" class="input-field">${DB.patients.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label class="field-label">Test Name</label>
        <select id="lo-test" class="input-field">
          <option>Complete Blood Count (CBC)</option><option>Lipid Profile</option>
          <option>Liver Function Test</option><option>Kidney Function Test</option>
          <option>MRI Brain</option><option>X-Ray Chest</option><option>X-Ray Knee (AP/Lat)</option>
          <option>ECG</option><option>Echocardiography</option><option>Blood Glucose (FBS)</option>
        </select>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveLabOrder()">Submit Order</button>
        <button class="btn" onclick="closeModal()" style="background:var(--bg-card2)">Cancel</button>
      </div>
    </div>`);
}

function saveLabOrder() {
  const pId  = parseInt(document.getElementById('lo-patient').value);
  const test = document.getElementById('lo-test').value;
  const pat  = DB.patients.find(p=>p.id===pId);
  DB.labTests.push({ id: DB.nextId(DB.labTests), patientId: pId, patientName: pat.name, doctorId: 1, doctorName: currentUser.name, date: getTodayStr(), test, status: 'pending', result: null, remarks: '' });
  Notif.add(`Lab order placed: ${test} for ${pat.name}`, 'info');
  closeModal();
  renderPage(currentPage);
}
