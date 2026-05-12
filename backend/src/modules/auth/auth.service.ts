import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma'
import { signToken } from '../../lib/jwt'
import { AppError } from '../../middleware/errorHandler'
import { Role } from '@prisma/client'

const SALT_ROUNDS = 10

export async function register(name: string, email: string, password: string, role: Role = Role.CUSTOMER) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
    select: { id: true, name: true, email: true, role: true },
  })
  const token = signToken({ sub: user.id, email: user.email, role: user.role })
  return { token, user }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials')
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials')
  const token = signToken({ sub: user.id, email: user.email, role: user.role })
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  })
  return user
}
