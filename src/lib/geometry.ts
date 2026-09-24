export interface Point2D {
  x: number
  y: number
}

/**
 * Angle at vertex B in the triangle A-B-C, in degrees.
 * Returns the interior angle at B formed by rays BA and BC.
 */
export function angleDeg(a: Point2D, b: Point2D, c: Point2D): number {
  const ba = { x: a.x - b.x, y: a.y - b.y }
  const bc = { x: c.x - b.x, y: c.y - b.y }

  const dot = ba.x * bc.x + ba.y * bc.y
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y)
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y)

  if (magBA === 0 || magBC === 0) return 0

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)))
  return (Math.acos(cosAngle) * 180) / Math.PI
}

export interface KneeAngleResult {
  angle: number | null
  status: 'valid' | 'low_confidence' | 'unavailable'
  hipConfidence: number
  kneeConfidence: number
  ankleConfidence: number
  reason?: string
}

export function computeKneeAngle(
  hip: Point2D & { visibility: number },
  knee: Point2D & { visibility: number },
  ankle: Point2D & { visibility: number },
  confidenceThreshold: number,
): KneeAngleResult {
  const hipConf = hip.visibility
  const kneeConf = knee.visibility
  const ankleConf = ankle.visibility

  const base = { hipConfidence: hipConf, kneeConfidence: kneeConf, ankleConfidence: ankleConf }

  const belowThreshold = []
  if (hipConf < confidenceThreshold) belowThreshold.push('hip')
  if (kneeConf < confidenceThreshold) belowThreshold.push('knee')
  if (ankleConf < confidenceThreshold) belowThreshold.push('ankle')

  if (belowThreshold.length > 0) {
    const allBelowMinimum = belowThreshold.some(
      (name) => {
        const conf = name === 'hip' ? hipConf : name === 'knee' ? kneeConf : ankleConf
        return conf < 0.3
      },
    )

    if (allBelowMinimum) {
      return {
        ...base,
        angle: null,
        status: 'unavailable',
        reason: `insufficient ${belowThreshold.join(', ')} landmark confidence`,
      }
    }

    const angle = angleDeg(hip, knee, ankle)
    return {
      ...base,
      angle,
      status: 'low_confidence',
      reason: `low confidence on ${belowThreshold.join(', ')} (below ${confidenceThreshold})`,
    }
  }

  const angle = angleDeg(hip, knee, ankle)
  return { ...base, angle, status: 'valid' }
}
