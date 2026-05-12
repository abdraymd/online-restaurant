import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/lib/prisma'

const app = createApp()
const prefix = `test_mi_${Date.now()}`
let restaurantId: string

beforeAll(async () => {
  const r = await prisma.restaurant.create({ data: { name: `${prefix}_rest`, address: '1 Test St' } })
  restaurantId = r.id
})

afterAll(async () => {
  await prisma.menuItem.deleteMany({ where: { restaurant: { name: { startsWith: 'test_mi_' } } } })
  await prisma.restaurant.deleteMany({ where: { name: { startsWith: 'test_mi_' } } })
  await prisma.$disconnect()
})

describe('POST /api/v1/restaurants/:restaurantId/menu-items', () => {
  it('creates a menu item', async () => {
    const res = await request(app)
      .post(`/api/v1/restaurants/${restaurantId}/menu-items`)
      .send({ name: 'Burger', price: 12.99, category: 'Mains' })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeTruthy()
    expect(res.body.restaurantId).toBe(restaurantId)
  })

  it('returns 400 on missing price', async () => {
    const res = await request(app)
      .post(`/api/v1/restaurants/${restaurantId}/menu-items`)
      .send({ name: 'Burger' })
    expect(res.status).toBe(400)
  })

  it('returns 400 on negative price', async () => {
    const res = await request(app)
      .post(`/api/v1/restaurants/${restaurantId}/menu-items`)
      .send({ name: 'Burger', price: -1 })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/restaurants/:restaurantId/menu-items', () => {
  it('returns array of menu items', async () => {
    const res = await request(app).get(`/api/v1/restaurants/${restaurantId}/menu-items`)
    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
  })

  it('filters by category', async () => {
    const res = await request(app)
      .get(`/api/v1/restaurants/${restaurantId}/menu-items?category=Mains`)
    expect(res.status).toBe(200)
    expect(res.body.every((i: { category: string }) => i.category === 'Mains')).toBe(true)
  })
})

describe('PATCH /api/v1/menu-items/:id', () => {
  let itemId: string

  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/v1/restaurants/${restaurantId}/menu-items`)
      .send({ name: 'To Update', price: 5 })
    itemId = res.body.id
  })

  it('updates a menu item', async () => {
    const res = await request(app).patch(`/api/v1/menu-items/${itemId}`).send({ isAvailable: false })
    expect(res.status).toBe(200)
    expect(res.body.isAvailable).toBe(false)
  })
})

describe('DELETE /api/v1/menu-items/:id', () => {
  let itemId: string

  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/v1/restaurants/${restaurantId}/menu-items`)
      .send({ name: 'To Delete', price: 5 })
    itemId = res.body.id
  })

  it('deletes a menu item and returns 204', async () => {
    const res = await request(app).delete(`/api/v1/menu-items/${itemId}`)
    expect(res.status).toBe(204)
  })

  it('returns 404 for already-deleted item', async () => {
    const res = await request(app).delete(`/api/v1/menu-items/${itemId}`)
    expect(res.status).toBe(404)
  })
})
