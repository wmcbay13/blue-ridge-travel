// Downtime and home-cooked cabin meals that can be added to any day.
// `atCabin` items take their location from the device-local home base (never committed).

export const DOWNTIME = [
  {
    id: 'dt-sunrise', name: 'Sunrise coffee on the deck', time: '7:30 AM', duration: '45 min', img: 'hero', tags: ['relaxing', 'scenic'],
    desc: 'Watch the fog lift off the ridges. Sunrise is ~7:37 AM during the trip — bring a blanket, mornings are in the 40s–50s.',
    bring: ['Coffee or cocoa', 'Blanket'],
  },
  {
    id: 'dt-reading', name: 'Reading on the porch', time: '2:00 PM', duration: '1–2 hr', img: 'cabin', tags: ['relaxing', 'rainy'],
    desc: 'A slow afternoon with a book, a hammock or rocking chair, and nowhere to be. Works on a covered porch in light rain.',
    bring: ['Books / e-reader', 'Hot cider or a growler from town'],
  },
  {
    id: 'dt-games', name: 'Board games & cards', time: '8:00 PM', duration: '1–2 hr', img: 'cabin', tags: ['relaxing', 'rainy'],
    desc: 'Cabin game night by the fire. Good rainy-day filler at any hour.',
    bring: ['Board games', 'Deck of cards', 'Snacks'],
  },
  {
    id: 'dt-fishing', name: 'Trout fishing on the Toccoa tailwater', time: '4:00 PM', duration: '2–3 hr', img: 'toccoa', tags: ['outdoor', 'relaxing'],
    atCabin: false, lat: 34.8850, lng: -84.2850, addr: 'Tammen Park, Blue Ridge, GA', drive: 8,
    desc: 'Wade or cast for stocked and holdover trout at Tammen Park, just below Blue Ridge Dam (Curtis Switch and Horseshoe Bend are other public access points). Or fish your cabin’s pond/creek if it has one.',
    bring: ['Georgia fishing license + trout license (ages 16+)', 'Rod & small spinners / flies', 'Waders or water shoes'],
    cost: 'Non-resident: $10 1-day fishing + $10 1-day trout license (GA DNR)',
    url: 'https://georgiawildlife.com/licenses-permits-passes',
    verify: 'TVA dam releases raise the river fast — check the Blue Ridge Dam generation schedule and only wade when generators are off',
  },
  {
    id: 'dt-hottub', name: 'Hot tub & stargazing', time: '9:30 PM', duration: '1 hr', img: 'springer', tags: ['relaxing'],
    desc: 'If the cabin has a hot tub, this is the move after a hiking day. Away from town lights the Milky Way can be visible on clear nights.',
    bring: ['Swimsuit', 'Towels', 'Stargazing app'],
  },
  {
    id: 'dt-nap', name: 'Hammock time / afternoon nap', time: '3:00 PM', duration: '1 hr', img: 'fall1', tags: ['relaxing'],
    desc: 'Recharge between the morning hike and dinner. No guilt allowed.',
    bring: ['Hammock (if the cabin doesn’t have one)'],
  },
  {
    id: 'dt-puzzle', name: 'Puzzle & playlist', time: '1:00 PM', duration: '1–2 hr', img: 'cabin', tags: ['relaxing', 'rainy'],
    desc: 'A 1,000-piece puzzle, a speaker and the rain on the roof.',
    bring: ['Jigsaw puzzle', 'Bluetooth speaker'],
  },
  {
    id: 'dt-movie', name: 'Cabin movie night', time: '8:30 PM', duration: '2 hr', img: 'campfire', tags: ['relaxing', 'rainy'],
    desc: 'Popcorn, blankets and something spooky for October — or the Swan Drive-In if it’s showing.',
    bring: ['Popcorn', 'Streaming login'],
  },
  {
    id: 'dt-campfire', name: 'Campfire & s’mores', time: '9:00 PM', duration: '1–2 hr', img: 'campfire', tags: ['relaxing'],
    desc: 'Fire pit, stories and s’mores. Check local burn restrictions and fully drown the fire before bed.',
    bring: ['Firewood (buy local — don’t move firewood)', 'S’mores kit', 'Lighter'],
  },
  {
    id: 'dt-journal', name: 'Trip journal & photo sort', time: '5:00 PM', duration: '45 min', img: 'downtown2', tags: ['relaxing', 'rainy'],
    desc: 'Pick the day’s best photos and jot down favorites while they’re fresh.',
    bring: ['Notebook', 'Phone charger'],
  },
].map(d => ({ atCabin: true, cat: 'cabin', kind: 'downtime', cost: 'Free', ...d }));

