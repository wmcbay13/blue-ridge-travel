// Scenic drives. `path` is a rough polyline of waypoints for the mini route map
// (not turn-by-turn). `gmaps` opens the full route in Google Maps.

const gm = (...stops) =>
  'https://www.google.com/maps/dir/' + stops.map(s => encodeURIComponent(s)).join('/');

export const DRIVES = [
  {
    id: 'russell', name: 'Brasstown Bald & Russell Scenic Highway Loop', img: 'brasstown',
    route: 'Blue Ridge → US-76 → Blairsville → GA-180 → Brasstown Bald → GA-348 (Russell Scenic Hwy) → Helen → GA-75/US-129 → Vogel → Blue Ridge',
    miles: '~140 mi loop', time: '3.5–4 hr driving (full day with stops)', day: 'Day 3 (Plan A)',
    stops: ['Blairsville (Sorghum Festival)', 'Brasstown Bald — 4,784 ft summit', 'Helton Creek Falls', 'Hogpen Gap AT overlook', 'Alpine Helen', 'Anna Ruby Falls', 'Vogel State Park'],
    food: 'Lunch in Helen; Oktoberfest Festhalle',
    note: 'Steep, curvy two-lane mountain roads. Fill up in Blairsville; cell service drops between Brasstown and Helen.',
    path: [[34.864, -84.324], [34.876, -83.958], [34.874, -83.811], [34.80, -83.80], [34.752, -83.896], [34.73, -83.80], [34.70, -83.729], [34.764, -83.712], [34.70, -83.729], [34.763, -83.928], [34.876, -83.958], [34.864, -84.324]],
    gmaps: gm('Blue Ridge, GA', 'Brasstown Bald, GA', 'Richard B. Russell Scenic Highway, GA', 'Helen, GA', 'Vogel State Park, GA', 'Blue Ridge, GA'),
  },
  {
    id: 'aska', name: 'Aska Road & Lake Blue Ridge Loop', img: 'lake',
    route: 'Downtown → Aska Rd (Old 76) → Iron Bridge → Shallowford Bridge → Dial Rd / GA-60 → Morganton → Lake Blue Ridge → Downtown',
    miles: '~40 mi', time: '1.5 hr driving', day: 'Day 2',
    stops: ['Aska Trails / Deep Gap', 'Iron Bridge General Store', 'Fall Branch Falls (Stanley Creek Rd)', 'Toccoa River at Shallowford Bridge', 'Swinging Bridge (FS 816)', 'Morganton Point on Lake Blue Ridge'],
    food: 'Iron Bridge Café; picnic at the lake',
    note: 'Aska Road is narrow and winding with cyclists — take it slow. Forest roads are gravel.',
    path: [[34.864, -84.324], [34.8197, -84.2827], [34.7836, -84.259], [34.786, -84.3056], [34.7836, -84.259], [34.737, -84.167], [34.80, -84.20], [34.8687, -84.2489], [34.864, -84.324]],
    gmaps: gm('Blue Ridge, GA', 'Iron Bridge General Store, Aska Rd, Blue Ridge, GA', 'Toccoa River Swinging Bridge, GA', 'Morganton Point Recreation Area, GA', 'Blue Ridge, GA'),
  },
  {
    id: 'ocoee', name: 'Ocoee Scenic Byway (US-64)', img: 'ocoee',
    route: 'Blue Ridge → GA-5 → McCaysville/Copperhill → US-64 West through the Ocoee Gorge → Ocoee Whitewater Center → Ocoee Lake → return',
    miles: '~75 mi round trip', time: '2 hr driving', day: 'Any day',
    stops: ['McCaysville/Copperhill state line', 'Ducktown Basin', 'Ocoee Whitewater Center (1996 Olympic venue)', 'Ocoee Dam #2', 'Lake Ocoee overlooks'],
    food: 'Copperhill Brewery & Buck Bald Brewing on the way back',
    note: 'Tennessee’s first National Forest Scenic Byway. US-64 follows the river through a narrow gorge — watch for raft buses.',
    path: [[34.864, -84.324], [34.9138, -84.2787], [34.986, -84.371], [35.03, -84.40], [35.0682, -84.4565], [35.10, -84.53], [35.0682, -84.4565], [34.986, -84.371], [34.864, -84.324]],
    gmaps: gm('Blue Ridge, GA', 'Copperhill, TN', 'Ocoee Whitewater Center, TN', 'Ocoee Dam No. 2, TN'),
  },
  {
    id: 'suches', name: 'GA-60 to Suches & the Appalachian Trail', img: 'at',
    route: 'Blue Ridge → Morganton → GA-60 South → Cooper Creek → Suches → Woody Gap (AT crossing) → return',
    miles: '~70 mi round trip', time: '2 hr driving', day: 'Any day',
    stops: ['Toccoa River swinging-bridge trailhead (GA-60)', 'Cooper Creek Scenic Area', 'Suches — “the valley above the clouds”', 'Woody Gap overlook on the AT', 'Lake Winfield Scott (optional)'],
    food: 'Pack a picnic — services are sparse',
    note: 'One of the region’s most famous motorcycle roads: tight switchbacks, few guardrails.',
    path: [[34.864, -84.324], [34.8687, -84.2489], [34.80, -84.17], [34.763, -84.067], [34.689, -84.022], [34.677, -83.999], [34.689, -84.022], [34.864, -84.324]],
    gmaps: gm('Blue Ridge, GA', 'Cooper Creek Recreation Area, GA', 'Suches, GA', 'Woody Gap, GA'),
  },
  {
    id: 'ellijay', name: 'Ellijay Apple Country', img: 'orchard',
    route: 'Blue Ridge → GA-515 South → Cherry Log → Ellijay → GA-52 East (orchard row) → Cartecay Vineyards → return',
    miles: '~65 mi round trip', time: '1.5 hr driving', day: 'Day 3 (Plan B) / Day 4 alt',
    stops: ['Expedition Bigfoot (Cherry Log)', 'Downtown Ellijay square', 'Georgia Apple Festival fairgrounds', 'Hillcrest Orchards & the GA-52 apple stands', 'Cartecay Vineyards', 'Chateau Meichtry'],
    food: 'Apple stands, festival food, winery tastings',
    note: 'GA-52 east of Ellijay is lined with family orchards and roadside apple houses in October.',
    path: [[34.864, -84.324], [34.802, -84.376], [34.695, -84.483], [34.674, -84.484], [34.619, -84.374], [34.615, -84.390], [34.588, -84.434], [34.695, -84.483], [34.864, -84.324]],
    gmaps: gm('Blue Ridge, GA', 'Ellijay, GA', 'Hillcrest Orchards, Ellijay, GA', 'Cartecay Vineyards, Ellijay, GA', 'Blue Ridge, GA'),
  },
];
