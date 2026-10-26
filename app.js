/**
 * MediVault Care Management
 * Pure client-side HTML, CSS & JavaScript application
 * LocalStorage persistent state - zero server required
 */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const STORAGE_KEY = 'medivault_healthcare_data_v1';

// Seed sample data for realistic first-time view
function getSeedData() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);
  const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10);

  return {
    patients: [
      { id: 'MV-10021', name: 'Eleanor Vance', dob: '1984-06-14', contact: '+1 (555) 234-8901', email: 'e.vance@example.com', status: 'Active', updated: today },
      { id: 'MV-10022', name: 'Marcus Chen', dob: '1976-11-23', contact: '+1 (555) 345-6712', email: 'm.chen@example.com', status: 'Active', updated: today },
      { id: 'MV-10023', name: 'Amira Patel', dob: '1992-03-30', contact: '+1 (555) 890-1234', email: 'amira.p@example.com', status: 'Active', updated: yesterday },
      { id: 'MV-10024', name: 'David Kowalski', dob: '1968-09-05', contact: '+1 (555) 456-7890', email: 'david.k@example.com', status: 'Active', updated: yesterday },
      { id: 'MV-10025', name: 'Sophia Rodriguez', dob: '1999-01-18', contact: '+1 (555) 567-8901', email: 'sophia.r@example.com', status: 'Inactive', updated: twoDaysAgo },
      { id: 'MV-10026', name: 'James Thornton', dob: '1981-12-04', contact: '+1 (555) 678-9012', email: 'j.thornton@example.com', status: 'Active', updated: threeDaysAgo }
    ],
    records: [
      { id: 'REC-9011', patient: 'Eleanor Vance', type: 'Clinical note', date: today, summary: 'Routine hypertension follow-up. BP steady at 122/78 mmHg.', clinician: 'Dr. Sarah Lin' },
      { id: 'REC-9012', patient: 'Marcus Chen', type: 'Lab result', date: today, summary: 'Comprehensive Metabolic Panel (CMP) normal; fasting glucose 94 mg/dL.', clinician: 'Dr. Robert Bell' },
      { id: 'REC-9013', patient: 'Amira Patel', type: 'Imaging', date: yesterday, summary: 'Right knee MRI: Minor medial meniscus fraying without full-thickness tear.', clinician: 'Dr. Clara Gomez' },
      { id: 'REC-9014', patient: 'David Kowalski', type: 'Clinical note', date: yesterday, summary: 'Post-op week 4 evaluation. Surgical wound clean, healing well.', clinician: 'Dr. Sarah Lin' },
      { id: 'REC-9015', patient: 'Sophia Rodriguez', type: 'Lab result', date: twoDaysAgo, summary: 'Lipid panel: Total cholesterol 182, LDL 104, HDL 56.', clinician: 'Dr. Robert Bell' },
      { id: 'REC-9016', patient: 'James Thornton', type: 'Discharge summary', date: threeDaysAgo, summary: 'Discharged following observation for mild viral gastroenteritis.', clinician: 'Dr. Michael Scott' }
    ],
    appointments: [
      { id: 'APT-4011', patient: 'Eleanor Vance', date: today, time: '09:30', reason: 'Blood pressure check', status: 'Scheduled' },
      { id: 'APT-4012', patient: 'David Kowalski', date: today, time: '14:00', reason: 'Post-op physical exam', status: 'Scheduled' },
      { id: 'APT-4013', patient: 'Amira Patel', date: today, time: '16:15', reason: 'MRI consultation', status: 'Pending' },
      { id: 'APT-4014', patient: 'Marcus Chen', date: yesterday, time: '11:00', reason: 'Lab review', status: 'Scheduled' },
      { id: 'APT-4015', patient: 'James Thornton', date: threeDaysAgo, time: '10:00', reason: 'Discharge review', status: 'Cancelled' }
    ],
    prescriptions: [
      { id: 'RX-7011', patient: 'Eleanor Vance', medication: 'Lisinopril', dosage: '10mg once daily', date: today, prescriber: 'Dr. Sarah Lin' },
      { id: 'RX-7012', patient: 'Marcus Chen', medication: 'Atorvastatin', dosage: '20mg at bedtime', date: yesterday, prescriber: 'Dr. Robert Bell' },
      { id: 'RX-7013', patient: 'Amira Patel', medication: 'Meloxicam', dosage: '7.5mg once daily with food', date: yesterday, prescriber: 'Dr. Clara Gomez' },
      { id: 'RX-7014', patient: 'David Kowalski', medication: 'Amoxicillin', dosage: '500mg tid x 7 days', date: twoDaysAgo, prescriber: 'Dr. Sarah Lin' }
    ]
  };
}

