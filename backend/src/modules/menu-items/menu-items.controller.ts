import { Request, Response } from 'express'
import { z } from 'zod'
import * as service from './menu-items.service'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  category: z.string().optional(),
})

const updateSchema = createSchema.partial()

export async function listHandler(req: Request<{ restaurantId: string }>, res: Response) {
  const { restaurantId } = req.params
  const category = req.query.category as string | undefined
  const isAvailable = req.query.isAvailable !== 'false'
  const items = await service.listByRestaurant(restaurantId, { category, isAvailable })
  res.json(items)
}

export async function createHandler(req: Request<{ restaurantId: string }>, res: Response) {
  const { restaurantId } = req.params
  const body = createSchema.parse(req.body)
  const item = await service.create(restaurantId, body)
  res.status(201).json(item)
}

export async function updateHandler(req: Request<{ id: string }>, res: Response) {
  const body = updateSchema.parse(req.body)
  const item = await service.update(req.params.id, body)
  res.json(item)
}

export async function removeHandler(req: Request<{ id: string }>, res: Response) {
  await service.remove(req.params.id)
  res.status(204).send()
}
