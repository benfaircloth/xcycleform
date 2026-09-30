import type { SessionSummary } from './measurement-buffer'

const API_KEY = import.meta.env.VITE_SEEKR_API_KEY as string
const MODEL = (import.meta.env.VITE_SEEKR_MODEL as string) || 'meta-llama/Llama-3.3-70B-Instruct'

const SYSTEM_PROMPT = `You are a cycling biomechanics coach. You analyze knee angle measurements captured from video of a cyclist on a trainer or road bike.

You will receive structured data including per-pedal-stroke cycle analysis with BDC (bottom dead center) and TDC (top dead center) angles. Your job is to interpret the data and provide actionable coaching.

Key biomechanics reference points for knee angle (measured as the interior angle at the knee between hip-knee-ankle):
- At BDC (leg most extended): optimal range is 140-150 degrees. Below 135 suggests saddle too low. Above 155 suggests saddle too high.
- At TDC (leg most flexed): typically 65-80 degrees. Below 60 may indicate excessive hip compression.
- Range of motion (ROM) per pedal stroke should be roughly 70-75 degrees.
- Cadence for steady riding is typically 80-100 RPM; below 60 may indicate high gear or low effort.
- These ranges come from established bike fitting methodology (Retul, BIKEFIT, IBFI).

When interpreting:
- Prioritize the per-cycle BDC/TDC data over raw aggregate statistics. The per-cycle data is the primary evidence.
- Report what the numbers show before making recommendations.
- Compare actual values to reference ranges with specific numbers (e.g., "BDC avg 156° is 6° above the 150° upper bound").
- If cycle-to-cycle variation is high, note inconsistency as a separate finding.
- Qualify confidence: if many frames had low confidence, were unavailable, or were discarded, note that data quality limits conclusions.
- Be specific about what adjustments to try and expected magnitude (e.g., "lower saddle 5-10mm").
- If the data is insufficient to draw conclusions, say so. Do not speculate beyond what the measurements support.`

export interface CoachingResponse {
  content: string
  model: string
  tokensUsed: number
}

export async function getCoaching(summary: SessionSummary): Promise<CoachingResponse> {
  if (!API_KEY) {
    throw new Error('VITE_SEEKR_API_KEY not set. Add it to .env file.')
  }

  const userMessage = formatSummaryForLLM(summary)

  const response = await fetch('/api/seekrflow/inference/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`SeekrFlow API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const choice = data.choices?.[0]

  return {
    content: choice?.message?.content ?? 'No response generated.',
    model: data.model ?? MODEL,
    tokensUsed: data.usage?.total_tokens ?? 0,
  }
}

function formatSummaryForLLM(summary: SessionSummary): string {
  const parts: string[] = []

  parts.push(`## Session Measurement Summary`)
  parts.push(`- Side tracked: ${summary.side}`)
  parts.push(`- Duration: ${summary.durationS.toFixed(1)}s`)
  parts.push(`- Total frames: ${summary.frameCount}`)
  parts.push(`- Valid frames: ${summary.validFrames}`)
  parts.push(`- Low confidence frames: ${summary.lowConfidenceFrames}`)
  parts.push(`- Unavailable frames: ${summary.unavailableFrames}`)
  parts.push(`- Discarded frames (outside 30-170° plausible range): ${summary.discardedFrames}`)

  if (summary.pedalStrokes) {
    const ps = summary.pedalStrokes
    parts.push(`\n## Pedal Stroke Analysis (${ps.count} complete cycles detected)`)
    parts.push(`- Average BDC angle: ${ps.avgBdcAngle.toFixed(1)}°`)
    parts.push(`- Average TDC angle: ${ps.avgTdcAngle.toFixed(1)}°`)
    parts.push(`- Average ROM: ${ps.avgRom.toFixed(1)}°`)
    parts.push(`- Average cadence: ${ps.avgCadenceRpm.toFixed(0)} RPM`)

    parts.push(`\n### Per-cycle detail`)
    parts.push(`| Cycle | BDC (°) | TDC (°) | ROM (°) | Cadence (RPM) |`)
    parts.push(`|-------|---------|---------|---------|---------------|`)
    for (let i = 0; i < ps.cycles.length; i++) {
      const c = ps.cycles[i]
      parts.push(`| ${i + 1} | ${c.bdcAngle.toFixed(1)} | ${c.tdcAngle.toFixed(1)} | ${c.rom.toFixed(1)} | ${c.cadenceRpm.toFixed(0)} |`)
    }
  }

  if (summary.angleStats) {
    parts.push(`\n## Raw Angle Statistics (${summary.side} leg, all frames)`)
    parts.push(`- Minimum: ${summary.angleStats.min.toFixed(1)}°`)
    parts.push(`- Maximum: ${summary.angleStats.max.toFixed(1)}°`)
    parts.push(`- Mean: ${summary.angleStats.mean.toFixed(1)}°`)
    parts.push(`- Range: ${summary.angleStats.range.toFixed(1)}°`)
  }

  if (!summary.pedalStrokes && summary.samples.length > 0) {
    const sampledPoints = downsample(summary.samples, 20)
    parts.push(`\n## Sample readings (${sampledPoints.length} of ${summary.samples.length} frames)`)
    parts.push(`| Time (s) | Angle (°) | Status |`)
    parts.push(`|----------|-----------|--------|`)
    for (const s of sampledPoints) {
      parts.push(`| ${s.timestampS.toFixed(2)} | ${s.angle.toFixed(1)} | ${s.status} |`)
    }
  }

  parts.push(`\nPlease interpret these measurements and provide coaching recommendations.`)

  return parts.join('\n')
}

function downsample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr
  const step = (arr.length - 1) / (n - 1)
  return Array.from({ length: n }, (_, i) => arr[Math.round(i * step)])
}
