'use strict';
const KEY = 'wedding_v1', AUTH = 'wedding_auth_v1', $ = s => document.querySelector(s);
const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

const DEFAULTS = {
  bride: 'Mishal', groom: 'Saad Kamboh',
  brideParents: 'Mr. & Mrs. Tariq Mahmood', groomParents: 'Mr. & Mrs. Khalid Mehmood Kamboh',
  date: '2027-01-08T18:00', venue: 'Grand Ballroom', address: 'Mall Road, Lahore, Punjab',
  message: 'With the blessings of Allah, we joyfully invite you to celebrate the union of our children.',
  rsvp: '923001234567', mapUrl: '', music: '',
  theme: { maroon: '#6b0f1a', gold: '#c9a961', ivory: '#fbf6ea' },
  events: [
    { name: 'Mehndi', date: '2027-02-09', time: '19:00', venue: 'Bride’s Residence, Gulberg' },
    { name: 'Baraat', date: '2027-01-08', time: '18:00', venue: 'Groom’s Residence, DHA' },
    { name: 'Nikah', date: '2027-01-08', time: '14:00', venue: 'Family Mosque, Lahore' },
    { name: 'Walima', date: '2027-01-09', time: '19:00', venue: 'Grand Ballroom, Lahore' }
  ],
  photos: []
};
const PRESETS = { Royal: ['#6b0f1a', '#c9a961', '#fbf6ea'], Emerald: ['#0f4a3a', '#d4b36a', '#f8f4e6'], Rose: ['#8a2846', '#d9b27c', '#fdf5ee'] };

let D = load();
function load() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return structuredClone(DEFAULTS); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(D)); toast('Changes saved'); return true; }
  catch { toast('Storage is full. Remove some photos or use a smaller music file.'); return false; }
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }

const dt = () => new Date(D.date);
const fmtDate = (d, o) => isNaN(d) ? '' : d.toLocaleDateString('en-GB', o);
const fmtTime = t => { if (!t) return ''; const [a, b] = t.split(':'); return new Date(2000, 0, 1, a, b).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };

function render() {
  const d = dt(), V = { ...D,
    dayName: fmtDate(d, { weekday: 'long' }), dateLong: fmtDate(d, { day: 'numeric', month: 'long', year: 'numeric' }),
    timeStr: isNaN(d) ? '' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
  document.querySelectorAll('[data-f]').forEach(e => e.textContent = V[e.dataset.f] ?? '');
  document.title = `${D.bride} & ${D.groom} – Wedding Invitation`;
  const r = document.documentElement.style;
  r.setProperty('--maroon', D.theme.maroon); r.setProperty('--gold', D.theme.gold); r.setProperty('--ivory', D.theme.ivory);

  const ev = $('#events'); ev.replaceChildren();
  D.events.forEach(e => {
    const c = h('article', 'ev'); c.append(h('h4', '', e.name), h('p', 't', fmtDate(new Date(e.date + 'T00:00'), { weekday: 'long', day: 'numeric', month: 'long' })),
      h('p', '', fmtTime(e.time)), h('p', '', e.venue)); ev.append(c);
  });
  const g = $('#gallery'); g.replaceChildren();
  D.photos.forEach((p, i) => { const im = h('img'); im.src = p; im.alt = `Wedding photo ${i + 1}`; im.loading = 'lazy'; im.onclick = () => window.open(p, '_blank'); g.append(im); });
  $('#galleryWrap').hidden = !D.photos.length;

  $('#mapBtn').href = D.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(D.venue + ' ' + D.address);
  $('#waBtn').href = `https://wa.me/${D.rsvp.replace(/\D/g, '')}?text=` + encodeURIComponent(`Assalamu Alaikum, I would love to attend the wedding of ${D.bride} & ${D.groom}.`);
  const a = $('#audio'); if (a.getAttribute('src') !== D.music) { a.pause(); D.music ? a.src = D.music : a.removeAttribute('src'); $('#musicBtn').classList.remove('on'); }
  $('#musicBtn').hidden = !D.music;
  tick();
}

function tick() {
  const ms = dt() - Date.now(), n = $('#cdNote');
  if (isNaN(ms)) return;
  if (ms <= 0) { ['d', 'h', 'm', 's'].forEach(k => $('#cd-' + k).textContent = 0); n.textContent = 'The celebration has begun. Alhamdulillah.'; return; }
  n.textContent = '';
  const s = Math.floor(ms / 1000);
  $('#cd-d').textContent = Math.floor(s / 86400); $('#cd-h').textContent = Math.floor(s % 86400 / 3600);
  $('#cd-m').textContent = Math.floor(s % 3600 / 60); $('#cd-s').textContent = s % 60;
}
setInterval(tick, 1000);

/* Envelope, music, scroll reveal */
$('#openBtn').onclick = () => {
  const c = $('#cover'); c.classList.add('open');
  setTimeout(() => c.classList.add('gone'), 1500);
  if (D.music) $('#audio').play().then(() => $('#musicBtn').classList.add('on')).catch(() => {});
};
$('#musicBtn').onclick = () => {
  const a = $('#audio'), b = $('#musicBtn');
  if (a.paused) { a.play().catch(() => toast('Could not play this audio file')); b.classList.add('on'); } else { a.pause(); b.classList.remove('on'); }
};
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .15 });
document.querySelectorAll('.hero,.count,.events-wrap,.gallery-wrap,.actions').forEach(e => { e.classList.add('reveal'); io.observe(e); });

