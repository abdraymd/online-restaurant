import { prisma } from '../../lib/prisma'

export async function listByRestaurant(restaurantId: string, params: { category?: string; isAvailable?: boolean }) {
  const { category, isAvailable = true } = params
  return prisma.menuItem.findMany({
    where: {
      restaurantId,
      ...(category && { category }),
      isAvailable,
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
}

export async function create(restaurantId: string, data: {
  name: string
  description?: string
  price: number
  imageUrl?: string
  isAvailable?: boolean
  category?: string
}) {
  return prisma.menuItem.create({ data: { ...data, restaurantId } })
}

export async function update(id: string, data: {
  name?: string
  description?: string
  price?: number
  imageUrl?: string
  isAvailable?: boolean
  category?: string
}) {
  return prisma.menuItem.update({ where: { id }, data })
}

export async function remove(id: string) {
  await prisma.menuItem.delete({ where: { id } })
}
