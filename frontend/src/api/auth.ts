import { apiClient } from './client'
import type { AuthResponse, User } from '@/types'

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', { email, password })
  return response.data
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  })
  return response.data
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me')
  return response.data
}
