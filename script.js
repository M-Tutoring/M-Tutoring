/* ============================================================
   M&E Tutoring — script.js
   ============================================================

   EMAILJS SETUP — takes ~5 minutes, completely free
   ──────────────────────────────────────────────────────────────
   1. Create a free account at https://www.emailjs.com

   2. Add Email Service:
      Dashboard → Email Services → Add New Service → Gmail
      Sign in with bizli765@gmail.com → copy the Service ID shown

   3. Create Email Template:
      Dashboard → Email Templates → Create New Template
      Subject line: New Tutoring Application — {{student_name}}
      Body (paste exactly):

        Name:          {{student_name}}
        Email:         {{student_email}}
        Phone:         {{student_phone}}
        Subject:       {{subject_choice}}
        Current Grade: {{current_grade}}
        Target Grade:  {{target_grade}}
        Rate Chosen:   {{preferred_rate}}
        Goals / Notes: {{goals}}
        Applied On:    {{application_date}}

      Set "To Email" field to: bizli765@gmail.com
      → Save template, copy the Template ID shown

   4. Get Public Key:
      Dashboard → Account → General → Public Key → copy it

   5. Paste all three values in the three lines directly below:
   ============================================================ */

const EMAILJS_PUBLIC_KEY  = 'i5Aa1qKdzUvzoach7'; 
const EMAILJS_SERVICE_ID  = 'service_eot817t';    
const EMAILJS_TEMPLATE_ID = 'template_7vw0fc8';   

/* ── Initialise ───────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch(e) {}
  initSite();
});

function initSite() {
  /* Scroll-reveal */
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 90);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* Nav shadow + back-to-top */
  window.addEventListener('scroll', () => {
    document.getElementById('main-nav').classList.toggle('scrolled', scrollY > 20);
    document.getElementById('back-top').classList.toggle('show', scrollY > 400);
  });

  /* Cookie banner */
  if (!localStorage.getItem('met_cookie')) {
    setTimeout(() => document.getElementById('cookie-bar').classList.add('show'), 2000);
  }

  /* Smooth-scroll with offset */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        const offset = parseInt(document.body.dataset.offset || 110);
        window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' });
      }
    });
  });

  /* Admin panel shortcut: Ctrl + Shift + A */
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') openAdmin();
  });
}

/* ── Announcement bar ─────────────────────────────────────── */
function dismissAnn() {
  document.getElementById('ann-bar').style.display = 'none';
  const nav = document.getElementById('main-nav');
  const mob = document.getElementById('mob-nav');
  nav.style.top = '0';
  mob.style.top = '70px';
  document.body.dataset.offset = '70';
  document.body.style.paddingTop = '70px';
}

/* ── Mobile menu ──────────────────────────────────────────── */
function toggleMenu() {
  const h = document.getElementById('hamburger');
  const m = document.getElementById('mob-nav');
  const open = m.classList.toggle('open');
  h.classList.toggle('open');
  h.setAttribute('aria-expanded', open);
}
function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mob-nav').classList.remove('open');
  document.getElementById('hamburger').setAttribute('aria-expanded', 'false');
}

/* ── Newsletter ───────────────────────────────────────────── */
function subNewsletter() {
  const em = document.getElementById('nl-email').value.trim();
  if (!em || !em.includes('@')) { alert('Please enter a valid email address.'); return; }
  document.getElementById('nl-success').style.display = 'block';
  document.getElementById('nl-email').value = '';
  setTimeout(() => document.getElementById('nl-success').style.display = 'none', 6000);
}

