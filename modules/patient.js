// ── PATIENT MODULE ──

function render_patient_dashboard(area) {
  const myAppts = DB.appointments.filter(a => a.patientId === 101);
  const myRx    = DB.prescriptions.filter(p => p.patientId === 101);
  const myBills = DB.bills.filter(b => b.patientId === 101);
  area.innerHTML = `
    <div class="fade-in">
      <div class="report-header" style="background:linear-gradient(135deg,#0077b6,#00b4d8)">
        <h2>Welcome back, ${currentUser.name} 👋</h2>
        <p>Your personal health dashboard – all in one place</p>
      </div>
      <div class="stats-grid">
        ${statCard('📅', 'blue',   myAppts.length, 'Total Appointments')}
        ${statCard('📋', 'green',  myRx.length,    'Prescriptions')}
        ${statCard('💳', 'yellow', myBills.filter(b=>b.status==='pending').length, 'Pending Bills')}
        ${statCard('🏥', 'purple', '6', 'Available Doctors')}
      </div>
      <div class="two-col">
        <div class="section-card">
          <div class="section-header"><div><div class="section-title">Upcoming Appointments</div></div>
            <button class="btn btn-primary btn-sm" onclick="navigateTo('find-doctor')">+ Book New</button></div>
          ${myAppts.length ? myAppts.slice(0,3).map(a=>`
            <div class="lab-result">
              <div class="lab-result-header">
                <div><strong>${a.doctorName}</strong><div style="font-size:12px;color:var(--text-muted)">${a.dept}</div></div>
                ${statusBadge(a.status)}
              </div>
              <div style="font-size:13px;color:var(--text-muted)">📅 ${a.date} &nbsp; ⏰ ${a.time} &nbsp; 📝 ${a.reason}</div>
            </div>`).join('') : '<div class="empty-state"><div class="empty-icon">📅</div><p>No appointments yet</p></div>'}
        </div>
        <div class="section-card">
          <div class="section-header"><div class="section-title">Recent Prescriptions</div></div>
          ${myRx.length ? myRx.map(r=>`
            <div class="rx-card">
              <div class="rx-header"><div><div class="rx-doctor">${r.doctorName}</div><div style="font-size:12px;color:var(--text-muted)">${r.date}</div></div>${statusBadge(r.status)}</div>
              <div class="rx-meds">${r.medicines.map(m=>`<span class="rx-med">💊 ${m.name}</span>`).join('')}</div>
            </div>`).join('') : '<div class="empty-state"><div class="empty-icon">📋</div><p>No prescriptions</p></div>'}
        </div>
      </div>
    </div>`;
}

