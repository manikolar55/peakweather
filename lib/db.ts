import { neon } from '@neondatabase/serverless'
import { PrismaNeonHTTP } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client/edge'

// Lazy singleton — deferred so build-time imports with no DATABASE_URL don't throw.
let _client: PrismaClient | undefined

function getClient(): PrismaClient {
  if (_client) return _client

  const url = process.env.DATABASE_URL ?? ''
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    // No valid Neon URL (e.g., local build without .env.local).
    // Return a bare PrismaClient that will throw only when a query executes.
    // Pages that try to pre-render DB data must wrap queries in try/catch.
    _client = new PrismaClient({ log: ['error'] })
    return _client
  }

  const sql = neon(url)
  const adapter = new PrismaNeonHTTP(sql)
  _client = new PrismaClient({ adapter, log: ['error'] })
  return _client
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    return (getClient() as any)[prop]
  },
})