/* Share + PDF */
$('#shareBtn').onclick = async () => {
  const data = { title: `${D.bride} & ${D.groom}`, text: 'You are invited to our wedding', url: location.href.split('#')[0] };
  try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); toast('Link copied'); } } catch {}
};
$('#pdfBtn').onclick = () => { toast('Choose “Save as PDF” in the print window'); setTimeout(() => window.print(), 600); };

/* Admin */
const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('wd:' + s)))].map(b => b.toString(16).padStart(2, '0')).join('');
const admin = $('#admin');
function field(label, type, val, on) {
  const l = h('label', '', label), i = type === 'textarea' ? h('textarea') : h('input');
  if (type !== 'textarea') i.type = type; else i.rows = 3;
  i.value = val; i.oninput = () => on(i.value); l.append(i); return l;
}
$('#ownerLink').onclick = () => setTimeout(openAdmin);
if (location.hash === '#admin') openAdmin();

function openAdmin() {
  $('#cover').classList.add('gone'); admin.hidden = false; admin.replaceChildren();
  if (sessionStorage.getItem('wd_in')) return panel();
  if (!crypto.subtle) { admin.append(h('p', '', 'The admin panel needs a secure page (https:// or localhost).'), closeBtn()); return; }
  const first = !localStorage.getItem(AUTH), f = h('form');
  f.append(h('h2', '', first ? 'Create owner password' : 'Owner login'));
  const p = h('input'); p.type = 'password'; p.autocomplete = first ? 'new-password' : 'current-password'; p.required = true; p.minLength = 6;
  const l = h('label', '', first ? 'Choose a password (6+ characters)' : 'Password'); l.append(p);
  const go = h('button', 'btn', first ? 'Create password' : 'Log in'); go.type = 'submit';
  f.append(l, go, closeBtn());
  f.onsubmit = async e => {
    e.preventDefault(); const x = await sha(p.value);
    if (first) localStorage.setItem(AUTH, x); else if (x !== localStorage.getItem(AUTH)) return toast('Incorrect password');
    sessionStorage.setItem('wd_in', '1'); openAdmin();
  };
  admin.append(f); p.focus();
}
function closeBtn() { const b = h('button', 'btn', 'Close'); b.type = 'button'; b.onclick = () => { admin.hidden = true; D = load(); render(); if (location.hash) history.replaceState(null, '', location.pathname); }; return b; }

