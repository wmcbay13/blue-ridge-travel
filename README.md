# Blue Ridge Mountain Getaway

Personal trip hub for a Blue Ridge, Georgia getaway: **October 8–11, 2026**.

A static, mobile-first site with no build step. It covers:

- **Trip Pulse** in the hero: a countdown before the trip that automatically becomes a live command center during it (day, weather, what's happening now or next with time-until and drive time from the cabin, the day's progress, and quick links), then a recap afterward. Preview it any time with `?now=2026-10-09T09:40` (Eastern time).
- **Home dashboard**: countdown, live trip forecast (Open-Meteo), today's plan, reservations to make, saved places and quick links
- **4-day itinerary** with **Plan A** (mountain days) and **Plan B** (a full rainy-weather version with indoor and covered alternatives). When the forecast shows a ≥ 60% chance of rain, the site suggests Plan B.
- **Check-off**: mark each activity **Upcoming**, **Done** or **Skip**. Done and skipped items fade and collapse, and each day shows progress such as “Day 2 — 3 of 6 activities completed”, plus what's left and what's up next. Plan A and Plan B are tracked separately.
- **What's nearby?** sorts food, breweries, attractions and still-upcoming events by distance from your current location (or a place you pick), with category and radius filters, walk/drive estimates and one-tap directions. Location is used in memory only and never saved.
- **Cabin time**: add downtime (reading, board games, trout fishing on the Toccoa, hot tub, campfire and more) or a home-cooked cabin meal to any day. Any restaurant stop can be swapped with **Cook at cabin instead**. Added items drop into the day in time order, and a **cabin grocery list** builds itself on the Trip Info page (copy it to text the shopper).
- **Explore** includes an **Ellijay Gems** filter: BJ Reece Orchards & Farm Market, Panorama and R&A Orchards, Reece’s Cider Co., Tumbling Waters Nature Trail, downtown Ellijay (Mountain Treasures’ hidden tasting room, The Roof), Cartecay River Brewing and the Pink Pig in Cherry Log.
- **Explore** (hikes, waterfalls, orchards, rainy-day picks) and **Scenic Drives** with route maps
- **Eat & Drink**, the **Brewery Trail**, and **Local Events** for Oct 8–11 (each marked Confirmed or Verify Before Trip)
- An interactive **trip map** (Leaflet + OpenStreetMap), **weather & packing**, and **trip tips**
- **Favorites & planner**: save any card and add it to a day

Favorites, itinerary additions, check-off progress, the packing checklist and the optional **home base** (cabin location) are stored in your browser's `localStorage`. They are never committed to this public repo.

## Run locally

```sh
python3 -m http.server 8765   # then open http://localhost:8765
```

## Tests

```sh
npm install
npx playwright install chromium            # or point at a system browser:
CHROMIUM_PATH=/usr/bin/chromium npm test
```

## Data

All content lives in `data/*.js`. Information was researched on Oct 4, 2026 from official sites where possible. Anything not confirmed carries a `verify` note and shows a **Verify Before Trip** pill. Photos come from Wikimedia Commons and are credited in `data/credits.json` and on the Trip Info page.

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`. To turn it on, go to **Settings → Pages → Source: GitHub Actions**.
