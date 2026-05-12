import { Request, Response } from 'express'
import { z } from 'zod'
import { OrderStatus } from '@prisma/client'
import * as service from './orders.service'

const placeOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(z.object({
    menuItemId: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1),
  note: z.string().optional(),
})

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export async function placeOrderHandler(req: Request, res: Response) {
  const body = placeOrderSchema.parse(req.body)
  const order = await service.placeOrder(req.user!.id, body)
  res.status(201).json(order)
}

export async function listHandler(req: Request, res: Response) {
  const orders = await service.list(req.user!.id)
  res.json(orders)
}

export async function getByIdHandler(req: Request<{ id: string }>, res: Response) {
  const order = await service.findById(req.user!.id, req.params.id)
  res.json(order)
}

export async function updateStatusHandler(req: Request<{ id: string }>, res: Response) {
  const { status } = updateStatusSchema.parse(req.body)
  const order = await service.updateStatus(req.user!.id, req.params.id, status)
  res.json(order)
}

export async function cancelHandler(req: Request<{ id: string }>, res: Response) {
  const order = await service.cancel(req.user!.id, req.params.id)
  res.json(order)
}
