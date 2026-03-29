import { Router } from 'express'
import auth from '../middleware/auth.js'
import Reservation from '../models/Reservation.js'
import Ride from '../models/Ride.js'
import { body, validationResult } from 'express-validator' // For robust input validation
import { v4 as uuidv4 } from 'uuid' // For generating unique confirmation numbers

const router = Router()

// Store human-readable labels in the reservation, not IDs
router.post('/', auth, [
  body('rideId').isMongoId().withMessage('Invalid ride ID.'),
  body('riderName').trim().notEmpty().withMessage('Rider name is required.'),
  body('mobility').optional().isIn(['None', 'Service Animal', 'Wheelchair', 'Walker']).withMessage('Invalid mobility option.'),
  body('pickupLabel').trim().notEmpty().withMessage('Pickup location label is required.'),
  body('destinationLabel').trim().notEmpty().withMessage('Destination location label is required.'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, riderName, mobility, pickupLabel, destinationLabel } = req.body
    const userId = req.user.userId
    const confirmationNumber = uuidv4().slice(0, 8).toUpperCase() // Generate unique confirmation number on backend

    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, $expr: { $lt: ['$seatsBooked', '$totalSeats'] } },
      { $inc: { seatsBooked: 1 } },
      { new: true }
    )
    if (!ride) return res.status(409).json({ error: 'No seats available on this ride.' })
    
    const reservation = await Reservation.create({
      userId, rideId: ride._id, confirmationNumber,
      date: ride.date,
      pickup: pickupLabel || ride.pickup,
      destination: destinationLabel || ride.destination,
      departureTime: ride.departureTime, arrivalTime: ride.arrivalTime,
      riderName, mobility,
      price: ride.price ?? 0,
    })
    res.status(201).json(reservation)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/reservations/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId)
      return res.status(403).json({ error: 'Forbidden' })

    const reservations = await Reservation.find({ userId: req.params.userId })
      .sort({ date: -1, departureTime: 1 })
      .lean()

    // For any reservation missing a price, look it up from the ride
    const rideIds = reservations
      .filter(r => r.price === undefined || r.price === null)
      .map(r => r.rideId)

    let ridePriceMap = {}
    if (rideIds.length > 0) {
      const rides = await Ride.find({ _id: { $in: rideIds } }).lean()
      rides.forEach(ride => { ridePriceMap[ride._id.toString()] = ride.price ?? 0 })
    }

    const result = reservations.map(r => ({
      ...r,
      price: (r.price !== undefined && r.price !== null)
        ? r.price
        : (ridePriceMap[r.rideId?.toString()] ?? 0)
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/reservations/:reservationId — cancel a single reservation
router.delete('/:reservationId', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId)
    if (!reservation) return res.status(404).json({ error: 'Reservation not found.' })
    if (reservation.userId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Forbidden' })

    // restore the seat atomically, never go below 0
    await Ride.findByIdAndUpdate(
      reservation.rideId,
      [{ $set: { seatsBooked: { $max: [0, { $subtract: ['$seatsBooked', 1] }] } } }],
      { updatePipeline: true }
    )
    await reservation.deleteOne()
    res.json({ message: 'Reservation cancelled.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
