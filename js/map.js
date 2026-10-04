// Leaflet helpers (Leaflet is loaded globally from cdnjs in index.html).
import { icon } from './icons.js';
import { CATS } from '../data/places.js';

const TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const hasLeaflet = () => typeof window.L !== 'undefined';

export function baseMap(el, opts = {}) {
  if (!hasLeaflet()) {
    el.innerHTML = '<p class="map-fallback">Map unavailable offline — use the directions links instead.</p>';
    return null;
  }
  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true, ...opts });
  L.tileLayer(TILE, { attribution: ATTR, maxZoom: 18 }).addTo(map);
  return map;
}

export function markerIcon(cat) {
  const c = CATS[cat] || CATS.town;
  return L.divIcon({
    className: 'mk',
    html: `<span class="mk-pin" style="--c:${c.color}">${icon(c.icon)}</span>`,
    iconSize: [34, 42], iconAnchor: [17, 40], popupAnchor: [0, -36],
  });
}

export function routeMap(el, path) {
  const map = baseMap(el, { dragging: !L.Browser?.mobile, tap: false });
  if (!map) return null;
  const line = L.polyline(path, { color: '#c8692a', weight: 4, opacity: .9, dashArray: '1 8', lineCap: 'round' }).addTo(map);
  L.polyline(path, { color: '#3f6b46', weight: 2, opacity: .7 }).addTo(map);
  L.circleMarker(path[0], { radius: 6, color: '#fff', weight: 2, fillColor: '#3f6b46', fillOpacity: 1 }).addTo(map).bindTooltip('Blue Ridge');
  map.fitBounds(line.getBounds(), { padding: [18, 18] });
  return map;
}
