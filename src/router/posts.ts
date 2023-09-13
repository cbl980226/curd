import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { nanoid } from 'nanoid'
import { t, protectedProcedure } from '@/trpc/trpc'
import { ROLE, type Post } from '@prisma/client'
import db from '@/db'

const postZodObject = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  published: z.boolean(),
  authorId: z.string()
})

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
        authorId: z.string().optional()
      })
    )
    .output(
      z.object({
        posts: z.array(postZodObject)
      })
    )
    .query(async ({ input, ctx }) => {
      let posts: Post[] = await db.post.findMany()

      if (input.authorId) {
        if (ctx.user.id === input.authorId || ctx.user.role === ROLE.ADMIN) {
          posts = posts.filter(post => {
            return post.authorId === input.authorId
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
            return post.authorId === ctx.user.id
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
        post: postZodObject
      })
    )
    .query(async ({ input, ctx }) => {
      const post = await db.post.findUnique({
        where: {
          id: input.id
        }
      })

      if (!post) {
        throw new TRPCError({
          message: 'Post not found',
          code: 'NOT_FOUND'
        })
      }
      if (post.authorId !== ctx.user.id && ctx.user.role !== ROLE.ADMIN) {
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
        title: z.string().min(1).max(50),
        content: z.string().max(140).optional()
      })
    )
    .output(
      z.object({
        post: postZodObject
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await db.post.create({
        data: {
          id: nanoid(),
          title: input.title,
          content: input.content,
          authorId: ctx.user.id
        }
      })

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
        content: z.string().max(140).optional()
      })
    )
    .output(
      z.object({
        post: postZodObject
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await db.post.findUnique({
        where: {
          id: input.id
        }
      })

      if (!post) {
        throw new TRPCError({
          message: 'Post not found',
          code: 'NOT_FOUND'
        })
      }
      if (post.authorId !== ctx.user.id && ctx.user.role !== ROLE.ADMIN) {
        throw new TRPCError({
          message: 'Cannot edit post owned by other user',
          code: 'FORBIDDEN'
        })
      }

      const updatedPost = await db.post.update({
        where: {
          id: input.id
        },
        data: {
          content: input.content
        }
      })

      return { post: updatedPost }
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
    .output(
      z.object({
        post: postZodObject
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await db.post.findUnique({
        where: {
          id: input.id
        }
      })

      if (!post) {
        throw new TRPCError({
          message: 'Post not found',
          code: 'NOT_FOUND'
        })
      }
      if (post.authorId !== ctx.user.id && ctx.user.role !== ROLE.ADMIN) {
        throw new TRPCError({
          message: 'Cannot delete post owned by other user',
          code: 'FORBIDDEN'
        })
      }

      const deletedPost = await db.post.delete({
        where: {
          id: input.id
        }
      })

      return { post: deletedPost }
    })
})
