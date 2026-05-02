// ── LAB MODULE ──

function render_lab_dashboard(area) {
  const pending   = DB.labTests.filter(t=>t.status==='pending');
  const completed = DB.labTests.filter(t=>t.status==='completed');
  area.innerHTML = `
    <div class="fade-in">
      <div class="report-header" style="background:linear-gradient(135deg,#003566,#48cae4)">
        <h2>Lab Admin Dashboard 🔬</h2>
        <p>Manage test orders and upload results for all departments</p>
      </div>
      <div class="stats-grid">
        ${statCard('🧪','blue',   DB.labTests.length,  'Total Test Orders')}
        ${statCard('⏳','yellow', pending.length,       'Pending Tests')}
        ${statCard('✅','green',  completed.length,     'Results Uploaded')}
        ${statCard('🏥','purple', [...new Set(DB.labTests.map(t=>t.dept||'General'))].length, 'Departments')}
      </div>
      <div class="section-card">
        <div class="section-header"><div class="section-title">Pending Lab Tests</div></div>
        ${pending.length ? pending.map(t=>`
          <div class="lab-result">
            <div class="lab-result-header">
              <div><strong>${t.test}</strong><div style="font-size:12px;color:var(--text-muted)">Patient: ${t.patientName} · Ordered by ${t.doctorName} · ${t.date}</div></div>
              <button class="btn btn-primary btn-sm" onclick="openUploadModal(${t.id})">Upload Result</button>
            </div>
          </div>`).join('')
        : '<div class="empty-state"><div class="empty-icon">✅</div><p>All tests processed</p></div>'}
      </div>
    </div>`;
}

function render_upload_results(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header"><div><div class="section-title">⬆️ Upload Lab Results</div><div class="section-sub">Update test results for pending orders</div></div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Patient</th><th>Test</th><th>Doctor</th><th>Date</th><th>Status</th><th>Remarks</th><th>Action</th></tr></thead>
          <tbody>${DB.labTests.map(t=>`
            <tr>
              <td>${t.id}</td><td><strong>${t.patientName}</strong></td><td>${t.test}</td>
              <td>${t.doctorName}</td><td>${t.date}</td><td>${statusBadge(t.status)}</td>
              <td style="font-size:12px;color:var(--text-muted)">${t.remarks||'—'}</td>
              <td>${t.status==='pending'?`<button class="btn btn-primary btn-sm" onclick="openUploadModal(${t.id})">Upload</button>`:'<span class="badge badge-success">Done</span>'}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>`;
}

function openUploadModal(testId) {
  const t = DB.labTests.find(x=>x.id===testId);
  if (!t) return;
  showModal(`🧪 Upload Result – ${t.test}`, `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="background:var(--bg-card2);border-radius:10px;padding:14px;font-size:13px">
        <strong>${t.patientName}</strong> &nbsp;|&nbsp; ${t.test} &nbsp;|&nbsp; ${t.date}<br/>
        <span style="color:var(--text-muted)">Ordered by: ${t.doctorName}</span>
      </div>
      <div class="form-group"><label class="field-label">Result Summary / Findings</label>
        <textarea id="res-summary" class="input-field" rows="3" placeholder="Enter test findings..."></textarea></div>
      <div class="form-group"><label class="field-label">Key Values (e.g. HB:12g/dL, BP:120/80)</label>
        <input id="res-values" class="input-field" placeholder="Param1:Value1, Param2:Value2"/></div>
      <div class="form-group"><label class="field-label">Doctor's Remarks / Interpretation</label>
        <input id="res-remarks" class="input-field" placeholder="Normal / Borderline / Abnormal..."/></div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveLabResult(${testId})">✅ Upload Result</button>
        <button class="btn" onclick="closeModal()" style="background:var(--bg-card2)">Cancel</button>
      </div>
    </div>`);
}

function saveLabResult(testId) {
  const t       = DB.labTests.find(x=>x.id===testId);
  const summary = document.getElementById('res-summary').value.trim();
  const values  = document.getElementById('res-values').value.trim();
  const remarks = document.getElementById('res-remarks').value.trim();
  if (!summary) { alert('Enter result findings.'); return; }
  t.status  = 'completed';
  t.remarks = remarks;
  t.result  = { summary };
  if (values) {
    values.split(',').forEach(pair=>{
      const [k,v] = pair.split(':');
      if (k&&v) t.result[k.trim()] = v.trim();
    });
  }
  Notif.add(`Lab result uploaded: ${t.test} for ${t.patientName}`, 'success');
  Notif.add(`Lab result ready for ${t.patientName} – ${t.test}`, 'info', 'doctor');
  closeModal();
  renderPage(currentPage);
}
