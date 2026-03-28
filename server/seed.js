import 'dotenv/config'
import mongoose from 'mongoose'
import Ride from './models/Ride.js'

const DURATIONS = {
  'pmu-corec': 5,   'corec-pmu': 5,
  'pmu-pui':   90,  'pui-pmu':   90,
  'pmu-ind':   105, 'ind-pmu':   105,
  'pmu-ord':   135, 'ord-pmu':   135,
  'corec-pui': 90,  'pui-corec': 90,
  'corec-ind': 105, 'ind-corec': 105,
  'corec-ord': 135, 'ord-corec': 135,
  'pui-ind':   25,  'ind-pui':   25,
  'pui-ord':   165, 'ord-pui':   165,
  'ind-ord':   185, 'ord-ind':   185,
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

function getDateStr(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toLocaleDateString('en-CA')
}

const DEPARTURES = ['6:00 AM', '8:30 AM', '11:00 AM', '1:30 PM', '4:00 PM', '6:30 PM']
const BASE_BOOKED = [2, 4, 0, 1, 7, 3]

const ROUTES = [
  ['pmu', 'pui'], ['pui', 'pmu'],
  ['pmu', 'ind'], ['ind', 'pmu'],
  ['pmu', 'ord'], ['ord', 'pmu'],
  ['corec', 'ind'], ['ind', 'corec'],
  ['corec', 'ord'], ['ord', 'corec'],
  ['pui', 'ind'], ['ind', 'pui'],
  ['pui', 'ord'], ['ord', 'pui'],
  ['ind', 'ord'], ['ord', 'ind'],
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
      const duration = DURATIONS[`${pickup}-${destination}`] || 60
      DEPARTURES.forEach((dep, i) => {
        rides.push({
          date, pickup, destination,
          departureTime: dep,
          arrivalTime: addMinutes(dep, duration),
          totalSeats: 12,
          seatsBooked: BASE_BOOKED[i % BASE_BOOKED.length],
        })
      })
    }
  }

  await Ride.insertMany(rides)
  console.log(`✅ Seeded ${rides.length} rides across 14 days`)
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
