import { OrderStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../middleware/errorHandler'

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED:  [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING:  [OrderStatus.READY],
  READY:      [OrderStatus.DELIVERED],
  DELIVERED:  [],
  CANCELLED:  [],
}

export async function placeOrder(userId: string, data: {
  restaurantId: string
  items: { menuItemId: string; quantity: number }[]
  note?: string
}) {
  // Validate all menu items belong to restaurant and are available
  const menuItemIds = data.items.map(i => i.menuItemId)
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, restaurantId: data.restaurantId, isAvailable: true },
  })
  if (menuItems.length !== menuItemIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'One or more menu items are unavailable or do not belong to this restaurant')
  }

  const priceMap = new Map(menuItems.map(m => [m.id, m.price]))
  const totalPrice = data.items.reduce((sum, item) => {
    const price = priceMap.get(item.menuItemId)!
    return sum + Number(price) * item.quantity
  }, 0)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        totalPrice,
        note: data.note,
        items: {
          create: data.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: priceMap.get(item.menuItemId)!,
          })),
        },
      },
      include: { items: true },
    })
    return created
  })

  return order
}

export async function list(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findById(userId: string, id: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true } })
  if (order.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'Not your order')
  return order
}

export async function updateStatus(userId: string, id: string, status: OrderStatus) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id } })
  if (order.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'Not your order')
  if (!VALID_TRANSITIONS[order.status].includes(status)) {
    throw new AppError(400, 'VALIDATION_ERROR', `Cannot transition from ${order.status} to ${status}`)
  }
  return prisma.order.update({ where: { id }, data: { status }, include: { items: true } })
}

export async function cancel(userId: string, id: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id } })
  if (order.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'Not your order')
  if (order.status !== OrderStatus.PENDING) throw new AppError(400, 'VALIDATION_ERROR', 'Only PENDING orders can be cancelled')
  return prisma.order.update({ where: { id }, data: { status: OrderStatus.CANCELLED }, include: { items: true } })
}
