import type { CadPoint } from '../lib/coords';
import type { SubsystemId } from './subsystems';

export type NavigableZoneId =
  | 'departures'
  | 'pier'
  | 'arrivals'
  | 'tower'
  | 'ssei'
  | 'cargo'
  | 'airside'
  | 'perimeter';

export interface NavigableZoneSpec {
  id: NavigableZoneId;
  kind: 'building' | 'exterior';
  name: { es: string; en: string };
  role: { es: string; en: string };
  center_cad: CadPoint;
  orthoZoom: number;
  perspectiveOffset: readonly [number, number, number];
  hasFloors: boolean;
  defaultFloor: 'GF' | 'F1';
  coreNodeId?: string;
  dominantDomain: 'IT' | 'OT';
  keySubsystems: readonly SubsystemId[];
  detailPriority: number;
}

export const NAVIGABLE_ZONES: Record<NavigableZoneId, NavigableZoneSpec> = {
  departures: {
    id: 'departures',
    kind: 'building',
    name: { es: 'Salidas', en: 'Departures' },
    role: {
      es: 'Hall de check-in, filtros de seguridad, puertas domésticas 50–57 y cuarto técnico MDF-A (N1).',
      en: 'Check-in hall, security screening, domestic gates 50–57, and MDF-A (N1) tech room.',
    },
    center_cad: [45.0, -103.58],
    orthoZoom: 2.6,
    perspectiveOffset: [-110, 130, 120],
    hasFloors: true,
    defaultFloor: 'GF',
    coreNodeId: 'N1',
    dominantDomain: 'IT',
    keySubsystems: ['fids', 'cupps', 'cctv', 'access_xray', 'wifi_das_cell', 'lighting_dali', 'pa_voip', 'bhs'],
    detailPriority: 1,
  },
  pier: {
    id: 'pier',
    kind: 'building',
    name: { es: 'Muelle de Pasajeros', en: 'Passenger Pier' },
    role: {
      es: 'Corredor de embarque (304 m), 14 fingers (puertas 1–39), lounges y MDF-B (N5).',
      en: 'Boarding concourse (304 m), 14 fingers (gates 1–39), lounges, and MDF-B (N5).',
    },
    center_cad: [268.0, -205.0],
    orthoZoom: 2.1,
    perspectiveOffset: [-150, 150, 170],
    hasFloors: true,
    defaultFloor: 'F1',
    coreNodeId: 'N5',
    dominantDomain: 'IT',
    keySubsystems: ['fids', 'pbb_400hz_pca', 'wifi_das_cell', 'cctv', 'cupps', 'lighting_dali', 'pa_voip'],
    detailPriority: 2,
  },
  arrivals: {
    id: 'arrivals',
    kind: 'building',
    name: { es: 'Llegadas', en: 'Arrivals' },
    role: {
      es: 'Reclamo de equipaje (carruseles 1–6), aduana, transporte terrestre y sala técnica N2.',
      en: 'Baggage claim (carousels 1–6), customs, ground transport, and N2 tech room.',
    },
    center_cad: [79.45, -392.0],
    orthoZoom: 2.7,
    perspectiveOffset: [-110, 125, 125],
    hasFloors: true,
    defaultFloor: 'GF',
    coreNodeId: 'N2',
    dominantDomain: 'OT',
    keySubsystems: ['bhs', 'fids', 'cctv', 'access_xray', 'wifi_das_cell', 'lighting_dali', 'pa_voip'],
    detailPriority: 3,
  },
  tower: {
    id: 'tower',
    kind: 'building',
    name: { es: 'Torre de Control', en: 'Control Tower' },
    role: {
      es: 'Centro ATC (N3), consola ALCMS de luces AGL, interrogador DAS-fibra y doble acometida.',
      en: 'ATC hub (N3), ALCMS airfield lighting console, Fiber-DAS interrogator, and dual duct entry.',
    },
    center_cad: [505.0, -386.67],
    orthoZoom: 4.5,
    perspectiveOffset: [-75, 95, 85],
    hasFloors: false,
    defaultFloor: 'GF',
    coreNodeId: 'N3',
    dominantDomain: 'OT',
    keySubsystems: ['atc_navaids', 'agl', 'das_fiber', 'ssei_substation'],
    detailPriority: 4,
  },
  ssei: {
    id: 'ssei',
    kind: 'building',
    name: { es: 'Nave SSEI y Subestación', en: 'SSEI Fire & Substation' },
    role: {
      es: 'Cuartel de bomberos aeronáuticos, subestación eléctrica IEC 61850 y nodo N6.',
      en: 'Aviation fire station, IEC 61850 electrical substation, and core node N6.',
    },
    center_cad: [485.1, 65.0],
    orthoZoom: 5.2,
    perspectiveOffset: [-65, 75, 75],
    hasFloors: false,
    defaultFloor: 'GF',
    coreNodeId: 'N6',
    dominantDomain: 'OT',
    keySubsystems: ['ssei_substation', 'agl', 'cctv'],
    detailPriority: 5,
  },
  cargo: {
    id: 'cargo',
    kind: 'building',
    name: { es: 'As World Cargo', en: 'As World Cargo' },
    role: {
      es: 'Terminal de carga (10 andenes), nodo N4 y enlace hacia planta de combustible ATEX.',
      en: 'Cargo terminal (10 docks), core node N4, and link to ATEX fuel farm.',
    },
    center_cad: [214.1, 65.0],
    orthoZoom: 6.0,
    perspectiveOffset: [-55, 65, 65],
    hasFloors: false,
    defaultFloor: 'GF',
    coreNodeId: 'N4',
    dominantDomain: 'OT',
    keySubsystems: ['fuel_scada', 'cctv', 'access_xray'],
    detailPriority: 6,
  },
  airside: {
    id: 'airside',
    kind: 'exterior',
    name: { es: 'Zona Airside (Rodajes y AGL)', en: 'Airside Zone (Taxiways & AGL)' },
    role: {
      es: 'Plataforma Apron 1, calles de rodaje L y K, bóvedas CCR (R5_A, R3_A, R2_A) y anillo Airside.',
      en: 'Apron 1, Taxiways L & K, CCR lighting vaults (R5_A, R3_A, R2_A), and Airside ring.',
    },
    center_cad: [380.0, -180.0],
    orthoZoom: 1.45,
    perspectiveOffset: [-260, 290, 290],
    hasFloors: false,
    defaultFloor: 'GF',
    dominantDomain: 'OT',
    keySubsystems: ['agl', 'atc_navaids', 'pbb_400hz_pca', 'fuel_scada'],
    detailPriority: 7,
  },
  perimeter: {
    id: 'perimeter',
    kind: 'exterior',
    name: { es: 'Perímetro (Cerca y DAS-fibra)', en: 'Perimeter (Fence & Fiber-DAS)' },
    role: {
      es: 'Anillo perimetral de 2,485.58 m con sensado acústico distribuido (DAS-fibra) y cámaras.',
      en: '2,485.58 m perimeter ring with Distributed Acoustic Sensing (Fiber-DAS) and cameras.',
    },
    center_cad: [280.0, -180.0],
    orthoZoom: 1.05,
    perspectiveOffset: [-340, 390, 390],
    hasFloors: false,
    defaultFloor: 'GF',
    dominantDomain: 'OT',
    keySubsystems: ['das_fiber', 'cctv', 'atc_navaids'],
    detailPriority: 8,
  },
};

export const NAVIGABLE_ZONE_LIST: NavigableZoneSpec[] = Object.values(
  NAVIGABLE_ZONES,
).sort((a, b) => a.detailPriority - b.detailPriority);

export function resolveNavigableZoneId(buildingId: string): NavigableZoneId | null {
  if (buildingId in NAVIGABLE_ZONES) return buildingId as NavigableZoneId;
  if (buildingId === 'arrivals_south') return 'arrivals';
  if (buildingId === 'gallery' || buildingId === 'neck') return 'departures';
  return null;
}
