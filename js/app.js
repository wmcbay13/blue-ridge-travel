import { PLACES, TOWN, CATS, EXPLORE_CATS, MEAL_CATS, FILTER_TAGS } from '../data/places.js';
import { DAYS, PLAN_A, PLAN_B, EXTRA_PLACES } from '../data/itinerary.js';
import { EVENTS } from '../data/events.js';
import { DRIVES } from '../data/drives.js';
import { WEATHER_NORMALS, PACKING, TIPS, BREWERY_TRAILS } from '../data/info.js';
import { icon, ridges, TOPO } from './icons.js';
import { load, save, favs, added, progress, planKey } from './store.js';
import { getForecast, describe, RAIN_THRESHOLD } from './weather.js';
import { baseMap, markerIcon, routeMap, hasLeaflet } from './map.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const img = key => `img/${key}.webp`;
// absolute URL so CSS custom properties don't resolve it relative to the stylesheet
const bg = key => `url('${new URL(img(key), document.baseURI).href}')`;
const TRIP_START = new Date('2026-10-08T15:00:00-04:00');
const TRIP_END = new Date('2026-10-12T00:00:00-04:00');

let credits = {};
let forecast = { current: null, days: [] };

/* ───────────── lookups ───────────── */

function homeBase() {
  const h = load('home', null);
  return {
    id: 'home', cat: 'lodging', name: h?.name || 'Our cabin', img: 'cabin', tags: ['relaxing'],
    lat: h?.lat, lng: h?.lng, addr: h?.addr || '',
    desc: h ? 'Home base for the trip.' : 'Home base — add the name/address in Trip Info (saved only on this device).',
    unset: !h,
  };
}

const eventAsPlace = e => ({ ...e, cat: 'event', addr: e.where, hours: e.when, verify: e.status === 'verify' ? 'Event details' : false });

const ALL = new Map([...PLACES, ...EXTRA_PLACES].map(p => [p.id, p]));
EVENTS.forEach(e => ALL.set(e.id, eventAsPlace(e)));

function lookup(id) {
  return id === 'home' ? homeBase() : ALL.get(id);
}

