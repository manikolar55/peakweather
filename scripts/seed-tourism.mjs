/**
 * Seeds missing tourism cities and treks directly into Neon.
 * Run: node scripts/seed-tourism.mjs
 */
import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { createHash } from 'crypto'
config({ path: '.env' })

const sql = neon(process.env.DATABASE_URL)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slug(name, cc) {
  const base = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
  return `${base}-${cc.toLowerCase()}`
}

// Deterministic cuid-style ID from a string (same length, prefixed c)
function stableId(seed) {
  return 'c' + createHash('sha256').update(seed).digest('hex').slice(0, 24)
}

// ─── Missing Tourism Cities ────────────────────────────────────────────────────
// IDs start at 90000001 to avoid GeoNames conflicts (max real ID ~13.7M so we use 90M+)

const CITIES = [
  // ── Gilgit-Baltistan ─────────────────────────────────────────────────────
  { id: 90000001, name: 'Hunza',         ascii: 'Hunza',         lat: 36.3167, lon: 74.6500, pop: 25000,  admin1: 'Gilgit-Baltistan' },
  { id: 90000002, name: 'Karimabad',     ascii: 'Karimabad',     lat: 36.3194, lon: 74.6592, pop: 15000,  admin1: 'Gilgit-Baltistan' },
  { id: 90000003, name: 'Passu',         ascii: 'Passu',         lat: 36.4667, lon: 74.8653, pop: 2000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000004, name: 'Gulmit',        ascii: 'Gulmit',        lat: 36.4000, lon: 74.8083, pop: 3000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000005, name: 'Gojal',         ascii: 'Gojal',         lat: 36.7000, lon: 74.9000, pop: 8000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000006, name: 'Khunjerab',     ascii: 'Khunjerab',     lat: 36.8400, lon: 75.4300, pop: 500,    admin1: 'Gilgit-Baltistan' },
  { id: 90000007, name: 'Astore',        ascii: 'Astore',        lat: 35.3710, lon: 74.8680, pop: 8000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000008, name: 'Khaplu',        ascii: 'Khaplu',        lat: 35.1724, lon: 76.3420, pop: 15000,  admin1: 'Gilgit-Baltistan' },
  { id: 90000009, name: 'Shigar',        ascii: 'Shigar',        lat: 35.5000, lon: 75.7278, pop: 12000,  admin1: 'Gilgit-Baltistan' },
  { id: 90000010, name: 'Chilas',        ascii: 'Chilas',        lat: 35.4193, lon: 74.1012, pop: 20000,  admin1: 'Gilgit-Baltistan' },
  { id: 90000011, name: 'Tato',          ascii: 'Tato',          lat: 35.3867, lon: 74.6522, pop: 1000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000012, name: 'Minapin',       ascii: 'Minapin',       lat: 36.1400, lon: 74.6300, pop: 2000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000013, name: 'Hispar',        ascii: 'Hispar',        lat: 36.1800, lon: 74.8500, pop: 1500,   admin1: 'Gilgit-Baltistan' },
  { id: 90000014, name: 'Naltar',        ascii: 'Naltar',        lat: 36.2300, lon: 74.2500, pop: 2000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000015, name: 'Phander',       ascii: 'Phander',       lat: 36.4500, lon: 72.5833, pop: 3000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000016, name: 'Gahkuch',       ascii: 'Gahkuch',       lat: 36.1700, lon: 73.7700, pop: 5000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000017, name: 'Yasin',         ascii: 'Yasin',         lat: 36.4000, lon: 73.3000, pop: 4000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000018, name: 'Ishkoman',      ascii: 'Ishkoman',      lat: 36.5500, lon: 73.8000, pop: 3000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000019, name: 'Nilt',          ascii: 'Nilt',          lat: 36.1600, lon: 74.4600, pop: 2000,   admin1: 'Gilgit-Baltistan' },
  { id: 90000020, name: 'Chapursan',     ascii: 'Chapursan',     lat: 37.0000, lon: 74.7000, pop: 1000,   admin1: 'Gilgit-Baltistan' },
  // ── Khyber Pakhtunkhwa – Kaghan Valley ───────────────────────────────────
  { id: 90000030, name: 'Naran',         ascii: 'Naran',         lat: 34.9019, lon: 73.6510, pop: 5000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000031, name: 'Kaghan',        ascii: 'Kaghan',        lat: 34.7627, lon: 73.5974, pop: 3000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000032, name: 'Shogran',       ascii: 'Shogran',       lat: 34.5869, lon: 73.6300, pop: 2000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000033, name: 'Balakot',       ascii: 'Balakot',       lat: 34.5524, lon: 73.3491, pop: 25000,  admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000034, name: 'Batakundi',     ascii: 'Batakundi',     lat: 34.8200, lon: 73.7100, pop: 1000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000035, name: 'Lalazar',       ascii: 'Lalazar',       lat: 34.9500, lon: 73.7500, pop: 500,    admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000036, name: 'Saif ul Malook', ascii: 'Saif ul Malook', lat: 34.8819, lon: 73.6907, pop: 100, admin1: 'Khyber Pakhtunkhwa' },
  // ── Khyber Pakhtunkhwa – Swat Valley ─────────────────────────────────────
  { id: 90000040, name: 'Kalam',         ascii: 'Kalam',         lat: 35.4903, lon: 72.5825, pop: 10000,  admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000041, name: 'Malam Jabba',   ascii: 'Malam Jabba',   lat: 34.8017, lon: 72.5633, pop: 2000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000042, name: 'Bahrian',       ascii: 'Bahrian',       lat: 34.8700, lon: 72.5400, pop: 8000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000043, name: 'Madyan',        ascii: 'Madyan',        lat: 35.0500, lon: 72.5100, pop: 12000,  admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000044, name: 'Mahodand',      ascii: 'Mahodand',      lat: 35.7490, lon: 72.5350, pop: 1000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000045, name: 'Utror',         ascii: 'Utror',         lat: 35.5800, lon: 72.5000, pop: 2000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000046, name: 'Gabral',        ascii: 'Gabral',        lat: 35.5500, lon: 72.4200, pop: 2000,   admin1: 'Khyber Pakhtunkhwa' },
  // ── Khyber Pakhtunkhwa – Dir & Chitral ───────────────────────────────────
  { id: 90000050, name: 'Kumrat',        ascii: 'Kumrat',        lat: 35.3500, lon: 72.1500, pop: 3000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000051, name: 'Mastuj',        ascii: 'Mastuj',        lat: 36.2800, lon: 72.5200, pop: 5000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000052, name: 'Booni',         ascii: 'Booni',         lat: 36.3700, lon: 72.2600, pop: 5000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000053, name: 'Laspur',        ascii: 'Laspur',        lat: 36.3000, lon: 72.4000, pop: 2000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000054, name: 'Yarkhun',       ascii: 'Yarkhun',       lat: 36.6000, lon: 72.6000, pop: 1500,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000055, name: 'Bamburet',      ascii: 'Bamburet',      lat: 35.7200, lon: 71.7200, pop: 3000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000056, name: 'Rumbur',        ascii: 'Rumbur',        lat: 35.7800, lon: 71.6800, pop: 2000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000057, name: 'Drosh',         ascii: 'Drosh',         lat: 35.5700, lon: 71.7900, pop: 15000,  admin1: 'Khyber Pakhtunkhwa' },
  // ── Khyber Pakhtunkhwa – Hazara Region ───────────────────────────────────
  { id: 90000060, name: 'Nathia Gali',   ascii: 'Nathia Gali',   lat: 34.0755, lon: 73.3736, pop: 3000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000061, name: 'Ayubia',        ascii: 'Ayubia',        lat: 34.0200, lon: 73.3900, pop: 3000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000062, name: 'Thandiani',     ascii: 'Thandiani',     lat: 34.0800, lon: 73.3900, pop: 1000,   admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000063, name: 'Besham',        ascii: 'Besham',        lat: 34.9200, lon: 72.8600, pop: 15000,  admin1: 'Khyber Pakhtunkhwa' },
  { id: 90000064, name: 'Dunga Gali',    ascii: 'Dunga Gali',    lat: 33.9800, lon: 73.4200, pop: 2000,   admin1: 'Khyber Pakhtunkhwa' },
  // ── Azad Kashmir ─────────────────────────────────────────────────────────
  { id: 90000070, name: 'Neelum',        ascii: 'Neelum',        lat: 34.5900, lon: 73.8100, pop: 20000,  admin1: 'Azad Kashmir' },
  { id: 90000071, name: 'Sharda',        ascii: 'Sharda',        lat: 34.9000, lon: 74.0800, pop: 5000,   admin1: 'Azad Kashmir' },
  { id: 90000072, name: 'Keran',         ascii: 'Keran',         lat: 34.6600, lon: 73.9300, pop: 3000,   admin1: 'Azad Kashmir' },
  { id: 90000073, name: 'Taobat',        ascii: 'Taobat',        lat: 35.0700, lon: 74.0300, pop: 2000,   admin1: 'Azad Kashmir' },
  { id: 90000074, name: 'Kel',           ascii: 'Kel',           lat: 34.9500, lon: 74.0000, pop: 1000,   admin1: 'Azad Kashmir' },
  { id: 90000075, name: 'Rawalakot',     ascii: 'Rawalakot',     lat: 33.8600, lon: 73.7600, pop: 40000,  admin1: 'Azad Kashmir' },
  { id: 90000076, name: 'Bagh',          ascii: 'Bagh',          lat: 33.9800, lon: 73.7800, pop: 30000,  admin1: 'Azad Kashmir' },
  // ── Punjab tourism ────────────────────────────────────────────────────────
  { id: 90000080, name: 'Taxila',        ascii: 'Taxila',        lat: 33.7450, lon: 72.8383, pop: 50000,  admin1: 'Punjab' },
  { id: 90000081, name: 'Bhurban',       ascii: 'Bhurban',       lat: 33.9600, lon: 73.4600, pop: 5000,   admin1: 'Punjab' },
  // ── Global tourism cities ─────────────────────────────────────────────────
  { id: 90001001, name: 'Leh',           ascii: 'Leh',           lat: 34.1526, lon: 77.5771, pop: 30870,  admin1: 'Ladakh',              cc: 'IN', cn: 'India',      tz: 'Asia/Kolkata' },
  { id: 90001002, name: 'Manali',        ascii: 'Manali',        lat: 32.2396, lon: 77.1887, pop: 8096,   admin1: 'Himachal Pradesh',    cc: 'IN', cn: 'India',      tz: 'Asia/Kolkata' },
  { id: 90001003, name: 'Dharamshala',   ascii: 'Dharamshala',   lat: 32.2190, lon: 76.3234, pop: 30764,  admin1: 'Himachal Pradesh',    cc: 'IN', cn: 'India',      tz: 'Asia/Kolkata' },
  { id: 90001004, name: 'Rishikesh',     ascii: 'Rishikesh',     lat: 30.0868, lon: 78.2676, pop: 102138, admin1: 'Uttarakhand',         cc: 'IN', cn: 'India',      tz: 'Asia/Kolkata' },
  { id: 90001005, name: 'Lukla',         ascii: 'Lukla',         lat: 27.6869, lon: 86.7289, pop: 2000,   admin1: 'Koshi',               cc: 'NP', cn: 'Nepal',      tz: 'Asia/Kathmandu' },
  { id: 90001006, name: 'Namche Bazaar', ascii: 'Namche Bazaar', lat: 27.8069, lon: 86.7142, pop: 5000,   admin1: 'Koshi',               cc: 'NP', cn: 'Nepal',      tz: 'Asia/Kathmandu' },
  { id: 90001007, name: 'Pokhara',       ascii: 'Pokhara',       lat: 28.2096, lon: 83.9856, pop: 264991, admin1: 'Gandaki',             cc: 'NP', cn: 'Nepal',      tz: 'Asia/Kathmandu' },
  { id: 90001008, name: 'Srinagar',      ascii: 'Srinagar',      lat: 34.0837, lon: 74.7973, pop: 1180570, admin1: 'Jammu and Kashmir',  cc: 'IN', cn: 'India',      tz: 'Asia/Kolkata' },
  { id: 90001009, name: 'Tashkent',      ascii: 'Tashkent',      lat: 41.2995, lon: 69.2401, pop: 2309600, admin1: 'Toshkent',          cc: 'UZ', cn: 'Uzbekistan',  tz: 'Asia/Tashkent' },
  { id: 90001010, name: 'Bishkek',       ascii: 'Bishkek',       lat: 42.8700, lon: 74.5900, pop: 1074075, admin1: 'Bishkek',           cc: 'KG', cn: 'Kyrgyzstan',  tz: 'Asia/Bishkek' },
  { id: 90001011, name: 'Dushanbe',      ascii: 'Dushanbe',      lat: 38.5598, lon: 68.7733, pop: 863400,  admin1: 'Dushanbe',          cc: 'TJ', cn: 'Tajikistan',  tz: 'Asia/Dushanbe' },
  { id: 90001012, name: 'Osh',           ascii: 'Osh',           lat: 40.5283, lon: 72.7985, pop: 310800,  admin1: 'Osh',               cc: 'KG', cn: 'Kyrgyzstan',  tz: 'Asia/Bishkek' },
  { id: 90001013, name: 'Karakol',       ascii: 'Karakol',       lat: 42.4833, lon: 78.3833, pop: 79000,   admin1: 'Issyk-Kul',         cc: 'KG', cn: 'Kyrgyzstan',  tz: 'Asia/Bishkek' },
  { id: 90001014, name: 'Kashgar',       ascii: 'Kashgar',       lat: 39.4704, lon: 75.9898, pop: 506640,  admin1: 'Xinjiang',          cc: 'CN', cn: 'China',       tz: 'Asia/Urumqi' },
]

