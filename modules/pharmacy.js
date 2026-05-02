// ── PHARMACY MODULE ──

function render_pharmacy_dashboard(area) {
  const lowStock   = DB.inventory.filter(m => m.stock <= m.threshold);
  const pending    = DB.deliveries.filter(d => d.status === 'pending');
  const totalItems = DB.inventory.reduce((s,m)=>s+m.stock,0);
  area.innerHTML = `
    <div class="fade-in">
      <div class="report-header" style="background:linear-gradient(135deg,#7b4f00,#ffd166)">
        <h2>Pharmacist Dashboard 💊</h2>
        <p>Manage inventory, prescriptions and medicine delivery</p>
      </div>
      <div class="stats-grid">
        ${statCard('📦','blue',   DB.inventory.length,      'Medicine Types')}
        ${statCard('🔢','green',  totalItems.toLocaleString(),'Total Stock Units')}
        ${statCard('⚠️','yellow', lowStock.length,           'Low Stock Alerts')}
        ${statCard('🚚','purple', pending.length,            'Pending Deliveries')}
      </div>
      <div class="two-col">
        <div class="section-card">
          <div class="section-header"><div class="section-title">⚠️ Low Stock Alert</div></div>
          ${lowStock.length ? lowStock.map(m=>`
            <div class="lab-result">
              <div class="lab-result-header"><div><strong>${m.name}</strong><div style="font-size:12px;color:var(--text-muted)">${m.category}</div></div><span class="badge badge-danger">${m.stock} ${m.unit}</span></div>
              <div class="stock-level"><div class="stock-bar"><div class="stock-fill" style="width:${Math.min(100,m.stock/m.threshold*100)}%;background:var(--danger)"></div></div><span style="font-size:12px;color:var(--text-muted)">Min: ${m.threshold}</span></div>
            </div>`).join('')
          : '<div class="empty-state"><div class="empty-icon">✅</div><p>All stocks adequate</p></div>'}
        </div>
        <div class="section-card">
          <div class="section-header"><div class="section-title">Pending Prescriptions</div></div>
          ${DB.prescriptions.filter(r=>r.status==='pending').map(r=>`
            <div class="rx-card">
              <div class="rx-header">
                <div><div class="rx-patient">${r.patientName}</div><div class="rx-doctor">${r.date}</div></div>
                <button class="btn btn-success btn-sm" onclick="dispenseRx(${r.id})">Dispense</button>
              </div>
              <div class="rx-meds">${r.medicines.map(m=>`<span class="rx-med">💊 ${m.name}</span>`).join('')}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function dispenseRx(rxId) {
  const rx = DB.prescriptions.find(r=>r.id===rxId);
  if (!rx) return;
  rx.status = 'dispensed';
  // Create delivery
  const total = rx.medicines.reduce((s,m)=>{
    const inv = DB.inventory.find(i=>i.name.toLowerCase().includes(m.name.split(' ')[0].toLowerCase()));
    return s + (inv ? inv.price * m.days : 50);
  },0);
  DB.deliveries.push({ id: `D${String(DB.deliveries.length+1).padStart(3,'0')}`, prescriptionId: rxId, patientName: rx.patientName, date: getTodayStr(), items: rx.medicines.map(m=>`${m.name} x${m.days}`), status: 'pending', total: Math.round(total) });
  // deduct stock
  rx.medicines.forEach(m=>{
    const inv = DB.inventory.find(i=>i.name===m.name);
    if (inv) inv.stock = Math.max(0, inv.stock - m.days);
  });
  Notif.add(`Prescription dispensed for ${rx.patientName}`, 'success');
  Notif.add(`Medicines dispensed for ${rx.patientName} – delivery scheduled`, 'info', 'patient');
  renderPage(currentPage);
}

function render_inventory(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="section-card">
        <div class="section-header">
          <div><div class="section-title">Medicine Inventory</div><div class="section-sub">Stock levels and reorder management</div></div>
          <button class="btn btn-primary btn-sm" onclick="openAddStockModal()">+ Add Stock</button>
        </div>
        <div class="search-bar">
          <input class="search-input" id="inv-search" placeholder="🔍 Search medicine..." oninput="filterInventory()"/>
          <select class="search-input" id="inv-cat" style="max-width:180px" onchange="filterInventory()">
            <option value="">All Categories</option>
            ${[...new Set(DB.inventory.map(m=>m.category))].map(c=>`<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="table-wrap" id="inv-table">${renderInventoryTable(DB.inventory)}</div>
      </div>
    </div>`;
}

function renderInventoryTable(items) {
  return `<table>
    <thead><tr><th>ID</th><th>Medicine</th><th>Category</th><th>Stock</th><th>Level</th><th>Price (₹)</th><th>Supplier</th><th>Status</th></tr></thead>
    <tbody>${items.map(m=>{
      const pct = Math.min(100, Math.round(m.stock/m.threshold*100));
      const color = pct<50?'var(--danger)':pct<100?'var(--warning)':'var(--success)';
      return `<tr>
        <td>${m.id}</td><td><strong>${m.name}</strong></td><td>${m.category}</td>
        <td>${m.stock} ${m.unit}</td>
        <td style="min-width:120px"><div class="stock-level"><div class="stock-bar"><div class="stock-fill" style="width:${pct}%;background:${color}"></div></div><span style="font-size:11px">${m.stock}/${m.threshold}</span></div></td>
        <td>₹${m.price}</td><td>${m.supplier}</td>
        <td>${m.stock<=m.threshold?'<span class="badge badge-danger">Low Stock</span>':'<span class="badge badge-success">OK</span>'}</td>
      </tr>`;}).join('')}
    </tbody></table>`;
}

function filterInventory() {
  const q   = document.getElementById('inv-search').value.toLowerCase();
  const cat = document.getElementById('inv-cat').value;
  const f   = DB.inventory.filter(m=>(!q||m.name.toLowerCase().includes(q))&&(!cat||m.category===cat));
  document.getElementById('inv-table').innerHTML = renderInventoryTable(f);
}

function openAddStockModal() {
  showModal('📦 Add / Restock Medicine', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-group"><label class="field-label">Medicine</label>
        <select id="stock-med" class="input-field">${DB.inventory.map(m=>`<option value="${m.id}">${m.name} (Current: ${m.stock})</option>`).join('')}</select></div>
      <div class="form-group"><label class="field-label">Add Units</label>
        <input id="stock-qty" class="input-field" type="number" min="1" placeholder="Quantity to add"/></div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="addStock()">✅ Update Stock</button>
        <button class="btn" onclick="closeModal()" style="background:var(--bg-card2)">Cancel</button>
      </div>
    </div>`);
}

function addStock() {
  const mid = document.getElementById('stock-med').value;
  const qty = parseInt(document.getElementById('stock-qty').value);
  if (!qty || qty < 1) { alert('Enter valid quantity'); return; }
  const m = DB.inventory.find(i=>i.id===mid);
  if (m) { m.stock += qty; Notif.add(`Stock updated: ${m.name} +${qty} units (Total: ${m.stock})`, 'success'); }
  closeModal();
  render_inventory(document.getElementById('content-area'));
}

function render_deliveries(area) {
  area.innerHTML = `
    <div class="fade-in">
      <div class="stats-grid">
        ${statCard('🚚','blue',   DB.deliveries.length,                            'Total Deliveries')}
        ${statCard('⏳','yellow', DB.deliveries.filter(d=>d.status==='pending').length,  'Pending')}
        ${statCard('✅','green',  DB.deliveries.filter(d=>d.status==='delivered').length,'Delivered')}
      </div>
      <div class="section-card">
        <div class="section-header"><div class="section-title">Delivery Management</div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>ID</th><th>Patient</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${DB.deliveries.map(d=>`
            <tr>
              <td>${d.id}</td><td><strong>${d.patientName}</strong></td><td>${d.date}</td>
              <td style="font-size:12px">${d.items.join(', ')}</td>
              <td>₹${d.total}</td><td>${statusBadge(d.status)}</td>
              <td>${d.status==='pending'?`<button class="btn btn-success btn-sm" onclick="markDelivered('${d.id}')">Mark Delivered</button>`:'✅'}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>`;
}

function markDelivered(delivId) {
  const d = DB.deliveries.find(x=>x.id===delivId);
  if (d) { d.status = 'delivered'; Notif.add(`Medicines delivered to ${d.patientName}`, 'success'); }
  render_deliveries(document.getElementById('content-area'));
}
