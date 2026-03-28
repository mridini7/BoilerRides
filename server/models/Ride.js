import mongoose from 'mongoose'

const rideSchema = new mongoose.Schema({
  date:          { type: String, required: true },
  pickup:        { type: String, required: true },
  destination:   { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime:   { type: String, required: true },
  totalSeats:    { type: Number, required: true, default: 12 },
  seatsBooked:   { type: Number, required: true, default: 0 },
})

export default mongoose.model('Ride', rideSchema)
