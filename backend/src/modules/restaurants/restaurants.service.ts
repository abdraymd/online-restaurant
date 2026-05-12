import { prisma } from '../../lib/prisma'

export async function list(params: {
  search?: string
  isOpen?: boolean
  page?: number
  limit?: number
}) {
  const { search, isOpen, page = 1, limit = 20 } = params
  const clampedLimit = Math.min(limit, 100)
  const skip = (page - 1) * clampedLimit

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(isOpen !== undefined && { isOpen }),
  }

  const [data, total] = await prisma.$transaction([
    prisma.restaurant.findMany({ where, skip, take: clampedLimit, orderBy: { createdAt: 'desc' } }),
    prisma.restaurant.count({ where }),
  ])

  return { data, meta: { page, limit: clampedLimit, total } }
}

export async function findById(id: string) {
  const restaurant = await prisma.restaurant.findUniqueOrThrow({
    where: { id },
    include: { menuItems: { where: { isAvailable: true }, orderBy: { category: 'asc' } } },
  })
  return restaurant
}

export async function create(data: {
  name: string
  description?: string
  imageUrl?: string
  address: string
  phone?: string
  isOpen?: boolean
}) {
  return prisma.restaurant.create({ data })
}

export async function update(id: string, data: {
  name?: string
  description?: string
  imageUrl?: string
  address?: string
  phone?: string
  isOpen?: boolean
}) {
  return prisma.restaurant.update({ where: { id }, data })
}

export async function remove(id: string) {
  await prisma.restaurant.delete({ where: { id } })
}
