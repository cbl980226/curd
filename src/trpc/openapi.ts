import { generateOpenApiDocument } from 'trpc-openapi'
import { appRouter } from '@/router/_app'
import { ENDPOINT_OPENAPI } from '@/constants/endpoint'

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Example CRUD API',
  description: 'OpenAPI compliant REST API built using tRPC with Express',
  version: '0.0.0',
  baseUrl: ENDPOINT_OPENAPI,
  docsUrl: 'https://github.com/jlalmes/trpc-openapi'
})
