import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import ridesRoutes from './routes/rides.js'
import reservationsRoutes from './routes/reservations.js'
import usersRoutes from './routes/users.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/rides', ridesRoutes)
app.use('/api/reservations', reservationsRoutes)
app.use('/api/users', usersRoutes)

const PORT = process.env.PORT || 3001

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch(err => { console.error('MongoDB connection error:', err.message); process.exit(1) })
