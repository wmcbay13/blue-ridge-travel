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
    (a[day] ||= []).push({ id, time: time || 'Flexible' });
    save('added', a);
  },
  remove(day, idx) {
    const a = added.all();
    (a[day] || []).splice(idx, 1);
    save('added', a);
  },
};
