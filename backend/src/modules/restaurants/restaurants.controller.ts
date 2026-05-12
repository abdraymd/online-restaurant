import { Request, Response } from 'express'
import { z } from 'zod'
import * as service from './restaurants.service'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  address: z.string().min(1),
  phone: z.string().optional(),
  isOpen: z.boolean().optional(),
})

const updateSchema = createSchema.partial()

export async function listHandler(req: Request, res: Response) {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const search = req.query.search as string | undefined
  const isOpen = req.query.isOpen === 'true' ? true : req.query.isOpen === 'false' ? false : undefined
  const result = await service.list({ search, isOpen, page, limit })
  res.json(result)
}

export async function getByIdHandler(req: Request<{ id: string }>, res: Response) {
  const restaurant = await service.findById(req.params.id)
  res.json(restaurant)
}

export async function createHandler(req: Request, res: Response) {
  const body = createSchema.parse(req.body)
  const restaurant = await service.create(body)
  res.status(201).json(restaurant)
}

export async function updateHandler(req: Request<{ id: string }>, res: Response) {
  const body = updateSchema.parse(req.body)
  const restaurant = await service.update(req.params.id, body)
  res.json(restaurant)
}

export async function removeHandler(req: Request<{ id: string }>, res: Response) {
  await service.remove(req.params.id)
  res.status(204).send()
}
