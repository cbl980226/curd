import axios from 'axios'
import { ROLE } from '@prisma/client'
import type { RouterOutput } from 'e2e/src/helpers/trpc'

describe('POST /auth/register', () => {
  it('should register successful', async () => {
    const res = await axios.post<RouterOutput['auth']['register']>(`/auth/register`, {
      name: 'Test',
      email: 'test@example.com',
      password: 'test',
      confirmPassword: 'test'
    })

    expect(res.status).toBe(200)
    expect(res.data.user.name).toBe('Test')
    expect(res.data.user.email).toBe('test@example.com')
    expect(res.data.user.role).toBe(ROLE.NORMAL)
  })
})
