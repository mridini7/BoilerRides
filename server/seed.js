import 'dotenv/config'
import mongoose from 'mongoose'
import Ride from './models/Ride.js'

// Drive durations in minutes (symmetric)
const DURATIONS = {
  // ── Purdue campus ───────────────────────────────────────────────────────
  'pmu-corec': 5,    'corec-pmu': 5,
  'pmu-pui':   90,   'pui-pmu':   90,

  // ── IND airport: only PMU and PUI ──────────────────────────────────────
  'pmu-ind':   105,  'ind-pmu':   105,
  'corec-ind': 105,  'ind-corec': 105,
  'pui-ind':   25,   'ind-pui':   25,

  // ── ORD airport: only PMU, Co-Rec, and UIUC ────────────────────────────
  'pmu-ord':   135,  'ord-pmu':   135,
  'corec-ord': 135,  'ord-corec': 135,
  'uiuc-ord':  90,   'ord-uiuc':  90,   // Champaign → O'Hare ~1h 30m

  // ── IND ↔ ORD (airport to airport) ─────────────────────────────────────
  'ind-ord':   185,  'ord-ind':   185,

  // ── PMU ↔ Inter-college ─────────────────────────────────────────────────
  'pmu-uiuc':  120,  'uiuc-pmu':  120,  // ~2h
  'pmu-umich': 195,  'umich-pmu': 195,  // ~3h 15m
  'pmu-iu':    75,   'iu-pmu':    75,   // ~1h 15m
  'pmu-osu':   270,  'osu-pmu':   270,  // ~4h 30m
  'pmu-nd':    90,   'nd-pmu':    90,   // ~1h 30m

  // ── Co-Rec ↔ Inter-college ──────────────────────────────────────────────
  'corec-uiuc':  120, 'uiuc-corec':  120,
  'corec-umich': 195, 'umich-corec': 195,
  'corec-iu':    75,  'iu-corec':    75,
  'corec-osu':   270, 'osu-corec':   270,
  'corec-nd':    90,  'nd-corec':    90,

  // ── Purdue Indy ↔ Inter-college ─────────────────────────────────────────
  'pui-uiuc':  165,  'uiuc-pui':  165,  // ~2h 45m
  'pui-umich': 240,  'umich-pui': 240,  // ~4h
  'pui-iu':    60,   'iu-pui':    60,   // ~1h
  'pui-osu':   285,  'osu-pui':   285,  // ~4h 45m
  'pui-nd':    135,  'nd-pui':    135,  // ~2h 15m

  // ── Inter-college ↔ Inter-college ───────────────────────────────────────
  'uiuc-iu':   135,  'iu-uiuc':   135,  // ~2h 15m
  'uiuc-nd':   150,  'nd-uiuc':   150,  // ~2h 30m
  'uiuc-umich':270,  'umich-uiuc':270,  // ~4h 30m
  'uiuc-osu':  300,  'osu-uiuc':  300,  // ~5h
  'iu-nd':     150,  'nd-iu':     150,  // ~2h 30m
  'iu-umich':  285,  'umich-iu':  285,  // ~4h 45m
  'iu-osu':    225,  'osu-iu':    225,  // ~3h 45m
  'nd-umich':  225,  'umich-nd':  225,  // ~3h 45m
  'nd-osu':    285,  'osu-nd':    285,  // ~4h 45m
  'umich-osu': 195,  'osu-umich': 195,  // ~3h 15m
}

// Prices in USD
const PRICES = {
  // ── Purdue campus (free) ────────────────────────────────────────────────
  'pmu-corec': 0,   'corec-pmu': 0,
  'pmu-pui':   0,   'pui-pmu':   0,

  // ── IND airport ─────────────────────────────────────────────────────────
  'pmu-ind':   25,  'ind-pmu':   25,
  'corec-ind': 25,  'ind-corec': 25,
  'pui-ind':   15,  'ind-pui':   15,

  // ── ORD airport ─────────────────────────────────────────────────────────
  'pmu-ord':   45,  'ord-pmu':   45,
  'corec-ord': 45,  'ord-corec': 45,
  'uiuc-ord':  30,  'ord-uiuc':  30,

  // ── IND ↔ ORD ───────────────────────────────────────────────────────────
  'ind-ord':   35,  'ord-ind':   35,

  // ── PMU ↔ Inter-college ─────────────────────────────────────────────────
  'pmu-uiuc':  20,  'uiuc-pmu':  20,
  'pmu-umich': 35,  'umich-pmu': 35,
  'pmu-iu':    15,  'iu-pmu':    15,
  'pmu-osu':   50,  'osu-pmu':   50,
  'pmu-nd':    20,  'nd-pmu':    20,

  // ── Co-Rec ↔ Inter-college ──────────────────────────────────────────────
  'corec-uiuc':  20, 'uiuc-corec':  20,
  'corec-umich': 35, 'umich-corec': 35,
  'corec-iu':    15, 'iu-corec':    15,
  'corec-osu':   50, 'osu-corec':   50,
  'corec-nd':    20, 'nd-corec':    20,

  // ── Purdue Indy ↔ Inter-college ─────────────────────────────────────────
  'pui-uiuc':  30,  'uiuc-pui':  30,
  'pui-umich': 45,  'umich-pui': 45,
  'pui-iu':    10,  'iu-pui':    10,
  'pui-osu':   55,  'osu-pui':   55,
  'pui-nd':    25,  'nd-pui':    25,

  // ── Inter-college ↔ Inter-college ───────────────────────────────────────
  'uiuc-iu':   25,  'iu-uiuc':   25,
  'uiuc-nd':   25,  'nd-uiuc':   25,
  'uiuc-umich':50,  'umich-uiuc':50,
  'uiuc-osu':  55,  'osu-uiuc':  55,
  'iu-nd':     25,  'nd-iu':     25,
  'iu-umich':  50,  'umich-iu':  50,
  'iu-osu':    40,  'osu-iu':    40,
  'nd-umich':  40,  'umich-nd':  40,
  'nd-osu':    50,  'osu-nd':    50,
  'umich-osu': 35,  'osu-umich': 35,
}

