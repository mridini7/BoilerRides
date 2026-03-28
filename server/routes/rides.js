import { Router } from 'express'
import auth from '../middleware/auth.js'
import Ride from '../models/Ride.js'

const router = Router()

router.get('/', auth, async (req, res) => {
  try {
    const { date, pickup, destination } = req.query
    if (!date || !pickup || !destination)
      return res.status(400).json({ error: 'date, pickup, and destination are required.' })

    const rides = await Ride.find({
      date, pickup, destination,
      $expr: { $lt: ['$seatsBooked', '$totalSeats'] },
    }).sort({ departureMinutes: 1 })

    // filter past departures if searching today
    const today = new Date().toLocaleDateString('en-CA')
    const now = new Date()
    const available = date !== today ? rides : rides.filter(r => {
      const [time, ampm] = r.departureTime.split(' ')
      let [h, m] = time.split(':').map(Number)
      if (ampm === 'PM' && h !== 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0
      const dep = new Date(); dep.setHours(h, m, 0, 0)
      return dep > now
    })

    res.json(available)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
