/**
 * Thin query layer over the Neon HTTP client.
 *
 * Replaces the Prisma adapter setup that triggered `[unenv] fs.readdir is not
 * implemented yet!` inside Cloudflare Workers.  All queries go through the
 * `neon` tagged-template SQL driver from `@neondatabase/serverless`, which
 * works in any edge / Workers runtime.
 *
 * The exported `db` object exposes the same five namespaces — city, trek,
 * trekVerdict, weatherCache, oWMDailyCounter — with the same method
 * signatures used across the codebase so that no call-site changes are needed.
 */

import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// ---------------------------------------------------------------------------
// Types that mirror the Prisma model shapes
// ---------------------------------------------------------------------------

export interface Trek {
  id: string
  slug: string
  name: string
  country: string
  region: string
  lat: number
  lon: number
  trailheadElevation: number
  summitElevation: number
  difficulty: string
  durationDays: number
  description: string
  popular: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TrekVerdict {
  id: string
  trekId: string
  verdict: string
  createdAt: Date
  expiresAt: Date
}

export interface TrekWithVerdict extends Trek {
  verdict: TrekVerdict | null
}

export interface WeatherCache {
  key: string
  data: string
  fetchedAt: Date
  expiresAt: Date
  lastModified: string | null
}

export interface City {
  id: number
  name: string
  asciiName: string
  country: string
  countryName: string
  lat: number
  lon: number
  population: number
  timezone: string
  admin1: string | null
  slug: string
}

export interface OWMDailyCounter {
  date: string
  count: number
}

// ---------------------------------------------------------------------------
// Raw-row mappers (DB column names → camelCase model fields)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTrek(row: any): Trek {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    country: row.country,
    region: row.region,
    lat: Number(row.lat),
    lon: Number(row.lon),
    trailheadElevation: Number(row.trailheadElevation),
    summitElevation: Number(row.summitElevation),
    difficulty: row.difficulty,
    durationDays: Number(row.durationDays),
    description: row.description,
    popular: Boolean(row.popular),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTrekVerdict(row: any): TrekVerdict {
  return {
    id: row.id,
    trekId: row.trekId,
    verdict: row.verdict,
    createdAt: new Date(row.createdAt),
    expiresAt: new Date(row.expiresAt),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCity(row: any): City {
  return {
    id: Number(row.id),
    name: row.name,
    asciiName: row.asciiName,
    country: row.country,
    countryName: row.countryName,
    lat: Number(row.lat),
    lon: Number(row.lon),
    population: Number(row.population),
    timezone: row.timezone,
    admin1: row.admin1 ?? null,
    slug: row.slug,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWeatherCache(row: any): WeatherCache {
  return {
    key: row.key,
    data: row.data,
    fetchedAt: new Date(row.fetchedAt),
    expiresAt: new Date(row.expiresAt),
    lastModified: row.lastModified ?? null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOWMDailyCounter(row: any): OWMDailyCounter {
  return {
    date: row.date,
    count: Number(row.count),
  }
}

// ---------------------------------------------------------------------------
// Lazy singleton Neon client
// ---------------------------------------------------------------------------

let _sql: NeonQueryFunction<false, false> | undefined

function getSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql
  const url = process.env.DATABASE_URL ?? ''
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    throw new Error(
      'DATABASE_URL is not set or is not a valid postgres:// URL. ' +
      'Ensure .env.local (dev) or the Cloudflare secret (prod) contains DATABASE_URL.',
    )
  }
  _sql = neon(url)
  return _sql
}

// ---------------------------------------------------------------------------
// Helpers for WHERE clause construction
// ---------------------------------------------------------------------------

/**
 * Escape a string so it can be placed inside a SQL LIKE/ILIKE pattern.
 * Neon's tagged-template handles value parameterisation; this only escapes
 * the three special LIKE metacharacters inside the string value itself.
 */
function escapeLike(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

// ---------------------------------------------------------------------------
// City namespace
// ---------------------------------------------------------------------------

interface CityWhereInput {
  slug?: string
  lat?: { gte?: number; lte?: number }
  lon?: { gte?: number; lte?: number }
  OR?: Array<{
    asciiName?: { contains: string; mode?: string }
    name?: { contains: string; mode?: string }
    countryName?: { contains: string; mode?: string }
  }>
}

interface CityFindManyArgs {
  where?: CityWhereInput
  orderBy?: { population?: 'asc' | 'desc' }
  take?: number
  skip?: number
  select?: { slug?: boolean; population?: boolean }
}

const cityNamespace = {
  async findUnique(args: { where: { slug: string } }): Promise<City | null> {
    const sql = getSql()
    const rows = await sql`
      SELECT id, name, "asciiName", country, "countryName", lat, lon,
             population, timezone, admin1, slug
      FROM   "City"
      WHERE  slug = ${args.where.slug}
      LIMIT  1
    `
    return rows.length ? mapCity(rows[0]) : null
  },

  async findMany(args: CityFindManyArgs = {}): Promise<City[]> {
    const sql = getSql()

    const conditions: string[] = []
    const bindings: unknown[] = []

    if (args.where) {
      const w = args.where

      if (w.lat?.gte !== undefined) {
        bindings.push(w.lat.gte)
        conditions.push(`lat >= $${bindings.length}`)
      }
      if (w.lat?.lte !== undefined) {
        bindings.push(w.lat.lte)
        conditions.push(`lat <= $${bindings.length}`)
      }
      if (w.lon?.gte !== undefined) {
        bindings.push(w.lon.gte)
        conditions.push(`lon >= $${bindings.length}`)
      }
      if (w.lon?.lte !== undefined) {
        bindings.push(w.lon.lte)
        conditions.push(`lon <= $${bindings.length}`)
      }

      if (w.OR && w.OR.length > 0) {
        const orParts: string[] = []
        for (const clause of w.OR) {
          if (clause.asciiName?.contains !== undefined) {
            bindings.push(`%${escapeLike(clause.asciiName.contains)}%`)
            orParts.push(`"asciiName" ILIKE $${bindings.length}`)
          }
          if (clause.name?.contains !== undefined) {
            bindings.push(`%${escapeLike(clause.name.contains)}%`)
            orParts.push(`name ILIKE $${bindings.length}`)
          }
          if (clause.countryName?.contains !== undefined) {
            bindings.push(`%${escapeLike(clause.countryName.contains)}%`)
            orParts.push(`"countryName" ILIKE $${bindings.length}`)
          }
        }
        if (orParts.length) {
          conditions.push(`(${orParts.join(' OR ')})`)
        }
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderBy = args.orderBy?.population
      ? `ORDER BY population ${args.orderBy.population.toUpperCase()}`
      : ''
    const limit = args.take !== undefined ? `LIMIT ${Number(args.take)}` : ''
    const offset = args.skip !== undefined ? `OFFSET ${Number(args.skip)}` : ''

    // Build query via parameterised neon call. Because neon's tagged-template
    // does not support dynamic SQL fragments, we construct the statement as a
    // plain string and pass it with the bindings array via the function call
    // form: sql(query, ...params).
    const query = [
      `SELECT id, name, "asciiName", country, "countryName", lat, lon,`,
      `       population, timezone, admin1, slug`,
      `FROM   "City"`,
      where,
      orderBy,
      limit,
      offset,
    ]
      .filter(Boolean)
      .join('\n')

    const rows = await sql.query(query, bindings)
    return rows.map(mapCity)
  },

  async count(): Promise<number> {
    const sql = getSql()
    const rows = await sql`SELECT COUNT(*)::int AS count FROM "City"`
    return Number(rows[0].count)
  },

  // Relevance-ranked city search: exact > prefix > substring, then population.
  async searchByName(q: string, limit = 5): Promise<City[]> {
    const sql = getSql()
    const escaped = escapeLike(q)
    const rows = await sql.query(
      `SELECT id, name, "asciiName", country, "countryName", lat, lon,
              population, timezone, admin1, slug
       FROM   "City"
       WHERE  "asciiName" ILIKE $1 OR name ILIKE $1 OR "countryName" ILIKE $1
       ORDER BY
         CASE
           WHEN "asciiName" ILIKE $2 OR name ILIKE $2 THEN 0
           WHEN "asciiName" ILIKE $3 OR name ILIKE $3 THEN 1
           ELSE 2
         END,
         population DESC
       LIMIT $4`,
      [`%${escaped}%`, escaped, `${escaped}%`, limit],
    )
    return rows.map(mapCity)
  },
}

// ---------------------------------------------------------------------------
// Trek namespace
// ---------------------------------------------------------------------------

type OrderByField = 'name' | 'popular'
type OrderByDir = 'asc' | 'desc'

interface TrekWhereInput {
  popular?: boolean
  OR?: Array<{
    name?: { contains: string; mode?: string }
    country?: { contains: string; mode?: string }
    region?: { contains: string; mode?: string }
  }>
}

interface TrekFindManyArgs<TInclude = false> {
  where?: TrekWhereInput
  include?: { verdict?: boolean }
  select?: { slug?: boolean; updatedAt?: boolean }
  orderBy?: { name?: OrderByDir; popular?: OrderByDir } | Array<{ name?: OrderByDir; popular?: OrderByDir }>
  take?: number
}

// Overloaded return type: when include.verdict is set, return TrekWithVerdict[],
// otherwise Trek[].  We use a single implementation and cast at the boundaries
// to keep things simple while preserving the Prisma-compatible generics used
// by the callers (the generic parameter is only for TS type-level compatibility).
const trekNamespace = {
  async findUnique<TArgs extends { where: { slug: string }; include?: { verdict?: boolean } }>(
    args: TArgs,
  ): Promise<(TArgs extends { include: { verdict: true } } ? TrekWithVerdict : Trek) | null> {
    const sql = getSql()

    const trekRows = await sql`
      SELECT id, slug, name, country, region, lat, lon,
             "trailheadElevation", "summitElevation", difficulty,
             "durationDays", description, popular, "createdAt", "updatedAt"
      FROM   "Trek"
      WHERE  slug = ${args.where.slug}
      LIMIT  1
    `
    if (!trekRows.length) return null

    const trek = mapTrek(trekRows[0])

    if (!args.include?.verdict) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return trek as any
    }

    const verdictRows = await sql`
      SELECT id, "trekId", verdict, "createdAt", "expiresAt"
      FROM   "TrekVerdict"
      WHERE  "trekId" = ${trek.id}
      LIMIT  1
    `
    const verdict = verdictRows.length ? mapTrekVerdict(verdictRows[0]) : null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { ...trek, verdict } as any
  },

  async findMany<TArgs extends TrekFindManyArgs>(
    args: TArgs = {} as TArgs,
  ): Promise<TArgs extends { include: { verdict: true } } ? TrekWithVerdict[] : Trek[]> {
    const sql = getSql()

    const conditions: string[] = []
    const bindings: unknown[] = []

    if (args.where) {
      const w = args.where
      if (w.popular !== undefined) {
        bindings.push(w.popular)
        conditions.push(`popular = $${bindings.length}`)
      }
      if (w.OR && w.OR.length > 0) {
        const orParts: string[] = []
        for (const clause of w.OR) {
          if (clause.name?.contains !== undefined) {
            bindings.push(`%${escapeLike(clause.name.contains)}%`)
            orParts.push(`name ILIKE $${bindings.length}`)
          }
          if (clause.country?.contains !== undefined) {
            bindings.push(`%${escapeLike(clause.country.contains)}%`)
            orParts.push(`country ILIKE $${bindings.length}`)
          }
          if (clause.region?.contains !== undefined) {
            bindings.push(`%${escapeLike(clause.region.contains)}%`)
            orParts.push(`region ILIKE $${bindings.length}`)
          }
        }
        if (orParts.length) {
          conditions.push(`(${orParts.join(' OR ')})`)
        }
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // Normalise orderBy to an array
    const orderByInput = args.orderBy
      ? Array.isArray(args.orderBy)
        ? args.orderBy
        : [args.orderBy]
      : []

    const orderClauses: string[] = []
    for (const ob of orderByInput) {
      if (ob.popular !== undefined) orderClauses.push(`popular ${ob.popular.toUpperCase()}`)
      if (ob.name !== undefined) orderClauses.push(`name ${ob.name.toUpperCase()}`)
    }
    const orderBy = orderClauses.length ? `ORDER BY ${orderClauses.join(', ')}` : ''
    const limit = args.take !== undefined ? `LIMIT ${Number(args.take)}` : ''

    // Determine which columns to fetch
    const selectAll = !args.select
    const wantSlug = selectAll || args.select?.slug
    const wantUpdatedAt = selectAll || args.select?.updatedAt

    let selectClause: string
    if (selectAll) {
      selectClause =
        `id, slug, name, country, region, lat, lon,` +
        ` "trailheadElevation", "summitElevation", difficulty,` +
        ` "durationDays", description, popular, "createdAt", "updatedAt"`
    } else {
      const cols: string[] = []
      if (!selectAll && args.select?.slug) cols.push('slug')
      if (!selectAll && args.select?.updatedAt) cols.push('"updatedAt"')
      // Always include id when include.verdict is requested, so we can join
      if (args.include?.verdict) cols.push('id')
      selectClause = cols.join(', ')
    }

    const query = [
      `SELECT ${selectClause}`,
      `FROM   "Trek"`,
      where,
      orderBy,
      limit,
    ]
      .filter(Boolean)
      .join('\n')

    const trekRows = await sql.query(query, bindings)

    if (args.select) {
      // Partial select — return lightweight objects without full mapping
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return trekRows.map((r: any) => ({
        ...(wantSlug ? { slug: r.slug } : {}),
        ...(wantUpdatedAt ? { updatedAt: new Date(r.updatedAt) } : {}),
      })) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    const treks = trekRows.map(mapTrek)

    if (!args.include?.verdict) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return treks as any
    }

    if (!treks.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return [] as any
    }

    // Fetch all verdicts for the returned treks in one query
    const trekIds = treks.map((t) => t.id)
    const verdictQuery = `
      SELECT id, "trekId", verdict, "createdAt", "expiresAt"
      FROM   "TrekVerdict"
      WHERE  "trekId" = ANY($1)
    `
    const verdictRows = await sql.query(verdictQuery, [trekIds])
    const verdictMap = new Map<string, TrekVerdict>(
      verdictRows.map((r) => [r.trekId as string, mapTrekVerdict(r)]),
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return treks.map((t) => ({ ...t, verdict: verdictMap.get(t.id) ?? null })) as any
  },
}

// ---------------------------------------------------------------------------
// TrekVerdict namespace
// ---------------------------------------------------------------------------

interface TrekVerdictUpsertArgs {
  where: { trekId: string }
  update: { verdict: string; expiresAt: Date }
  create: { trekId: string; verdict: string; expiresAt: Date }
}

const trekVerdictNamespace = {
  async upsert(args: TrekVerdictUpsertArgs): Promise<TrekVerdict> {
    const sql = getSql()
    const rows = await sql`
      INSERT INTO "TrekVerdict" (id, "trekId", verdict, "createdAt", "expiresAt")
      VALUES (
        gen_random_uuid()::text,
        ${args.create.trekId},
        ${args.create.verdict},
        NOW(),
        ${args.create.expiresAt.toISOString()}
      )
      ON CONFLICT ("trekId") DO UPDATE
        SET verdict    = EXCLUDED.verdict,
            "expiresAt" = EXCLUDED."expiresAt"
      RETURNING id, "trekId", verdict, "createdAt", "expiresAt"
    `
    return mapTrekVerdict(rows[0])
  },
}

// ---------------------------------------------------------------------------
// WeatherCache namespace
// ---------------------------------------------------------------------------

interface WeatherCacheUpsertArgs {
  where: { key: string }
  update: {
    data: string
    expiresAt: Date
    lastModified: string | null | undefined
    fetchedAt: Date
  }
  create: {
    key: string
    data: string
    expiresAt: Date
    lastModified: string | null | undefined
  }
}

interface WeatherCacheUpdateArgs {
  where: { key: string }
  data: { expiresAt: Date }
}

const weatherCacheNamespace = {
  async findUnique(args: { where: { key: string } }): Promise<WeatherCache | null> {
    const sql = getSql()
    const rows = await sql`
      SELECT key, data, "fetchedAt", "expiresAt", "lastModified"
      FROM   "WeatherCache"
      WHERE  key = ${args.where.key}
      LIMIT  1
    `
    return rows.length ? mapWeatherCache(rows[0]) : null
  },

  async upsert(args: WeatherCacheUpsertArgs): Promise<WeatherCache> {
    const sql = getSql()
    const rows = await sql`
      INSERT INTO "WeatherCache" (key, data, "fetchedAt", "expiresAt", "lastModified")
      VALUES (
        ${args.create.key},
        ${args.create.data},
        NOW(),
        ${args.create.expiresAt.toISOString()},
        ${args.create.lastModified ?? null}
      )
      ON CONFLICT (key) DO UPDATE
        SET data           = EXCLUDED.data,
            "fetchedAt"    = ${args.update.fetchedAt.toISOString()},
            "expiresAt"    = EXCLUDED."expiresAt",
            "lastModified" = EXCLUDED."lastModified"
      RETURNING key, data, "fetchedAt", "expiresAt", "lastModified"
    `
    return mapWeatherCache(rows[0])
  },

  async update(args: WeatherCacheUpdateArgs): Promise<WeatherCache> {
    const sql = getSql()
    const rows = await sql`
      UPDATE "WeatherCache"
      SET    "expiresAt" = ${args.data.expiresAt.toISOString()}
      WHERE  key = ${args.where.key}
      RETURNING key, data, "fetchedAt", "expiresAt", "lastModified"
    `
    if (!rows.length) {
      throw new Error(`WeatherCache row not found for key: ${args.where.key}`)
    }
    return mapWeatherCache(rows[0])
  },
}

// ---------------------------------------------------------------------------
// OWMDailyCounter namespace
// ---------------------------------------------------------------------------

interface OWMDailyCounterUpsertArgs {
  where: { date: string }
  update: { count: { increment: number } }
  create: { date: string; count: number }
}

const owmDailyCounterNamespace = {
  async findUnique(args: { where: { date: string } }): Promise<OWMDailyCounter | null> {
    const sql = getSql()
    const rows = await sql`
      SELECT date, count
      FROM   "OWMDailyCounter"
      WHERE  date = ${args.where.date}
      LIMIT  1
    `
    return rows.length ? mapOWMDailyCounter(rows[0]) : null
  },

  async upsert(args: OWMDailyCounterUpsertArgs): Promise<OWMDailyCounter> {
    const sql = getSql()
    const rows = await sql`
      INSERT INTO "OWMDailyCounter" (date, count)
      VALUES (${args.create.date}, ${args.create.count})
      ON CONFLICT (date) DO UPDATE
        SET count = "OWMDailyCounter".count + ${args.update.count.increment}
      RETURNING date, count
    `
    return mapOWMDailyCounter(rows[0])
  },
}

// ---------------------------------------------------------------------------
// Exported db object
// ---------------------------------------------------------------------------

export const db = {
  city: cityNamespace,
  trek: trekNamespace,
  trekVerdict: trekVerdictNamespace,
  weatherCache: weatherCacheNamespace,
  oWMDailyCounter: owmDailyCounterNamespace,
  $disconnect: async () => { /* no-op — Neon HTTP is stateless */ },
} as const
