import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet' // For basic security headers
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import ridesRoutes from './routes/rides.js'
import reservationsRoutes from './routes/reservations.js'
import usersRoutes from './routes/users.js'

const app = express()
app.use(cors())
app.use(helmet()) // Add Helmet for basic security headers
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/rides', ridesRoutes)
app.use('/api/reservations', reservationsRoutes)
app.use('/api/users', usersRoutes)

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'An unexpected error occurred on the server.',
  });
});

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ Connected to MongoDB Atlas'))
      .catch(err => console.error('❌ MongoDB connection error:', err.message))
  } else {
    console.error('❌ MONGODB_URI is missing from .env')
  }
})
