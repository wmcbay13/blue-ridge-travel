// Live forecast from Open-Meteo (free, no key). The trip dates are only forecastable
// within ~16 days, so callers fall back to October normals when `days` is empty.
import { load, save } from './store.js';

const LAT = 34.864, LNG = -84.3241;
const URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
  '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York' +
  '&start_date=2026-10-08&end_date=2026-10-11';
const TTL = 60 * 60 * 1000;

export const RAIN_THRESHOLD = 60; // % chance that triggers the Plan B suggestion

export function describe(code) {
  if (code == null) return { label: '—', icon: 'cloud' };
  if (code === 0) return { label: 'Clear', icon: 'sun' };
  if (code <= 2) return { label: 'Partly cloudy', icon: 'sun' };
  if (code === 3) return { label: 'Overcast', icon: 'cloud' };
  if (code <= 48) return { label: 'Fog', icon: 'fog' };
  if (code <= 67) return { label: code <= 57 ? 'Drizzle' : 'Rain', icon: 'rain' };
  if (code <= 77) return { label: 'Snow', icon: 'cloud' };
  if (code <= 82) return { label: 'Showers', icon: 'rain' };
  return { label: 'Thunderstorms', icon: 'storm' };
}

export async function getForecast() {
  const cached = load('wx', null);
  if (cached && Date.now() - cached.at < TTL) return cached.data;
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(res.status);
    const j = await res.json();
    const d = j.daily || {};
    const data = {
      current: j.current ? { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code } : null,
      days: (d.time || []).map((date, i) => ({
        date,
        hi: Math.round(d.temperature_2m_max[i]),
        lo: Math.round(d.temperature_2m_min[i]),
        code: d.weather_code[i],
        pop: d.precipitation_probability_max[i],
      })).filter(x => x.hi != null && !Number.isNaN(x.hi)),
    };
    save('wx', { at: Date.now(), data });
    return data;
  } catch {
    return cached ? cached.data : { current: null, days: [] };
  }
}
