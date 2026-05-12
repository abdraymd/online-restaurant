import { Request, Response } from 'express'
import * as service from './users.service'

export async function listHandler(_req: Request, res: Response) {
  const users = await service.list()
  res.json(users)
}

export async function getByIdHandler(req: Request<{ id: string }>, res: Response) {
  const user = await service.findById(req.params.id)
  res.json(user)
}

export async function removeHandler(req: Request<{ id: string }>, res: Response) {
  await service.remove(req.params.id)
  res.status(204).send()
}
