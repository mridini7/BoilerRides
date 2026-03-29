import jwt from 'jsonwebtoken'
import HttpError from '../utils/HttpError.js' // Assuming you create this utility

export default function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError('Unauthorized: No token provided or invalid format.', 401));
  }

  try {
    const token = header.slice(7);
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    next(new HttpError('Unauthorized: Invalid or expired token.', 401));
  }
}