function miles(a, b) {
  const R = 3958.8, toR = x => x * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function distLabel(p) {
  if (p.lat == null) return '';
  const m = miles(TOWN, p);
  if (m < 0.6) return 'Downtown';
  return `~${Math.round(m * 1.3)} mi from downtown`; // ×1.3 ≈ road distance on mountain roads
}

function driveLabel(p) {
  if (p.drive == null) return '';
  return p.drive === 0 ? 'Walkable downtown' : `${p.drive} min drive`;
}

const dirUrl = p => 'https://www.google.com/maps/dir/?api=1&destination=' +
  encodeURIComponent(p.addr || (p.lat != null ? `${p.lat},${p.lng}` : p.name));

/* ───────────── small UI pieces ───────────── */

const pill = (txt, cls = '') => `<span class="pill ${cls}">${txt}</span>`;
const verifyPill = p => p.verify ? `<span class="pill pill-verify" title="${esc(typeof p.verify === 'string' ? p.verify : 'Verify before trip')}">${icon('info')}Verify Before Trip</span>` : '';
const PRIORITY = { must: ['Must Do', 'pill-must'], optional: ['Optional', 'pill-opt'], rainy: ['Rainy Day Alternative', 'pill-rain'] };

function favButton(id) {
  const on = favs.has(id);
  return `<button class="heart ${on ? 'on' : ''}" data-fav="${esc(id)}" aria-pressed="${on}" aria-label="${on ? 'Remove from' : 'Save to'} favorites">${icon('heart')}</button>`;
}

function photo(key, alt, cls = '') {
  return `<div class="ph ${cls}"><img src="${img(key)}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('ph-fail');this.remove()"></div>`;
}

function fact(ic, label, val) {
  if (!val) return '';
  return `<div class="fact">${icon(ic)}<span><small>${label}</small>${esc(val)}</span></div>`;
}

function actions(p, { add = true } = {}) {
  return `<div class="actions">
    ${p.url ? `<a class="btn-sm" href="${esc(p.url)}" target="_blank" rel="noopener">${icon('globe')}Website</a>` : ''}
    <a class="btn-sm" href="${dirUrl(p)}" target="_blank" rel="noopener">${icon('nav')}Directions</a>
    ${add ? `<button class="btn-sm ghost" data-add="${esc(p.id)}">${icon('plus')}Add to day</button>` : ''}
  </div>`;
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

function chips(el, items, active, onPick, { multi = false } = {}) {
  el.innerHTML = items.map(([k, label]) =>
    `<button class="chip ${(multi ? active.has(k) : active === k) ? 'on' : ''}" data-k="${k}" aria-pressed="${multi ? active.has(k) : active === k}">${label}</button>`).join('');
  el.onclick = e => {
    const b = e.target.closest('.chip');
    if (b) onPick(b.dataset.k);
  };
}

/* ───────────── cards ───────────── */

function placeCard(p) {
  const meta = [p.difficulty && ['boot', 'Difficulty', p.difficulty], p.distance && ['mountain', 'Distance', p.distance],
    ['clock', 'Visit time', p.duration], ['car', 'Drive', driveLabel(p)], ['ticket', 'Cost', p.cost],
    ['parking', 'Parking', p.parking], ['calendar', 'Hours', p.hours]].filter(Boolean);
  return `<article class="card" data-id="${esc(p.id)}">
    <div class="card-media">${photo(p.img, p.name)}${favButton(p.id)}
      <span class="cat-tag" style="--c:${CATS[p.cat]?.color}">${icon(CATS[p.cat]?.icon)}${CATS[p.cat]?.label}</span>
      ${p.dontMiss ? `<span class="dont-miss">Don’t Miss</span>` : ''}
    </div>
    <div class="card-body">
      <h3>${esc(p.name)}</h3>
      <p class="loc">${icon('pin')}${esc(distLabel(p))}</p>
      ${verifyPill(p)}
      <p>${esc(p.desc)}</p>
      ${p.why ? `<p class="why"><b>Why go:</b> ${esc(p.why)}</p>` : ''}
      <div class="facts">${meta.map(m => fact(...m)).join('')}</div>
      ${actions(p)}
    </div>
  </article>`;
}

function eatCard(p) {
  return `<article class="card" data-id="${esc(p.id)}">
    <div class="card-media">${photo(p.img, p.name)}${favButton(p.id)}
      ${p.dontMiss ? `<span class="dont-miss">Don’t Miss</span>` : ''}
    </div>
    <div class="card-body">
      <div class="title-row"><h3>${esc(p.name)}</h3><span class="price">${esc(p.price || '')}</span></div>
      <p class="sub">${esc(p.cuisine || '')}</p>
      <p class="loc">${icon('pin')}${esc(p.addr?.split(',').slice(0, 2).join(',') || '')}</p>
      ${verifyPill(p)}
      <p>${esc(p.desc)}</p>
      ${p.dishes ? `<p class="dishes"><b>Order:</b> ${p.dishes.map(esc).join(' · ')}</p>` : ''}
      <div class="facts">${fact('clock', 'Hours', p.hours)}${fact('calendar', 'Reservations', p.reservation)}</div>
      ${actions(p)}
    </div>
  </article>`;
}

function breweryCard(p) {
  return `<article class="card" data-id="${esc(p.id)}">
    <div class="card-media">${photo(p.img, p.name)}${favButton(p.id)}
      ${p.dontMiss ? `<span class="dont-miss">Don’t Miss</span>` : ''}
    </div>
    <div class="card-body">
      <h3>${esc(p.name)}</h3>
      <p class="loc">${icon('pin')}${esc(distLabel(p))}${p.drive ? ` · ${p.drive} min` : ''}</p>
      ${verifyPill(p)}
      <p>${esc(p.desc)}</p>
      <div class="facts">
        ${fact('beer', 'Beer styles', p.styles)}${fact('fork', 'Food', p.food)}
        ${fact('sun', 'Outdoor seating', p.outdoor)}${fact('star', 'Live music', p.music)}
        ${fact('clock', 'Hours', p.hours)}
      </div>
      ${actions(p)}
    </div>
  </article>`;
}

function eventCard(e) {
  const confirmed = e.status === 'confirmed';
  return `<article class="card event ${confirmed ? '' : 'is-verify'}" data-id="${esc(e.id)}">
    <div class="card-media">${photo(e.img, e.name)}${favButton(e.id)}
      <span class="status ${confirmed ? 'ok' : 'chk'}">${confirmed ? icon('check') + 'Confirmed' : icon('info') + 'Verify Before Trip'}</span>
    </div>
    <div class="card-body">
      <h3>${esc(e.name)}</h3>
      <div class="facts">
        ${fact('calendar', 'When', e.when)}${fact('pin', 'Where', e.where)}${fact('ticket', 'Cost', e.cost)}
      </div>
      <p>${esc(e.desc)}</p>
      <div class="actions">
        <a class="btn-sm" href="${esc(e.url)}" target="_blank" rel="noopener">${icon('globe')}Official info</a>
        <a class="btn-sm" href="${dirUrl({ ...e, addr: e.where })}" target="_blank" rel="noopener">${icon('nav')}Directions</a>
        <button class="btn-sm ghost" data-add="${esc(e.id)}">${icon('plus')}Add to day</button>
      </div>
    </div>
  </article>`;
}

/* ───────────── itinerary ───────────── */

const plan = () => load('plan', 'A');
const planData = () => (plan() === 'B' ? PLAN_B : PLAN_A);

function resolveItem(it) {
  let base = {};
  if (it.place) base = lookup(it.place) || {};
  else if (it.event) base = lookup(it.event) || {};
  else if (it.drive) {
    const d = DRIVES.find(x => x.id === it.drive);
    base = { id: 'drive-' + d.id, name: d.name, img: d.img, url: d.gmaps, addr: '', desc: d.note, cost: 'Free', drive: null, distance: d.miles };
  }
  return {
    ...base, ...it,
    name: base.name, title: it.title || base.name,
    img: it.img || base.img || 'fall1',
    desc: it.desc || base.desc,
    duration: it.duration || base.duration || '',
    cost: it.cost || base.cost || base.price || '',
    reservation: it.reservation || base.reservation || '',
    url: base.url, id: base.id,
  };
}

const STATUS_UI = [['upcoming', 'Upcoming', 'clock'], ['done', 'Done', 'check'], ['skip', 'Skip', 'x']];

function statusControl(key, status, title) {
  return `<div class="status-ctl" role="group" aria-label="Status for ${esc(title)}">${STATUS_UI.map(([v, label, ic]) =>
    `<button type="button" class="st-${v} ${status === v ? 'on' : ''}" data-status="${v}" data-key="${esc(key)}" aria-pressed="${status === v}">${icon(ic)}<span>${label}</span></button>`).join('')}</div>`;
}

// All of a day's items (plan + ones added from favorites) with their check-off keys
function dayItems(day, p = plan()) {
  const planned = (p === 'B' ? PLAN_B : PLAN_A)[day].map((it, i) => ({ it, idx: i, key: planKey(p, day, it.title) }));
  const extra = added.forDay(day).map((a, i) => ({
    it: { ...a, place: ALL.has(a.id) && !EVENTS.find(e => e.id === a.id) ? a.id : undefined, event: EVENTS.find(e => e.id === a.id) ? a.id : undefined, priority: 'optional' },
    idx: i, key: added.key(day, a, i), removable: true,
  }));
  return [...planned, ...extra].map(x => ({ ...x, status: progress.get(x.key) }));
}

// Skipped items drop out of the plan, so "of N" counts only done + upcoming
function dayStats(day, p = plan()) {
  const items = dayItems(day, p);
  const done = items.filter(x => x.status === 'done').length;
  const skip = items.filter(x => x.status === 'skip').length;
  const total = items.length - skip;
  const next = items.find(x => x.status === 'upcoming');
  return { items, done, skip, total, remaining: total - done, next };
}

function activityCard(it, idx, { removable = false, day, key, status = 'upcoming', next = false } = {}) {
  const r = resolveItem(it);
  const [plabel, pcls] = PRIORITY[it.priority] || PRIORITY.optional;
  const isHome = r.id === 'home';
  const loc = isHome ? r.name : (r.addr ? r.addr.split(',').slice(0, 2).join(',') : r.name || '');
  const driveTxt = it.drive ? 'See route' : driveLabel(r);
  const closed = status !== 'upcoming';
  return `<li class="act ${it.priority || ''} is-${status} ${next ? 'is-next' : ''}" data-key="${esc(key)}">
    <div class="act-time"><span>${status === 'done' ? icon('check') : status === 'skip' ? icon('x') : ''}${esc(it.time)}</span></div>
    <article class="act-card">
      ${photo(r.img, r.title, 'act-ph')}
      <div class="act-body">
        ${closed ? `<button type="button" class="act-summary" data-expand aria-expanded="false">
          <b>${esc(r.title)}</b><span class="pill ${status === 'done' ? 'pill-done' : 'pill-skip'}">${status === 'done' ? 'Done' : 'Skipped'}</span><small>Details</small></button>` : ''}
        <div class="act-top">
          ${next ? pill('Up next', 'pill-next') : ''}${pill(plabel, pcls)}${verifyPill(r)}
          ${r.id && !isHome && !String(r.id).startsWith('drive-') ? favButton(r.id) : ''}
        </div>
        <h3>${esc(r.title)}</h3>
        ${loc ? `<p class="loc">${icon('pin')}${esc(loc)}</p>` : ''}
        ${r.desc ? `<p>${esc(r.desc)}</p>` : ''}
        <div class="facts compact">
          ${fact('clock', 'Duration', r.duration)}${fact('car', 'Drive', driveTxt)}
          ${fact('dollar', 'Cost', r.cost)}${fact('calendar', 'Reservations', r.reservation)}
        </div>
        <div class="actions">
          ${r.url ? `<a class="btn-sm" href="${esc(r.url)}" target="_blank" rel="noopener">${icon('globe')}${it.drive ? 'Route map' : 'Website'}</a>` : ''}
          ${!it.drive && !(isHome && r.unset) ? `<a class="btn-sm" href="${dirUrl(r)}" target="_blank" rel="noopener">${icon('nav')}Directions</a>` : ''}
          ${removable ? `<button class="btn-sm ghost" data-remove="${day}:${idx}">${icon('trash')}Remove</button>` : ''}
        </div>
        ${statusControl(key, status, r.title)}
      </div>
    </article>
  </li>`;
}

function wxForDay(date) {
  return forecast.days.find(d => d.date === date);
}

function wxBadge(date) {
  const w = wxForDay(date);
  if (!w) return '';
  const d = describe(w.code);
  return `<span class="wx-badge">${icon(d.icon)}${w.hi}° / ${w.lo}° · ${w.pop ?? 0}% rain</span>`;
}

function renderItinerary(activeDay) {
  const el = $('#itinerary');
  const day = activeDay || Number(load('day', todayTripDay() || 1));
  save('day', day);
  const D = DAYS.find(d => d.n === day);
  const st = dayStats(day);
  const hideClosed = load('hideClosed', false);
  const visible = st.items.filter(x => !hideClosed || x.status === 'upcoming');
  const card = x => activityCard(x.it, x.idx, { removable: x.removable, day, key: x.key, status: x.status, next: x === st.next });
  const planned = visible.filter(x => !x.removable), extra = visible.filter(x => x.removable);
  const pct = st.total ? Math.round(st.done / st.total * 100) : 0;
  const w = wxForDay(D.date);
  const rainy = w && w.pop >= RAIN_THRESHOLD;

  el.innerHTML = `
    <div class="plan-toggle" role="radiogroup" aria-label="Choose plan">
      <button role="radio" aria-checked="${plan() === 'A'}" class="${plan() === 'A' ? 'on' : ''}" data-plan="A">${icon('sun')}<span><b>Plan A</b><small>Mountain days</small></span></button>
      <button role="radio" aria-checked="${plan() === 'B'}" class="${plan() === 'B' ? 'on rain' : ''}" data-plan="B">${icon('umbrella')}<span><b>Plan B</b><small>Rainy-weather backup</small></span></button>
    </div>
    <div class="day-tabs" role="tablist">
      ${DAYS.map(d => { const ds = dayStats(d.n); const all = ds.total && ds.done === ds.total; return `<button role="tab" aria-selected="${d.n === day}" class="${d.n === day ? 'on' : ''} ${all ? 'complete' : ''}" data-day="${d.n}">
        <small>Day ${d.n} · ${d.dow.slice(0, 3)}</small><b>${d.label}</b><em class="tab-prog">${all ? icon('check') + 'Done' : `${ds.done}/${ds.total}`}</em></button>`; }).join('')}
    </div>
    <div class="day-hero" style="--photo:${bg(D.img)}">
      <div>
        <p class="eyebrow">Day ${D.n} · ${D.dow}, ${D.label}${plan() === 'B' ? ' · Plan B' : ''}</p>
        <h3>${esc(D.title)}${plan() === 'B' ? ' <span class="rain-tag">Rainy-day version</span>' : ''}</h3>
        <p>${esc(D.blurb)}</p>
        ${wxBadge(D.date)}
      </div>
    </div>
    ${rainy && plan() === 'A' ? `<div class="alert rain">${icon('rain')}<div><b>${w.pop}% chance of rain on ${D.label}.</b> Plan B swaps in indoor &amp; covered alternatives.</div><button class="btn-sm" data-plan="B">Switch to Plan B</button></div>` : ''}
    ${plan() === 'B' ? `<div class="alert planb">${icon('umbrella')}<div><b>Plan B — rainy weather.</b> Indoor and covered picks for ${D.label}: museums, the enclosed scenic railway, tasting rooms, taprooms and cozy dinners. Outdoor options stay listed as <i>Optional</i> for breaks in the rain.</div></div>` : ''}
    <div class="day-progress" aria-live="polite">
      <div class="dp-head">
        <h4>Day ${D.n} — ${st.done} of ${st.total} ${st.total === 1 ? 'activity' : 'activities'} completed</h4>
        <span class="dp-pct">${pct}%</span>
      </div>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${st.total}" aria-valuenow="${st.done}" aria-label="Day ${D.n} progress"><i style="width:${pct}%"></i></div>
      <p class="dp-meta">${st.remaining ? `<b>${st.remaining}</b> remaining` : (st.total ? '<b>All done</b> — nice day!' : 'Nothing planned')}${st.skip ? ` · ${st.skip} skipped` : ''}${st.next ? ` · Up next: <b>${esc(st.next.it.time)}</b> ${esc(resolveItem(st.next.it).title)}` : ''}</p>
      <div class="dp-actions">
        <label class="switch"><input type="checkbox" id="hideClosed" ${hideClosed ? 'checked' : ''}><span>Hide done &amp; skipped</span></label>
        ${st.done || st.skip ? `<button type="button" class="linkish" data-reset-day>${icon('trash')}Reset Day ${D.n}</button>` : ''}
      </div>
    </div>
    <ol class="timeline">${planned.map(card).join('')}</ol>
    ${hideClosed && st.items.length > visible.length ? `<p class="muted small center">${st.items.length - visible.length} done/skipped ${st.items.length - visible.length === 1 ? 'item' : 'items'} hidden</p>` : ''}
    ${extra.length ? `<h4 class="added-h">${icon('heart')}Added from favorites</h4><ol class="timeline">${extra.map(card).join('')}</ol>` : ''}
    <p class="muted small center">Swipe between days above · ${plan() === 'A' ? 'Weather looking bad? Switch to Plan B.' : 'Sun came out? Switch back to Plan A.'}</p>`;

  el.onclick = e => {
    const t = e.target.closest('[data-day],[data-plan],[data-remove],[data-status],[data-expand],[data-reset-day]');
    if (!t) return;
    if (t.dataset.status) {
      progress.set(t.dataset.key, t.dataset.status);
      renderItinerary(day);
      renderDashboard();
      if (t.dataset.status !== 'upcoming') toast(t.dataset.status === 'done' ? 'Marked done ✓' : 'Skipped');
      return;
    }
    if ('expand' in t.dataset) {
      const li = t.closest('.act');
      const open = li.classList.toggle('expanded');
      t.setAttribute('aria-expanded', open);
      return;
    }
    if ('resetDay' in t.dataset) {
      progress.clear(st.items.map(x => x.key));
      renderItinerary(day);
      renderDashboard();
      toast(`Day ${day} reset`);
      return;
    }
    if (t.dataset.day) renderItinerary(Number(t.dataset.day));
    if (t.dataset.plan) { save('plan', t.dataset.plan); renderItinerary(day); renderDashboard(); toast(t.dataset.plan === 'B' ? 'Plan B (rainy day) active' : 'Plan A active'); }
    if (t.dataset.remove) { const [d, i] = t.dataset.remove.split(':'); added.remove(d, Number(i)); renderItinerary(day); renderDashboard(); }
  };
  $('#hideClosed').onchange = e => { save('hideClosed', e.target.checked); renderItinerary(day); };
}

/* ───────────── dashboard ───────────── */

function nyDateStr(d = new Date()) {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

function todayTripDay() {
  const t = nyDateStr();
  return DAYS.find(d => d.date === t)?.n || null;
}

function renderCountdown() {
  const el = $('#countdown');
  const tick = () => {
    const now = Date.now();
    if (now >= TRIP_END) { el.innerHTML = '<p class="cd-msg">Hope the mountains were good to you. 🍂</p>'; return; }
    if (now >= TRIP_START) { el.innerHTML = `<p class="cd-msg">We’re here! Day ${todayTripDay() || ''} of 4.</p>`; return; }
    let s = Math.floor((TRIP_START - now) / 1000);
    const parts = [['Days', 86400], ['Hours', 3600], ['Min', 60], ['Sec', 1]].map(([l, n]) => { const v = Math.floor(s / n); s -= v * n; return [l, v]; });
    el.innerHTML = parts.map(([l, v]) => `<div><b>${String(v).padStart(2, '0')}</b><small>${l}</small></div>`).join('');
  };
  tick();
  setInterval(tick, 1000);
}

function weatherWidget(compact = false) {
  if (!forecast.days.length) {
    return `<div class="wx-normals">${icon('leaf')}<div><b>Typical Oct weather</b><p>Highs ${WEATHER_NORMALS.high}, lows ${WEATHER_NORMALS.low}. Live forecast appears ~2 weeks out.</p></div></div>`;
  }
  return `<div class="wx-row ${compact ? 'compact' : ''}">${forecast.days.map(w => {
    const d = describe(w.code), D = DAYS.find(x => x.date === w.date);
    return `<div class="wx-day ${w.pop >= RAIN_THRESHOLD ? 'wet' : ''}"><small>${D?.dow.slice(0, 3)} ${D?.label.split(' ')[1]}</small>${icon(d.icon, 'wx-ico')}<b>${w.hi}°</b><span>${w.lo}°</span><em>${w.pop ?? 0}%</em></div>`;
  }).join('')}</div>`;
}

function renderDashboard() {
  const el = $('#dashboard');
  const tDay = todayTripDay();
  const before = Date.now() < TRIP_START && !tDay;
  const showDay = tDay || 1;
  const D = DAYS.find(d => d.n === showDay);
  const tst = dayStats(showDay);
  const todays = tst.items.filter(x => x.status !== 'skip').slice(0, 6);
  const tpct = tst.total ? Math.round(tst.done / tst.total * 100) : 0;
  const saved = favs.all().map(lookup).filter(Boolean);
  const resv = [];
  Object.entries(planData()).forEach(([n, items]) => items.forEach(it => {
    const r = resolveItem(it);
    if (/recommend|book|required/i.test(r.reservation || '') && !/^(none|no |walk)/i.test(r.reservation)) {
      if (!resv.find(x => x.title === r.name)) resv.push({ day: Number(n), time: it.time, title: r.name || r.title, how: r.reservation, url: r.url });
    }
  }));
  const anyRain = forecast.days.some(w => w.pop >= RAIN_THRESHOLD);

  el.innerHTML = `
    <div class="facts-strip">
      <div>${icon('calendar')}<span><small>Dates</small>October 8–11, 2026</span></div>
      <div>${icon('cabin')}<span><small>Length</small>4 Days / 4 Nights</span></div>
      <div>${icon('mountain')}<span><small>Basecamp</small>Blue Ridge, Georgia</span></div>
      <div>${icon(forecast.current ? describe(forecast.current.code).icon : 'sun')}<span><small>Now in Blue Ridge</small>${forecast.current ? `${forecast.current.temp}°F · ${describe(forecast.current.code).label}` : 'Mild days, cool nights'}</span></div>
    </div>

    <div class="dash-grid">
      <div class="panel today">
        <div class="panel-h"><h2>${before ? `Coming up: Day 1` : `Today · Day ${showDay}`}</h2><a href="#itinerary" data-goday="${showDay}">Full day ${icon('arrow')}</a></div>
        <p class="muted">${D.dow}, ${D.label} — <b>${esc(D.title)}</b>${plan() === 'B' ? ' · <span class="rain-tag">Plan B</span>' : ''}</p>
        <div class="mini-prog"><span>${tst.done} of ${tst.total} completed · ${tst.remaining} remaining</span><div class="progress"><i style="width:${tpct}%"></i></div></div>
        <ol class="mini-tl">${todays.map(({ it, status }) => { const r = resolveItem(it); return `<li class="is-${status}"><time>${esc(it.time)}</time><span>${status === 'done' ? icon('check', 'inline') + ' ' : ''}${esc(r.title)}</span>${status === 'done' ? '<i class="done">Done</i>' : it.priority === 'must' ? '<i>Must</i>' : ''}</li>`; }).join('')}</ol>
      </div>

      <div class="panel weather">
        <div class="panel-h"><h2>Trip forecast</h2><a href="#info">Weather &amp; packing ${icon('arrow')}</a></div>
        ${weatherWidget()}
        ${anyRain ? `<div class="alert rain small">${icon('rain')}<div>Rain likely on at least one day. <a href="#itinerary" data-plan-link="B">Open Plan B</a></div></div>` : `<p class="muted small">${forecast.days.length ? 'Live forecast from Open-Meteo. Rain ≥ ' + RAIN_THRESHOLD + '% will suggest Plan B.' : ''}</p>`}
      </div>

      <div class="panel days">
        <div class="panel-h"><h2>The plan at a glance</h2><a href="#itinerary">Itinerary ${icon('arrow')}</a></div>
        <div class="day-cards">${DAYS.map(d => `<a href="#itinerary" data-goday="${d.n}" class="day-card" style="--photo:${bg(d.img)}">
          <small>Day ${d.n} · ${d.dow.slice(0, 3)} ${d.label}</small><b>${esc(d.title)}</b>${wxBadge(d.date)}</a>`).join('')}</div>
      </div>

      <div class="panel resv">
        <div class="panel-h"><h2>Reservations to make</h2></div>
        <ul class="resv-list">${resv.map(r => `<li><span class="d">D${r.day}</span><div><b>${esc(r.title)}</b><small>${esc(r.time)} · ${esc(r.how)}</small></div>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="Website for ${esc(r.title)}">${icon('globe')}</a>` : ''}</li>`).join('')}</ul>
      </div>

      <div class="panel saved">
        <div class="panel-h"><h2>Saved places</h2><button class="linkish" data-open-favs>Open planner ${icon('arrow')}</button></div>
        ${saved.length ? `<ul class="saved-list">${saved.slice(0, 6).map(p => `<li>${photo(p.img, p.name, 'thumb')}<span>${esc(p.name)}</span></li>`).join('')}</ul>${saved.length > 6 ? `<p class="muted small">+${saved.length - 6} more</p>` : ''}`
          : `<p class="muted">Tap ${icon('heart', 'inline')} on any restaurant, brewery, hike or event to save it here.</p>`}
      </div>

      <div class="panel quick">
        <div class="panel-h"><h2>Quick links</h2></div>
        <div class="quick-grid">
          <a href="#eat" style="--photo:${bg('grits')}">${icon('fork')}Restaurants</a>
          <a href="#breweries" style="--photo:${bg('beerflight')}">${icon('beer')}Breweries</a>
          <a href="#explore" data-cat="hiking" style="--photo:${bg('fallbranch')}">${icon('boot')}Hikes</a>
          <a href="#events" style="--photo:${bg('downtown2')}">${icon('calendar')}Events</a>
          <a href="#map" style="--photo:${bg('lake')}">${icon('pin')}Map</a>
          <a href="#itinerary" data-plan-link="B" style="--photo:${bg('railway')}">${icon('umbrella')}Rainy Plan B</a>
        </div>
      </div>
    </div>`;
}

/* ───────────── explore / eat / breweries / events ───────────── */

function renderExplore(cat = load('exploreCat', 'all')) {
  save('exploreCat', cat);
  const el = $('#explore');
  const list = PLACES.filter(p => p.explore && (cat === 'all' || p.explore.includes(cat)));
  el.innerHTML = `<div class="chips" id="exploreChips"></div>
    <div class="grid">${list.map(placeCard).join('')}</div>`;
  chips($('#exploreChips'), [['all', 'All'], ...EXPLORE_CATS], cat, k => renderExplore(k));
}

function renderDrives() {
  const el = $('#drives');
  el.innerHTML = `<div class="section-head sub"><p class="eyebrow">Windows down</p><h2>Scenic Drives</h2>
    <p class="lede">Classic mountain routes from Blue Ridge. Lines are approximate — open the route in Google Maps to navigate.</p></div>
    <div class="drives">${DRIVES.map(d => `<article class="drive">
      <div class="drive-map" data-route="${d.id}" role="img" aria-label="Route map for ${esc(d.name)}"></div>
      <div class="drive-body">
        <h3>${esc(d.name)}</h3>
        <div class="facts compact">${fact('car', 'Distance', d.miles)}${fact('clock', 'Driving', d.time)}${fact('calendar', 'Best for', d.day)}</div>
        <p class="route">${esc(d.route)}</p>
        <h4>Stops along the way</h4>
        <ul class="stops">${d.stops.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <p><b>Food &amp; drink:</b> ${esc(d.food)}</p>
        <p class="muted small">${icon('info', 'inline')} ${esc(d.note)}</p>
        <a class="btn-sm" href="${d.gmaps}" target="_blank" rel="noopener">${icon('nav')}Open route in Google Maps</a>
      </div></article>`).join('')}</div>`;
  lazyMaps(el, '[data-route]', node => routeMap(node, DRIVES.find(d => d.id === node.dataset.route).path));
}

function renderEat(cat = load('eatCat', 'all')) {
  save('eatCat', cat);
  const el = $('#eat');
  const all = [...PLACES, ...EXTRA_PLACES].filter(p => p.meals);
  const list = all.filter(p => cat === 'all' || p.meals.includes(cat));
  const dm = all.filter(p => p.dontMiss);
  el.innerHTML = `
    <div class="dont-miss-strip">
      <h3>${icon('star')}Don’t Miss</h3>
      <div class="dm-row">${dm.map(p => `<a href="#eat" class="dm" data-scroll="${p.id}" style="--photo:${bg(p.img)}"><b>${esc(p.name)}</b><small>${esc(p.cuisine)}</small></a>`).join('')}</div>
    </div>
    <div class="chips" id="eatChips"></div>
    <div class="grid">${list.map(eatCard).join('') || '<p class="muted">Nothing in this category yet.</p>'}</div>`;
  chips($('#eatChips'), [['all', 'All'], ...MEAL_CATS], cat, k => renderEat(k));
}

function renderBreweries() {
  const el = $('#breweries');
  const list = PLACES.filter(p => p.cat === 'brewery' || p.styles);
  el.innerHTML = `
    <div class="alert dd">${icon('car')}<div><b>Designate a driver or rideshare.</b> Mountain roads are dark, curvy and patrolled. Rideshare is limited outside downtown — line up a sober driver or local taxi before the Copperhill hop or Oktoberfest.</div></div>
    <div class="grid">${list.map(breweryCard).join('')}</div>
    <div class="section-head sub"><p class="eyebrow">Optional</p><h2>Brewery Trail Routes</h2></div>
    <div class="trails">${BREWERY_TRAILS.map((t, i) => {
      const stops = t.stops.map(lookup);
      return `<article class="trail">
        <div class="drive-map" data-trail="${i}" role="img" aria-label="Map of ${esc(t.name)}"></div>
        <div class="drive-body">
          <h3>${esc(t.name)}</h3><p class="muted">${esc(t.time)}</p>
          <ol class="trail-stops">${stops.map((s, j) => `<li><span>${j + 1}</span><div><b>${esc(s.name)}</b><small>${esc(s.hours || '')}</small></div></li>`).join('')}</ol>
          <p class="small">${esc(t.note)}</p>
          <a class="btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/${stops.map(s => encodeURIComponent(s.addr)).join('/')}">${icon('nav')}Route in Google Maps</a>
        </div></article>`;
    }).join('')}</div>`;
  lazyMaps(el, '[data-trail]', node => {
    const stops = BREWERY_TRAILS[node.dataset.trail].stops.map(lookup);
    const m = baseMap(node, { tap: false });
    if (!m) return;
    const pts = stops.map(s => [s.lat, s.lng]);
    L.polyline(pts, { color: '#d9a13b', weight: 4, dashArray: '2 8', lineCap: 'round' }).addTo(m);
    stops.forEach((s, j) => L.marker([s.lat, s.lng], { icon: markerIcon('brewery') }).addTo(m).bindTooltip(`${j + 1}. ${s.name}`));
    m.fitBounds(L.latLngBounds(pts).pad(0.4));
  });
}

function renderEvents(day = load('eventDay', 'all')) {
  save('eventDay', day);
  const el = $('#events');
  const list = EVENTS.filter(e => day === 'all' || e.dates.includes(day))
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'confirmed' ? -1 : 1));
  el.innerHTML = `<div class="legend"><span class="status ok">${icon('check')}Confirmed</span> official dates found
      <span class="status chk">${icon('info')}Verify Before Trip</span> recurring / suggested</div>
    <div class="chips" id="eventChips"></div>
    <div class="grid">${list.map(eventCard).join('')}</div>`;
  chips($('#eventChips'), [['all', 'All 4 days'], ...DAYS.map(d => [d.date, `${d.dow.slice(0, 3)} ${d.label}`])], day, k => renderEvents(k));
}

/* ───────────── trip map ───────────── */

let tripMap, layerByCat = {}, mapCats;

function popupHtml(p) {
  return `<div class="pop">
    ${p.img ? `<img src="${img(p.img)}" alt="" loading="lazy">` : ''}
    <b>${esc(p.name)}</b>
    <small>${esc(CATS[p.cat]?.label || '')}${p.lat != null && p.id !== 'home' ? ' · ' + esc(distLabel(p)) : ''}</small>
    <p>${esc((p.desc || '').slice(0, 140))}${(p.desc || '').length > 140 ? '…' : ''}</p>
    <a href="${dirUrl(p)}" target="_blank" rel="noopener">Directions →</a>
  </div>`;
}

function renderMap() {
  const el = $('#mapwrap');
  if (tripMap) { setTimeout(() => tripMap.invalidateSize(), 50); return; }
  mapCats = new Set(Object.keys(CATS));
  const items = [homeBase(), ...PLACES, ...EXTRA_PLACES, ...EVENTS.map(eventAsPlace)].filter(p => p.lat != null);
  el.innerHTML = `<div class="chips" id="mapChips"></div><div class="tripmap" id="tripmap"></div>
    <p class="muted small">${homeBase().unset ? 'Tip: set your cabin location in Trip Info to see it here (stored only on your device).' : ''}</p>`;
  const drawChips = () => chips($('#mapChips'), Object.entries(CATS).map(([k, c]) => [k, `<i class="dot" style="--c:${c.color}"></i>${c.label}`]), mapCats, k => {
    mapCats.has(k) ? mapCats.delete(k) : mapCats.add(k);
    layerByCat[k] && (mapCats.has(k) ? layerByCat[k].addTo(tripMap) : tripMap.removeLayer(layerByCat[k]));
    drawChips();
  }, { multi: true });
  drawChips();
  tripMap = baseMap($('#tripmap'));
  if (!tripMap) return;
  items.forEach(p => {
    (layerByCat[p.cat] ||= L.layerGroup().addTo(tripMap));
    L.marker([p.lat, p.lng], { icon: markerIcon(p.cat), title: p.name }).bindPopup(popupHtml(p), { maxWidth: 240 }).addTo(layerByCat[p.cat]);
  });
  tripMap.fitBounds(L.latLngBounds(items.map(p => [p.lat, p.lng])), { padding: [24, 24] });
}

/* ───────────── trip info ───────────── */

function renderInfo() {
  const el = $('#info');
  const packed = load('packing', {});
  const allItems = PACKING.flatMap(g => g.items);
  const done = allItems.filter(i => packed[i]).length;
  const h = load('home', null) || {};
  el.innerHTML = `
    <div class="info-grid">
      <div class="panel">
        <div class="panel-h"><h2>${icon('leaf')} October mountain weather</h2></div>
        ${weatherWidget()}
        <dl class="normals">
          <div><dt>Typical highs</dt><dd>${WEATHER_NORMALS.high}</dd></div>
          <div><dt>Typical lows</dt><dd>${WEATHER_NORMALS.low}</dd></div>
          <div><dt>Sunrise</dt><dd>${WEATHER_NORMALS.sunrise}</dd></div>
          <div><dt>Sunset</dt><dd>${WEATHER_NORMALS.sunset}</dd></div>
        </dl>
        <p class="small">${esc(WEATHER_NORMALS.summary)}</p>
        <p class="small muted">Rain: ${esc(WEATHER_NORMALS.rain)}</p>
      </div>

      <div class="panel" id="packing">
        <div class="panel-h"><h2>${icon('bag')} Packing checklist</h2><span class="progress-txt">${done}/${allItems.length}</span></div>
        <div class="progress"><i style="width:${(done / allItems.length * 100).toFixed(0)}%"></i></div>
        ${PACKING.map(g => `<details ${g.group === 'Hiking gear' ? 'open' : ''}><summary>${esc(g.group)} <small>${g.items.filter(i => packed[i]).length}/${g.items.length}</small></summary>
          <ul class="checklist">${g.items.map(i => `<li><label><input type="checkbox" data-pack="${esc(i)}" ${packed[i] ? 'checked' : ''}><span>${esc(i)}</span></label></li>`).join('')}</ul></details>`).join('')}
      </div>
    </div>

    <div class="section-head sub"><p class="eyebrow">Know before you go</p><h2>Trip Tips</h2></div>
    <div class="tips">${TIPS.map(t => `<article class="tip">${icon(t.icon)}<h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></article>`).join('')}</div>

    <div class="info-grid">
      <div class="panel" id="homebase">
        <div class="panel-h"><h2>${icon('cabin')} Our home base</h2></div>
        <p class="small muted">Private: saved only in this browser, never published. Used for the map pin and directions.</p>
        <form id="homeForm" class="form">
          <label>Name<input name="name" value="${esc(h.name || '')}" placeholder="e.g. Creekside Cabin" maxlength="60"></label>
          <label>Address<input name="addr" value="${esc(h.addr || '')}" placeholder="Street, Blue Ridge, GA" maxlength="140"></label>
          <div class="row2">
            <label>Latitude<input name="lat" inputmode="decimal" value="${h.lat ?? ''}" placeholder="34.86"></label>
            <label>Longitude<input name="lng" inputmode="decimal" value="${h.lng ?? ''}" placeholder="-84.32"></label>
          </div>
          <div class="actions">
            <button type="button" class="btn-sm ghost" id="useLoc">${icon('compass')}Use my current location</button>
            <button type="submit" class="btn-sm">${icon('check')}Save</button>
            ${h.name ? `<button type="button" class="btn-sm ghost" id="clearHome">${icon('trash')}Clear</button>` : ''}
          </div>
        </form>
      </div>
      <div class="panel" id="credits">
        <div class="panel-h"><h2>${icon('info')} Photo credits</h2></div>
        <p class="small muted">All photos via Wikimedia Commons under the licenses shown. Food and taproom photos are representative, not the specific venue.</p>
        <ul class="credits">${Object.entries(credits).map(([k, c]) => `<li><a href="${esc(c.page)}" target="_blank" rel="noopener">${esc(c.file.replace(/\.(jpe?g|png)$/i, ''))}</a> — ${esc(c.artist)} · ${esc(c.license)}</li>`).join('')}</ul>
      </div>
    </div>`;

  el.onchange = e => {
    const k = e.target.dataset.pack;
    if (k == null) return;
    const p = load('packing', {});
    e.target.checked ? (p[k] = true) : delete p[k];
    save('packing', p);
    const openGroups = $$('details[open] summary', el).map(s => s.firstChild.textContent.trim());
    renderInfo();
    $$('details', el).forEach(d => { if (openGroups.includes(d.querySelector('summary').firstChild.textContent.trim())) d.open = true; });
  };
  $('#homeForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const lat = parseFloat(f.get('lat')), lng = parseFloat(f.get('lng'));
    save('home', { name: f.get('name').trim() || 'Our cabin', addr: f.get('addr').trim(), lat: Number.isFinite(lat) ? lat : undefined, lng: Number.isFinite(lng) ? lng : undefined });
    resetMap();
    toast('Home base saved on this device');
    renderInfo();
  };
  $('#useLoc').onclick = () => {
    if (!navigator.geolocation) return toast('Location not available');
    navigator.geolocation.getCurrentPosition(pos => {
      $('#homeForm [name=lat]').value = pos.coords.latitude.toFixed(5);
      $('#homeForm [name=lng]').value = pos.coords.longitude.toFixed(5);
      toast('Location filled in — tap Save');
    }, () => toast('Couldn’t get location'));
  };
  const clr = $('#clearHome');
  if (clr) clr.onclick = () => { save('home', null); resetMap(); renderInfo(); toast('Home base cleared'); };
}

function resetMap() {
  if (tripMap) { tripMap.remove(); tripMap = null; layerByCat = {}; }
}

/* ───────────── favorites drawer ───────────── */

let favFilter = 'all';

function renderFavs() {
  const list = favs.all().map(lookup).filter(Boolean)
    .filter(p => favFilter === 'all' || (p.tags || []).includes(favFilter));
  $('#favCount').textContent = favs.all().length;
  $('#favBtn').classList.toggle('has', favs.all().length > 0);
  chips($('#favFilters'), [['all', 'All'], ...FILTER_TAGS], favFilter, k => { favFilter = k; renderFavs(); });
  $('#favList').innerHTML = list.length ? `<ul class="fav-list">${list.map(p => `<li>
      ${photo(p.img, p.name, 'thumb')}
      <div><b>${esc(p.name)}</b><small>${esc(CATS[p.cat]?.label || '')}${p.lat != null ? ' · ' + esc(distLabel(p)) : ''}</small>
        <div class="actions">
          <button class="btn-sm" data-add="${esc(p.id)}">${icon('plus')}Add to day</button>
          <a class="btn-sm ghost" href="${dirUrl(p)}" target="_blank" rel="noopener">${icon('nav')}Go</a>
          <button class="btn-sm ghost" data-fav="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">${icon('x')}</button>
        </div></div></li>`).join('')}</ul>`
    : `<div class="empty">${icon('heart')}<p>${favs.all().length ? 'No favorites match this filter.' : 'No favorites yet. Tap the heart on any card.'}</p></div>`;
}

function openDrawer() {
  renderFavs();
  const d = $('#drawer');
  d.hidden = false;
  requestAnimationFrame(() => d.classList.add('open'));
  $('#drawer [data-close]').focus?.();
}

function closeDrawer() {
  const d = $('#drawer');
  d.classList.remove('open');
  setTimeout(() => (d.hidden = true), 250);
}

let addTarget = null;
function openAdd(id) {
  addTarget = id;
  const p = lookup(id);
  $('#addTitle').textContent = `Add “${p.name}” to…`;
  $('#addDay').innerHTML = DAYS.map(d => `<option value="${d.n}">Day ${d.n} — ${d.dow}, ${d.label}</option>`).join('');
  $('#addDay').value = load('day', 1);
  $('#addTime').value = '';
  const dlg = $('#addDlg');
  dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
}

/* ───────────── router & global events ───────────── */

const VIEWS = ['home', 'itinerary', 'explore', 'eat', 'breweries', 'events', 'map', 'info'];
const rendered = new Set();

function route() {
  const v = (location.hash || '#home').slice(1);
  const view = VIEWS.includes(v) ? v : 'home';
  $$('.view').forEach(s => (s.hidden = s.dataset.view !== view));
  $$('#nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + view));
  $$('.quickbar a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + view));
  document.body.dataset.view = view;
  closeMenu();
  if (!rendered.has(view)) {
    ({ explore: () => { renderExplore(); renderDrives(); }, eat: () => renderEat(), breweries: renderBreweries, events: () => renderEvents() }[view] || (() => {}))();
    if (view !== 'map' && view !== 'itinerary' && view !== 'home') rendered.add(view);
  }
  if (view === 'itinerary') renderItinerary();
  if (view === 'map') renderMap();
  if (view === 'info') renderInfo();
  window.scrollTo(0, 0);
  $('#topbar').classList.toggle('solid', view !== 'home');
  if (view === 'info' && pendingScroll) { $('#' + pendingScroll)?.scrollIntoView({ behavior: 'smooth' }); pendingScroll = null; }
}
let pendingScroll = null;

function closeMenu() {
  $('#nav').classList.remove('open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
}

function syncHearts(id) {
  const on = favs.has(id);
  $$(`[data-fav="${CSS.escape(id)}"].heart`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}

function bindGlobal() {
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-fav]');
    if (f) {
      const on = favs.toggle(f.dataset.fav);
      syncHearts(f.dataset.fav);
      renderFavs();
      if (document.body.dataset.view === 'home') renderDashboard();
      toast(on ? 'Saved to favorites' : 'Removed from favorites');
      return;
    }
    const a = e.target.closest('[data-add]');
    if (a) { openAdd(a.dataset.add); return; }
    const gd = e.target.closest('[data-goday]');
    if (gd) save('day', Number(gd.dataset.goday));
    const pl = e.target.closest('[data-plan-link]');
    if (pl) save('plan', pl.dataset.planLink);
    const ec = e.target.closest('[data-cat]');
    if (ec) { save('exploreCat', ec.dataset.cat); rendered.delete('explore'); }
    const go = e.target.closest('[data-goto]');
    if (go) pendingScroll = go.dataset.goto;
    const sc = e.target.closest('[data-scroll]');
    if (sc) { e.preventDefault(); renderEat('all'); document.querySelector(`.card[data-id="${CSS.escape(sc.dataset.scroll)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    const today = e.target.closest('[data-today]');
    if (today) save('day', todayTripDay() || 1);
    if (e.target.closest('[data-open-favs]')) openDrawer();
    if (e.target.closest('[data-close]')) closeDrawer();
  });
  $('#favBtn').onclick = openDrawer;
  $('#quickFav').onclick = openDrawer;
  $('#menuBtn').onclick = () => {
    const open = $('#nav').classList.toggle('open');
    $('#menuBtn').setAttribute('aria-expanded', open);
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeMenu(); } });
  $('#addDlg').addEventListener('close', () => {
    if ($('#addDlg').returnValue !== 'ok' || !addTarget) return;
    const day = Number($('#addDay').value);
    added.add(day, addTarget, $('#addTime').value.trim());
    toast(`Added to Day ${day}`);
    save('day', day);
    if (document.body.dataset.view === 'itinerary') renderItinerary(day);
    renderDashboard();
    addTarget = null;
  });
  window.addEventListener('hashchange', route);
}

