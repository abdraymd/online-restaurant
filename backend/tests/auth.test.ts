import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/lib/prisma'

const app = createApp()

const testEmail = `test_auth_${Date.now()}@example.com`
const testPassword = 'password123'
const testName = 'Test User'

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'test_auth_' } } })
  await prisma.$disconnect()
})

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: testName, email: testEmail, password: testPassword })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe(testEmail)
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it('returns 409 on duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: testName, email: testEmail, password: testPassword })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('returns 400 on invalid body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: '123' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' })
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: testPassword })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/v1/auth/me', () => {
  it('returns current user when authenticated', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword })
    const token = loginRes.body.token

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.email).toBe(testEmail)
    expect(res.body.passwordHash).toBeUndefined()
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me')
    expect(res.status).toBe(401)
  })
})
