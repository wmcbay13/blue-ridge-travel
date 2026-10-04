// localStorage wrapper. Everything here is per-device convenience state;
// storage can be unavailable (private mode, blocked), so every access is guarded.

const NS = 'brt:';
const mem = {};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw == null ? (key in mem ? mem[key] : fallback) : JSON.parse(raw);
  } catch {
    return key in mem ? mem[key] : fallback;
  }
}

export function save(key, value) {
  mem[key] = value;
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch { /* in-memory only */ }
}

// Favorites: array of place/event ids
export const favs = {
  all: () => load('favs', []),
  has: id => favs.all().includes(id),
  toggle(id) {
    const list = favs.all();
    const i = list.indexOf(id);
    i >= 0 ? list.splice(i, 1) : list.push(id);
    save('favs', list);
    return i < 0;
  },
};

// Items the user moved into a day: { [day]: [{ id, time }] }
export const added = {
  all: () => load('added', {}),
  forDay: d => added.all()[d] || [],
  add(day, id, time) {
    const a = added.all();
    (a[day] ||= []).push({ id, time: time || 'Flexible', uid: Date.now().toString(36) });
    save('added', a);
  },
  remove(day, idx) {
    const a = added.all();
    const [gone] = (a[day] || []).splice(idx, 1);
    save('added', a);
    if (gone) progress.set(added.key(day, gone, idx), 'upcoming');
  },
  key: (day, a, idx) => `added:${day}:${a.uid || `${a.id}:${idx}`}`,
};

// Itinerary check-off: { [itemKey]: 'done' | 'skip' }. Missing = upcoming.
// Plan items are keyed by plan + day + title so Plan A and Plan B track separately.
export const STATUSES = ['upcoming', 'done', 'skip'];

export const progress = {
  all: () => load('status', {}),
  get: key => progress.all()[key] || 'upcoming',
  set(key, status) {
    const s = progress.all();
    status === 'upcoming' ? delete s[key] : (s[key] = status);
    save('status', s);
  },
  clear(keys) {
    const s = progress.all();
    keys.forEach(k => delete s[k]);
    save('status', s);
  },
};

export const planKey = (plan, day, title) =>
  `${plan}:${day}:${String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
