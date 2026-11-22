import type { DeviceSpec, TerminalIdfId } from '../data/devices';
import { DISTRIBUTION_RACKS } from '../data/racks';
import type { CadPoint } from './coords';

export const COPPER_MAX_DISTANCE_M = 90;

export interface LastMileEvaluation {
  deviceId: string;
  idfId: TerminalIdfId;
  orthogonalDistance_m: number;
  exceeds90m: boolean;
  highEmiOrAtex: boolean;
  media: 'cobre-poe' | 'fibra';
  hasMediaConverter: boolean;
  path3D: [number, number, number][]; // in Three.js coordinates [x, y, z]
}

const IDF_POS_MAP = new Map<string, CadPoint>(
  DISTRIBUTION_RACKS.map((r) => [r.id, [r.x_cad, r.y_cad]]),
);

/**
 * Evaluates the last-mile link from an IDF rack to a terminal device using
 * orthogonal cable-tray routing (not straight line) and enforces the 90 m Cat6A rule.
 */
export function evaluateLastMile(device: DeviceSpec): LastMileEvaluation {
  const idfPos = IDF_POS_MAP.get(device.idfId) ?? [45, -103.58];
  const idfElev = 2.2;
  const trayElevGF = 3.2;
  const trayElevF1 = 9.2;

  const dx = Math.abs(device.pos_cad[0] - idfPos[0]);
  const dy = Math.abs(device.pos_cad[1] - idfPos[1]);
  const verticalRise = device.floor === 'F1' ? trayElevF1 - trayElevGF : 0;
  const dropToDevice = Math.abs(
    (device.floor === 'F1' ? trayElevF1 : trayElevGF) - device.elev_m,
  );
  const riserFromIdf = trayElevGF - idfElev;

  // Orthogonal tray distance: up from IDF to GF tray + N-S/E-W orthogonal legs + F1 riser + vertical drop
  const orthogonalDistance_m =
    riserFromIdf + dx + dy + verticalRise + dropToDevice;

  const exceeds90m = orthogonalDistance_m > COPPER_MAX_DISTANCE_M;
  const highEmiOrAtex = Boolean(device.highEmiOrAtex);
  const needsFiber = exceeds90m || highEmiOrAtex;

  // Build orthogonal 3D polyline in Three.js coordinates [x_cad, elev, -y_cad]
  const path3D: [number, number, number][] = [
    [idfPos[0], idfElev, -idfPos[1]],
    [idfPos[0], trayElevGF, -idfPos[1]],
  ];

  if (device.floor === 'F1') {
    // Route along GF tray to F1 riser at R3_T (75, -162) or direct riser if already at IDF
    path3D.push([idfPos[0], trayElevGF, -device.pos_cad[1]]);
    path3D.push([idfPos[0], trayElevF1, -device.pos_cad[1]]);
    path3D.push([device.pos_cad[0], trayElevF1, -device.pos_cad[1]]);
  } else {
    // Orthogonal L-route along GF ceiling tray
    path3D.push([idfPos[0], trayElevGF, -device.pos_cad[1]]);
    path3D.push([device.pos_cad[0], trayElevGF, -device.pos_cad[1]]);
  }
  path3D.push([device.pos_cad[0], device.elev_m, -device.pos_cad[1]]);

  return {
    deviceId: device.id,
    idfId: device.idfId,
    orthogonalDistance_m: Number(orthogonalDistance_m.toFixed(1)),
    exceeds90m,
    highEmiOrAtex,
    media: needsFiber ? 'fibra' : 'cobre-poe',
    hasMediaConverter: needsFiber,
    path3D,
  };
}
