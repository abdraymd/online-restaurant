import { prisma } from '../../lib/prisma'

const USER_SELECT = { id: true, name: true, email: true, role: true, createdAt: true }

export async function list() {
  return prisma.user.findMany({ select: USER_SELECT, orderBy: { createdAt: 'desc' } })
}

export async function findById(id: string) {
  return prisma.user.findUniqueOrThrow({ where: { id }, select: USER_SELECT })
}

export async function remove(id: string) {
  await prisma.user.delete({ where: { id } })
}