export const CABIN_MEALS = [
  {
    id: 'cm-pancakes', name: 'Cabin pancake breakfast', meal: 'breakfast', time: '8:00 AM', duration: '1 hr', prep: '30 min', img: 'pancakes',
    desc: 'Pancakes, bacon and eggs with Mercier apple butter and cider.',
    groceries: ['Pancake mix', 'Eggs', 'Bacon', 'Butter', 'Maple syrup', 'Mercier apple butter', 'Apple cider', 'Coffee'],
  },
  {
    id: 'cm-biscuits', name: 'Biscuits & sausage gravy', meal: 'breakfast', time: '8:30 AM', duration: '1 hr', prep: '35 min', img: 'grits',
    desc: 'A Southern cabin breakfast before a big day — or a lazy Sunday.',
    groceries: ['Canned / frozen biscuits', 'Breakfast sausage', 'Flour', 'Milk', 'Black pepper', 'Eggs', 'Coffee'],
  },
  {
    id: 'cm-trail-lunch', name: 'Packed trail lunch', meal: 'lunch', time: '12:00 PM', duration: '30 min', prep: '15 min', img: 'bmt',
    desc: 'Make sandwiches in the morning and eat at a waterfall or overlook — saves time on a hiking day.',
    groceries: ['Bread or wraps', 'Deli meat & cheese', 'Apples', 'Trail mix', 'Chips', 'Water bottles'],
  },
  {
    id: 'cm-board', name: 'Porch charcuterie & cider', meal: 'lunch', time: '1:00 PM', duration: '1 hr', prep: '15 min', img: 'dessert',
    desc: 'Cheese, salami, crackers, local apples and a growler or hard cider from town. Doubles as a pre-dinner snack.',
    groceries: ['2–3 cheeses', 'Salami', 'Crackers', 'Local apples', 'Mercier hard cider or a local growler', 'Grapes', 'Nuts'],
  },
  {
    id: 'cm-chili', name: 'Big pot of chili', meal: 'dinner', time: '6:30 PM', duration: '1.5 hr', prep: '20 min + simmer', img: 'bbq',
    desc: 'Start it before an afternoon nap; perfect for a cool, rainy mountain night. Leftovers become lunch.',
    groceries: ['Ground beef', 'Kidney & black beans', 'Diced tomatoes', 'Onion', 'Chili seasoning', 'Shredded cheese', 'Sour cream', 'Cornbread mix'],
  },
  {
    id: 'cm-grill', name: 'Grill night: burgers or steaks', meal: 'dinner', time: '6:30 PM', duration: '1.5 hr', prep: '30 min', img: 'burger',
    desc: 'Fire up the cabin grill. Grab steaks or burger patties and corn on the way back from the day’s adventure.',
    groceries: ['Burger patties or steaks', 'Buns', 'Cheese slices', 'Corn on the cob', 'Salad kit', 'Condiments', 'Charcoal / propane (check cabin)'],
  },
  {
    id: 'cm-foil', name: 'Campfire foil-packet dinner', meal: 'dinner', time: '7:00 PM', duration: '1.5 hr', prep: '20 min', img: 'campfire',
    desc: 'Sausage, potatoes, peppers and onions wrapped in foil and cooked on the coals. Dinner and the campfire in one.',
    groceries: ['Smoked sausage', 'Baby potatoes', 'Bell peppers', 'Onion', 'Olive oil', 'Cajun seasoning', 'Heavy-duty foil', 'S’mores kit'],
  },
  {
    id: 'cm-pasta', name: 'Pasta night', meal: 'dinner', time: '7:00 PM', duration: '1 hr', prep: '25 min', img: 'pizza',
    desc: 'Easy one-pot pasta with garlic bread and a bottle from Cartecay or Chateau Meichtry.',
    groceries: ['Pasta', 'Jarred marinara', 'Italian sausage or meatballs', 'Parmesan', 'Garlic bread', 'Salad kit', 'Local wine'],
  },
  {
    id: 'cm-pizza', name: 'Homemade pizza night', meal: 'dinner', time: '7:00 PM', duration: '1 hr', prep: '30 min', img: 'pizza',
    desc: 'Store-bought dough, everyone builds their own. Easy after a long Day 3 drive.',
    groceries: ['Pizza dough (x2)', 'Pizza sauce', 'Mozzarella', 'Pepperoni', 'Veggie toppings', 'Cornmeal'],
  },
  {
    id: 'cm-trout', name: 'Cook your catch: pan-fried trout', meal: 'dinner', time: '7:00 PM', duration: '1 hr', prep: '30 min', img: 'toccoa',
    desc: 'If the Toccoa cooperated, pan-fry trout in butter with lemon. (Keep only what regulations allow — or buy local trout.)',
    groceries: ['Butter', 'Lemons', 'Cornmeal or flour', 'Rice or potatoes', 'Green beans', 'Backup: trout fillets from the store'],
  },
  {
    id: 'cm-dessert', name: 'Fried-pie & s’mores dessert', meal: 'snack', time: '9:00 PM', duration: '30 min', prep: '5 min', img: 'dessert',
    desc: 'Warm up Mercier fried pies, add vanilla ice cream — or go classic s’mores by the fire.',
    groceries: ['Mercier fried pies', 'Vanilla ice cream', 'S’mores kit'],
  },
].map(m => ({ atCabin: true, cat: 'cabin', kind: 'meal', cost: 'Groceries', tags: ['food', 'relaxing'], ...m }));

export const MEAL_TYPES = [['all', 'All meals'], ['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snack', 'Dessert & snacks']];

// Guess which meal a restaurant stop is, from its time (minutes since midnight)
export const mealForMinutes = m => (m == null ? 'all' : m < 10 * 60 + 30 ? 'breakfast' : m < 15 * 60 ? 'lunch' : 'dinner');