// Storage helpers
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.patients)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage load failed, using seed data:', e);
  }
  const seed = getSeedData();
  saveState(seed);
  return seed;
}

function saveState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// Global runtime state
const appData = loadState();
const state = {
  page: 'dashboard',
  patients: appData.patients,
  records: appData.records,
  appointments: appData.appointments,
  prescriptions: appData.prescriptions,
  query: '',
  listFilter: 'all',
  sort: 'name',
  sortDir: 1,
  pageNo: 1,
  pageSize: 6
};

function persist() {
  saveState({
    patients: state.patients,
    records: state.records,
    appointments: state.appointments,
    prescriptions: state.prescriptions
  });
}

const labels = {
  dashboard: 'Overview',
  patients: 'Patients',
  records: 'Medical records',
  appointments: 'Appointments',
  prescriptions: 'Prescriptions'
};

// Utilities
function esc(v = '') {
  return String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || 'PT';
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function header(title, sub, action = '') {
  return `
    <div class="page-head">
      <div>
        <div class="eyebrow">MediVault · Care management</div>
        <h1>${title}</h1>
        <p class="subhead">${sub}</p>
      </div>
      <div>${action}</div>
    </div>
  `;
}

function btn(label, action, primary = true, extraClass = '') {
  return `<button class="btn ${primary ? 'primary' : ''} ${extraClass}" data-action="${action}">${label}</button>`;
}

function kpi(title, value, icon, note) {
  return `
    <article class="card kpi">
      <div class="kpi-top">${title}<span class="kpi-icon">${icon}</span></div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-note">${note}</div>
    </article>
  `;
}

// Care Activity Chart: Last 7 days dynamic calculation
function renderActivityChart() {
  const days = [];
  const counts = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i}d ago`;
    days.push(dayLabel);

    const count = state.records.filter(r => r.date === dateStr).length +
                  state.appointments.filter(a => a.date === dateStr).length;
    counts.push(count);
  }

  const maxVal = Math.max(...counts, 4);
  const points = counts.map((c, idx) => {
    const x = idx * 100;
    const y = 195 - (c / maxVal) * 150;
    return `${x} ${Math.max(25, y)}`;
  });

  const pathD = `M0 195 L${points.join(' L')} L600 195`;
  const areaD = `M0 195 L${points.join(' L')} L600 195 L600 210 L0 210 Z`;
  const totalActivity = counts.reduce((a, b) => a + b, 0);

  return `
    <div class="chart">
      <svg viewBox="0 0 600 220" preserveAspectRatio="none" aria-label="Care activity line chart">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0e7490" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#0e7490" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${[35, 75, 115, 155, 195].map(y => `<line x1="0" y1="${y}" x2="600" y2="${y}" stroke="#edf2f5" stroke-dasharray="3 4"/>`).join('')}
        <text x="8" y="20" fill="#8ca0ac" font-size="11" font-weight="600">${totalActivity} activities in past 7 days</text>
        <path d="${areaD}" fill="url(#chartGradient)"/>
        <path d="${pathD}" fill="none" stroke="#0e7490" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${points.map(pt => {
          const [px, py] = pt.split(' ');
          return `<circle cx="${px}" cy="${py}" r="4" fill="#0e7490" stroke="#fff" stroke-width="2"/>`;
        }).join('')}
      </svg>
    </div>
    <div class="chart-labels">
      ${days.map(d => `<span>${d}</span>`).join('')}
    </div>
  `;
}

// Category Distribution Donut calculation
function renderDonut() {
  const total = state.records.length;
  const notes = state.records.filter(r => r.type === 'Clinical note').length;
  const labs = state.records.filter(r => r.type === 'Lab result').length;
  const imaging = state.records.filter(r => r.type === 'Imaging').length;
  const others = total - notes - labs - imaging;

  let bg = 'conic-gradient(#e5eff0 0 100%)';
  if (total > 0) {
    const p1 = Math.round((notes / total) * 100);
    const p2 = p1 + Math.round((labs / total) * 100);
    const p3 = p2 + Math.round((imaging / total) * 100);
    bg = `conic-gradient(#0e7490 0 ${p1}%, #14b8a6 ${p1}% ${p2}%, #38bdf8 ${p2}% ${p3}%, #cbd5e1 ${p3}% 100%)`;
  }

  return `
    <div class="donut-wrap">
      <div class="donut" style="background:${bg}">
        <div class="donut-center">${total}<small>records</small></div>
      </div>
      <div class="category-list">
        <div class="category-row"><i class="category-color"></i><span>Clinical notes</span><b>${notes}</b></div>
        <div class="category-row"><i class="category-color c2"></i><span>Lab results</span><b>${labs}</b></div>
        <div class="category-row"><i class="category-color c3"></i><span>Imaging</span><b>${imaging}</b></div>
        <div class="category-row"><i class="category-color c4"></i><span>Other</span><b>${Math.max(0, others)}</b></div>
      </div>
    </div>
  `;
}

