import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password || !phone)
      return res.status(400).json({ error: 'All fields required.' })
    if (!email.endsWith('.edu'))
      return res.status(400).json({ error: 'Must use a .edu email address.' })
    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Account already exists.' })

    const user = await User.create({ name, email, password, phone })
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'All fields required.' })
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' })

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
