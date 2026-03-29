import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rideId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  confirmationNumber: { type: String, required: true },
  date:               { type: String, required: true },
  pickup:             { type: String, required: true },
  destination:        { type: String, required: true },
  departureTime:      { type: String, required: true },
  arrivalTime:        { type: String, required: true },
  riderName:          { type: String, required: true },
  mobility:           { type: String, default: 'None' },
  price:              { type: Number, required: true }, // Ensure price is always present
}, { timestamps: true })

export default mongoose.model('Reservation', reservationSchema)
