// ── BILLING MODULE ──

function render_billing_dashboard(area) {
  const total   = DB.bills.reduce((s,b)=>s+b.total,0);
  const paid    = DB.bills.filter(b=>b.status==='paid').reduce((s,b)=>s+b.total,0);
  const pending = DB.bills.filter(b=>b.status==='pending');
  area.innerHTML = `
    <div class="fade-in">
      <div class="report-header" style="background:linear-gradient(135deg,#6b0000,#ef476f)">
        <h2>Billing Dashboard 💳</h2>
        <p>Track hospital transactions, generate bills and manage payments</p>
      </div>
      <div class="stats-grid">
        ${statCard('💰','blue',   '₹'+total.toLocaleString(),     'Total Revenue')}
        ${statCard('✅','green',  '₹'+paid.toLocaleString(),      'Collected')}
        ${statCard('⏳','yellow', '₹'+(total-paid).toLocaleString(),'Outstanding')}
        ${statCard('📄','red',    pending.length,                  'Pending Bills')}
      </div>
      <div class="two-col">
        <div class="section-card">
          <div class="section-header"><div class="section-title">Pending Bills</div><button class="btn btn-primary btn-sm" onclick="navigateTo('billing')">View All</button></div>
          ${pending.map(b=>`
            <div class="lab-result">
              <div class="lab-result-header">
                <div><strong>${b.patientName}</strong><div style="font-size:12px;color:var(--text-muted)">Bill #${b.id} · ${b.date}</div></div>
                <div style="display:flex;gap:8px;align-items:center"><strong>₹${b.total.toLocaleString()}</strong>
                  <button class="btn btn-success btn-sm" onclick="markBillPaid('${b.id}')">Mark Paid</button></div>
              </div>
            </div>`).join('')||'<div class="empty-state"><div class="empty-icon">✅</div><p>No pending bills</p></div>'}
        </div>
        <div class="section-card">
          <div class="section-header"><div class="section-title">Revenue by Department</div></div>
          ${renderDeptRevChart()}
        </div>
      </div>
    </div>`;
}

function renderDeptRevChart() {
  const depts = {};
  DB.bills.forEach(b=>{
    b.items.forEach(i=>{
      const dept = i.desc.includes('Cardiology')?'Cardiology':i.desc.includes('Neurology')?'Neurology':i.desc.includes('Orthopedics')?'Orthopedics':i.desc.includes('Medicines')?'Pharmacy':'Other';
      depts[dept] = (depts[dept]||0) + i.amt;
    });
  });
  const max = Math.max(...Object.values(depts),1);
  const colors = ['#00b4d8','#06d6a0','#ffd166','#ef476f','#c77dff','#48cae4'];
  return `<div class="chart-container">` +
    Object.entries(depts).map(([k,v],i)=>`
      <div class="chart-bar-wrap">
        <div class="chart-val">₹${v}</div>
        <div class="chart-bar" style="height:${Math.round(v/max*160)}px;background:${colors[i%colors.length]}"></div>
        <div class="chart-label">${k}</div>
      </div>`).join('') + `</div>`;
}

function render_billing(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">All Bills</div><div class="section-sub">Complete billing ledger</div></div>
          <button class="btn btn-primary btn-sm" onclick="openNewBillModal()">+ New Bill</button>
        </div>
        <div id="bills-list">${renderBillsList()}</div>
      </div>
    </div>`;
}

function renderBillsList() {
  return DB.bills.map(b=>`
    <div class="rx-card">
      <div class="rx-header">
        <div>
          <div class="rx-patient">👤 ${b.patientName} <span style="font-size:12px;color:var(--text-muted)">Bill #${b.id}</span></div>
          <div class="rx-doctor">${b.date}</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          ${statusBadge(b.status)}
          <strong style="font-size:16px">₹${b.total.toLocaleString()}</strong>
        </div>
      </div>
      <div class="table-wrap" style="margin-top:10px"><table>
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>${b.items.map(i=>`<tr><td>${i.desc}</td><td>₹${i.amt}</td></tr>`).join('')}
          <tr style="font-weight:700"><td>Total</td><td>₹${b.total}</td></tr>
        </tbody>
      </table></div>
      ${b.status==='pending'?`<div style="margin-top:10px"><button class="btn btn-success btn-sm" onclick="markBillPaid('${b.id}')">✅ Mark Paid</button> <button class="btn btn-primary btn-sm" onclick="printBill('${b.id}')">🖨️ Print</button></div>`:`<button class="btn btn-sm" style="margin-top:8px;background:var(--bg-card2)" onclick="printBill('${b.id}')">🖨️ Print</button>`}
    </div>`).join('');
}

function markBillPaid(billId) {
  const b = DB.bills.find(x=>x.id===billId);
  if (b) { b.status='paid'; Notif.add(`Bill #${billId} marked as paid – ₹${b.total.toLocaleString()}`, 'success'); }
  if (currentPage==='billing') document.getElementById('bills-list').innerHTML = renderBillsList();
  else renderPage(currentPage);
}

