import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'
import { AppError } from './errorHandler'

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid token')
  const token = header.slice(7)
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role }
    next()
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Token expired or invalid')
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated')
    if (!roles.includes(req.user.role)) throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions')
    next()
  }
}
