/**
 * Download and import all populated places from GeoNames allCountries dump.
 * Includes cities, towns, villages, colonies, sectors, cantonments (PPLX), etc.
 * ~1.5M records worldwide.
 *
 * Uses raw SQL INSERT batches (not Prisma transactions) for Neon reliability.
 *
 * Usage:  npm run db:seed:cities
 */

import { config } from 'dotenv'
config()

import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { createWriteStream, createReadStream } from 'fs'
import { unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { createInterface } from 'readline'
import { execSync } from 'child_process'

neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

const GEONAMES_URL     = 'https://download.geonames.org/export/dump/allCountries.zip'
const COUNTRY_INFO_URL = 'https://download.geonames.org/export/dump/countryInfo.txt'

const ALLOWED_CODES = new Set([
  'PPL',   // populated place
  'PPLX',  // section of populated place (colony, sector, cantonment, neighbourhood)
  'PPLA',  // seat of first-order admin div (state capital)
  'PPLA2', // seat of second-order admin div
  'PPLA3', // seat of third-order admin div
  'PPLA4', // seat of fourth-order admin div
  'PPLC',  // capital of a political entity
  'PPLL',  // populated locality
  'PPLS',  // populated places
  'PPLR',  // religious populated place
  'PPLG',  // seat of government of a political entity
])

const COUNTRY_NAMES: Record<string, string> = {}

async function loadCountryNames(): Promise<void> {
  try {
    const res = await fetch(COUNTRY_INFO_URL)
    if (!res.ok) return
    const text = await res.text()
    for (const line of text.split('\n')) {
      if (line.startsWith('#') || !line.trim()) continue
      const cols = line.split('\t')
      if (cols.length >= 5) COUNTRY_NAMES[cols[0]] = cols[4]
    }
  } catch { /* non-fatal */ }
}

function buildSlug(asciiName: string, countryCode: string): string {
  return (
    asciiName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') +
    '-' + countryCode.toLowerCase()
  )
}

async function downloadAndExtract(): Promise<string> {
  const zipPath = join(tmpdir(), 'allCountries.zip')
  const txtPath = join(tmpdir(), 'allCountries.txt')

  console.log('Downloading allCountries.zip from GeoNames (~350 MB)...')
  const res = await fetch(GEONAMES_URL)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)

  let downloaded = 0
  await new Promise<void>((resolve, reject) => {
    const ws2 = createWriteStream(zipPath)
    const reader = res.body!.getReader()
    const pump = (): void => {
      reader.read().then(({ done, value }) => {
        if (done) { ws2.end(); return }
        downloaded += value.length
        process.stdout.write(`\rDownloaded: ${(downloaded / 1024 / 1024).toFixed(1)} MB...`)
        ws2.write(value, pump)
      }).catch(reject)
    }
    ws2.on('finish', resolve)
    ws2.on('error', reject)
    pump()
  })
  console.log('\nExtracting...')

  try {
    execSync(`unzip -o "${zipPath}" allCountries.txt -d "${tmpdir()}"`, { stdio: 'pipe' })
  } catch {
    execSync(
      `powershell -Command "Expand-Archive -Force '${zipPath}' '${tmpdir()}'"`,
      { stdio: 'pipe' }
    )
  }

  await unlink(zipPath).catch(() => null)
  return txtPath
}

interface CityRow {
  id: number; name: string; asciiName: string; country: string; countryName: string
  lat: number; lon: number; population: number; timezone: string; slug: string
}

async function flushBatch(batch: CityRow[]): Promise<void> {
  if (!batch.length) return
  // Build a multi-row INSERT with ON CONFLICT DO NOTHING
  // Each row = 10 columns
  const cols = ['id', 'name', '"asciiName"', 'country', '"countryName"', 'lat', 'lon', 'population', 'timezone', 'slug']
  const rows = batch.map((_, i) => {
    const base = i * cols.length
    return `(${cols.map((__, j) => `$${base + j + 1}`).join(',')})`
  })
  const values = batch.flatMap(c => [c.id, c.name, c.asciiName, c.country, c.countryName, c.lat, c.lon, c.population, c.timezone, c.slug])
  await pool.query(
    `INSERT INTO "City" (${cols.join(',')}) VALUES ${rows.join(',')} ON CONFLICT (id) DO NOTHING`,
    values
  )
}

async function importCities(txtPath: string): Promise<void> {
  const rl = createInterface({ input: createReadStream(txtPath), crlfDelay: Infinity })

  const BATCH = 200  // smaller batches = fewer params per query, more Neon-friendly
  let batch: CityRow[] = []
  let total = 0
  let skipped = 0
  const slugSeen = new Set<string>()

  for await (const line of rl) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    if (cols.length < 19) continue

    const featureClass = cols[6]
    const featureCode  = cols[7]
    if (featureClass !== 'P') continue
    if (!ALLOWED_CODES.has(featureCode)) continue

    const id  = parseInt(cols[0], 10)
    const lat = parseFloat(cols[4])
    const lon = parseFloat(cols[5])
    if (isNaN(id) || isNaN(lat) || isNaN(lon)) continue

    const asciiName = (cols[2] || cols[1]).trim()
    if (asciiName.length < 2) continue

    const countryCode = cols[8].toUpperCase()
    const slug = buildSlug(asciiName, countryCode)

    if (slugSeen.has(slug)) { skipped++; continue }
    slugSeen.add(slug)

    const pop = parseInt(cols[14], 10)

    batch.push({
      id,
      name:        cols[1].trim(),
      asciiName,
      country:     countryCode,
      countryName: COUNTRY_NAMES[countryCode] ?? countryCode,
      lat, lon,
      population:  isNaN(pop) ? 0 : pop,
      timezone:    cols[17] || 'UTC',
      slug,
    })

    if (batch.length >= BATCH) {
      await flushBatch(batch)
      total += batch.length
      batch = []
      if (total % 10000 === 0) process.stdout.write(`\rImported: ${total.toLocaleString()} places...`)
    }
  }

  await flushBatch(batch)
  total += batch.length
  console.log(`\nDone. ${total.toLocaleString()} places imported, ${skipped.toLocaleString()} slug duplicates skipped.`)
}

async function main() {
  await loadCountryNames()
  console.log('Clearing existing city records...')
  await pool.query('DELETE FROM "City"')

  const txtPath = await downloadAndExtract()
  await importCities(txtPath)
  await unlink(txtPath).catch(() => null)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => pool.end())
