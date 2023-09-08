import { z } from 'zod'
import { t, protectedAdminProcedure } from '@/trpc/trpc'
import { database } from '@/database/index'
import { TRPCError } from '@trpc/server'
import { ROLE } from '@/constants/role'

export const usersRouter = t.router({
  getUsers: protectedAdminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users',
        tags: ['users'],
        summary: 'Read all users'
      }
    })
    .input(z.void())
    .output(
      z.object({
        users: z.array(
          z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string()
          })
        )
      })
    )
    .query(() => {
      const users = database.users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name
      }))

      return { users }
    }),
  getUserById: protectedAdminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/{id}',
        tags: ['users'],
        summary: 'Read a user by id'
      }
    })
    .input(
      z.object({
        id: z.string()
      })
    )
    .output(
      z.object({
        user: z.object({
          id: z.string(),
          email: z.string().email(),
          name: z.string(),
          role: z.enum([ROLE.ADMIN, ROLE.NORMAL, ROLE.BANNED])
        })
      })
    )
    .query(({ input }) => {
      const user = database.users.find(_user => _user.id === input.id)

      if (!user) {
        throw new TRPCError({
          message: 'User not found',
          code: 'NOT_FOUND'
        })
      }

      return { user }
    })
})
