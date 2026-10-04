import { test, expect } from '@playwright/test';

const VIEWS = ['home', 'itinerary', 'explore', 'eat', 'breweries', 'events', 'map', 'nearby', 'info'];

// Deterministic forecast: Sat Oct 10 is a washout so the Plan B prompt should appear.
const FORECAST = {
  current: { temperature_2m: 61, weather_code: 3 },
  daily: {
    time: ['2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'],
    weather_code: [1, 2, 63, 3],
    temperature_2m_max: [72, 70, 61, 66],
    temperature_2m_min: [48, 47, 52, 45],
    precipitation_probability_max: [5, 10, 85, 20],
  },
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api.open-meteo.com/**', r => r.fulfill({ json: FORECAST }));
});

test('every view renders without errors or horizontal scroll', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  for (const v of VIEWS) {
    await page.goto('/#' + v);
    await expect(page.locator(`section[data-view="${v}"]`)).toBeVisible();
    if (v !== 'nearby') await expect(page.locator(`#nav a[href="#${v}"]`)).toHaveClass(/active/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `overflow on ${v}`).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});

test('home dashboard: countdown, forecast and reservations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Blue Ridge Mountain Getaway');
  await expect(page.locator('#countdown')).not.toBeEmpty();
  await expect(page.locator('.dash .wx-day')).toHaveCount(4);
  await expect(page.locator('.dash .alert.rain')).toContainText('Rain likely');
  await expect(page.locator('.resv-list li').first()).toBeVisible();
  await expect(page.locator('.resv-list')).not.toContainText('No reservation');
});

test('itinerary: four days, Plan A/B toggle and rain prompt', async ({ page }) => {
  await page.goto('/#itinerary');
  await expect(page.locator('.day-tabs button')).toHaveCount(4);
  const planATitles = await page.locator('.timeline h3').allTextContents();
  // Each card exposes the required details
  const first = page.locator('.act').nth(1);
  await expect(first.locator('.act-time')).not.toBeEmpty();
  await expect(first.locator('.pill').first()).toHaveText(/Must Do|Optional|Rainy Day Alternative/);
  await expect(first.getByRole('link', { name: 'Directions' })).toHaveAttribute('href', /google\.com\/maps/);

  await page.locator('[data-day="3"]').click();
  await expect(page.locator('.day-hero h3')).toContainText('Explore North Georgia');
  await expect(page.locator('#itinerary .alert.rain')).toContainText('85%');

  await page.locator('#itinerary .alert.rain [data-plan="B"]').click();
  await expect(page.locator('.alert.planb')).toBeVisible();
  await expect(page.locator('.pill-rain').first()).toBeVisible();
  for (const d of [1, 2, 3, 4]) {
    await page.locator(`[data-day="${d}"]`).click();
    expect(await page.locator('.timeline .act').count()).toBeGreaterThan(4);
  }
  await page.locator('[data-day="1"]').click();
  expect(await page.locator('.timeline h3').allTextContents()).not.toEqual(planATitles);

  await page.reload();
  await expect(page.locator('.plan-toggle [data-plan="B"]')).toHaveAttribute('aria-checked', 'true');
});

test('favorites: save, filter, add to a day, persist after reload', async ({ page }) => {
  await page.goto('/#breweries');
  await page.locator('.card[data-id="grumpy-old-men"] .heart').click();
  await expect(page.locator('#favCount')).toHaveText('1');
  await page.goto('/#explore');
  await page.locator('.card[data-id="fall-branch-falls"] .heart').click();
  await expect(page.locator('#favCount')).toHaveText('2');

  await page.locator('#favBtn').click();
  await expect(page.locator('.fav-list li')).toHaveCount(2);
  await page.locator('#favFilters [data-k="brewery"]').click();
  await expect(page.locator('.fav-list li')).toHaveCount(1);
  await page.locator('.fav-list [data-add="grumpy-old-men"]').click();
  await page.locator('#addDay').selectOption('2');
  await page.locator('#addTime').fill('4:00 PM');
  await page.locator('#addOk').click();

  await page.goto('/#itinerary');
  await page.reload();
  await page.locator('[data-day="2"]').click();
  await expect(page.locator('.added-h')).toBeVisible();
  await expect(page.locator('.timeline').last()).toContainText('Grumpy Old Men Brewing');
  await expect(page.locator('.timeline').last()).toContainText('4:00 PM');
  await expect(page.locator('#favCount')).toHaveText('2');

  await page.locator('[data-remove="2:0"]').click();
  await expect(page.locator('.added-h')).toHaveCount(0);
});

test('explore, eat and events filters', async ({ page }) => {
  await page.goto('/#explore');
  await page.locator('#exploreChips [data-k="waterfalls"]').click();
  const names = await page.locator('#explore .card h3').allTextContents();
  expect(names.length).toBeGreaterThan(3);
  expect(names.join()).toContain('Falls');
  await expect(page.locator('.drive')).toHaveCount(5);

  await page.goto('/#eat');
  await expect(page.locator('.dm').first()).toBeVisible();
  await page.locator('#eatChips [data-k="bbq"]').click();
  await expect(page.locator('#eat .card h3')).toContainText(['Mike’s Trackside BBQ']);

  await page.goto('/#events');
  await expect(page.locator('.status.ok').first()).toBeVisible();
  await expect(page.locator('.card.event.is-verify').first()).toBeVisible();
  await page.locator('#eventChips [data-k="2026-10-09"]').click();
  await expect(page.locator('#events .card h3')).toContainText(['Haunted Blue Ridge Ghost Tour — October Special']);
});

test('map: markers, category toggle and popup', async ({ page }) => {
  await page.goto('/#map');
  await page.waitForFunction(() => document.querySelectorAll('.leaflet-marker-icon').length > 20);
  const before = await page.locator('.leaflet-marker-icon').count();
  await page.locator('#mapChips [data-k="brewery"]').click();
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(before - 5);
  await page.locator('.leaflet-marker-icon[title="Harvest on Main"]').dispatchEvent('click');
  await expect(page.locator('.leaflet-popup .pop')).toContainText('Directions');
});

test('trip info: packing checklist persists; home base stays local', async ({ page }) => {
  await page.goto('/#info');
  const box = page.locator('[data-pack="Daypack (15–25 L)"]');
  await box.check();
  await page.reload();
  await expect(page.locator('[data-pack="Daypack (15–25 L)"]')).toBeChecked();
  await expect(page.locator('.tip')).toHaveCount(10);

  await page.fill('#homeForm [name=name]', 'Test Cabin');
  await page.fill('#homeForm [name=lat]', '34.85');
  await page.fill('#homeForm [name=lng]', '-84.30');
  await page.locator('#homeForm button[type=submit]').click();
  await page.goto('/#map');
  await page.waitForFunction(() => document.querySelectorAll('.leaflet-marker-icon').length > 20);
  await expect(page.locator('.leaflet-marker-icon[title="Test Cabin"]')).toHaveCount(1);
});

test('weather falls back to October normals when the API is down', async ({ page }) => {
  await page.unroute('**/api.open-meteo.com/**');
  await page.route('**/api.open-meteo.com/**', r => r.abort());
  await page.goto('/');
  await expect(page.locator('.dash .wx-normals')).toContainText('Typical Oct weather');
});

test('broken images fall back to a styled placeholder', async ({ page }) => {
  await page.route('**/img/fallbranch.webp', r => r.fulfill({ status: 404, body: '' }));
  await page.goto('/#explore');
  await expect(page.locator('.card[data-id="fall-branch-falls"] .ph')).toHaveClass(/ph-fail/);
});