// Pages
function dashboard() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysAppointments = state.appointments.filter(a => a.date === todayStr).length;

  return `
    ${header(`Good ${greeting()}, care team`, 'A real-time overview of your patient care activity.', btn('+ Add patient', 'add-patient'))}
    <div class="kpi-grid">
      ${kpi('Registered patients', state.patients.length, '♙', 'Patients in your workspace')}
      ${kpi('Medical records', state.records.length, '▤', 'Clinical docs & lab reports')}
      ${kpi('Appointments today', todaysAppointments, '◷', 'Scheduled for today')}
      ${kpi('Prescriptions', state.prescriptions.length, '⚕', 'Prescribed medications')}
    </div>
    <div class="dashboard-grid">
      <section class="card panel">
        <div class="panel-head">
          <div>
            <h2>Care activity trend</h2>
            <p>Records and appointments created over the past 7 days</p>
          </div>
          <span class="status">Live Local Data</span>
        </div>
        ${renderActivityChart()}
      </section>
      <section class="card panel">
        <div class="panel-head">
          <div>
            <h2>Record categories</h2>
            <p>Distribution across stored medical records</p>
          </div>
        </div>
        ${renderDonut()}
      </section>
    </div>
    <section class="card table-card">
      <div class="table-head">
        <div>
          <h2>Recently updated patients</h2>
          <p>Latest active profiles in this workspace</p>
        </div>
        <div class="toolbar">
          <input class="search" id="dashSearch" placeholder="Search patients…" aria-label="Search patients">
          <button class="btn" data-page="patients">View all patients →</button>
        </div>
      </div>
      ${patientTable(state.patients.slice(-5).reverse(), false)}
    </section>
  `;
}

