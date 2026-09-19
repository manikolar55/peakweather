import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { TrekVerdictData } from '@/types'
import type { Trek, WeatherData } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const VerdictSchema = z.object({
  status: z.enum(['GO', 'CAUTION', 'NO-GO']),
  score: z.number().min(0).max(10),
  reasoning: z.string().min(10),
  safestWindow: z.string(),
  bestDay: z.string(),
  risks: z.array(
    z.enum(['lightning', 'wind_chill', 'snow', 'heat', 'low_visibility', 'high_uv', 'rain', 'ice', 'storm', 'altitude_sickness'])
  ),
  packingList: z.array(z.string()),
  generatedAt: z.string(),
})

const SYSTEM_PROMPT = `You are an expert mountain safety advisor and meteorologist specialising in high-altitude trekking.
Your primary responsibility is the safety of trekkers. You must be conservative, especially for high-altitude or technical treks.

Rules:
- If there is any significant risk of lightning, severe storms, whiteout conditions, or extreme wind chill at altitude, default to NO-GO or CAUTION.
- Score 0 = completely unsafe, 10 = perfect conditions.
- A score of 7+ is required for GO status. 5-6 is CAUTION. Below 5 is NO-GO.
- For treks above 5000m, be especially cautious about temperature drops, wind chill, and acclimatisation.
- Your packing list must be specific to the conditions (not generic).
- Always include altitude sickness as a risk for treks with summit elevation above 3500m.
- Return ONLY valid JSON matching the schema. No markdown, no explanation, just the JSON object.`

function buildPrompt(trek: Trek, trailheadWeather: WeatherData, summitWeather: WeatherData): string {
  const today = new Date().toISOString().split('T')[0]
  const summaryHours = trailheadWeather.hourly.time.slice(0, 48)

  return `Trek: ${trek.name}
Country: ${trek.country}, Region: ${trek.region}
Difficulty: ${trek.difficulty}
Trailhead elevation: ${trek.trailheadElevation}m
Summit/highest elevation: ${trek.summitElevation}m
Duration: ${trek.durationDays} days

Today's date: ${today}

=== TRAILHEAD (${trek.trailheadElevation}m) — Current Conditions ===
Temperature: ${trailheadWeather.current.temperature}°C (feels like ${trailheadWeather.current.apparent_temperature}°C)
Wind: ${trailheadWeather.current.windspeed} km/h gusting ${trailheadWeather.current.windgusts} km/h
Visibility: ${trailheadWeather.current.visibility}m
Precipitation: ${trailheadWeather.current.precipitation}mm

=== SUMMIT (${trek.summitElevation}m) — Current Conditions ===
Temperature: ${summitWeather.current.temperature}°C (feels like ${summitWeather.current.apparent_temperature}°C)
Wind: ${summitWeather.current.windspeed} km/h gusting ${summitWeather.current.windgusts} km/h
Visibility: ${summitWeather.current.visibility}m

=== NEXT 7 DAYS — Daily Outlook ===
${trailheadWeather.daily.time.slice(0, 7).map((date, i) => `
${date}: High ${trailheadWeather.daily.temperature_2m_max[i]}°C / Low ${trailheadWeather.daily.temperature_2m_min[i]}°C
  Rain: ${trailheadWeather.daily.precipitation_sum[i]}mm, Wind max: ${trailheadWeather.daily.windspeed_10m_max[i]} km/h, Gusts: ${trailheadWeather.daily.windgusts_10m_max[i]} km/h
  UV: ${trailheadWeather.daily.uv_index_max[i]}, WMO code: ${trailheadWeather.daily.weathercode[i]}
`).join('')}

=== NEXT 24H HOURLY — Trailhead ===
${summaryHours.slice(0, 24).map((t, i) => `${t}: ${trailheadWeather.hourly.temperature_2m[i]}°C, wind ${trailheadWeather.hourly.windspeed_10m[i]}km/h, precip ${trailheadWeather.hourly.precipitation[i]}mm, code ${trailheadWeather.hourly.weathercode[i]}`).join('\n')}

Return a JSON object exactly matching this TypeScript type:
{
  status: "GO" | "CAUTION" | "NO-GO",
  score: number, // 0–10
  reasoning: string, // 2–4 plain-language sentences
  safestWindow: string, // e.g. "Start by 5 AM, off summit by 12 PM"
  bestDay: string, // e.g. "2024-06-15 (Wednesday)"
  risks: Array<"lightning"|"wind_chill"|"snow"|"heat"|"low_visibility"|"high_uv"|"rain"|"ice"|"storm"|"altitude_sickness">,
  packingList: string[], // 5–10 items specific to conditions
  generatedAt: string // ISO date string of now
}`
}

export async function generateTrekVerdict(
  trek: Trek,
  trailheadWeather: WeatherData,
  summitWeather: WeatherData,
): Promise<TrekVerdictData> {
  const prompt = buildPrompt(trek, trailheadWeather, summitWeather)

  async function attempt(): Promise<TrekVerdictData> {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const jsonText = text.startsWith('{') ? text : text.replace(/^```json\s*/, '').replace(/```\s*$/, '')

    const parsed = JSON.parse(jsonText)
    return VerdictSchema.parse({ ...parsed, generatedAt: new Date().toISOString() })
  }

  try {
    return await attempt()
  } catch {
    // Retry once on invalid JSON or validation failure
    return await attempt()
  }
}
