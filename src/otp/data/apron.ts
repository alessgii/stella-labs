import type { CadPoint } from '../lib/coords';
import { rectFromCorners, rectToPolygon } from './buildings';

// 4.8 Aeronautical surfaces & landside roadways (Y_3D = 0.0 / -0.05)
export const APRON_1_OUTLINE: readonly CadPoint[] = [
  [118.0, -15.0],
  [450.0, -15.0],
  [505.0, -150.0],
  [505.0, -440.0],
  [140.0, -440.0],
];

// Closed polygon derived directly from the Apron 1 outline for rendering the concrete slab
export const APRON_1_POLYGON: readonly CadPoint[] = [
  [118.0, -15.0],
  [450.0, -15.0],
  [505.0, -150.0],
  [505.0, -440.0],
  [140.0, -440.0],
  [118.0, -239.0],
];

export const TAXIWAY_L: readonly [CadPoint, CadPoint] = [
  [140.0, -75.0],
  [450.0, -50.0],
];

export const TAXIWAY_K: readonly [CadPoint, CadPoint] = [
  [180.0, -340.0],
  [450.0, -315.0],
];

export const BULEVARDUL_AEROPORTULUI: readonly [CadPoint, CadPoint] = [
  [105.0, 125.0],
  [600.0, 125.0],
];

// Schematic landside context slabs matching PNG (Decision D-07)
export const LANDSIDE_PARKING_ZONES: {
  id: string;
  label: { es: string; en: string };
  polygon: readonly CadPoint[];
  labelCad: CadPoint;
}[] = [
  {
    id: 'parking-north',
    label: { es: 'ESTACIONAMIENTO', en: 'PARKING' },
    polygon: rectToPolygon(rectFromCorners(-52.0, -195.0, -12.0, -25.0)),
    labelCad: [-32.0, -110.0],
  },
  {
    id: 'parking-south',
    label: { es: 'ESTACIONAMIENTO', en: 'PARKING' },
    polygon: rectToPolygon(rectFromCorners(-42.0, -505.0, 28.0, -435.0)),
    labelCad: [-7.0, -470.0],
  },
];

// Schematic landside access road connecting Departures and Arrivals frontages
export const LANDSIDE_ROAD_PATH: readonly CadPoint[] = [
  [-55.0, -10.0],
  [-6.0, -10.0],
  [-6.0, -220.0],
  [32.0, -335.0],
  [32.0, -445.0],
  [-45.0, -445.0],
];
