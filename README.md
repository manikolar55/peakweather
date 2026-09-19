# PeakWeather

Global weather forecasts + AI-powered GO / NO-GO safety verdicts for 100+ world treks.

**Stack:** Next.js 16 · Prisma 5 · Neon Postgres · Cloudflare Workers · MET Norway · Claude AI

---

## Local development

### 1. Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) account (free) — create a project and copy the connection string

### 2. Environment variables

Create `.env.local` (never commit this):

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

METNO_USER_AGENT="PeakWeather/1.0 your@email.com"
ANTHROPIC_API_KEY="sk-ant-..."
OPENWEATHER_API_KEY="..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
# Push schema to Neon (creates all tables)
npx prisma db push

# Seed treks + starter cities (~150 major cities)
npm run db:seed

# (Optional) Import full GeoNames dataset — 1.5 M cities/colonies, takes 20-30 min
npm run db:seed:cities
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Cloudflare Workers + Neon

### One-time setup

#### A. Neon (database)

1. Go to [neon.tech](https://neon.tech) → create a project → copy the **connection string**
2. Push the schema:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   ```
3. Seed data:
   ```bash
   DATABASE_URL="postgresql://..." npm run db:seed
   DATABASE_URL="postgresql://..." npm run db:seed:cities   # optional, large import
   ```

#### B. Cloudflare account

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) (free)
2. Install Wrangler and log in:
   ```bash
   npx wrangler login
   ```

#### C. Create the KV namespace for weather cache

```bash
npx wrangler kv namespace create WEATHER_CACHE
# prints an id — copy it
```

Edit `wrangler.toml` and replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with that id.

#### D. Set secrets in Cloudflare

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put METNO_USER_AGENT
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put OPENWEATHER_API_KEY
```

#### E. Update `wrangler.toml`

Set `NEXT_PUBLIC_SITE_URL` in `[vars]` to your actual domain or `https://peakweather.<subdomain>.workers.dev`.

### Deploy

```bash
npm run cf:deploy
```

This runs `opennextjs-cloudflare build` then `wrangler deploy`.

> **Windows note:** `@opennextjs/cloudflare` requires symlink support, which Windows restricts by default.
> Enable **Developer Mode** in Windows Settings → System → For Developers, then re-run.
> Alternatively, run the deploy from **WSL** or use **GitHub Actions** (recommended for CI).

### GitHub Actions deploy (recommended)

Create `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma generate
      - run: npm run cf:deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Preview locally with Cloudflare runtime

```bash
npm run cf:preview
```

---

## Cron jobs (verdict refresh)

Trek AI verdicts expire after 4 hours. To pre-warm them, schedule the refresh script.

**GitHub Actions (free)** — create `.github/workflows/refresh-verdicts.yml`:

```yaml
on:
  schedule:
    - cron: '0 */4 * * *'
  workflow_dispatch:

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run refresh-verdicts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## Architecture

```
Cloudflare Workers (nodejs_compat)
  └── @opennextjs/cloudflare
        ├── Next.js server components / API routes
        │     ├── MET Norway → weather data
        │     ├── Cloudflare KV (WEATHER_CACHE) → 30-min weather cache
        │     ├── Neon Postgres → cities, treks, verdicts
        │     └── Claude API → AI trek verdicts (4-hr cache in DB)
        └── Static assets (Cloudflare CDN via ASSETS binding)
```

**Cache strategy:**
- Weather: Cloudflare KV in production (30 min TTL), DB `WeatherCache` in local dev
- Verdicts: Neon `TrekVerdict` table (4 hr TTL)
- Pages: Next.js ISR — city pages 900 s, home 1800 s

---

## Data sources and licences

| Source | Data | Licence |
|---|---|---|
| [MET Norway](https://api.met.no/) | Weather forecasts | CC BY 4.0 |
| [GeoNames](https://www.geonames.org/) | City database | CC BY 4.0 |
| [RainViewer](https://www.rainviewer.com/) | Radar tiles | Free tier |
| [OpenWeatherMap](https://openweathermap.org/) | Air quality | Free 1000/day |
| [Anthropic Claude](https://www.anthropic.com/) | AI verdicts | Pay-per-use |

AI verdicts are for guidance only — not a substitute for local guides or official warnings.
