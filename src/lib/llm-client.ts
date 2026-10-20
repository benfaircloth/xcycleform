import type { CapturedFrame, SessionSummary } from './measurement-buffer'

const API_KEY = import.meta.env.VITE_LLM_API_KEY as string
const MODEL = (import.meta.env.VITE_LLM_MODEL as string) || 'Qwen/Qwen2.5-VL-32B-Instruct'

const SYSTEM_PROMPT = `You are a cycling biomechanics coach. You analyze knee angle measurements and video frames captured from a cyclist on a trainer or road bike.

You will receive structured per-pedal-stroke data with BDC (bottom dead center) and TDC (top dead center) angles, plus key video frames captured at those moments. Your job is to interpret both the numbers and what you see in the frames to provide actionable coaching.

Key biomechanics reference points for knee angle (measured as the interior angle at the knee between hip-knee-ankle):
- At BDC (leg most extended): optimal range is 140-150 degrees. Below 135 suggests saddle too low. Above 155 suggests saddle too high.
- At TDC (leg most flexed): typically 65-80 degrees. Below 60 may indicate excessive hip compression.
- Range of motion (ROM) per pedal stroke should be roughly 70-75 degrees.
- Cadence for steady riding is typically 80-100 RPM; below 60 may indicate high gear or low effort.
- These ranges come from established bike fitting methodology (Retul, BIKEFIT, IBFI).

Important: The knee angle is measured from a 2D side-view camera using pose estimation landmarks. The hip landmark is at the greater trochanter, not the true hip joint center, which can inflate the measured angle by 10-15 degrees. Account for this systematic bias when interpreting numbers near reference boundaries.

When analyzing video frames:
- Look at hand/wrist placement on the handlebars (drops, hoods, tops).
- Assess elbow bend and arm tension.
- Evaluate trunk angle and back flatness.
- Note head/neck position.
- Check for lateral sway or asymmetry if visible.
- Observe ankle angle and foot position on the pedals.
- Note any visible equipment issues (saddle tilt, cleat position if visible).

When interpreting:
- Prioritize the per-cycle BDC/TDC data over raw aggregate statistics.
- Report what the numbers and images show before making recommendations.
- Compare actual values to reference ranges with specific numbers.
- Acknowledge the 2D measurement bias when readings are near boundaries.
- Be specific about what adjustments to try and expected magnitude.
- If the data or images are insufficient, say so.`

export interface CoachingResponse {
  content: string
  model: string
  tokensUsed: number
}

export async function getCoaching(summary: SessionSummary): Promise<CoachingResponse> {
  if (!API_KEY) {
    throw new Error('VITE_LLM_API_KEY not set. Add it to .env file.')
  }

  const userContent = buildUserContent(summary)

  const response = await fetch('/api/llm/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LLM API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const choice = data.choices?.[0]

  return {
    content: choice?.message?.content ?? 'No response generated.',
    model: data.model ?? MODEL,
    tokensUsed: data.usage?.total_tokens ?? 0,
  }
}

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

function buildUserContent(summary: SessionSummary): ContentPart[] | string {
  const textParts = formatSummaryText(summary)

  if (summary.capturedFrames.length === 0) {
    return textParts
  }

  const parts: ContentPart[] = []
  parts.push({ type: 'text', text: textParts })

  const bdcFrames = summary.capturedFrames.filter((f) => f.type === 'bdc')
  const tdcFrames = summary.capturedFrames.filter((f) => f.type === 'tdc')

  if (bdcFrames.length > 0) {
    parts.push({
      type: 'text',
      text: `\n## BDC Frames (leg most extended)\nThe following ${bdcFrames.length} frame(s) were captured at bottom dead center:`,
    })
    for (const frame of bdcFrames) {
      parts.push({
        type: 'text',
        text: `BDC at ${frame.timestampS.toFixed(2)}s, knee angle: ${frame.angle.toFixed(1)}°`,
      })
      parts.push({
        type: 'image_url',
        image_url: { url: frame.dataUrl },
      })
    }
  }

  if (tdcFrames.length > 0) {
    parts.push({
      type: 'text',
      text: `\n## TDC Frames (leg most flexed)\nThe following ${tdcFrames.length} frame(s) were captured at top dead center:`,
    })
    for (const frame of tdcFrames) {
      parts.push({
        type: 'text',
        text: `TDC at ${frame.timestampS.toFixed(2)}s, knee angle: ${frame.angle.toFixed(1)}°`,
      })
      parts.push({
        type: 'image_url',
        image_url: { url: frame.dataUrl },
      })
    }
  }

  parts.push({
    type: 'text',
    text: '\nPlease interpret the measurements and video frames together to provide coaching recommendations.',
  })

  return parts
}

function formatSummaryText(summary: SessionSummary): string {
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

  return parts.join('\n')
}
