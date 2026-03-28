import { Router } from 'express'
import auth from '../middleware/auth.js'
import User from '../models/User.js'
import Reservation from '../models/Reservation.js'

const router = Router()

router.delete('/:userId', auth, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId)
      return res.status(403).json({ error: 'Forbidden' })
    await Reservation.deleteMany({ userId: req.params.userId })
    await User.findByIdAndDelete(req.params.userId)
    res.json({ message: 'Account deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:userId', auth, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId)
      return res.status(403).json({ error: 'Forbidden' })
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })
    const { email, password, phone } = req.body
    if (email) {
      if (!email.endsWith('.edu')) return res.status(400).json({ error: 'Must be a .edu email.' })
      user.email = email
    }
    if (phone) user.phone = phone
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Min 6 characters.' })
      user.password = password
    }
    await user.save()
    res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