function lazyMaps(root, sel, init) {
  const nodes = $$(sel, root);
  if (!('IntersectionObserver' in window)) return nodes.forEach(init);
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { io.unobserve(en.target); init(en.target); }
  }), { rootMargin: '200px' });
  nodes.forEach(n => io.observe(n));
}

/* ───────────── hero effects ───────────── */

function heroFx() {
  $('#heroRidges').innerHTML = ridges();
  $('#footRidges').innerHTML = ridges();
  document.documentElement.style.setProperty('--topo', TOPO);
  const leaves = $('#leaves');
  const colors = ['#c8692a', '#d9a13b', '#b2452f', '#e07b39', '#9b4d3a', '#c99a2e'];
  leaves.innerHTML = Array.from({ length: 14 }, (_, i) =>
    `<i style="--x:${(i * 73) % 100}vw;--d:${9 + (i * 7) % 9}s;--delay:-${(i * 1.7) % 12}s;--c:${colors[i % colors.length]};--s:${0.6 + (i % 4) * 0.2};--sway:${(i % 2 ? 1 : -1) * (30 + (i * 13) % 50)}px"></i>`).join('');
  const bar = $('#topbar');
  const onScroll = () => bar.classList.toggle('solid', window.scrollY > 40 || document.body.dataset.view !== 'home');
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('hashchange', onScroll);
  onScroll();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = $('#hero');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || document.body.dataset.view !== 'home') return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, 900);
      hero.style.setProperty('--py', y);
      ticking = false;
    });
  }, { passive: true });
}

/* ───────────── boot ───────────── */

async function boot() {
  $$('[data-icon]').forEach(s => (s.outerHTML = icon(s.dataset.icon)));
  heroFx();
  bindGlobal();
  renderCountdown();
  renderDashboard();
  renderFavs();
  route();
  try { credits = await (await fetch('data/credits.json')).json(); } catch { credits = {}; }
  forecast = await getForecast();
  renderDashboard();
  if (document.body.dataset.view === 'itinerary') renderItinerary();
  if (document.body.dataset.view === 'info') renderInfo();
}

boot();
