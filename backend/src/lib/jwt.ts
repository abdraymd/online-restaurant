import jwt from 'jsonwebtoken'
import { config } from '../config'
import { Role } from '@prisma/client'

export interface JwtPayload {
  sub: string
  email: string
  role: Role
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET)
  if (typeof decoded === 'string' || !decoded.sub || !decoded['email'] || !decoded['role']) {
    throw new Error('Invalid token payload')
  }
  return decoded as JwtPayload
}
