// ── REPORTS MODULE (shared across all roles) ──

function render_reports(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="report-header">
        <h2>📈 Reports & Analytics</h2>
        <p>Hospital-wide insights – doctor availability, patient trends, pharmacy and billing</p>
      </div>
      <!-- Doctor Availability Report -->
      <div class="section-card">
        <div class="section-header"><div><div class="section-title">1. Doctor Availability Report</div><div class="section-sub">Current status of all doctors in the system</div></div>
          <button class="btn btn-sm" style="background:var(--bg-card2)" onclick="exportCSV('doctors')">⬇ Export CSV</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>ID</th><th>Name</th><th>Specialization</th><th>Department</th><th>Fee (₹)</th><th>Status</th><th>Slots Available</th><th>Total Appointments</th></tr></thead>
          <tbody>${DB.doctors.map(d=>`
            <tr>
              <td>${d.id}</td>
              <td><span style="font-size:18px;margin-right:6px">${d.avatar}</span><strong>${d.name}</strong></td>
              <td>${d.spec}</td><td>${d.dept}</td><td>₹${d.fee}</td>
              <td>${d.available?'<span class="badge badge-success">Available</span>':'<span class="badge badge-danger">Unavailable</span>'}</td>
              <td>${d.slots.length} slots</td>
              <td>${DB.appointments.filter(a=>a.doctorId===d.id).length}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>

      <!-- Day-wise Patient Report -->
      <div class="section-card">
        <div class="section-header"><div><div class="section-title">2. Day-wise Patient Report</div><div class="section-sub">Appointments grouped by date</div></div>
          <button class="btn btn-sm" style="background:var(--bg-card2)" onclick="exportCSV('appointments')">⬇ Export CSV</button>
        </div>
        ${renderDaywiseReport()}
      </div>

      <!-- Pharmacy Delivery Report -->
      <div class="section-card">
        <div class="section-header"><div><div class="section-title">3. Pharmacist Delivery Report</div><div class="section-sub">Medicine delivery status and summary</div></div>
          <button class="btn btn-sm" style="background:var(--bg-card2)" onclick="exportCSV('deliveries')">⬇ Export CSV</button>
        </div>
        <div class="two-col" style="margin-bottom:18px">
          ${statCard('🚚','blue',   DB.deliveries.length, 'Total Deliveries')}
          ${statCard('✅','green',  DB.deliveries.filter(d=>d.status==='delivered').length, 'Delivered')}
          ${statCard('⏳','yellow', DB.deliveries.filter(d=>d.status==='pending').length, 'Pending')}
          ${statCard('💰','purple', '₹'+DB.deliveries.reduce((s,d)=>s+d.total,0).toLocaleString(), 'Total Value')}
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Delivery ID</th><th>Patient</th><th>Date</th><th>Medicines</th><th>Total (₹)</th><th>Status</th></tr></thead>
          <tbody>${DB.deliveries.map(d=>`
            <tr>
              <td><strong>${d.id}</strong></td><td>${d.patientName}</td><td>${d.date}</td>
              <td style="font-size:12px">${d.items.join(', ')}</td>
              <td>₹${d.total}</td><td>${statusBadge(d.status)}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>

      <!-- Billing Summary -->
      <div class="section-card">
        <div class="section-header"><div><div class="section-title">4. Billing Summary Report</div><div class="section-sub">Revenue collection across all departments</div></div>
          <button class="btn btn-sm" style="background:var(--bg-card2)" onclick="exportCSV('billing')">⬇ Export CSV</button>
        </div>
        <div class="two-col" style="margin-bottom:18px">
          ${statCard('💰','blue',   '₹'+DB.bills.reduce((s,b)=>s+b.total,0).toLocaleString(), 'Total Billed')}
          ${statCard('✅','green',  '₹'+DB.bills.filter(b=>b.status==='paid').reduce((s,b)=>s+b.total,0).toLocaleString(), 'Collected')}
          ${statCard('⏳','yellow', '₹'+DB.bills.filter(b=>b.status==='pending').reduce((s,b)=>s+b.total,0).toLocaleString(), 'Outstanding')}
          ${statCard('📄','red',    DB.bills.filter(b=>b.status==='pending').length, 'Pending Bills')}
        </div>
        ${renderRevenueBarChart()}
      </div>
    </div>`;
}

function renderDaywiseReport() {
  const byDate = {};
  DB.appointments.forEach(a=>{
    if (!byDate[a.date]) byDate[a.date] = [];
    byDate[a.date].push(a);
  });
  const rows = Object.entries(byDate).sort((a,b)=>a[0].localeCompare(b[0]));
  return `<div class="table-wrap"><table>
    <thead><tr><th>Date</th><th>Total Patients</th><th>Confirmed</th><th>Pending</th><th>Rejected</th><th>Departments</th></tr></thead>
    <tbody>${rows.map(([date,appts])=>`
      <tr>
        <td><strong>${date}</strong></td>
        <td><strong>${appts.length}</strong></td>
        <td>${appts.filter(a=>a.status==='confirmed').length}</td>
        <td>${appts.filter(a=>a.status==='pending').length}</td>
        <td>${appts.filter(a=>a.status==='rejected').length}</td>
        <td style="font-size:12px">${[...new Set(appts.map(a=>a.dept))].join(', ')}</td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

function renderRevenueBarChart() {
  const days = {};
  DB.bills.forEach(b=>{ days[b.date]=(days[b.date]||0)+b.total; });
  const max = Math.max(...Object.values(days),1);
  const colors = ['#00b4d8','#06d6a0','#ffd166','#ef476f','#c77dff'];
  return `<div><div class="section-sub" style="margin-bottom:10px">Daily Revenue</div>
    <div class="chart-container">
      ${Object.entries(days).sort().map(([d,v],i)=>`
        <div class="chart-bar-wrap">
          <div class="chart-val">₹${v}</div>
          <div class="chart-bar" style="height:${Math.round(v/max*160)}px;background:${colors[i%colors.length]}"></div>
          <div class="chart-label">${d.slice(5)}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

// ── NOTIFICATIONS PAGE ──
function render_notifications(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">All Notifications</div></div>
          <button class="btn btn-sm btn-danger" onclick="clearNotifications();render_notifications(document.getElementById('content-area'))">Clear All</button>
        </div>
        ${DB.notifications.length ? DB.notifications.map(n=>`
          <div class="notif-item" style="border-radius:10px;background:var(--bg-card2);margin-bottom:8px;border:1px solid var(--border)">
            <div class="notif-dot" style="background:${n.type==='danger'?'var(--danger)':n.type==='success'?'var(--success)':n.type==='warning'?'var(--warning)':'var(--primary)'}"></div>
            <div><div class="notif-text">${n.msg}</div><div class="notif-time">${n.time}</div></div>
          </div>`).join('')
        : '<div class="empty-state"><div class="empty-icon">🔔</div><h4>No notifications</h4></div>'}
      </div>
    </div>`;
}

// ── CSV EXPORT ──
function exportCSV(type) {
  let rows = [], headers = [], data = [];
  if (type === 'doctors') {
    headers = ['ID','Name','Specialization','Department','Fee','Available','Total Appointments'];
    data = DB.doctors.map(d=>[d.id, d.name, d.spec, d.dept, d.fee, d.available?'Yes':'No', DB.appointments.filter(a=>a.doctorId===d.id).length]);
  } else if (type === 'appointments') {
    headers = ['ID','Patient','Doctor','Department','Date','Time','Reason','Status'];
    data = DB.appointments.map(a=>[a.id, a.patientName, a.doctorName, a.dept, a.date, a.time, a.reason, a.status]);
  } else if (type === 'deliveries') {
    headers = ['ID','Patient','Date','Items','Total','Status'];
    data = DB.deliveries.map(d=>[d.id, d.patientName, d.date, d.items.join(' | '), d.total, d.status]);
  } else if (type === 'billing') {
    headers = ['Bill ID','Patient','Date','Items','Total','Status'];
    data = DB.bills.map(b=>[b.id, b.patientName, b.date, b.items.map(i=>i.desc).join(' | '), b.total, b.status]);
  }
  const csv = [headers, ...data].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
  const a   = document.createElement('a');
  a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download= `ehospital_${type}_report.csv`;
  a.click();
}
