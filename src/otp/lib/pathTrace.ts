import type { DeviceSpec, TerminalIdfId } from '../data/devices';
import { FIBER_CABLES } from '../data/fiber';
import { DISTRIBUTION_RACKS } from '../data/racks';
import { getSubsystemById, type Subsystem } from '../data/subsystems';
import { evaluateLastMile } from './lastMile';

export const FIBER_PROPAGATION_US_PER_KM = 5.0; // ~200,000 km/s in silica glass (n ≈ 1.468)
export const COPPER_PROPAGATION_US_PER_KM = 5.0; // ~0.66c in Cat6A

export interface PathTraceHop {
  step: number;
  from: string;
  to: string;
  medium: 'cobre-cat6a-poe' | 'fibra-os2' | 'backplane';
  distance_m: number;
  vrf: string;
  ringLabel: string;
  propagationLatency_us: number;
}

export interface PathTraceResult {
  device: DeviceSpec;
  subsystem: Subsystem;
  hops: PathTraceHop[];
  totalDistance_m: number;
  totalPropagationLatency_us: number;
  primaryPathSummary: { es: string; en: string };
  backupPathSummary: { es: string; en: string };
  path3D: [number, number, number][];
}

function dist2D(a: readonly [number, number], b: readonly [number, number]): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function findTerminalRingDistanceToN1(idfId: TerminalIdfId): {
  dist_m: number;
  viaPoints: [number, number][];
} {
  const pts = FIBER_CABLES.DISTRIB_TERMINAL.points_cad;
  // DISTRIB_TERMINAL order: [0] N1 -> [1] R1_T -> [2] R2_T -> [3] R3_T -> [4] R4_T -> [5] R5_T -> [6] R6_T -> [7] N2
  const idxMap: Record<TerminalIdfId, number> = {
    R1_T: 1,
    R2_T: 2,
    R3_T: 3,
    R4_T: 4,
    R5_T: 5,
    R6_T: 6,
  };
  const targetIdx = idxMap[idfId];
  let sum = 0;
  const viaPoints: [number, number][] = [];
  for (let i = targetIdx; i > 0; i -= 1) {
    sum += dist2D(pts[i], pts[i - 1]);
    viaPoints.push([pts[i][0], pts[i][1]]);
  }
  viaPoints.push([pts[0][0], pts[0][1]]);
  return { dist_m: sum, viaPoints };
}

/**
 * Computes the complete end-to-end Path Trace from any terminal device to its
 * central server in MDF-A (N1), plus the failover backup path via N2 -> MDF-B (N5).
 */
export function buildDevicePathTrace(device: DeviceSpec): PathTraceResult {
  const subsystem = getSubsystemById(device.subsystemId);
  const lastMile = evaluateLastMile(device);
  const idfRack = DISTRIBUTION_RACKS.find((r) => r.id === device.idfId)!;
  const distToN1 = findTerminalRingDistanceToN1(device.idfId);

  const ringLabelPrimary = `Anillo ${subsystem.ring.primary}`;
  const hops: PathTraceHop[] = [
    {
      step: 1,
      from: device.id,
      to: `${device.idfId} (SW-${device.idfId})`,
      medium: lastMile.media === 'fibra' ? 'fibra-os2' : 'cobre-cat6a-poe',
      distance_m: lastMile.orthogonalDistance_m,
      vrf: subsystem.vrf,
      ringLabel: 'Acceso',
      propagationLatency_us: Number(
        ((lastMile.orthogonalDistance_m / 1000) * FIBER_PROPAGATION_US_PER_KM).toFixed(3),
      ),
    },
    {
      step: 2,
      from: `SW-${device.idfId}`,
      to: 'N1 (MDF-A Core Switch)',
      medium: 'fibra-os2',
      distance_m: Number(distToN1.dist_m.toFixed(1)),
      vrf: subsystem.vrf,
      ringLabel: 'Dist. Terminal',
      propagationLatency_us: Number(
        ((distToN1.dist_m / 1000) * FIBER_PROPAGATION_US_PER_KM).toFixed(3),
      ),
    },
    {
      step: 3,
      from: 'N1 (MDF-A)',
      to: `Servidor ${subsystem.id.toUpperCase()} / Réplica MDF-B (N5)`,
      medium: 'fibra-os2',
      distance_m: 12.0,
      vrf: subsystem.vrf,
      ringLabel: ringLabelPrimary,
      propagationLatency_us: Number(
        ((12.0 / 1000) * FIBER_PROPAGATION_US_PER_KM).toFixed(3),
      ),
    },
  ];

  const totalDistance_m = Number(
    hops.reduce((acc, h) => acc + h.distance_m, 0).toFixed(1),
  );
  const totalPropagationLatency_us = Number(
    hops.reduce((acc, h) => acc + h.propagationLatency_us, 0).toFixed(3),
  );

  // Combine 3D path from device -> IDF -> Terminal distribution waypoints -> N1
  const path3D: [number, number, number][] = [
    ...lastMile.path3D.slice().reverse(),
    ...distToN1.viaPoints.slice(1).map(
      (pt) => [pt[0], 3.2, -pt[1]] as [number, number, number],
    ),
  ];

  const backupRing = subsystem.ring.backup;

  return {
    device,
    subsystem,
    hops,
    totalDistance_m,
    totalPropagationLatency_us,
    primaryPathSummary: {
      es: `${device.id} → ${idfRack.id} → Anillo Terminal → N1 (MDF-A) · ${subsystem.vrf} (Anillo ${subsystem.ring.primary})`,
      en: `${device.id} → ${idfRack.id} → Terminal Ring → N1 (MDF-A) · ${subsystem.vrf} (Ring ${subsystem.ring.primary})`,
    },
    backupPathSummary: {
      es: `Ante corte hacia N1: ERPS (<50 ms) conmuta por el anillo Terminal hacia N2 (Llegadas) y sube al Anillo ${backupRing} rumbo a MDF-B (N5).`,
      en: `On uplink cut to N1: ERPS (<50 ms) fails over via Terminal Ring to N2 (Arrivals) and rides Core Ring ${backupRing} to MDF-B (N5).`,
    },
    path3D,
  };
}