/* ── Application form ─────────────────────────────────────── */
async function submitApplication() {
  const btn    = document.getElementById('submit-btn');
  const status = document.getElementById('form-status');
  const get    = id => document.getElementById(id).value.trim();

  const fname  = get('f-fname');
  const lname  = get('f-lname');
  const email  = get('f-email');
  const phone  = get('f-phone');
  const subj   = get('f-subject');
  const cgrade = get('f-current');
  const tgrade = get('f-target');
  const rate   = get('f-rate');
  const goals  = get('f-goals');

  /* Validate required fields */
  if (!fname || !lname || !email || !phone || !subj) {
    setStatus('error', 'Please fill in all required fields marked with *.');
    return;
  }
  if (!email.includes('@')) { setStatus('error', 'Please enter a valid email address.'); return; }

  /* Consent checkbox */
  const consent = document.getElementById('f-consent').checked;
  if (!consent) {
    setStatus('error', 'Please tick the consent checkbox before submitting.');
    return;
  }

  btn.textContent = 'Sending…';
  btn.disabled    = true;
  status.className = '';
  status.textContent = '';

  const data = {
    student_name:     fname + ' ' + lname,
    student_email:    email,
    student_phone:    phone,
    subject_choice:   subj,
    current_grade:    cgrade || 'Not provided',
    target_grade:     tgrade || 'Not provided',
    preferred_rate:   rate   || 'Not specified',
    goals:            goals  || 'Not provided',
    application_date: new Date().toLocaleString('en-GB'),
  };

  /* Always save locally first */
  saveToDb(data);

  /* Send email via EmailJS */
  try {
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') throw new Error('not_configured');
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data);
    setStatus('success', '✅ Application received! I will be in touch within 24 hours.');
    clearForm();
  } catch(err) {
    if (err.message === 'not_configured') {
      setStatus('success', '✅ Application saved! (Email notification will work once EmailJS is configured — see script.js.)');
      clearForm();
    } else {
      setStatus('warning', '⚠️ Application saved locally. Email notification failed — please also email bizli765@gmail.com directly.');
      console.error('EmailJS error:', err);
    }
  }

  btn.textContent = 'Submit Application →';
  btn.disabled = false;
}

function setStatus(type, msg) {
  const s = document.getElementById('form-status');
  s.className = 'form-status ' + type;
  s.textContent = msg;
}

function clearForm() {
  ['f-fname','f-lname','f-email','f-phone','f-subject','f-current','f-target','f-rate','f-goals']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

/* ── LocalStorage database ────────────────────────────────── */
function saveToDb(data) {
  try {
    const apps = JSON.parse(localStorage.getItem('met_applications') || '[]');
    apps.push({ ...data, id: Date.now() });
    localStorage.setItem('met_applications', JSON.stringify(apps));
  } catch(e) { console.warn('Could not save to localStorage:', e); }
}

/* ── Admin panel (Ctrl + Shift + A) ──────────────────────── */
function openAdmin() {
  renderAdmin();
  document.getElementById('admin-overlay').classList.add('show');
}
function closeAdmin() {
  document.getElementById('admin-overlay').classList.remove('show');
}

function renderAdmin() {
  const apps = JSON.parse(localStorage.getItem('met_applications') || '[]');
  const body = document.getElementById('admin-body');
  document.getElementById('admin-count').textContent = apps.length + ' application' + (apps.length !== 1 ? 's' : '');

  if (!apps.length) {
    body.innerHTML = '<p class="admin-empty">No applications stored yet. Submit the form to see entries here.</p>';
    return;
  }

  body.innerHTML = [...apps].reverse().map((a, i) => `
    <div class="admin-entry">
      <div class="admin-entry-head">#${apps.length - i} &nbsp;·&nbsp; ${a.student_name} &nbsp;·&nbsp; ${a.application_date}</div>
      <div class="admin-entry-grid">
        <div><strong>Email:</strong> <a href="mailto:${a.student_email}">${a.student_email}</a></div>
        <div><strong>Phone:</strong> ${a.student_phone}</div>
        <div><strong>Subject:</strong> ${a.subject_choice}</div>
        <div><strong>Rate:</strong> ${a.preferred_rate}</div>
        <div><strong>Current Grade:</strong> ${a.current_grade}</div>
        <div><strong>Target Grade:</strong> ${a.target_grade}</div>
        <div class="admin-goals"><strong>Goals:</strong> ${a.goals}</div>
      </div>
    </div>
  `).join('');
}

function exportCSV() {
  const apps = JSON.parse(localStorage.getItem('met_applications') || '[]');
  if (!apps.length) { alert('No applications to export.'); return; }
  const hdr = ['ID','Name','Email','Phone','Subject','Current Grade','Target Grade','Rate','Goals','Date'];
  const rows = apps.map(a => [
    a.id, a.student_name, a.student_email, a.student_phone, a.subject_choice,
    a.current_grade, a.target_grade, a.preferred_rate, a.goals, a.application_date
  ].map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(','));
  const csv  = [hdr.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'met_applications_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

function clearAllData() {
  if (confirm('Permanently delete all stored applications? This cannot be undone.')) {
    localStorage.removeItem('met_applications');
    renderAdmin();
  }
}

/* ── Cookie consent ───────────────────────────────────────── */
function acceptCookies() {
  localStorage.setItem('met_cookie', 'accepted');
  document.getElementById('cookie-bar').classList.remove('show');
}
function declineCookies() {
  localStorage.setItem('met_cookie', 'declined');
  document.getElementById('cookie-bar').classList.remove('show');
}
