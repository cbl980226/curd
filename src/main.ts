import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { createOpenApiExpressMiddleware } from 'trpc-openapi'
import { expressHandler } from 'trpc-playground/handlers/express'
import swaggerUi from 'swagger-ui-express'
import { createContext } from '@/trpc/trpc'
import { openApiDocument } from '@/trpc/openapi'
import { appRouter } from '@/router/index'

const host = process.env.HOST ?? 'localhost'
const port = process.env.PORT ? Number(process.env.PORT) : 3000

const app = express()

const ENDPOINT_TRPC = '/trpc'
const ENDPOINT_TRPC_PLAYGROUND = '/trpc-playground'
const ENDPOINT_OPENAPI = '/api'

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
app.use('/', swaggerUi.serve)
app.get('/', swaggerUi.setup(openApiDocument))

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`)
})
