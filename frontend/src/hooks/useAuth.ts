import { useMutation, useQuery } from '@tanstack/react-query'
import { login, register, getMe } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string
      email: string
      password: string
    }) => register(name, email, password),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
    },
  })
}

export function useMe() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!token,
    retry: false,
  })
}