function patientTable(rows, showPagination = true) {
  if (!rows.length) {
    return `
      <div class="empty">
        <div class="empty-icon">♙</div>
        <h3>No patient records found</h3>
        <p>Add a new patient to start organizing medical records and appointments.</p>
        ${btn('+ Add patient', 'add-patient')}
      </div>
    `;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date of birth</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(p => `
            <tr>
              <td>
                <div class="patient-cell">
                  <div class="patient-avatar">${esc(initials(p.name))}</div>
                  <div>
                    <div class="patient-name">${esc(p.name)}</div>
                    <div class="patient-id">${esc(p.id)}</div>
                  </div>
                </div>
              </td>
              <td>${esc(p.dob || '—')}</td>
              <td>${esc(p.contact || '—')}</td>
              <td>${esc(p.email || '—')}</td>
              <td>
                <span class="status ${p.status === 'Inactive' ? 'cancelled' : ''}">
                  ${esc(p.status || 'Active')}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="btn sm" data-action="view-patient" data-id="${esc(p.id)}">Details</button>
                  <button class="btn sm danger" data-action="delete-patient" data-id="${esc(p.id)}" title="Delete patient">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ${showPagination ? `
      <div class="table-foot">
        <span>Showing ${rows.length} patient${rows.length === 1 ? '' : 's'}</span>
        <div class="pagination">
          <button class="active">1</button>
        </div>
      </div>
    ` : ''}
  `;
}

function patients() {
  const q = state.query.toLowerCase().trim();
  const rows = state.patients.filter(p =>
    [p.name, p.id, p.contact, p.email].join(' ').toLowerCase().includes(q)
  ).sort((a, b) =>
    String(a[state.sort] || '').localeCompare(String(b[state.sort] || '')) * state.sortDir
  );

  return `
    ${header('Patients', 'Manage patient profiles, clinical history, and contact details.', btn('+ Add patient', 'add-patient'))}
    <section class="card table-card">
      <div class="table-head">
        <div>
          <h2>Patient directory</h2>
          <p>${state.patients.length} total registered patients in browser storage</p>
        </div>
        <div class="toolbar">
          <input class="search" id="patientSearch" placeholder="Search name, ID or contact…" value="${esc(state.query)}" aria-label="Search patients">
          <button class="btn" data-action="export-patients">Export CSV ↓</button>
        </div>
      </div>
      ${patientTable(rows)}
    </section>
  `;
}

function genericTable(kind, arr, cols) {
  if (!arr.length) {
    const icons = { records: '▤', appointments: '◷', prescriptions: '⚕' };
    const sing = { records: 'record', appointments: 'appointment', prescriptions: 'prescription' }[kind];
    return `
      <div class="empty">
        <div class="empty-icon">${icons[kind] || '▤'}</div>
        <h3>No ${kind} found</h3>
        <p>Start by creating a new entry linked to an existing patient.</p>
        ${btn(`+ Add ${sing}`, `add-${sing}`)}
      </div>
    `;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${cols.map(c => `<th>${c[1]}</th>`).join('')}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${arr.map(o => `
            <tr>
              ${cols.map(c => {
                const val = o[c[0]];
                if (c[0] === 'status') {
                  const s = String(val).toLowerCase();
                  const cls = s === 'pending' ? 'pending' : s === 'cancelled' ? 'cancelled' : '';
                  return `<td><span class="status ${cls}">${esc(val || 'Active')}</span></td>`;
                }
                return `<td>${esc(val || '—')}</td>`;
              }).join('')}
              <td>
                <button class="btn sm danger" data-action="delete-item" data-kind="${kind}" data-id="${esc(o.id)}">Remove</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="table-foot">
      <span>Showing ${arr.length} ${kind}</span>
      <div class="pagination"><button class="active">1</button></div>
    </div>
  `;
}

function listing(kind) {
  const configs = {
    records: {
      title: 'Medical records',
      sub: 'Organize clinical progress notes, diagnostic lab results, and imaging studies.',
      sing: 'record',
      cols: [['patient', 'Patient'], ['type', 'Type'], ['date', 'Date'], ['summary', 'Summary'], ['clinician', 'Clinician']],
      data: state.records
    },
    appointments: {
      title: 'Appointments',
      sub: 'Schedule visits, consultations, and review patient care dates.',
      sing: 'appointment',
      cols: [['patient', 'Patient'], ['date', 'Date'], ['time', 'Time'], ['reason', 'Reason for visit'], ['status', 'Status']],
      data: state.appointments
    },
    prescriptions: {
      title: 'Prescriptions',
      sub: 'Manage medications, dosages, schedule instructions, and prescribing doctors.',
      sing: 'prescription',
      cols: [['patient', 'Patient'], ['medication', 'Medication'], ['dosage', 'Dosage'], ['date', 'Prescribed date'], ['prescriber', 'Prescriber']],
      data: state.prescriptions
    }
  };

  const cfg = configs[kind];
  let filtered = cfg.data;
  if (state.query) {
    const q = state.query.toLowerCase();
    filtered = filtered.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q)));
  }

  return `
    ${header(cfg.title, cfg.sub, btn(`+ Add ${cfg.sing}`, `add-${cfg.sing}`))}
    <section class="card table-card">
      <div class="table-head">
        <div>
          <h2>${cfg.title} directory</h2>
          <p>${cfg.data.length} total saved entries</p>
        </div>
        <div class="toolbar">
          <input class="search" id="listSearch" placeholder="Filter ${kind}…" value="${esc(state.query)}" aria-label="Filter ${kind}">
          <button class="btn" data-action="export-${kind}">Export CSV ↓</button>
        </div>
      </div>
      <div id="listContent">${genericTable(kind, filtered, cfg.cols)}</div>
    </section>
  `;
}

function render() {
  const crumb = $('#crumb');
  if (crumb) crumb.textContent = labels[state.page];

  $$('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === state.page);
  });

  const content = $('#content');
  if (!content) return;

  if (state.page === 'dashboard') {
    content.innerHTML = dashboard();
  } else if (state.page === 'patients') {
    content.innerHTML = patients();
  } else {
    content.innerHTML = listing(state.page);
  }
}

// Modal dialogs
function openModal(title, body) {
  $('#modalBackdrop')?.remove();
  const m = document.createElement('div');
  m.className = 'modal-backdrop';
  m.id = 'modalBackdrop';
  m.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head">
        <h2>${esc(title)}</h2>
        <button class="close" data-action="close-modal" aria-label="Close dialog">×</button>
      </div>
      ${body}
    </div>
  `;
  document.body.append(m);
  m.addEventListener('click', e => {
    if (e.target === m) m.remove();
  });
}

function field(label, name, type = 'text', required = true, extra = '', value = '') {
  return `
    <div class="field">
      <label for="f-${name}">${label}${required ? ' *' : ''}</label>
      <input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${required ? 'required' : ''} ${extra}>
    </div>
  `;
}

function selectField(label, name, opts, required = true, current = '') {
  return `
    <div class="field">
      <label for="f-${name}">${label}${required ? ' *' : ''}</label>
      <select id="f-${name}" name="${name}" ${required ? 'required' : ''}>
        ${opts.map(x => `<option value="${esc(x)}" ${x === current ? 'selected' : ''}>${esc(x)}</option>`).join('')}
      </select>
    </div>
  `;
}

function patientSelect() {
  if (!state.patients.length) {
    return `
      <div class="field full">
        <label for="f-patient">Patient *</label>
        <select id="f-patient" name="patient" required disabled>
          <option value="">Please add a patient first</option>
        </select>
        <small style="color:var(--amber);margin-top:4px">You need at least one patient record to link this entry.</small>
      </div>
    `;
  }
  return `
    <div class="field full">
      <label for="f-patient">Patient *</label>
      <select id="f-patient" name="patient" required>
        ${state.patients.map(p => `<option value="${esc(p.name)}">${esc(p.name)} (${esc(p.id)})</option>`).join('')}
      </select>
    </div>
  `;
}

function addForm(type) {
  let title = '';
  let fields = '';
  const today = new Date().toISOString().slice(0, 10);

  if (type === 'patient') {
    title = 'Add New Patient';
    const nextId = `MV-${Math.floor(10000 + Math.random() * 90000)}`;
    fields = `
      <div class="form-grid">
        ${field('Full name', 'name', 'text', true, 'placeholder="e.g. John Doe"')}
        ${field('Patient ID', 'id', 'text', true, `value="${nextId}"`)}
        ${field('Date of birth', 'dob', 'date', true)}
        ${selectField('Profile status', 'status', ['Active', 'Inactive'])}
        ${field('Contact phone', 'contact', 'tel', false, 'placeholder="+1 (555) 000-0000"')}
        ${field('Email address', 'email', 'email', false, 'placeholder="john@example.com"')}
      </div>
      <div class="notice" style="margin-top:16px">
        Information is safely encrypted &amp; stored locally in this browser.
      </div>
    `;
  } else if (type === 'record') {
    title = 'Add Medical Record';
    fields = `
      <div class="form-grid">
        ${patientSelect()}
        ${selectField('Record type', 'type', ['Clinical note', 'Lab result', 'Imaging', 'Discharge summary', 'Other'])}
        ${field('Record date', 'date', 'date', true, `value="${today}"`)}
        ${field('Clinician / Doctor', 'clinician', 'text', false, 'placeholder="e.g. Dr. Sarah Lin"')}
        <div class="field full">
          <label for="f-summary">Clinical Summary *</label>
          <textarea id="f-summary" name="summary" required placeholder="Enter diagnostic findings, observations or notes..."></textarea>
        </div>
      </div>
    `;
  } else if (type === 'appointment') {
    title = 'Schedule Appointment';
    fields = `
      <div class="form-grid">
        ${patientSelect()}
        ${field('Appointment date', 'date', 'date', true, `value="${today}"`)}
        ${field('Time', 'time', 'time', true, 'value="10:00"')}
        ${selectField('Status', 'status', ['Scheduled', 'Pending', 'Cancelled'])}
        <div class="field full">
          <label for="f-reason">Reason for visit *</label>
          <input id="f-reason" name="reason" type="text" required placeholder="e.g. Routine consultation, Annual checkup">
        </div>
      </div>
    `;
  } else {
    title = 'Add Prescription';
    fields = `
      <div class="form-grid">
        ${patientSelect()}
        ${field('Medication name', 'medication', 'text', true, 'placeholder="e.g. Amoxicillin"')}
        ${field('Dosage instructions', 'dosage', 'text', true, 'placeholder="e.g. 500mg tid x 7 days"')}
        ${field('Prescribed date', 'date', 'date', true, `value="${today}"`)}
        ${field('Prescribing clinician', 'prescriber', 'text', true, 'placeholder="Dr. Sarah Lin"')}
      </div>
    `;
  }

  openModal(title, `
    <form id="entryForm" data-type="${type}">
      ${fields}
      <div class="form-actions">
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button class="btn primary" type="submit">Save ${type}</button>
      </div>
    </form>
  `);
}

function submitEntry(form) {
  const type = form.dataset.type;
  const data = Object.fromEntries(new FormData(form).entries());

  if (type === 'patient') {
    if (state.patients.some(p => p.id.toLowerCase() === data.id.toLowerCase())) {
      toast('A patient with that ID already exists.');
      return;
    }
    data.updated = new Date().toISOString().slice(0, 10);
    state.patients.unshift(data);
  } else {
    if (!state.patients.length) {
      toast('Please add a patient first before adding associated records.');
      return;
    }
    const prefix = { record: 'REC', appointment: 'APT', prescription: 'RX' }[type] || 'MED';
    data.id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const collectionKey = { record: 'records', appointment: 'appointments', prescription: 'prescriptions' }[type];
    state[collectionKey].unshift(data);
  }

  persist();
  $('#modalBackdrop')?.remove();
  state.query = '';
  render();
  toast(`${type[0].toUpperCase() + type.slice(1)} saved successfully.`);
}

function viewPatientModal(patientId) {
  const p = state.patients.find(x => x.id === patientId);
  if (!p) return;

  const pRecords = state.records.filter(r => r.patient === p.name);
  const pAppointments = state.appointments.filter(a => a.patient === p.name);
  const pPrescriptions = state.prescriptions.filter(rx => rx.patient === p.name);

  openModal(`Patient: ${p.name}`, `
    <div class="notice">
      <strong>ID:</strong> ${esc(p.id)} &nbsp;·&nbsp;
      <strong>Status:</strong> ${esc(p.status || 'Active')} &nbsp;·&nbsp;
      <strong>Last Updated:</strong> ${esc(p.updated || '—')}
    </div>
    <div class="patient-detail-grid">
      <div class="detail-item"><span>Date of birth</span><strong>${esc(p.dob || '—')}</strong></div>
      <div class="detail-item"><span>Contact phone</span><strong>${esc(p.contact || '—')}</strong></div>
      <div class="detail-item"><span>Email address</span><strong>${esc(p.email || '—')}</strong></div>
      <div class="detail-item"><span>Total records</span><strong>${pRecords.length} records</strong></div>
    </div>

    <h3 style="margin-top:18px">Active Prescriptions (${pPrescriptions.length})</h3>
    ${pPrescriptions.length ? `
      <ul style="padding-left:18px;margin:6px 0;font-size:13px;color:var(--ink-light)">
        ${pPrescriptions.map(rx => `<li><b>${esc(rx.medication)}</b> - ${esc(rx.dosage)} (Dr. ${esc(rx.prescriber)})</li>`).join('')}
      </ul>
    ` : '<p style="color:var(--muted);font-size:12.5px;margin:6px 0">No prescriptions recorded.</p>'}

    <h3 style="margin-top:14px">Upcoming &amp; Past Visits (${pAppointments.length})</h3>
    ${pAppointments.length ? `
      <ul style="padding-left:18px;margin:6px 0;font-size:13px;color:var(--ink-light)">
        ${pAppointments.map(a => `<li>${esc(a.date)} at ${esc(a.time)}: <i>${esc(a.reason)}</i> [${esc(a.status)}]</li>`).join('')}
      </ul>
    ` : '<p style="color:var(--muted);font-size:12.5px;margin:6px 0">No appointments recorded.</p>'}

    <div class="form-actions">
      <button class="btn danger" data-action="delete-patient" data-id="${esc(p.id)}">Delete profile</button>
      <button class="btn primary" data-action="close-modal">Close</button>
    </div>
  `);
}

function exportCSV(rows, filename) {
  if (!rows.length) {
    toast('No entries to export.');
    return;
  }
  const keys = [...new Set(rows.flatMap(o => Object.keys(o)))];
  const headerRow = keys.join(',');
  const dataRows = rows.map(o => keys.map(k => `"${String(o[k] ?? '').replace(/"/g, '""')}"`).join(','));
  const csvContent = [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast(`Exported ${filename}`);
}

