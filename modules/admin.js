// ── ADMIN MODULE ──

function render_admin_dashboard(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="report-header" style="background:linear-gradient(135deg,#2d006e,#c77dff)">
        <h2>Admin Dashboard 🛡️</h2>
        <p>Hospital-wide overview and management</p>
      </div>
      <div class="stats-grid">
        ${statCard('👨‍⚕️','blue',   DB.doctors.length,                             'Total Doctors')}
        ${statCard('👥','green',  DB.patients.length,                            'Registered Patients')}
        ${statCard('📅','yellow', DB.appointments.length,                        'Total Appointments')}
        ${statCard('💰','red',    '₹'+DB.bills.reduce((s,b)=>s+b.total,0).toLocaleString(), 'Total Revenue')}
        ${statCard('📋','purple', DB.prescriptions.length,                       'Prescriptions')}
        ${statCard('🧪','blue',   DB.labTests.length,                            'Lab Orders')}
      </div>
      <div class="two-col">
        <div class="section-card">
          <div class="section-header"><div class="section-title">Department Overview</div></div>
          ${[...new Set(DB.doctors.map(d=>d.dept))].map(dept=>{
            const docs = DB.doctors.filter(d=>d.dept===dept);
            const appts= DB.appointments.filter(a=>a.dept===dept);
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
              <div><strong>${dept}</strong><div style="font-size:12px;color:var(--text-muted)">${docs.length} doctor(s)</div></div>
              <div style="display:flex;gap:12px;font-size:13px">
                <span>📅 ${appts.length} appts</span>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="section-card">
          <div class="section-header"><div class="section-title">System Activity</div></div>
          <div class="timeline">
            <div class="timeline-item"><div class="timeline-title">New prescription written</div><div class="timeline-body">Dr. Rajesh Kumar → Meera Singh</div><div class="timeline-time">Today, 11:30 AM</div></div>
            <div class="timeline-item"><div class="timeline-title">Lab result uploaded</div><div class="timeline-body">Lipid Profile – Ravi Gupta</div><div class="timeline-time">Today, 10:00 AM</div></div>
            <div class="timeline-item"><div class="timeline-title">Bill paid</div><div class="timeline-body">Ravi Gupta – ₹1,715</div><div class="timeline-time">Yesterday, 3:15 PM</div></div>
            <div class="timeline-item"><div class="timeline-title">Stock alert resolved</div><div class="timeline-body">Aspirin 75mg restocked</div><div class="timeline-time">Yesterday, 1:00 PM</div></div>
          </div>
        </div>
      </div>
    </div>`;
}

function render_doctors(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">Doctor Management</div><div class="section-sub">Manage hospital doctors and availability</div></div>
          <button class="btn btn-primary btn-sm" onclick="openAddDoctorModal()">+ Add Doctor</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Name</th><th>Specialization</th><th>Department</th><th>Fee (₹)</th><th>Availability</th><th>Slots</th><th>Action</th></tr></thead>
          <tbody>${DB.doctors.map(d=>`
            <tr>
              <td>${d.id}</td>
              <td><div style="display:flex;align-items:center;gap:10px"><span style="font-size:22px">${d.avatar}</span><strong>${d.name}</strong></div></td>
              <td>${d.spec}</td><td>${d.dept}</td><td>₹${d.fee}</td>
              <td>${d.available?'<span class="badge badge-success">Available</span>':'<span class="badge badge-danger">Unavailable</span>'}</td>
              <td style="font-size:12px">${d.slots.join(', ')}</td>
              <td><button class="btn btn-sm" style="background:var(--bg-card2)" onclick="toggleDoctorAvail(${d.id})">${d.available?'Set Unavailable':'Set Available'}</button></td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>`;
}

function toggleDoctorAvail(docId) {
  const d = DB.doctors.find(x=>x.id===docId);
  if (d) { d.available = !d.available; Notif.add(`${d.name} marked as ${d.available?'Available':'Unavailable'}`, 'info'); }
  render_doctors(document.getElementById('content-area'));
}

function openAddDoctorModal() {
  showModal('👨‍⚕️ Add New Doctor', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-row">
        <div class="form-group"><label class="field-label">Full Name</label><input id="doc-name" class="input-field" placeholder="Dr. Full Name"/></div>
        <div class="form-group"><label class="field-label">Specialization</label><input id="doc-spec" class="input-field" placeholder="e.g. Cardiologist"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="field-label">Department</label><input id="doc-dept2" class="input-field" placeholder="e.g. Cardiology"/></div>
        <div class="form-group"><label class="field-label">Consultation Fee (₹)</label><input id="doc-fee" class="input-field" type="number" placeholder="Fee"/></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveDoctor()">✅ Add Doctor</button>
        <button class="btn" onclick="closeModal()" style="background:var(--bg-card2)">Cancel</button>
      </div>
    </div>`);
}

function saveDoctor() {
  const name = document.getElementById('doc-name').value.trim();
  const spec = document.getElementById('doc-spec').value.trim();
  const dept = document.getElementById('doc-dept2').value.trim();
  const fee  = parseInt(document.getElementById('doc-fee').value)||500;
  if (!name||!spec||!dept) { alert('Fill all fields'); return; }
  DB.doctors.push({ id: DB.nextId(DB.doctors), name, spec, dept, available: true, slots: ['09:00','10:00','11:00','14:00','15:00'], fee, avatar: '👨‍⚕️' });
  Notif.add(`New doctor added: ${name} (${spec})`, 'success');
  closeModal();
  render_doctors(document.getElementById('content-area'));
}

function render_patients(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">Patient Registry</div><div class="section-sub">All registered patients</div></div>
          <button class="btn btn-primary btn-sm" onclick="openAddPatientModal()">+ Register Patient</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Blood Group</th><th>Phone</th><th>Department</th><th>Appointments</th></tr></thead>
          <tbody>${DB.patients.map(p=>`
            <tr>
              <td>${p.id}</td><td><strong>${p.name}</strong></td><td>${p.age}</td><td>${p.gender}</td>
              <td><span class="badge badge-info">${p.blood}</span></td>
              <td>${p.phone}</td><td>${p.dept}</td>
              <td>${DB.appointments.filter(a=>a.patientId===p.id).length} appt(s)</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>`;
}

function openAddPatientModal() {
  showModal('👤 Register New Patient', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-row">
        <div class="form-group"><label class="field-label">Full Name</label><input id="pat-name" class="input-field" placeholder="Patient Name"/></div>
        <div class="form-group"><label class="field-label">Age</label><input id="pat-age" class="input-field" type="number" placeholder="Age"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="field-label">Gender</label>
          <select id="pat-gender" class="input-field"><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div class="form-group"><label class="field-label">Blood Group</label>
          <select id="pat-blood" class="input-field"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="field-label">Phone</label><input id="pat-phone" class="input-field" placeholder="Phone number"/></div>
        <div class="form-group"><label class="field-label">Department</label><input id="pat-dept" class="input-field" placeholder="e.g. Cardiology"/></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="savePatient()">✅ Register Patient</button>
        <button class="btn" onclick="closeModal()" style="background:var(--bg-card2)">Cancel</button>
      </div>
    </div>`);
}

function savePatient() {
  const name   = document.getElementById('pat-name').value.trim();
  const age    = parseInt(document.getElementById('pat-age').value)||0;
  const gender = document.getElementById('pat-gender').value;
  const blood  = document.getElementById('pat-blood').value;
  const phone  = document.getElementById('pat-phone').value.trim();
  const dept   = document.getElementById('pat-dept').value.trim();
  if (!name) { alert('Enter patient name'); return; }
  const newId = Math.max(...DB.patients.map(p=>p.id),100)+1;
  DB.patients.push({ id: newId, name, age, gender, blood, phone, dept });
  Notif.add(`New patient registered: ${name} (ID:${newId})`, 'success');
  closeModal();
  render_patients(document.getElementById('content-area'));
}