// ─── New Treks ────────────────────────────────────────────────────────────────

const TREKS = [
  // ── Pakistan – Kaghan Valley / KPK ────────────────────────────────────────
  {
    slug: 'saif-ul-malook-pk',
    name: 'Saif ul Malook Lake',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 34.8847, lon: 73.6946,
    trailheadElevation: 3200, summitElevation: 3224,
    difficulty: 'easy', durationDays: 1,
    description: 'One of Pakistan\'s most iconic high-altitude lakes nestled in the Kaghan Valley, surrounded by snow-capped peaks and accessible by jeep or a short hike.',
    popular: true,
  },
  {
    slug: 'dudipatsar-lake-pk',
    name: 'Dudipatsar Lake Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 35.0167, lon: 73.7833,
    trailheadElevation: 3400, summitElevation: 3827,
    difficulty: 'hard', durationDays: 4,
    description: 'A demanding trek to the remote "Lake of Fairies" (Dudipatsar) at 3,827m in Kaghan Valley, passing through pristine alpine meadows and high passes.',
    popular: true,
  },
  {
    slug: 'makra-peak-pk',
    name: 'Makra Peak Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 34.8500, lon: 73.6700,
    trailheadElevation: 3100, summitElevation: 3885,
    difficulty: 'hard', durationDays: 3,
    description: 'A challenging summit trek to Makra Peak (3,885m) in the Kaghan Valley, offering panoramic views of the Himalayan foothills and snow-capped ridges.',
    popular: false,
  },
  {
    slug: 'lalazar-plateau-pk',
    name: 'Lalazar Plateau',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 34.9500, lon: 73.7500,
    trailheadElevation: 3200, summitElevation: 3350,
    difficulty: 'easy', durationDays: 1,
    description: 'A beautiful alpine plateau near Naran covered in wildflowers, offering easy walks with stunning views of the Kaghan Valley.',
    popular: true,
  },
  {
    slug: 'shogran-siri-paye-pk',
    name: 'Shogran to Siri Paye',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 34.5869, lon: 73.6300,
    trailheadElevation: 2400, summitElevation: 3000,
    difficulty: 'moderate', durationDays: 2,
    description: 'A popular overnight trek from Shogran meadows up to Siri Paye, a flower-carpeted plateau with views of Musa ka Musala and Malika Parbat.',
    popular: true,
  },
  {
    slug: 'ansoo-lake-pk',
    name: 'Ansoo Lake Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 34.8730, lon: 73.7270,
    trailheadElevation: 3200, summitElevation: 4245,
    difficulty: 'hard', durationDays: 3,
    description: 'A strenuous high-altitude trek to the teardrop-shaped Ansoo Lake (4,245m) above Naran, named for its resemblance to a teardrop.',
    popular: false,
  },
  {
    slug: 'babusar-pass-pk',
    name: 'Babusar Pass Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 35.1333, lon: 73.9667,
    trailheadElevation: 3100, summitElevation: 4173,
    difficulty: 'moderate', durationDays: 2,
    description: 'A scenic high-altitude pass (4,173m) connecting Kaghan Valley to Chilas, with breathtaking views of Nanga Parbat.',
    popular: true,
  },
  // ── Pakistan – Swat Valley ─────────────────────────────────────────────────
  {
    slug: 'mahodand-lake-pk',
    name: 'Mahodand Lake Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 35.7490, lon: 72.5350,
    trailheadElevation: 2700, summitElevation: 2880,
    difficulty: 'easy', durationDays: 1,
    description: 'A stunning glacial lake surrounded by snow-capped peaks near Kalam in Swat Valley, accessible by 4WD and a short walk.',
    popular: true,
  },
  {
    slug: 'kumrat-valley-pk',
    name: 'Kumrat Valley Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 35.3500, lon: 72.1500,
    trailheadElevation: 1900, summitElevation: 2800,
    difficulty: 'moderate', durationDays: 3,
    description: 'A pristine green valley in Dir Upper district with dense forests, crystal-clear rivers, and spectacular alpine meadows — one of KPK\'s best-kept secrets.',
    popular: true,
  },
  {
    slug: 'kundol-lake-swat-pk',
    name: 'Kundol Lake Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 35.5000, lon: 72.2000,
    trailheadElevation: 2500, summitElevation: 3600,
    difficulty: 'hard', durationDays: 3,
    description: 'A challenging trek to the remote Kundol Lake in Swat near Kalam, passing through wildflower meadows and glacial streams.',
    popular: false,
  },
  {
    slug: 'malam-jabba-swat-pk',
    name: 'Malam Jabba Ski Resort Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 34.8017, lon: 72.5633,
    trailheadElevation: 2200, summitElevation: 2804,
    difficulty: 'easy', durationDays: 1,
    description: 'Pakistan\'s premier ski resort in Swat Valley offers scenic hiking trails in summer with panoramic views of the Hindu Kush.',
    popular: true,
  },
  // ── Pakistan – Chitral ─────────────────────────────────────────────────────
  {
    slug: 'tirich-mir-base-camp-pk',
    name: 'Tirich Mir Base Camp',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 36.2536, lon: 71.8431,
    trailheadElevation: 2100, summitElevation: 4700,
    difficulty: 'technical', durationDays: 8,
    description: 'A remote and demanding trek to the base of Tirich Mir (7,708m), the highest peak of the Hindu Kush range, through spectacular Chitral valleys.',
    popular: false,
  },
  {
    slug: 'shandur-pass-pk',
    name: 'Shandur Pass Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 36.0800, lon: 72.5200,
    trailheadElevation: 3500, summitElevation: 3734,
    difficulty: 'moderate', durationDays: 3,
    description: 'Trek across the "Roof of the World" Shandur Pass (3,734m), home to the world\'s highest polo ground, linking Chitral to Gilgit through stunning highland scenery.',
    popular: true,
  },
  {
    slug: 'bamburet-kalash-valley-pk',
    name: 'Bamburet Kalash Valley',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 35.7200, lon: 71.7200,
    trailheadElevation: 1900, summitElevation: 2600,
    difficulty: 'easy', durationDays: 2,
    description: 'A cultural and scenic trek through the Bamburet Valley, home to the ancient Kalash people with unique traditions, colorful dress, and festivals.',
    popular: true,
  },
  {
    slug: 'yarkhun-valley-pk',
    name: 'Yarkhun Valley Trek',
    country: 'Pakistan', region: 'Khyber Pakhtunkhwa',
    lat: 36.6000, lon: 72.6000,
    trailheadElevation: 2800, summitElevation: 3800,
    difficulty: 'moderate', durationDays: 5,
    description: 'A long remote valley trek in upper Chitral along the Yarkhun River, offering untouched landscapes, historic forts, and views into the Wakhan Corridor.',
    popular: false,
  },
  // ── Pakistan – Ghizer ──────────────────────────────────────────────────────
  {
    slug: 'phander-lake-pk',
    name: 'Phander Lake Trek',
    country: 'Pakistan', region: 'Gilgit-Baltistan',
    lat: 36.4500, lon: 72.5833,
    trailheadElevation: 2900, summitElevation: 3400,
    difficulty: 'easy', durationDays: 2,
    description: 'A serene turquoise lake set in the remote Ghizer Valley of Gilgit-Baltistan, offering reflections of snow-capped peaks and excellent trout fishing.',
    popular: true,
  },
  {
    slug: 'yasin-valley-pk',
    name: 'Yasin Valley Trek',
    country: 'Pakistan', region: 'Gilgit-Baltistan',
    lat: 36.4000, lon: 73.3000,
    trailheadElevation: 2200, summitElevation: 3500,
    difficulty: 'moderate', durationDays: 4,
    description: 'A peaceful and rarely visited valley in Ghizer with lush green villages, apricot orchards, and trails leading toward Darkot and Thui An passes.',
    popular: false,
  },
  // ── Pakistan – Gojal / Upper Hunza ────────────────────────────────────────
  {
    slug: 'chapursan-valley-pk',
    name: 'Chapursan Valley Trek',
    country: 'Pakistan', region: 'Gilgit-Baltistan',
    lat: 37.0000, lon: 74.7000,
    trailheadElevation: 3000, summitElevation: 4400,
    difficulty: 'hard', durationDays: 6,
    description: 'A remote frontier valley bordering Afghanistan in upper Gojal, where traditional Wakhi culture thrives amid dramatic Karakoram and Pamir landscapes.',
    popular: false,
  },
  {
    slug: 'borit-lake-pk',
    name: 'Borit Lake & Passu Cones',
    country: 'Pakistan', region: 'Gilgit-Baltistan',
    lat: 36.4000, lon: 74.7800,
    trailheadElevation: 2650, summitElevation: 3000,
    difficulty: 'easy', durationDays: 1,
    description: 'A short and scenic hike around Borit Lake with iconic views of the Passu Cathedral spires and Batura Glacier in upper Hunza.',
    popular: true,
  },
  {
    slug: 'khunjerab-national-park-pk',
    name: 'Khunjerab National Park Trek',
    country: 'Pakistan', region: 'Gilgit-Baltistan',
    lat: 36.8400, lon: 75.4300,
    trailheadElevation: 4000, summitElevation: 4733,
    difficulty: 'moderate', durationDays: 3,
    description: 'Trek through the highest paved border crossing in the world on the Karakoram Highway, exploring alpine plateaus home to snow leopards and Marco Polo sheep.',
    popular: true,
  },
  // ── Pakistan – Azad Kashmir ────────────────────────────────────────────────
  {
    slug: 'neelum-valley-trek-pk',
    name: 'Neelum Valley Trek',
    country: 'Pakistan', region: 'Azad Kashmir',
    lat: 34.7000, lon: 73.9000,
    trailheadElevation: 1500, summitElevation: 2800,
    difficulty: 'moderate', durationDays: 5,
    description: 'A stunning valley in Azad Kashmir flanked by dense forests, rushing rivers, and meadows — dotted with traditional villages and high-altitude lakes.',
    popular: true,
  },
  {
    slug: 'ratti-gali-lake-pk',
    name: 'Ratti Gali Lake Trek',
    country: 'Pakistan', region: 'Azad Kashmir',
    lat: 34.8500, lon: 73.8000,
    trailheadElevation: 2600, summitElevation: 3700,
    difficulty: 'moderate', durationDays: 2,
    description: 'A beautiful turquoise glacial lake in the Neelum Valley at 3,700m, reachable via a scenic trail through pine forests and alpine meadows.',
    popular: true,
  },
  {
    slug: 'shounter-lake-pk',
    name: 'Shounter Lake Trek',
    country: 'Pakistan', region: 'Azad Kashmir',
    lat: 34.7300, lon: 73.7800,
    trailheadElevation: 2400, summitElevation: 3500,
    difficulty: 'hard', durationDays: 3,
    description: 'A remote high-altitude lake in AJK reached through dense forests and steep mountain trails, offering solitude and raw natural beauty.',
    popular: false,
  },
  {
    slug: 'chitta-katha-lake-pk',
    name: 'Chitta Katha Lake Trek',
    country: 'Pakistan', region: 'Azad Kashmir',
    lat: 34.8500, lon: 73.9500,
    trailheadElevation: 2800, summitElevation: 3800,
    difficulty: 'hard', durationDays: 3,
    description: 'A glacial emerald lake in upper Neelum Valley at nearly 3,800m, set against a backdrop of snow-capped peaks and glaciers.',
    popular: false,
  },
  // ── Pakistan – Gilgit-Baltistan (additional) ──────────────────────────────
  {
    slug: 'nanga-parbat-diamir-pk',
    name: 'Nanga Parbat Diamir Face Base Camp',
    country: 'Pakistan', region: 'Gilgit-Baltistan',
    lat: 35.1800, lon: 74.5200,
    trailheadElevation: 2100, summitElevation: 4200,
    difficulty: 'hard', durationDays: 6,
    description: 'Trek to the dramatic western face of Nanga Parbat (8,126m) via the Diamir Valley, offering a different perspective on the world\'s ninth-highest mountain.',
    popular: false,
  },
  {
    slug: 'hushe-valley-masherbrum-pk',
    name: 'Hushe Valley & Masherbrum Base Camp',
    country: 'Pakistan', region: 'Gilgit-Baltistan',
    lat: 35.6000, lon: 76.3000,
    trailheadElevation: 3100, summitElevation: 4800,
    difficulty: 'hard', durationDays: 8,
    description: 'A stunning trek up the Hushe Valley in the Karakoram to the base of Masherbrum (K1, 7,821m), surrounded by dramatic peaks and glaciers.',
    popular: false,
  },
  {
    slug: 'hispar-glacier-pk',
    name: 'Hispar Glacier Trek',
    country: 'Pakistan', region: 'Gilgit-Baltistan',
    lat: 36.1800, lon: 74.8500,
    trailheadElevation: 2700, summitElevation: 5100,
    difficulty: 'technical', durationDays: 10,
    description: 'One of the world\'s longest glaciers (49 km), the Hispar Glacier connects to the Biafo forming the Snow Lake basin — a remote glacial traverse for experienced mountaineers.',
    popular: false,
  },
  // ── India ──────────────────────────────────────────────────────────────────
  {
    slug: 'triund-trek-in',
    name: 'Triund Trek',
    country: 'India', region: 'Himachal Pradesh',
    lat: 32.2800, lon: 76.3300,
    trailheadElevation: 1350, summitElevation: 2842,
    difficulty: 'easy', durationDays: 2,
    description: 'A highly popular and scenic ridge trek above Dharamshala offering breathtaking views of the Dhauladhar Range and the Kangra Valley below.',
    popular: true,
  },
  {
    slug: 'kheerganga-trek-in',
    name: 'Kheerganga Trek',
    country: 'India', region: 'Himachal Pradesh',
    lat: 32.0667, lon: 77.2833,
    trailheadElevation: 1640, summitElevation: 2960,
    difficulty: 'moderate', durationDays: 2,
    description: 'A beautiful trek through Parvati Valley to the natural hot springs at Kheerganga, passing waterfalls, forests, and mountain views.',
    popular: true,
  },
  {
    slug: 'pin-parvati-pass-in',
    name: 'Pin Parvati Pass Trek',
    country: 'India', region: 'Himachal Pradesh',
    lat: 31.9000, lon: 77.5500,
    trailheadElevation: 2100, summitElevation: 5300,
    difficulty: 'technical', durationDays: 9,
    description: 'A challenging high-altitude crossing (5,319m) linking the lush Parvati Valley to the arid Spiti desert landscape — one of the Himalayas\' great contrasts.',
    popular: false,
  },
  {
    slug: 'spiti-valley-trek-in',
    name: 'Spiti Valley Trek',
    country: 'India', region: 'Himachal Pradesh',
    lat: 32.2000, lon: 78.0000,
    trailheadElevation: 3800, summitElevation: 4850,
    difficulty: 'hard', durationDays: 8,
    description: 'Trek through the remote high-altitude Spiti Valley at 12,000–16,000 ft, visiting ancient monasteries, traditional villages, and snow leopard habitat.',
    popular: true,
  },
  {
    slug: 'bali-pass-trek-in',
    name: 'Bali Pass Trek',
    country: 'India', region: 'Uttarakhand',
    lat: 30.9500, lon: 78.3000,
    trailheadElevation: 2200, summitElevation: 4935,
    difficulty: 'hard', durationDays: 7,
    description: 'A remote and scenic traverse across Bali Pass (4,935m) in the Garhwal Himalayas, connecting Sankri to Har Ki Dun with stunning ridge views.',
    popular: false,
  },
  {
    slug: 'dayara-bugyal-in',
    name: 'Dayara Bugyal Trek',
    country: 'India', region: 'Uttarakhand',
    lat: 30.9400, lon: 78.2600,
    trailheadElevation: 2620, summitElevation: 3408,
    difficulty: 'easy', durationDays: 3,
    description: 'One of the most beautiful alpine meadows in Uttarakhand, offering easy walks through wildflower pastures with panoramic Himalayan views.',
    popular: true,
  },
  {
    slug: 'leh-ladakh-trek-in',
    name: 'Leh-Ladakh Stok Kangri Summit',
    country: 'India', region: 'Ladakh',
    lat: 33.9800, lon: 77.6100,
    trailheadElevation: 3500, summitElevation: 6153,
    difficulty: 'technical', durationDays: 7,
    description: 'Summit Stok Kangri (6,153m), the highest trekking peak in Ladakh, with acclimatization walks through Ladakhi villages and moonscape terrain.',
    popular: true,
  },
  {
    slug: 'chadar-trek-in',
    name: 'Chadar Frozen River Trek',
    country: 'India', region: 'Ladakh',
    lat: 34.1500, lon: 76.5000,
    trailheadElevation: 3300, summitElevation: 3700,
    difficulty: 'hard', durationDays: 9,
    description: 'Walk on the frozen Zanskar River (the Chadar) in January-February, one of the world\'s most surreal and challenging winter treks.',
    popular: true,
  },
  // ── Nepal ──────────────────────────────────────────────────────────────────
  {
    slug: 'tilicho-lake-np',
    name: 'Tilicho Lake Trek',
    country: 'Nepal', region: 'Annapurna',
    lat: 28.6833, lon: 83.8500,
    trailheadElevation: 2800, summitElevation: 4919,
    difficulty: 'hard', durationDays: 3,
    description: 'A demanding side trek off the Annapurna Circuit to Tilicho Lake (4,919m), one of the world\'s highest lakes, with dramatic Annapurna views.',
    popular: true,
  },
  {
    slug: 'mardi-himal-np',
    name: 'Mardi Himal Trek',
    country: 'Nepal', region: 'Annapurna',
    lat: 28.4000, lon: 83.8700,
    trailheadElevation: 1800, summitElevation: 4500,
    difficulty: 'moderate', durationDays: 5,
    description: 'A less-trodden gem near Pokhara that takes you to the Mardi Himal Base Camp with spectacular close-up views of Machapuchare (Fish Tail) and Annapurna South.',
    popular: true,
  },
  {
    slug: 'gosaikund-np',
    name: 'Gosaikund Trek',
    country: 'Nepal', region: 'Langtang',
    lat: 28.0833, lon: 85.4167,
    trailheadElevation: 1470, summitElevation: 4380,
    difficulty: 'moderate', durationDays: 5,
    description: 'A sacred pilgrimage and trekking route to the holy Gosaikund lakes (4,380m) in the Langtang region, with sweeping Himalayan panoramas.',
    popular: true,
  },
  {
    slug: 'khopra-danda-np',
    name: 'Khopra Danda Ridge Trek',
    country: 'Nepal', region: 'Annapurna',
    lat: 28.4500, lon: 83.6500,
    trailheadElevation: 1900, summitElevation: 3660,
    difficulty: 'moderate', durationDays: 6,
    description: 'A quieter alternative to Annapurna Base Camp, the Khopra Danda ridge offers extraordinary views of Dhaulagiri, Annapurna South, and Nilgiri from a peaceful vantage.',
    popular: false,
  },
  // ── Central Asia ───────────────────────────────────────────────────────────
  {
    slug: 'iskanderkul-tj',
    name: 'Iskanderkul Lake Trek',
    country: 'Tajikistan', region: 'Sughd',
    lat: 39.0833, lon: 68.3667,
    trailheadElevation: 2200, summitElevation: 2700,
    difficulty: 'easy', durationDays: 2,
    description: 'A scenic mountain lake named after Alexander the Great, nestled in the Fan Mountains of Tajikistan — the turquoise water and surrounding peaks make for an easy and rewarding hike.',
    popular: true,
  },
  {
    slug: 'peak-Lenin-kg',
    name: 'Peak Lenin Base Camp',
    country: 'Kyrgyzstan', region: 'Osh',
    lat: 39.7000, lon: 72.8800,
    trailheadElevation: 3600, summitElevation: 4400,
    difficulty: 'hard', durationDays: 5,
    description: 'Trek to the base camp of Peak Lenin (7,134m) on the Kyrgyz-Tajik border through vast high-altitude plateaus, yurt camps, and rolling pastures.',
    popular: true,
  },
  {
    slug: 'terskey-alatoo-kg',
    name: 'Terskey Ala-Too Traverse',
    country: 'Kyrgyzstan', region: 'Issyk-Kul',
    lat: 42.2000, lon: 78.5000,
    trailheadElevation: 2000, summitElevation: 4000,
    difficulty: 'hard', durationDays: 8,
    description: 'A dramatic multi-day traverse of the Terskey Ala-Too range south of Lake Issyk-Kul, crossing multiple high passes through wild yurt-dotted valleys.',
    popular: false,
  },
]

