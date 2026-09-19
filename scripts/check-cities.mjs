import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
config({ path: '.env' })

const sql = neon(process.env.DATABASE_URL)

const terms = ['hunza','naran','abbottabad','mingora','kalam','balakot','nathia','shogran','malam','mansehra','besham','swat','astore','khaplu','shigar','kumrat','mahodand','chilas','phander','ghizer','passu','gulmit','gilgit','skardu']

for (const t of terms) {
  const rows = await sql`SELECT name, population, slug FROM "City" WHERE "asciiName" ILIKE ${`%${t}%`} AND country='PK' LIMIT 3`
  if (rows.length) console.log(t + ':', rows.map(x => x.name + '(pop:' + x.population + ')').join(', '))
  else console.log(t + ': *** MISSING ***')
}
