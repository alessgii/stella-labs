import { FIBER_CABLES } from '../data/fiber';
import { DISTRIBUTION_RACKS } from '../data/racks';
import type { CadPoint } from './coords';

export type IntrusionEventType = 'climb' | 'cut' | 'dig' | 'walk';

export interface BackscatterSample {
  distance_m: number;
  intensity_dB: number;
}

export interface DasIntrusionAnalysis {
  interrogatorNodeId: 'N5';
  totalFiberLength_m: number;
  arcDistance_m: number;
  snappedPoint_cad: CadPoint;
  segmentIndex: number;
  eventType: IntrusionEventType;
  nearestCctvRackId: string;
  nearestCctvPos_cad: CadPoint;
  cameraAzimuthRad: number;
  roundTripLightTime_us: number;
  waveform: BackscatterSample[];
}

// Speed of light in OS2 silica core ~200,000 km/s => round-trip (2x distance) is ~10 us/km
const OTDR_ROUND_TRIP_US_PER_KM = 10.0;

/**
 * Projects a 2D CAD click point onto the DISTRIB_PERIMETRO polyline (2,485.58 m),
 * computes exact arc-length distance from the Interrogator at MDF-B (N5),
 * generates the Rayleigh backscatter waveform, and slews the nearest perimeter CCTV.
 */
export function analyzePerimeterIntrusion(
  click_cad: CadPoint,
  eventType: IntrusionEventType = 'climb',
): DasIntrusionAnalysis {
  const poly = FIBER_CABLES.DISTRIB_PERIMETRO.points_cad;
  let bestDistToSeg = Infinity;
  let bestSnap: CadPoint = poly[0];
  let bestArcDist = 0;
  let bestSegIdx = 0;

  let cumulativeArc = 0;
  for (let i = 0; i < poly.length - 1; i += 1) {
    const a = poly[i];
    const b = poly[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const segLenSq = dx * dx + dy * dy;
    const segLen = Math.sqrt(segLenSq);

    const t =
      segLenSq > 0
        ? Math.max(0, Math.min(1, ((click_cad[0] - a[0]) * dx + (click_cad[1] - a[1]) * dy) / segLenSq))
        : 0;
    const proj: CadPoint = [a[0] + t * dx, a[1] + t * dy];
    const dist = Math.hypot(click_cad[0] - proj[0], click_cad[1] - proj[1]);

    if (dist < bestDistToSeg) {
      bestDistToSeg = dist;
      bestSnap = [Number(proj[0].toFixed(2)), Number(proj[1].toFixed(2))];
      bestArcDist = cumulativeArc + t * segLen;
      bestSegIdx = i;
    }

    cumulativeArc += segLen;
  }

  const arcDistance_m = Number(bestArcDist.toFixed(1));
  const totalFiberLength_m = Number(cumulativeArc.toFixed(2));

  // Find nearest perimeter rack R1_P..R6_P hosting a perimeter PTZ camera
  const perimRacks = DISTRIBUTION_RACKS.filter((r) => r.ring === 'DISTRIB_PERIMETRO');
  let nearestRack = perimRacks[0];
  let minCamDist = Infinity;
  for (const r of perimRacks) {
    const d = Math.hypot(bestSnap[0] - r.x_cad, bestSnap[1] - r.y_cad);
    if (d < minCamDist) {
      minCamDist = d;
      nearestRack = r;
    }
  }

  const cameraAzimuthRad = Math.atan2(
    bestSnap[1] - nearestRack.y_cad,
    bestSnap[0] - nearestRack.x_cad,
  );

  const roundTripLightTime_us = Number(
    ((arcDistance_m / 1000) * OTDR_ROUND_TRIP_US_PER_KM).toFixed(2),
  );

  // Build 40-point Rayleigh backscatter intensity waveform across 0..totalFiberLength_m
  const peakDb =
    eventType === 'cut' ? 38 : eventType === 'climb' ? 31 : eventType === 'dig' ? 27 : 19;
  const waveform: BackscatterSample[] = [];
  const sampleCount = 40;
  for (let i = 0; i <= sampleCount; i += 1) {
    const d = Number(((i / sampleCount) * totalFiberLength_m).toFixed(0));
    const delta = Math.abs(d - arcDistance_m);
    const spike = peakDb * Math.exp(-(delta * delta) / (2 * 65 * 65));
    const baseline = 4.0 + Math.sin(i * 1.7) * 0.8;
    waveform.push({
      distance_m: d,
      intensity_dB: Number((baseline + spike).toFixed(1)),
    });
  }

  return {
    interrogatorNodeId: 'N5',
    totalFiberLength_m,
    arcDistance_m,
    snappedPoint_cad: bestSnap,
    segmentIndex: bestSegIdx,
    eventType,
    nearestCctvRackId: nearestRack.id,
    nearestCctvPos_cad: [nearestRack.x_cad, nearestRack.y_cad],
    cameraAzimuthRad,
    roundTripLightTime_us,
    waveform,
  };
}
