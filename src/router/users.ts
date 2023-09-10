import { z } from 'zod'
import { t, protectedAdminProcedure } from '@/trpc/trpc'
import { TRPCError } from '@trpc/server'
import db from '@/db'
import { ROLE } from '@prisma/client'

export const usersRouter = t.router({
  getUsers: protectedAdminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users',
        tags: ['users'],
        protect: true,
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
    .query(async () => {
      const users = await db.user.findMany()

      return { users }
    }),
  getUserById: protectedAdminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/{id}',
        tags: ['users'],
        protect: true,
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
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: {
          id: input.id
        }
      })

      if (!user) {
        throw new TRPCError({
          message: 'User not found',
          code: 'NOT_FOUND'
        })
      }

      return { user }
    })
})
