import type { CadPoint } from '../lib/coords';
import {
  PIER_OUTER_POLYGON,
  rectFromCorners,
  rectToPolygon,
} from './buildings';

export type FloorId = 'GF' | 'F1';
export type FloorViewMode = 'GF' | 'F1' | 'BOTH';

export interface FloorSpec {
  id: FloorId;
  elevation_m: number;
  label: { es: string; en: string };
  shortLabel: { es: string; en: string };
}

export const FLOORS: Record<FloorId, FloorSpec> = {
  GF: {
    id: 'GF',
    elevation_m: 0.0,
    label: { es: 'Planta Baja', en: 'Ground Floor' },
    shortLabel: { es: 'PB', en: 'GF' },
  },
  F1: {
    id: 'F1',
    elevation_m: 6.0,
    label: { es: 'Primer Piso', en: 'First Floor' },
    shortLabel: { es: 'P1', en: 'F1' },
  },
};

export interface FloorSlabSpec {
  id: string;
  buildingId: string;
  floor: FloorId;
  polygon: readonly CadPoint[];
}

// Ground Floor slabs cover the full footprint of all terminal buildings
// First Floor slabs cover Departures mezzanine (D-06), Gallery, Neck, Arrivals, and Pier
export const FLOOR_SLABS: FloorSlabSpec[] = [
  // GF Slabs
  {
    id: 'slab-departures-gf',
    buildingId: 'departures',
    floor: 'GF',
    polygon: rectToPolygon(rectFromCorners(0.7, -206.46, 89.3, -0.7)),
  },
  {
    id: 'slab-gallery-gf',
    buildingId: 'gallery',
    floor: 'GF',
    polygon: rectToPolygon(rectFromCorners(50.7, -334.91, 89.3, -207.86)),
  },
  {
    id: 'slab-neck-gf',
    buildingId: 'neck',
    floor: 'GF',
    polygon: rectToPolygon(rectFromCorners(90.7, -238.3, 114.95, -192.7)),
  },
  {
    id: 'slab-arrivals-gf',
    buildingId: 'arrivals',
    floor: 'GF',
    polygon: rectToPolygon(rectFromCorners(40.7, -427.91, 118.2, -336.31)),
  },
  {
    id: 'slab-arrivals-south-gf',
    buildingId: 'arrivals_south',
    floor: 'GF',
    polygon: rectToPolygon(rectFromCorners(65.7, -515.3, 102.3, -429.31)),
  },
  {
    id: 'slab-pier-gf',
    buildingId: 'pier',
    floor: 'GF',
    polygon: PIER_OUTER_POLYGON,
  },
  {
    id: 'slab-cargo-gf',
    buildingId: 'cargo',
    floor: 'GF',
    polygon: rectToPolygon(rectFromCorners(169.8, 50.7, 258.4, 79.3)),
  },
  {
    id: 'slab-ssei-gf',
    buildingId: 'ssei',
    floor: 'GF',
    polygon: rectToPolygon(rectFromCorners(425.8, 33.2, 544.4, 96.8)),
  },

  // F1 Slabs (y = +6.0 m)
  // Departures F1 mezzanine leaves the north check-in atrium open (Decision D-06)
  {
    id: 'slab-departures-f1',
    buildingId: 'departures',
    floor: 'F1',
    polygon: [
      [35.0, -85.0],
      [89.3, -85.0],
      [89.3, -206.46],
      [35.0, -206.46],
    ],
  },
  {
    id: 'slab-gallery-f1',
    buildingId: 'gallery',
    floor: 'F1',
    polygon: rectToPolygon(rectFromCorners(50.7, -334.91, 89.3, -207.86)),
  },
  {
    id: 'slab-neck-f1',
    buildingId: 'neck',
    floor: 'F1',
    polygon: rectToPolygon(rectFromCorners(90.7, -238.3, 114.95, -192.7)),
  },
  {
    id: 'slab-arrivals-f1',
    buildingId: 'arrivals',
    floor: 'F1',
    polygon: rectToPolygon(rectFromCorners(40.7, -427.91, 118.2, -336.31)),
  },
  {
    id: 'slab-pier-f1',
    buildingId: 'pier',
    floor: 'F1',
    polygon: PIER_OUTER_POLYGON,
  },
];
