import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/lib/prisma'

const app = createApp()

const prefix = `test_rest_${Date.now()}`

afterAll(async () => {
  await prisma.restaurant.deleteMany({ where: { name: { startsWith: 'test_rest_' } } })
  await prisma.$disconnect()
})

describe('GET /api/v1/restaurants', () => {
  it('returns paginated list', async () => {
    const res = await request(app).get('/api/v1/restaurants')
    expect(res.status).toBe(200)
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.meta).toMatchObject({ page: 1, limit: 20 })
  })
})

describe('POST /api/v1/restaurants', () => {
  it('creates a restaurant', async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .send({ name: `${prefix}_A`, address: '1 Test St' })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeTruthy()
    expect(res.body.name).toBe(`${prefix}_A`)
  })

  it('returns 400 on missing required fields', async () => {
    const res = await request(app).post('/api/v1/restaurants').send({ name: 'No Address' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/restaurants/:id', () => {
  let restaurantId: string

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .send({ name: `${prefix}_B`, address: '2 Test St' })
    restaurantId = res.body.id
  })

  it('returns restaurant with menuItems', async () => {
    const res = await request(app).get(`/api/v1/restaurants/${restaurantId}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(restaurantId)
    expect(res.body.menuItems).toBeInstanceOf(Array)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/v1/restaurants/nonexistent_id')
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/v1/restaurants/:id', () => {
  let restaurantId: string

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .send({ name: `${prefix}_C`, address: '3 Test St' })
    restaurantId = res.body.id
  })

  it('updates a restaurant', async () => {
    const res = await request(app)
      .patch(`/api/v1/restaurants/${restaurantId}`)
      .send({ isOpen: false })
    expect(res.status).toBe(200)
    expect(res.body.isOpen).toBe(false)
  })
})

describe('DELETE /api/v1/restaurants/:id', () => {
  let restaurantId: string

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/restaurants')
      .send({ name: `${prefix}_D`, address: '4 Test St' })
    restaurantId = res.body.id
  })

  it('deletes a restaurant and returns 204', async () => {
    const res = await request(app).delete(`/api/v1/restaurants/${restaurantId}`)
    expect(res.status).toBe(204)
  })

  it('returns 404 for already-deleted restaurant', async () => {
    const res = await request(app).delete(`/api/v1/restaurants/${restaurantId}`)
    expect(res.status).toBe(404)
  })
})