test('itinerary check-off: done/skip collapse, progress counts, persistence', async ({ page }) => {
  await page.goto('/#itinerary');
  await page.locator('[data-day="2"]').click();
  const total = await page.locator('.timeline .act').count();
  await expect(page.locator('.day-progress h4')).toHaveText(`Day 2 — 0 of ${total} activities completed`);
  await expect(page.locator('.act.is-next')).toHaveCount(1);

  // Mark the first two done and skip the third
  const acts = page.locator('.timeline .act');
  await acts.nth(0).locator('[data-status="done"]').click();
  await acts.nth(1).locator('[data-status="done"]').click();
  await acts.nth(2).locator('[data-status="skip"]').click();

  await expect(page.locator('.day-progress h4')).toHaveText(`Day 2 — 2 of ${total - 1} activities completed`);
  await expect(page.locator('.dp-meta')).toContainText(`${total - 3} remaining · 1 skipped`);
  await expect(page.locator('[data-day="2"] .tab-prog')).toHaveText(`2/${total - 1}`);

  // Done items collapse (photo/description hidden) and fade; details can be expanded
  const doneCard = page.locator('.act.is-done').first();
  await expect(doneCard.locator('.act-ph')).toBeHidden();
  await expect(doneCard.locator('.act-summary')).toBeVisible();
  await doneCard.locator('[data-expand]').click();
  await expect(doneCard.locator('.facts')).toBeVisible();
  // "Up next" moves to the first remaining item
  await expect(page.locator('.act.is-next')).toHaveClass(/is-upcoming/);

  // Persists after reload and is shown on the dashboard
  await page.reload();
  await expect(page.locator('.act.is-done')).toHaveCount(2);
  await expect(page.locator('.act.is-skip')).toHaveCount(1);

  // Hide done & skipped
  await page.locator('#hideClosed').check();
  await expect(page.locator('.timeline .act')).toHaveCount(total - 3);
  await page.locator('#hideClosed').uncheck();

  // Undo one, then plan B tracks separately
  await page.locator('.act.is-skip [data-status="upcoming"]').click();
  await expect(page.locator('.act.is-skip')).toHaveCount(0);
  await page.locator('.plan-toggle [data-plan="B"]').click();
  await expect(page.locator('.day-progress h4')).toContainText('Day 2 — 0 of');
  await page.locator('.plan-toggle [data-plan="A"]').click();

  // Reset day clears everything
  await page.locator('[data-reset-day]').click();
  await expect(page.locator('.act.is-done')).toHaveCount(0);
  await expect(page.locator('.day-progress h4')).toHaveText(`Day 2 — 0 of ${total} activities completed`);
});

