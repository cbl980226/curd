import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { createOpenApiExpressMiddleware } from 'trpc-openapi'
import { expressHandler } from 'trpc-playground/handlers/express'
import swaggerUi from 'swagger-ui-express'
import { createContext } from '@/trpc/trpc'
import { openApiDocument } from '@/trpc/openapi'
import { appRouter } from '@/router/_app'
import {
  ENDPOINT_OPENAPI,
  ENDPOINT_SWAGGER,
  ENDPOINT_TRPC,
  ENDPOINT_TRPC_PLAYGROUND
} from './constants/endpoint'

export const app = express()

app.use(express.static('public'))

// Handle incoming OpenAPI requests
app.use(ENDPOINT_OPENAPI, createOpenApiExpressMiddleware({ router: appRouter, createContext }))
// Handle incoming tRPC requests
app.use(ENDPOINT_TRPC, createExpressMiddleware({ router: appRouter, createContext }))
// Handle incoming tRPC Playground requests
expressHandler({
  trpcApiEndpoint: ENDPOINT_TRPC,
  playgroundEndpoint: ENDPOINT_TRPC_PLAYGROUND,
  router: appRouter
}).then(handler => {
  app.use(handler)
})

// Serve Swagger UI with our OpenAPI schema
app.use(ENDPOINT_SWAGGER, swaggerUi.serve)
app.get(ENDPOINT_SWAGGER, swaggerUi.setup(openApiDocument))
