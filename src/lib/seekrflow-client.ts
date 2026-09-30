import type { SessionSummary } from './measurement-buffer'

const API_KEY = import.meta.env.VITE_SEEKR_API_KEY as string
const MODEL = (import.meta.env.VITE_SEEKR_MODEL as string) || 'meta-llama/Llama-3.3-70B-Instruct'

const SYSTEM_PROMPT = `You are a cycling biomechanics coach. You analyze knee angle measurements captured from video of a cyclist on a trainer or road bike.

You will receive a JSON summary of knee angle measurements from a session. Your job is to interpret the data and provide actionable coaching.

Key biomechanics reference points for knee angle (measured as the interior angle at the knee between hip-knee-ankle):
- At bottom dead center (BDC, leg most extended): optimal range is 140-150 degrees. Below 135 suggests saddle too low. Above 155 suggests saddle too high.
- At top dead center (TDC, leg most flexed): typically 65-80 degrees. Below 60 may indicate excessive compression.
- The range of motion through a pedal stroke should be roughly 70-75 degrees.
- These ranges come from established bike fitting methodology (Retul, BIKEFIT, IBFI).

When interpreting:
- State what the numbers show before making recommendations.
- Qualify confidence: if many frames had low confidence or were unavailable, note that the data quality limits your conclusions.
- If the angle range (max - min) is small, the rider may not be completing full pedal strokes, or the camera angle may not capture the full range of motion.
- Be specific about what adjustments to try and why.
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

  if (summary.angleStats) {
    parts.push(`\n## Knee Angle Statistics (${summary.side} leg)`)
    parts.push(`- Minimum: ${summary.angleStats.min.toFixed(1)}°`)
    parts.push(`- Maximum: ${summary.angleStats.max.toFixed(1)}°`)
    parts.push(`- Mean: ${summary.angleStats.mean.toFixed(1)}°`)
    parts.push(`- Range: ${summary.angleStats.range.toFixed(1)}°`)
  }

  if (summary.samples.length > 0) {
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
