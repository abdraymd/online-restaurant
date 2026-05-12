import { Request, Response } from 'express'
import { z } from 'zod'
import { Role } from '@prisma/client'
import * as authService from './auth.service'

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function registerHandler(req: Request, res: Response) {
  const body = registerSchema.parse(req.body)
  const result = await authService.register(body.name, body.email, body.password, body.role)
  res.status(201).json(result)
}

export async function loginHandler(req: Request, res: Response) {
  const body = loginSchema.parse(req.body)
  const result = await authService.login(body.email, body.password)
  res.json(result)
}

export async function meHandler(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id)
  res.json(user)
}