// Global Event Listeners
document.addEventListener('click', e => {
  // Navigation
  const nav = e.target.closest('[data-page]');
  if (nav) {
    e.preventDefault();
    state.page = nav.dataset.page;
    state.query = '';
    render();
    $('#sidebar')?.classList.remove('open');
    $('#sidebarBackdrop')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Buttons with actions
  const b = e.target.closest('[data-action]');
  if (!b) return;

  const act = b.dataset.action;
  if (act === 'add-patient') addForm('patient');
  else if (act === 'add-record') addForm('record');
  else if (act === 'add-appointment') addForm('appointment');
  else if (act === 'add-prescription') addForm('prescription');
  else if (act === 'close-modal') $('#modalBackdrop')?.remove();
  else if (act === 'export-patients') exportCSV(state.patients, 'medivault_patients.csv');
  else if (act === 'export-records') exportCSV(state.records, 'medivault_records.csv');
  else if (act === 'export-appointments') exportCSV(state.appointments, 'medivault_appointments.csv');
  else if (act === 'export-prescriptions') exportCSV(state.prescriptions, 'medivault_prescriptions.csv');
  else if (act === 'view-patient') viewPatientModal(b.dataset.id);
  else if (act === 'delete-patient') {
    if (confirm('Are you sure you want to delete this patient profile?')) {
      const pId = b.dataset.id;
      const patient = state.patients.find(x => x.id === pId);
      state.patients = state.patients.filter(x => x.id !== pId);
      if (patient) {
        state.records = state.records.filter(r => r.patient !== patient.name);
        state.appointments = state.appointments.filter(a => a.patient !== patient.name);
        state.prescriptions = state.prescriptions.filter(rx => rx.patient !== patient.name);
      }
      persist();
      $('#modalBackdrop')?.remove();
      render();
      toast('Patient profile removed.');
    }
  } else if (act === 'delete-item') {
    const kind = b.dataset.kind;
    const itemId = b.dataset.id;
    if (confirm('Remove this entry from local records?')) {
      state[kind] = state[kind].filter(x => x.id !== itemId);
      persist();
      render();
      toast('Entry removed.');
    }
  }
});

// Form submissions
document.addEventListener('submit', e => {
  if (e.target.id === 'entryForm') {
    e.preventDefault();
    if (!e.target.reportValidity()) return;
    submitEntry(e.target);
  }
});

// Search inputs
document.addEventListener('input', e => {
  if (e.target.id === 'patientSearch' || e.target.id === 'listSearch') {
    state.query = e.target.value;
    const cursor = e.target.selectionStart;
    render();
    const input = $(`#${e.target.id}`);
    if (input) {
      input.focus();
      input.setSelectionRange(cursor, cursor);
    }
  }

  if (e.target.id === 'dashSearch') {
    const q = e.target.value.toLowerCase().trim();
    const rows = state.patients.filter(p => p.name.toLowerCase().includes(q));
    const tableCard = e.target.closest('.table-card');
    const existingTable = tableCard?.querySelector('.table-wrap');
    if (existingTable) {
      existingTable.outerHTML = patientTable(rows, false);
    }
  }
});

// Sidebar & mobile menu
$('#menuBtn')?.addEventListener('click', () => {
  $('#sidebar')?.classList.toggle('open');
  $('#sidebarBackdrop')?.classList.toggle('open');
});

$('#sidebarBackdrop')?.addEventListener('click', () => {
  $('#sidebar')?.classList.remove('open');
  $('#sidebarBackdrop')?.classList.remove('open');
});

// Reset demo data handler
$('#resetDemoBtn')?.addEventListener('click', () => {
  if (confirm('Reset to standard sample patients and records? This will overwrite local changes.')) {
    const seed = getSeedData();
    state.patients = seed.patients;
    state.records = seed.records;
    state.appointments = seed.appointments;
    state.prescriptions = seed.prescriptions;
    persist();
    render();
    toast('Sample data restored.');
  }
});

// Initial boot
render();