function panel() {
  admin.replaceChildren(h('h2', '', 'Edit invitation'));
  const S = (k, label, type = 'text') => admin.append(field(label, type, D[k], v => { D[k] = v; render(); }));
  S('bride', 'Bride’s name'); S('groom', 'Groom’s name'); S('brideParents', 'Bride’s parents'); S('groomParents', 'Groom’s parents');
  S('date', 'Wedding date and time', 'datetime-local'); S('venue', 'Venue'); S('address', 'Complete address', 'textarea');
  S('message', 'Special message', 'textarea'); S('rsvp', 'RSVP number with country code', 'tel'); S('mapUrl', 'Google Maps link (optional)', 'url');

  admin.append(h('h4', '', 'Colors'));
  const pr = h('div'); Object.entries(PRESETS).forEach(([n, v]) => { const b = h('button', 'btn', n); b.type = 'button'; b.onclick = () => { [D.theme.maroon, D.theme.gold, D.theme.ivory] = v; render(); panel(); }; pr.append(b); });
  const row = h('div', 'row'); [['maroon', 'Main'], ['gold', 'Accent'], ['ivory', 'Paper']].forEach(([k, n]) => row.append(field(n, 'color', D.theme[k], v => { D.theme[k] = v; render(); })));
  admin.append(pr, row, h('h4', '', 'Events'));

  D.events.forEach((e, i) => {
    const r = h('div', 'ev-row'), g = h('div', 'row');
    g.append(field('Name', 'text', e.name, v => { e.name = v; render(); }), field('Date', 'date', e.date, v => { e.date = v; render(); }), field('Time', 'time', e.time, v => { e.time = v; render(); }));
    const rm = h('button', 'btn', 'Remove event'); rm.type = 'button'; rm.onclick = () => { D.events.splice(i, 1); render(); panel(); };
    r.append(g, field('Venue', 'text', e.venue, v => { e.venue = v; render(); }), rm); admin.append(r);
  });
  const add = h('button', 'btn', 'Add event'); add.type = 'button';
  add.onclick = () => { D.events.push({ name: 'New event', date: D.date.slice(0, 10), time: '19:00', venue: '' }); render(); panel(); };
  admin.append(add, h('h4', '', 'Photos'));

  const th = h('div', 'thumbs'); D.photos.forEach((p, i) => { const f = h('figure'), im = h('img'), x = h('button', 'btn', '×'); im.src = p; im.alt = ''; x.type = 'button'; x.setAttribute('aria-label', 'Remove photo'); x.onclick = () => { D.photos.splice(i, 1); render(); panel(); }; f.append(im, x); th.append(f); });
  const up = h('input'); up.type = 'file'; up.accept = 'image/*'; up.multiple = true;
  up.onchange = async () => { for (const f of up.files) D.photos.push(await shrink(f)); render(); panel(); };
  admin.append(th, up, h('h4', '', 'Background music'));

  const au = h('input'); au.type = 'file'; au.accept = 'audio/*';
  au.onchange = () => { const f = au.files[0]; if (!f) return; if (f.size > 2.5e6) return toast('Please choose a file under 2.5 MB, or paste a link below'); const r = new FileReader(); r.onload = () => { D.music = r.result; render(); toast('Music added'); }; r.readAsDataURL(f); };
  const clr = h('button', 'btn', 'Remove music'); clr.type = 'button'; clr.onclick = () => { D.music = ''; render(); panel(); };
  admin.append(au, field('Or paste an audio link (.mp3)', 'url', D.music.startsWith('data:') ? '' : D.music, v => { D.music = v; render(); }), clr, h('h4', '', 'Publish'));

  const mk = (t, fn) => { const b = h('button', 'btn', t); b.type = 'button'; b.onclick = fn; return b; };
  admin.append(
    mk('Save changes', save),
    mk('Preview', () => { admin.hidden = true; $('#backBtn').hidden = false; scrollTo(0, 0); }),
    mk('Log out', () => { sessionStorage.removeItem('wd_in'); admin.hidden = true; D = load(); render(); }),
    closeBtn());
}
$('#backBtn').onclick = () => { $('#backBtn').hidden = true; admin.hidden = false; };

const shrink = f => new Promise(res => {
  const i = new Image, u = URL.createObjectURL(f);
  i.onload = () => { const s = Math.min(1, 900 / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = i.width * s; c.height = i.height * s; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', .78)); };
  i.src = u;
});

render();
