import { t } from '@/trpc/trpc'
import { authRouter } from './auth'
import { usersRouter } from './users'
import { postsRouter } from './posts'

export const appRouter = t.router({
  auth: authRouter,
  users: usersRouter,
  posts: postsRouter
})

export type AppRouter = typeof appRouter
