import { generateOpenApiDocument } from 'trpc-openapi'
import { appRouter } from '../router/_app'

const port = process.env.PORT ? Number(process.env.PORT) : 3000

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Example CRUD API',
  description: 'OpenAPI compliant REST API built using tRPC with Express',
  version: '0.0.0',
  baseUrl: `http://localhost:${port}/api`,
  docsUrl: 'https://github.com/jlalmes/trpc-openapi'
})