function openNewBillModal() {
  showModal('💰 Generate New Bill', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-group"><label class="field-label">Patient</label>
        <select id="bill-patient" class="input-field">${DB.patients.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
      <div id="bill-items">
        <div class="field-label" style="margin-bottom:6px">Bill Items</div>
        ${billItemRow(0)}
      </div>
      <button class="btn btn-sm" style="background:var(--bg-card2)" onclick="addBillItem()">+ Add Item</button>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveBill()">Generate Bill</button>
        <button class="btn" onclick="closeModal()" style="background:var(--bg-card2)">Cancel</button>
      </div>
    </div>`);
  window._billItemCount = 1;
}

function billItemRow(i) {
  return `<div class="form-row" id="bill-item-${i}" style="margin-bottom:8px">
    <div class="form-group"><input id="bi-desc-${i}" class="input-field" placeholder="Description"/></div>
    <div class="form-group" style="max-width:120px"><input id="bi-amt-${i}" class="input-field" type="number" placeholder="₹ Amount"/></div>
  </div>`;
}

function addBillItem() {
  document.getElementById('bill-items').insertAdjacentHTML('beforeend', billItemRow(window._billItemCount));
  window._billItemCount++;
}

function saveBill() {
  const pId = parseInt(document.getElementById('bill-patient').value);
  const pat  = DB.patients.find(p=>p.id===pId);
  const items = [];
  for (let i=0; i<window._billItemCount; i++) {
    const desc = document.getElementById(`bi-desc-${i}`)?.value.trim();
    const amt  = parseFloat(document.getElementById(`bi-amt-${i}`)?.value);
    if (desc && amt) items.push({ desc, amt });
  }
  if (!items.length) { alert('Add at least one item.'); return; }
  const total = items.reduce((s,i)=>s+i.amt,0);
  DB.bills.push({ id:`B${String(DB.bills.length+1).padStart(3,'0')}`, patientId:pId, patientName:pat.name, date:getTodayStr(), items, status:'pending', total });
  Notif.add(`New bill generated for ${pat.name} – ₹${total.toLocaleString()}`, 'info');
  closeModal();
  renderPage(currentPage);
}

function printBill(billId) {
  const b = DB.bills.find(x=>x.id===billId);
  const w = window.open('','_blank','width=700,height=600');
  w.document.write(`<html><head><title>Bill ${b.id}</title><style>body{font-family:sans-serif;padding:30px}h2{color:#0077b6}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd}tfoot td{font-weight:bold}</style></head><body>
    <h2>🏥 E-Hospital System</h2><h3>Bill #${b.id}</h3>
    <p><strong>Patient:</strong> ${b.patientName} | <strong>Date:</strong> ${b.date} | <strong>Status:</strong> ${b.status.toUpperCase()}</p>
    <table><thead><tr><th>Description</th><th>Amount (₹)</th></tr></thead>
    <tbody>${b.items.map(i=>`<tr><td>${i.desc}</td><td>₹${i.amt}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td>Total</td><td>₹${b.total.toLocaleString()}</td></tr></tfoot></table>
    <p style="margin-top:20px;color:#666">Thank you for choosing E-Hospital. Get well soon!</p>
  </body></html>`);
  w.document.close(); w.print();
}

function render_transactions(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="stats-grid">
        ${statCard('📊','blue', DB.bills.length, 'Total Transactions')}
        ${statCard('💰','green', '₹'+DB.bills.filter(b=>b.status==='paid').reduce((s,b)=>s+b.total,0).toLocaleString(), 'Total Collected')}
        ${statCard('⏳','yellow', DB.bills.filter(b=>b.status==='pending').length, 'Pending Bills')}
      </div>
      <div class="section-card">
        <div class="section-header"><div class="section-title">Transaction Ledger</div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Bill ID</th><th>Patient</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${DB.bills.map(b=>`
            <tr>
              <td><strong>${b.id}</strong></td><td>${b.patientName}</td><td>${b.date}</td>
              <td style="font-size:12px">${b.items.map(i=>i.desc).join(', ')}</td>
              <td><strong>₹${b.total.toLocaleString()}</strong></td>
              <td>${statusBadge(b.status)}</td>
              <td>${b.status==='pending'?`<button class="btn btn-success btn-sm" onclick="markBillPaid('${b.id}');render_transactions(document.getElementById('content-area'))">Pay</button>`:'✅'}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>`;
}