// ─── Insert logic ─────────────────────────────────────────────────────────────

async function insertCities() {
  console.log(`\nInserting ${CITIES.length} tourism cities...`)
  let inserted = 0, skipped = 0
  for (const c of CITIES) {
    const cc = c.cc ?? 'PK'
    const cn = c.cn ?? 'Pakistan'
    const tz = c.tz ?? 'Asia/Karachi'
    const s = slug(c.ascii, cc)
    try {
      await sql`
        INSERT INTO "City" (id, name, "asciiName", country, "countryName", lat, lon, population, timezone, admin1, slug)
        VALUES (${c.id}, ${c.name}, ${c.ascii}, ${cc}, ${cn}, ${c.lat}, ${c.lon}, ${c.pop}, ${tz}, ${c.admin1}, ${s})
        ON CONFLICT (id) DO NOTHING
      `
      // Also check slug conflict separately
      inserted++
    } catch (e) {
      if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
        skipped++
      } else {
        console.warn(`  City ${c.name}: ${e.message}`)
        skipped++
      }
    }
  }
  console.log(`  Cities: ${inserted} inserted, ${skipped} skipped`)
}

async function insertTreks() {
  console.log(`\nInserting ${TREKS.length} new treks...`)
  let inserted = 0, skipped = 0
  for (const t of TREKS) {
    const id = stableId(t.slug)
    const now = new Date().toISOString()
    try {
      await sql`
        INSERT INTO "Trek" (id, slug, name, country, region, lat, lon, "trailheadElevation", "summitElevation", difficulty, "durationDays", description, popular, "createdAt", "updatedAt")
        VALUES (${id}, ${t.slug}, ${t.name}, ${t.country}, ${t.region}, ${t.lat}, ${t.lon}, ${t.trailheadElevation}, ${t.summitElevation}, ${t.difficulty}, ${t.durationDays}, ${t.description}, ${t.popular}, ${now}, ${now})
        ON CONFLICT (slug) DO NOTHING
      `
      inserted++
    } catch (e) {
      if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
        skipped++
      } else {
        console.warn(`  Trek ${t.slug}: ${e.message}`)
        skipped++
      }
    }
  }
  console.log(`  Treks: ${inserted} inserted, ${skipped} skipped`)
}

// ─── Run ──────────────────────────────────────────────────────────────────────

await insertCities()
await insertTreks()

// Verify
const cityCount = await sql`SELECT COUNT(*) AS n FROM "City" WHERE country = 'PK'`
const trekCount = await sql`SELECT COUNT(*) AS n FROM "Trek"`
console.log(`\nDone. PK cities in DB: ${cityCount[0].n} | Total treks: ${trekCount[0].n}`)
const dbSize = await sql`SELECT pg_size_pretty(pg_database_size(current_database())) AS s`
console.log(`DB size: ${dbSize[0].s}`)
