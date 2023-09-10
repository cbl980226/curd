import { type CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { type inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server'
import { type OpenApiMeta } from 'trpc-openapi'
import { nanoid } from 'nanoid'
import jwt from 'jsonwebtoken'
import { ROLE, type User } from '@prisma/client'
import db from '@/db'

// create context for each request
export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const requestId = nanoid()
  res.setHeader('x-request-id', requestId)

  let user: User | null = null

  try {
    if (req.headers['authorization']) {
      const token = req.headers['authorization'].split(' ')[1]
      if (token) {
        const userId = jwt.verify(token, process.env.JWT_SECRET) as string
        if (userId) {
          user = await db.user.findUnique({
            where: {
              id: userId
            }
          })
          delete user.password
        }
      }
    }
  } catch (error) {
    console.error(error)
  }

  return {
    req,
    res,
    user,
    requestId
  }
}

export type Context = inferAsyncReturnType<typeof createContext>

export const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    errorFormatter({ error, shape }) {
      if (error.code === 'INTERNAL_SERVER_ERROR' && process.env.NODE_ENV === 'production') {
        return { ...shape, message: 'Internal server error' }
      }
      return shape
    }
  })

export const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authorized' })
  }
  if (!ctx.user.role) {
    ctx.user.role = ctx.user.role ?? ROLE.NORMAL
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})

export const adminMiddleware = authMiddleware.unstable_pipe(({ ctx, next }) => {
  if (ctx.user.role !== ROLE.ADMIN) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be an admin to perform this action'
    })
  }
  return next({ ctx })
})

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(authMiddleware)
export const protectedAdminProcedure = t.procedure.use(adminMiddleware)
