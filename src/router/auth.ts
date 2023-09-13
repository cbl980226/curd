import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { nanoid } from 'nanoid'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { t, publicProcedure } from '@/trpc/trpc'
import { ROLE } from '@prisma/client'
import db from '@/db'

export const authRouter = t.router({
  register: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register',
        tags: ['auth'],
        summary: 'Register as a new user'
      }
    })
    .input(
      z
        .object({
          name: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(4),
          confirmPassword: z.string(),
          role: z.enum([ROLE.ADMIN, ROLE.NORMAL]).default(ROLE.NORMAL)
        })
        .refine(data => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword']
        })
    )
    .output(
      z.object({
        user: z.object({
          id: z.string(),
          name: z.string().min(3),
          email: z.string().email(),
          role: z.enum([ROLE.ADMIN, ROLE.NORMAL])
        })
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({
        where: {
          email: input.email
        }
      })

      if (user) {
        throw new TRPCError({
          message: 'User with email already exists',
          code: 'UNAUTHORIZED'
        })
      }

      try {
        const hash = await bcrypt.hash(input.password, 10)
        const newUser = await db.user.create({
          data: {
            id: nanoid(),
            name: input.name,
            email: input.email,
            password: hash
          }
        })
        delete newUser.password
        return { user: { ...newUser } }
      } catch (error) {
        console.error(error)
      }
    }),
  login: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login',
        tags: ['auth'],
        summary: 'Login as an existing user'
      }
    })
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(4)
      })
    )
    .output(
      z.object({
        token: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({
        where: {
          email: input.email
        }
      })

      if (!user) {
        throw new TRPCError({
          message: 'User with email not found',
          code: 'UNAUTHORIZED'
        })
      }
      const passwordCompareResult = await bcrypt.compare(input.password, user.password)
      if (!passwordCompareResult) {
        throw new TRPCError({
          message: 'Password was incorrect',
          code: 'UNAUTHORIZED'
        })
      }

      return {
        token: jwt.sign(user.id, process.env.JWT_SECRET)
      }
    })
})
