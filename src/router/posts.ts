import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { nanoid } from 'nanoid'
import { t, protectedProcedure } from '@/trpc/trpc'
import { database, type Post } from '@/database/index'
import { ROLE } from '@/constants/role'

export const postsRouter = t.router({
  getPosts: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/posts',
        tags: ['posts'],
        protect: true,
        summary: 'Read all posts'
      }
    })
    .input(
      z.object({
        userId: z.string().optional()
      })
    )
    .output(
      z.object({
        posts: z.array(
          z.object({
            id: z.string(),
            content: z.string(),
            userId: z.string()
          })
        )
      })
    )
    .query(({ input, ctx }) => {
      let posts: Post[] = database.posts

      if (input.userId) {
        if (ctx.user.role === ROLE.ADMIN) {
          posts = posts.filter(post => {
            return post.userId === input.userId
          })
        } else {
          throw new TRPCError({
            message: 'You must be an admin to read other user posts',
            code: 'FORBIDDEN'
          })
        }
      } else {
        if (ctx.user.role !== ROLE.ADMIN) {
          posts = posts.filter(post => {
            return post.userId === ctx.user.id
          })
        }
      }

      return { posts }
    }),
  getPostById: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/posts/{id}',
        tags: ['posts'],
        protect: true,
        summary: 'Read a post by id'
      }
    })
    .input(
      z.object({
        id: z.string()
      })
    )
    .output(
      z.object({
        post: z.object({
          id: z.string(),
          content: z.string(),
          userId: z.string()
        })
      })
    )
    .query(({ input, ctx }) => {
      const post = database.posts.find(_post => _post.id === input.id)

      if (!post) {
        throw new TRPCError({
          message: 'Post not found',
          code: 'NOT_FOUND'
        })
      }
      if (post.userId !== ctx.user.id && ctx.user.role !== ROLE.ADMIN) {
        throw new TRPCError({
          message: 'Cannot get post owned by other user',
          code: 'FORBIDDEN'
        })
      }

      return { post }
    }),
  createPost: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/posts',
        tags: ['posts'],
        protect: true,
        summary: 'Create a new post'
      }
    })
    .input(
      z.object({
        content: z.string().min(1).max(140)
      })
    )
    .output(
      z.object({
        post: z.object({
          id: z.string(),
          content: z.string(),
          userId: z.string()
        })
      })
    )
    .mutation(({ input, ctx }) => {
      const post: Post = {
        id: nanoid(),
        content: input.content,
        userId: ctx.user.id
      }

      database.posts.push(post)

      return { post }
    }),
  updatePostById: protectedProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/posts/{id}',
        tags: ['posts'],
        protect: true,
        summary: 'Update an existing post'
      }
    })
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1)
      })
    )
    .output(
      z.object({
        post: z.object({
          id: z.string(),
          content: z.string(),
          userId: z.string()
        })
      })
    )
    .mutation(({ input, ctx }) => {
      const post = database.posts.find(_post => _post.id === input.id)

      if (!post) {
        throw new TRPCError({
          message: 'Post not found',
          code: 'NOT_FOUND'
        })
      }
      if (post.userId !== ctx.user.id && ctx.user.role !== ROLE.ADMIN) {
        throw new TRPCError({
          message: 'Cannot edit post owned by other user',
          code: 'FORBIDDEN'
        })
      }

      post.content = input.content

      return { post }
    }),
  deletePostById: protectedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/posts/{id}',
        tags: ['posts'],
        protect: true,
        summary: 'Delete a post'
      }
    })
    .input(
      z.object({
        id: z.string()
      })
    )
    .output(z.boolean())
    .mutation(({ input, ctx }) => {
      const post = database.posts.find(_post => _post.id === input.id)

      if (!post) {
        throw new TRPCError({
          message: 'Post not found',
          code: 'NOT_FOUND'
        })
      }
      if (post.userId !== ctx.user.id && ctx.user.role !== ROLE.ADMIN) {
        throw new TRPCError({
          message: 'Cannot delete post owned by other user',
          code: 'FORBIDDEN'
        })
      }

      database.posts = database.posts.filter(_post => _post !== post)

      return true
    })
})
