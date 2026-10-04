// Weather normals, packing list, practical tips and the brewery trail.

export const WEATHER_NORMALS = {
  high: '66–72°F', low: '42–48°F', rain: '~3.5 in. for the month — expect 1 rainy day in 4',
  sunrise: '~7:37 AM', sunset: '~7:07–7:11 PM',
  summary: 'Crisp mornings, warm sunny afternoons, cold clear nights. Ridgetops (Brasstown Bald, 4,784 ft) run 10–15°F cooler and windy. Early October color starts at high elevations; lower valleys peak mid–late October.',
};

export const PACKING = [
  { group: 'Hiking gear', items: ['Broken-in hiking shoes or trail runners', 'Daypack (15–25 L)', 'Water bottles / hydration bladder', 'Trail snacks', 'Headlamp', 'Small first-aid kit & blister care', 'Downloaded offline maps', 'Trekking poles (optional)'] },
  { group: 'Layers', items: ['Base layer tops', 'Fleece or light puffy', 'Flannel', 'Warm hat & light gloves (for mornings & summit)', 'Wool socks'] },
  { group: 'Rain gear', items: ['Waterproof rain jacket', 'Packable umbrella', 'Spare socks', 'Dry bag / zip bags for phones'] },
  { group: 'Casual & evening clothes', items: ['Jeans / comfy pants', 'T-shirts', 'Nice-casual outfit for Black Sheep & grace', 'Cozy cabin clothes', 'Swimsuit (hot tub?)'] },
  { group: 'Shoes', items: ['Hiking shoes', 'Comfortable walking shoes for downtown', 'Slip-ons for the cabin'] },
  { group: 'Essentials', items: ['Sunglasses', 'Sunscreen', 'Bug spray', 'Portable charger + cables', 'Car phone mount', 'Cash for parking, festivals & roadside stands', 'IDs (breweries)', 'Reusable shopping bag for Mercier haul'] },
  { group: 'Campfire & cabin', items: ['S’mores kit', 'Lighter / fire starters', 'Bluetooth speaker', 'Board games / cards', 'Coffee & breakfast basics', 'Cooler for leftovers & cider', 'Blankets for the drive-in'] },
];

export const TIPS = [
  { icon: 'parking', title: 'Parking downtown', body: 'Public lots surround the depot; street spaces fill by late morning on weekends. During Fall Arts in the Park (Oct 10–11) use the free visitor lots and shuttle. Helen and Amicalola charge for parking.' },
  { icon: 'road', title: 'Mountain roads', body: 'Expect steep grades, switchbacks and slow drivers — and fast motorcycles on GA-60 and GA-348. Use lower gears downhill. Forest service roads (FS 58, FS 816, FS 42) are gravel; go slow, and skip them after very heavy rain. Watch for deer at dusk.' },
  { icon: 'signal', title: 'Cell coverage', body: 'Good in downtown Blue Ridge, Blairsville and Helen. Spotty to none on Aska Road, forest roads, the Cohutta and between Brasstown Bald and Helen. Download Google Maps offline for the region before Day 2.' },
  { icon: 'boot', title: 'Hiking safety', body: 'Start early, tell someone your route, carry water, a layer and a headlamp — sunset is ~7:10 PM. Wet rocks near waterfalls are extremely slick; stay behind railings and never climb on falls.' },
  { icon: 'bear', title: 'Wildlife awareness', body: 'Black bears are active in fall fattening up. Never leave food or trash in cars or on decks, use bear-proof cans, and give bears space. Make noise on trails. Watch for snakes on warm rocks and deer on roads.' },
  { icon: 'sun', title: 'Sunrise & sunset spots', body: 'Sunrise ~7:37 AM: Brasstown Bald (if open), any east-facing cabin deck. Sunset ~7:10 PM: The Lookout rooftop downtown, Morganton Point on Lake Blue Ridge, Springer Mountain overlook.' },
  { icon: 'leaf', title: 'Best foliage viewpoints', body: 'Early October color starts up high: Brasstown Bald summit deck, Russell Scenic Hwy overlooks (Hogpen Gap), Woody Gap on GA-60, Springer Mountain. The scenic railway along the Toccoa shows lower-valley color.' },
  { icon: 'cart', title: 'Groceries', body: 'Ingles Markets on Appalachian Hwy (GA-515) is the main full-size grocery in Blue Ridge; there are also discount grocers along GA-515. Mercier Orchards is great for baked goods, apples and cider. (Verify hours.)' },
  { icon: 'fuel', title: 'Gas', body: 'Plenty of stations along GA-515 and GA-5 in Blue Ridge, plus Blairsville and Ellijay. Fill up before Aska Road, GA-60 or the Day 3 loop — there are long stretches with no services.' },
  { icon: 'plus', title: 'Emergency info', body: 'Call 911 for any emergency. Nearest ER: Fannin Regional Hospital, 2855 Old Hwy 5, Blue Ridge (verify phone before trip). For trail emergencies, note the trail name and nearest road/landmark; texts sometimes go through when calls won’t.' },
];

export const BREWERY_TRAILS = [
  {
    name: 'Downtown Walkable Trail', time: '~3 hr', stops: ['angry-hops', 'tipping-point', 'grumpy-old-men'],
    note: 'Angry Hops and Tipping Point are a short walk apart downtown. Grumpy Old Men is ~1 mi south on E Main — rideshare/taxi or have a designated driver. Grab dinner between stops.',
  },
  {
    name: 'Two-State Hop: Copperhill, TN', time: '~3–4 hr incl. 25-min drive each way', stops: ['mercier', 'copperhill-brewery', 'buck-bald'],
    note: 'Start with a cider flight at Mercier (it’s on GA-5 heading north), then Copperhill Brewery and Buck Bald — across the street from each other. A designated driver is a must for this one.',
  },
];