test('dashboard shows day progress', async ({ page }) => {
  await page.goto('/#itinerary');
  await page.locator('[data-day="1"]').click();
  await page.locator('.timeline .act').first().locator('[data-status="done"]').click();
  await page.goto('/#home');
  await expect(page.locator('.mini-prog')).toContainText('1 of');
  await expect(page.locator('.mini-tl li.is-done')).toHaveCount(1);
});

test.describe('what\'s nearby', () => {
  // Standing on Ocoee St in Copperhill, TN
  test.use({ geolocation: { latitude: 34.9890, longitude: -84.3720 }, permissions: ['geolocation'] });

  test('sorts by distance from current location, with filters', async ({ page }) => {
    await page.goto('/');
    await page.locator('.near-btn').click();
    await expect(page).toHaveURL(/#nearby$/);
    await page.locator('#nearLocate').click();
    await expect(page.locator('.near-count')).toContainText('your current location');

    // Copperhill's two breweries are across the street — they must be the closest results
    const first2 = await page.locator('.near-row h3').evaluateAll(els => els.slice(0, 3).map(e => e.textContent));
    expect(first2.join()).toMatch(/Copperhill Brewery|Buck Bald/);

    // Distances are ascending
    const d = await page.locator('.near-dist').evaluateAll(els => els.map(e => parseFloat(e.textContent.replace('<', '')) || 0));
    expect(d).toEqual([...d].sort((a, b) => a - b));

    await page.locator('#nearCats [data-k="brewery"]').click();
    const names = await page.locator('.near-row h3').allTextContents();
    expect(names.length).toBe(5);
    expect(names.slice(0, 2).sort()).toEqual(['Buck Bald Brewing', 'Copperhill Brewery (Riverside Taproom)']);

    // A walkable result gets walking directions from the current location
    const go = page.locator('.near-row').first().getByRole('link', { name: 'Go' });
    await expect(go).toHaveAttribute('href', /origin=34\.989,-84\.372.*travelmode=walking/);

    // Radius filter
    await page.locator('#nearRadius [data-k="5"]').click();
    await expect(page.locator('.near-row')).toHaveCount(2);
    await page.locator('#nearCats [data-k="food"]').click();
    await expect(page.locator('.near-count')).toContainText('Nothing within 5 mi');
    await page.locator('[data-near-radius="any"]').click();
    expect(await page.locator('.near-row').count()).toBeGreaterThan(10);
  });

  test('can start from a chosen place without GPS', async ({ page }) => {
    await page.goto('/#nearby');
    await page.locator('#nearOrigin').selectOption('town');
    await expect(page.locator('.near-count')).toContainText('Downtown Blue Ridge');
    await page.locator('#nearCats [data-k="event"]').click();
    expect(await page.locator('.near-row').count()).toBeGreaterThan(0);
    await page.locator('#nearCats [data-k="attraction"]').click();
    await expect(page.locator('.near-row').first()).toBeVisible();
    // Save from the list updates favorites
    await page.locator('.near-row .heart-sm').first().click();
    await expect(page.locator('#favCount')).toHaveText('1');
  });

  test('is linked from the itinerary progress panel', async ({ page }) => {
    await page.goto('/#itinerary');
    await page.locator('.near-link').click();
    await expect(page.locator('section[data-view="nearby"]')).toBeVisible();
  });
});

test.describe('what\'s nearby without permission', () => {
  test.use({ permissions: [] });
  test('explains denied location and offers a fallback', async ({ page, context }) => {
    await context.clearPermissions();
    await page.addInitScript(() => {
      navigator.geolocation.getCurrentPosition = (_ok, fail) => fail({ code: 1, message: 'denied' });
    });
    await page.goto('/#nearby');
    await page.locator('#nearLocate').click();
    await expect(page.locator('.near-msg.warn')).toContainText('permission was denied');
    await expect(page.locator('#nearOrigin')).toBeVisible();
  });
});

test.describe('trip pulse', () => {
  const at = iso => new Date(iso);
  const cabin = () => localStorage.setItem('brt:home', JSON.stringify({ name: 'Test Cabin', lat: 34.83, lng: -84.28 }));

  test('before the trip it is a countdown', async ({ page }) => {
    await page.clock.install({ time: at('2026-10-05T12:00:00-04:00') });
    await page.goto('/');
    await expect(page.locator('#countdown > div')).toHaveCount(4);
    await expect(page.locator('.pulse')).toHaveCount(0);
    await expect(page.locator('.hero-cta')).toBeVisible();
  });

  test('during the trip it becomes the command center', async ({ page }) => {
    await page.addInitScript(cabin);
    await page.clock.install({ time: at('2026-10-09T09:40:00-04:00') });
    await page.goto('/');
    const pulse = page.locator('.pulse');
    await expect(pulse.locator('.pulse-eyebrow')).toHaveText(/Day 2 — Friday/i);
    await expect(pulse.locator('.pulse-wx')).toContainText('61°F · Overcast');
    await expect(pulse.locator('.pulse-next')).toContainText('Now');
    await expect(pulse.locator('.pulse-next')).toContainText('Hike Fall Branch Falls');
    await expect(pulse).toContainText('drive from cabin');
    await expect(pulse).toContainText('Then: Toccoa River Swinging Bridge · 10:30 AM');
    await expect(pulse.getByRole('link', { name: 'Directions' })).toHaveAttribute('href', /google\.com\/maps/);
    await expect(page.locator('.hero-cta')).toBeHidden();

    // Checking off the current activity advances the pulse
    await page.goto('/#itinerary');
    await page.locator('[data-day="2"]').click();
    await page.locator('.act', { hasText: 'Hike Fall Branch Falls' }).locator('[data-status="done"]').click();
    await page.goto('/#home');
    await expect(pulse.locator('.pulse-next')).toContainText('Next');
    await expect(pulse.locator('.pulse-next')).toContainText('Toccoa River Swinging Bridge');
    await expect(pulse).toContainText('10:30 AM · in 50 min');
    await expect(pulse.locator('.pulse-prog')).toContainText('1 of 8 done');
  });

  test('suggests Plan B on a rainy day and wraps up at night', async ({ page }) => {
    await page.clock.install({ time: at('2026-10-10T07:00:00-04:00') });
    await page.goto('/');
    await expect(page.locator('.pulse-alert')).toContainText('switch to Plan B');
    await expect(page.locator('.pulse-next')).toContainText('Breakfast: Royal Waffle King');
    await expect(page.locator('.pulse')).toContainText('in 30 min');

    await page.clock.setFixedTime(at('2026-10-10T23:30:00-04:00'));
    await page.reload();
    await expect(page.locator('.pulse-next')).toContainText('That’s a wrap');
    await expect(page.locator('.pulse')).toContainText('Tomorrow: Relax & Favorites');
  });

  test('after the trip shows a recap', async ({ page }) => {
    await page.clock.install({ time: at('2026-10-12T10:00:00-04:00') });
    await page.goto('/');
    await expect(page.locator('.pulse')).toContainText('Trip complete');
  });

  test('?now= previews the command center before the trip', async ({ page }) => {
    await page.goto('/?now=2026-10-11T18:10');
    await expect(page.locator('.pulse-eyebrow')).toHaveText(/Day 4 — Sunday/i);
    await expect(page.locator('.pulse-next')).toContainText('Sunset drinks on The Lookout rooftop');
  });
});
