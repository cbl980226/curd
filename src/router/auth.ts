import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { nanoid } from 'nanoid'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { t, publicProcedure } from '@/trpc/trpc'
import { database } from '@/database/index'
import { ROLE } from '@/constants/role'

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
          role: z.enum([ROLE.ADMIN, ROLE.NORMAL, ROLE.BANNED]).default(ROLE.NORMAL)
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
          role: z.enum([ROLE.ADMIN, ROLE.NORMAL, ROLE.BANNED])
        })
      })
    )
    .mutation(async ({ input }) => {
      let user = database.users.find(_user => _user.email === input.email)

      if (user) {
        throw new TRPCError({
          message: 'User with email already exists',
          code: 'UNAUTHORIZED'
        })
      }

      try {
        const hash = await bcrypt.hash(input.password, 10)
        user = {
          id: nanoid(),
          name: input.name,
          email: input.email,
          password: hash,
          role: input.role || ROLE.NORMAL
        }
        database.users.push(user)
      } catch (error) {
        console.error(error)
      }

      return { user: { id: user.id, email: user.email, name: user.name, role: user.role } }
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
      const user = database.users.find(_user => _user.email === input.email)

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
