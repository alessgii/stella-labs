import type { DeviceSpec } from '../data/devices';
import { getSubsystemById, type SubsystemId } from '../data/subsystems';
import { evaluateLastMile } from './lastMile';

export type UplinkSpeedGbps = 1 | 10 | 100;
export type TrafficLightStatus = 'green' | 'yellow' | 'red';

export interface SubsystemBandwidthBreakdown {
  subsystemId: SubsystemId;
  deviceCount: number;
  copperCount: number;
  fiberCount: number;
  bitrateMbpsPerDevice: number;
  subtotalMbps: number;
}

export interface IdfSizingSummary {
  idfId: string;
  totalDevices: number;
  copperDevices: number;
  fiberDevices: number;
  totalBandwidthMbps: number;
  uplinkGbps: UplinkSpeedGbps;
  utilizationPct: number;
  status: TrafficLightStatus;
  breakdown: SubsystemBandwidthBreakdown[];
  recommendation: { es: string; en: string };
}

/**
 * Computes IDF aggregate bandwidth utilization against its uplink capacity
 * using the same 80% threshold rule as Mode B core rings.
 */
export function calculateIdfSizing(
  idfId: string,
  devices: readonly DeviceSpec[],
  uplinkGbps: UplinkSpeedGbps = 1,
): IdfSizingSummary {
  const idfDevices = devices.filter((d) => d.idfId === idfId);
  const grouped = new Map<
    SubsystemId,
    { count: number; copper: number; fiber: number }
  >();

  let copperDevices = 0;
  let fiberDevices = 0;

  for (const dev of idfDevices) {
    const lm = evaluateLastMile(dev);
    const entry = grouped.get(dev.subsystemId) ?? {
      count: 0,
      copper: 0,
      fiber: 0,
    };
    entry.count += 1;
    if (lm.media === 'fibra') {
      entry.fiber += 1;
      fiberDevices += 1;
    } else {
      entry.copper += 1;
      copperDevices += 1;
    }
    grouped.set(dev.subsystemId, entry);
  }

  const breakdown: SubsystemBandwidthBreakdown[] = [];
  let totalBandwidthMbps = 0;

  for (const [subsystemId, stats] of grouped.entries()) {
    const sub = getSubsystemById(subsystemId);
    const bitrate = sub.assumptions.bitrateMbpsPerDevice ?? 1;
    const subtotalMbps = Number((stats.count * bitrate).toFixed(2));
    totalBandwidthMbps += subtotalMbps;
    breakdown.push({
      subsystemId,
      deviceCount: stats.count,
      copperCount: stats.copper,
      fiberCount: stats.fiber,
      bitrateMbpsPerDevice: bitrate,
      subtotalMbps,
    });
  }

  breakdown.sort((a, b) => b.subtotalMbps - a.subtotalMbps);

  const uplinkMbps = uplinkGbps * 1000;
  const utilizationPct = Number(
    ((totalBandwidthMbps / uplinkMbps) * 100).toFixed(1),
  );

  let status: TrafficLightStatus = 'green';
  if (utilizationPct > 80) {
    status = 'red';
  } else if (utilizationPct >= 50) {
    status = 'yellow';
  }

  const recommendation =
    status === 'red'
      ? {
          es: `Supera el umbral del 80 % (${utilizationPct}%). Sube el enlace de subida a ${uplinkGbps === 1 ? '10G' : '100G'} o reparte equipos hacia un IDF vecino.`,
          en: `Exceeds the 80% threshold (${utilizationPct}%). Upgrade uplink to ${uplinkGbps === 1 ? '10G' : '100G'} or rebalance endpoints to an adjacent IDF.`,
        }
      : status === 'yellow'
        ? {
            es: `Carga moderada (${utilizationPct}%). Aceptable ahora, pero conviene prever crecimiento o subida a ${uplinkGbps === 1 ? '10G' : '100G'}.`,
            en: `Moderate load (${utilizationPct}%). Acceptable now, plan future headroom or ${uplinkGbps === 1 ? '10G' : '100G'} uplink.`,
          }
        : {
            es: `Dimensionamiento holgado (${utilizationPct}% < 50 %). Margen amplio para crecimiento y ráfagas.`,
            en: `Healthy sizing (${utilizationPct}% < 50%). Ample headroom for growth and bursts.`,
          };

  return {
    idfId,
    totalDevices: idfDevices.length,
    copperDevices,
    fiberDevices,
    totalBandwidthMbps: Number(totalBandwidthMbps.toFixed(1)),
    uplinkGbps,
    utilizationPct,
    status,
    breakdown,
    recommendation,
  };
}
