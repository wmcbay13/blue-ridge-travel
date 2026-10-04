// Small stroke icon set (24×24, currentColor) plus the decorative illustrations.

const P = {
  cabin: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/><path d="M16 6V3h2v4.5"/>',
  fork: '<path d="M7 3v8a2 2 0 0 0 4 0V3"/><path d="M9 11v10"/><path d="M17 3c-2 2-2 6 0 8v10"/>',
  beer: '<path d="M6 7h10v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M16 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><path d="M6 7a3 3 0 0 1 3-4 3 3 0 0 1 4 0 3 3 0 0 1 3 4"/><path d="M9 11v6M13 11v6"/>',
  boot: '<path d="M7 3h5v8l6 3a3 3 0 0 1 2 3v2H4V3z"/><path d="M4 19h16"/><path d="M12 8h-3M12 11H9"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  mountain: '<path d="m3 20 6-11 4 6 2-3 6 8z"/><path d="m8 11 1.5 1.5L11 11"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  apple: '<path d="M12 7c-2-1.5-6-1-6 4 0 5 3 9 6 8 3 1 6-3 6-8 0-5-4-5.5-6-4z"/><path d="M12 7c0-2 1-3.5 3-4"/>',
  pin: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  car: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/>',
  dollar: '<path d="M12 3v18"/><path d="M17 7c-1-1.5-3-2-5-2-2.5 0-4 1.3-4 3s1.5 2.6 4 3 4 1.4 4 3.2S14.5 17 12 17c-2 0-4-.6-5-2"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  nav: '<path d="m3 11 18-8-8 18-2-8z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z"/>',
  rain: '<path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
  storm: '<path d="M7 14h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14z"/><path d="m12 14-2 4h3l-2 4"/>',
  fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 14 10"/>',
  parking: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  road: '<path d="M8 3 4 21M16 3l4 18M12 4v3M12 11v3M12 18v2"/>',
  signal: '<path d="M4 20v-3M9 20v-7M14 20V9M19 20V4"/>',
  bear: '<circle cx="7" cy="6" r="2"/><circle cx="17" cy="6" r="2"/><path d="M5 13a7 7 0 0 1 14 0c0 4-3 7-7 7s-7-3-7-7z"/><circle cx="12" cy="15" r="1.5"/>',
  cart: '<path d="M3 4h2l2.5 11h11l2-8H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  fuel: '<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M4 21h12M7 8h6"/><path d="M15 10h2a2 2 0 0 1 2 2v4a1 1 0 0 0 2 0V8l-3-3"/>',
  fire: '<path d="M12 21c4 0 6-2.5 6-6 0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15c0 3.5 2 6 6 6z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
  umbrella: '<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v7a2 2 0 0 1-4 0"/><path d="M12 3v0"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
};

export const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.pin}</svg>`;

// Layered ridgelines used in the hero and as section dividers.
export const ridges = () => `
<svg class="ridges" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
  <path class="r1" d="M0 190 L90 150 L170 172 L260 120 L350 160 L430 128 L520 165 L610 110 L700 150 L790 118 L880 160 L960 126 L1050 158 L1140 112 L1230 150 L1330 122 L1440 150 V320 H0Z"/>
  <path class="r2" d="M0 230 L110 196 L210 218 L320 178 L420 212 L540 172 L650 206 L760 180 L870 214 L980 176 L1090 210 L1200 182 L1320 214 L1440 190 V320 H0Z"/>
  <path class="r3" d="M0 268 L120 240 L250 262 L380 230 L500 258 L640 232 L780 262 L900 236 L1040 264 L1180 238 L1310 260 L1440 240 V320 H0Z"/>
  <g class="pines">${Array.from({ length: 26 }, (_, i) => {
    const x = 20 + i * 56 + (i % 3) * 9, h = 34 + (i * 37 % 26), y = 300 - (i % 4) * 6;
    return `<path d="M${x} ${y} l${h * .28} 0 l-${h * .28} -${h} l-${h * .28} ${h}z"/>`;
  }).join('')}</g>
  <path class="r4" d="M0 298 L160 284 L320 296 L480 282 L640 294 L800 280 L960 292 L1120 282 L1280 294 L1440 286 V320 H0Z"/>
</svg>`;

// Subtle topographic contour pattern for section backgrounds (data URI).
export const TOPO = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="none" stroke="#8a6b47" stroke-opacity=".08" stroke-width="1.2">' +
  [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${-20 + i * 6} ${200 + i * 4}c60-${70 - i * 8} 140-${90 - i * 10} 210-${30 - i * 3}s130 ${70 - i * 6} 210 ${20 - i * 2}"/>`).join('') +
  [0, 1, 2, 3].map(i => `<ellipse cx="300" cy="90" rx="${18 + i * 16}" ry="${12 + i * 11}"/>`).join('') +
  [0, 1, 2].map(i => `<ellipse cx="90" cy="320" rx="${14 + i * 15}" ry="${10 + i * 10}"/>`).join('') +
  '</svg>')}")`;