function addMinutes(timeStr, mins) {
  const [time, ampm] = timeStr.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  const total = h * 60 + m + mins
  let rh = Math.floor(total / 60) % 24
  const rm = total % 60
  const rap = rh >= 12 ? 'PM' : 'AM'
  if (rh > 12) rh -= 12
  if (rh === 0) rh = 12
  return `${rh}:${String(rm).padStart(2, '0')} ${rap}`
}

function toMinutes(timeStr) {
  const [time, ampm] = timeStr.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function getDateStr(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toLocaleDateString('en-CA')
}

const DEPARTURES = ['6:00 AM', '8:30 AM', '11:00 AM', '1:30 PM', '4:00 PM', '6:30 PM']
const BASE_BOOKED = [2, 4, 0, 1, 7, 3]

const ROUTES = [
  // ── Purdue campus ──────────────────────────────────────────────────────
  ['pmu', 'corec'], ['corec', 'pmu'],
  ['pmu', 'pui'],   ['pui', 'pmu'],

  // ── IND: only PMU, Co-Rec, PUI ────────────────────────────────────────
  ['pmu', 'ind'],   ['ind', 'pmu'],
  ['corec', 'ind'], ['ind', 'corec'],
  ['pui', 'ind'],   ['ind', 'pui'],

  // ── ORD: only PMU, Co-Rec, UIUC ──────────────────────────────────────
  ['pmu', 'ord'],   ['ord', 'pmu'],
  ['corec', 'ord'], ['ord', 'corec'],
  ['uiuc', 'ord'],  ['ord', 'uiuc'],

  // ── IND ↔ ORD ─────────────────────────────────────────────────────────
  ['ind', 'ord'],   ['ord', 'ind'],

  // ── PMU ↔ Inter-college ───────────────────────────────────────────────
  ['pmu', 'uiuc'],  ['uiuc', 'pmu'],
  ['pmu', 'umich'], ['umich', 'pmu'],
  ['pmu', 'iu'],    ['iu', 'pmu'],
  ['pmu', 'osu'],   ['osu', 'pmu'],
  ['pmu', 'nd'],    ['nd', 'pmu'],

  // ── Co-Rec ↔ Inter-college ────────────────────────────────────────────
  ['corec', 'uiuc'],  ['uiuc', 'corec'],
  ['corec', 'umich'], ['umich', 'corec'],
  ['corec', 'iu'],    ['iu', 'corec'],
  ['corec', 'osu'],   ['osu', 'corec'],
  ['corec', 'nd'],    ['nd', 'corec'],

  // ── Purdue Indy ↔ Inter-college ───────────────────────────────────────
  ['pui', 'uiuc'],  ['uiuc', 'pui'],
  ['pui', 'umich'], ['umich', 'pui'],
  ['pui', 'iu'],    ['iu', 'pui'],
  ['pui', 'osu'],   ['osu', 'pui'],
  ['pui', 'nd'],    ['nd', 'pui'],

  // ── Inter-college ↔ Inter-college ─────────────────────────────────────
  ['uiuc', 'iu'],    ['iu', 'uiuc'],
  ['uiuc', 'nd'],    ['nd', 'uiuc'],
  ['uiuc', 'umich'], ['umich', 'uiuc'],
  ['uiuc', 'osu'],   ['osu', 'uiuc'],
  ['iu', 'nd'],      ['nd', 'iu'],
  ['iu', 'umich'],   ['umich', 'iu'],
  ['iu', 'osu'],     ['osu', 'iu'],
  ['nd', 'umich'],   ['umich', 'nd'],
  ['nd', 'osu'],     ['osu', 'nd'],
  ['umich', 'osu'],  ['osu', 'umich'],
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB Atlas')
  await Ride.deleteMany({})
  console.log('Cleared existing rides')

  const rides = []
  for (let day = 1; day <= 14; day++) {
    const date = getDateStr(day)
    for (const [pickup, destination] of ROUTES) {
      const key = `${pickup}-${destination}`
      const duration = DURATIONS[key] || 60
      const price = PRICES[key] ?? 0
      DEPARTURES.forEach((dep, i) => {
        rides.push({
          date, pickup, destination,
          departureTime: dep,
          arrivalTime: addMinutes(dep, duration),
          departureMinutes: toMinutes(dep),
          totalSeats: 12,
          seatsBooked: BASE_BOOKED[i % BASE_BOOKED.length],
          price,
        })
      })
    }
  }

  await Ride.insertMany(rides)
  console.log(`✅ Seeded ${rides.length} rides across 14 days`)
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