function render_find_doctor(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header"><div><div class="section-title">Find a Doctor</div><div class="section-sub">Search by name, specialization or department</div></div></div>
        <div class="search-bar">
          <input class="search-input" id="doc-search" placeholder="🔍 Search doctor, specialization..." oninput="filterDoctors()"/>
          <select class="search-input" id="doc-dept" style="max-width:200px" onchange="filterDoctors()">
            <option value="">All Departments</option>
            ${[...new Set(DB.doctors.map(d=>d.dept))].map(d=>`<option>${d}</option>`).join('')}
          </select>
        </div>
        <div class="doctor-grid" id="doctor-grid">${renderDoctorCards(DB.doctors)}</div>
      </div>
    </div>`;
}

function filterDoctors() {
  const q    = document.getElementById('doc-search').value.toLowerCase();
  const dept = document.getElementById('doc-dept').value;
  const filtered = DB.doctors.filter(d =>
    (!q || d.name.toLowerCase().includes(q) || d.spec.toLowerCase().includes(q)) &&
    (!dept || d.dept === dept));
  document.getElementById('doctor-grid').innerHTML = renderDoctorCards(filtered);
}

function renderDoctorCards(docs) {
  if (!docs.length) return '<div class="empty-state"><div class="empty-icon">🔍</div><p>No doctors found</p></div>';
  return docs.map(d => `
    <div class="doctor-card" onclick="openBookingModal(${d.id})">
      <div class="doctor-avatar">${d.avatar}</div>
      <div class="doctor-name">${d.name}</div>
      <div class="doctor-spec">${d.spec}</div>
      <div class="doctor-avail">${d.available ? badge('Available','success') : badge('Unavailable','danger')}</div>
      <div style="margin-top:10px;font-size:12px;color:var(--text-muted)">Consultation: ₹${d.fee}</div>
      ${d.available ? `<button class="btn btn-primary btn-sm" style="margin-top:10px;width:100%">Book Appointment</button>` : ''}
    </div>`).join('');
}

function openBookingModal(doctorId) {
  const d = DB.doctors.find(x => x.id === doctorId);
  if (!d || !d.available) return;
  const bookedSlots = DB.appointments.filter(a => a.doctorId === doctorId && a.date === getTodayStr() && a.status !== 'rejected').map(a => a.time);
  const slotsHTML = d.slots.map(s => {
    const isBooked = bookedSlots.includes(s);
    return `<div class="slot ${isBooked?'booked':'available'}" id="slot-${s.replace(':','')}" onclick="${isBooked?'':`selectSlot('${s}')`}">${s}</div>`;
  }).join('');
  showModal(`Book Appointment – ${d.name}`, `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="background:var(--bg-card2);border-radius:12px;padding:16px;display:flex;gap:14px;align-items:center">
        <div style="font-size:36px">${d.avatar}</div>
        <div><div style="font-weight:700">${d.name}</div><div style="font-size:13px;color:var(--text-muted)">${d.spec} · ${d.dept}</div><div style="font-size:13px;color:var(--text-muted)">Consultation: ₹${d.fee}</div></div>
      </div>
      <div class="form-group">
        <label class="field-label">Appointment Date</label>
        <input type="date" id="book-date" class="input-field" value="${getTodayStr()}" min="${getTodayStr()}"/>
      </div>
      <div class="form-group">
        <label class="field-label">Select Time Slot</label>
        <div class="slot-grid">${slotsHTML}</div>
      </div>
      <div class="form-group">
        <label class="field-label">Reason for Visit</label>
        <textarea id="book-reason" class="input-field" rows="2" placeholder="Describe your symptoms..."></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="confirmBooking(${doctorId})">✅ Confirm Booking</button>
        <button class="btn" onclick="closeModal()" style="background:var(--bg-card2);color:var(--text)">Cancel</button>
      </div>
    </div>`);
  window._selectedSlot = null;
}

function selectSlot(time) {
  document.querySelectorAll('.slot.available, .slot.selected').forEach(s => {
    s.classList.remove('selected');
    if (!s.classList.contains('booked')) s.classList.add('available');
  });
  const el = document.getElementById(`slot-${time.replace(':','')}`);
  if (el) { el.classList.remove('available'); el.classList.add('selected'); }
  window._selectedSlot = time;
}

function confirmBooking(doctorId) {
  const d      = DB.doctors.find(x => x.id === doctorId);
  const date   = document.getElementById('book-date').value;
  const reason = document.getElementById('book-reason').value.trim();
  const time   = window._selectedSlot;
  if (!date)   { alert('Please select a date.'); return; }
  if (!time)   { alert('Please select a time slot.'); return; }
  if (!reason) { alert('Please enter reason for visit.'); return; }
  const appt = { id: DB.nextId(DB.appointments), patientId: 101, patientName: currentUser.name, doctorId, doctorName: d.name, date, time, status: 'pending', dept: d.dept, reason };
  DB.appointments.push(appt);
  Notif.add(`Appointment booked with ${d.name} on ${date} at ${time}`, 'success');
  Notif.add(`New appointment request from ${currentUser.name} for ${date} at ${time}`, 'info', 'doctor');
  closeModal();
  navigateTo('my-appointments');
}

function render_my_appointments(area) {
  const appts = DB.appointments.filter(a => a.patientId === 101);
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">My Appointments</div><div class="section-sub">Track all your scheduled visits</div></div>
          <button class="btn btn-primary btn-sm" onclick="navigateTo('find-doctor')">+ New Appointment</button>
        </div>
        ${appts.length ? `
        <div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Doctor</th><th>Department</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
          <tbody>${appts.map(a=>`
            <tr>
              <td>${a.id}</td><td><strong>${a.doctorName}</strong></td><td>${a.dept}</td>
              <td>${a.date}</td><td>${a.time}</td><td>${a.reason}</td>
              <td>${statusBadge(a.status)}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>` : '<div class="empty-state"><div class="empty-icon">📅</div><h4>No appointments</h4><p>Book your first appointment</p></div>'}
      </div>
    </div>`;
}

function render_my_prescriptions(area) {
  const rxs = DB.prescriptions.filter(p => p.patientId === 101);
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header"><div class="section-title">My Prescriptions</div><div class="section-sub">Prescriptions from all departments</div></div>
        ${rxs.length ? rxs.map(r=>`
          <div class="rx-card">
            <div class="rx-header">
              <div><div class="rx-patient">Prescribed by: ${r.doctorName}</div><div class="rx-doctor">${r.dept} · ${r.date}</div></div>
              ${statusBadge(r.status)}
            </div>
            <div class="rx-meds">${r.medicines.map(m=>`<span class="rx-med">💊 ${m.name} – ${m.dosage} (${m.days} days)</span>`).join('')}</div>
            <div style="margin-top:10px;font-size:13px;color:var(--text-muted)">📝 ${r.notes}</div>
          </div>`).join('')
        : '<div class="empty-state"><div class="empty-icon">📋</div><h4>No prescriptions yet</h4></div>'}
      </div>
    </div>`;
}

function render_my_bills(area) {
  const bills = DB.bills.filter(b => b.patientId === 101);
  const total  = bills.reduce((s,b)=>s+b.total,0);
  const paid   = bills.filter(b=>b.status==='paid').reduce((s,b)=>s+b.total,0);
  area.innerHTML = `
    <div class="fade-in">
      <div class="stats-grid">
        ${statCard('💰','blue','₹'+total.toLocaleString(),'Total Billed')}
        ${statCard('✅','green','₹'+paid.toLocaleString(),'Paid')}
        ${statCard('⏳','yellow','₹'+(total-paid).toLocaleString(),'Outstanding')}
      </div>
      <div class="section-card">
        <div class="section-header"><div class="section-title">My Bills</div></div>
        ${bills.map(b=>`
          <div class="lab-result" style="margin-bottom:12px">
            <div class="lab-result-header">
              <div><strong>Bill #${b.id}</strong><div style="font-size:12px;color:var(--text-muted)">${b.date}</div></div>
              <div style="display:flex;gap:10px;align-items:center">${statusBadge(b.status)}<strong>₹${b.total.toLocaleString()}</strong></div>
            </div>
            <div style="font-size:13px;color:var(--text-muted)">${b.items.map(i=>`${i.desc}: ₹${i.amt}`).join(' &nbsp;|&nbsp; ')}</div>
            ${b.status==='pending'?`<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="payBill('${b.id}')">💳 Pay Now</button>`:''}
          </div>`).join('')}
      </div>
    </div>`;
}

function payBill(billId) {
  const b = DB.bills.find(x=>x.id===billId);
  if (!b) return;
  b.status = 'paid';
  Notif.add(`Bill #${billId} paid successfully – ₹${b.total.toLocaleString()}`, 'success');
  render_my_bills(document.getElementById('content-area'));
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}
