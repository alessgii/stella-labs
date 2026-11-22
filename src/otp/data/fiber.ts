import type { CadPoint } from '../lib/coords';

export type CoreRingId = 'NUCLEO_ANILLO1_RUTA_A' | 'NUCLEO_ANILLO2_RUTA_B';
export type DistributionRingId =
  | 'DISTRIB_TERMINAL'
  | 'DISTRIB_AIRSIDE'
  | 'DISTRIB_CARGA'
  | 'DISTRIB_PERIMETRO';
export type FiberCableId = CoreRingId | DistributionRingId;

export interface FiberCableSpec {
  id: FiberCableId;
  layer: 'core' | 'distribution';
  name: { es: string; en: string };
  color: string;
  closed: boolean;
  dashed: boolean;
  length_m: number;
  fiberType: 'OS2';
  fiberCount: number; // 72h for core, 24h initial configurable for distribution (Decision D-09)
  uplinkNodes?: readonly [string, string];
  points_cad: readonly CadPoint[];
}

export const FIBER_CABLES: Record<FiberCableId, FiberCableSpec> = {
  NUCLEO_ANILLO1_RUTA_A: {
    id: 'NUCLEO_ANILLO1_RUTA_A',
    layer: 'core',
    name: {
      es: 'Anillo 1 Núcleo — Ruta A (Crítico)',
      en: 'Core Ring 1 — Route A (Critical)',
    },
    color: '#005AFF',
    closed: true,
    dashed: false,
    length_m: 1780.95,
    fiberType: 'OS2',
    fiberCount: 72,
    points_cad: [
      [45.0, -103.58],
      [65.0, -207.16],
      [65.0, -335.61],
      [79.45, -382.11],
      [505.0, -386.67],
      [405.0, -386.67],
      [405.0, -213.46],
      [485.1, 65.0],
      [214.1, 65.0],
    ],
  },

  NUCLEO_ANILLO2_RUTA_B: {
    id: 'NUCLEO_ANILLO2_RUTA_B',
    layer: 'core',
    name: {
      es: 'Anillo 2 Núcleo — Ruta B (Servicios)',
      en: 'Core Ring 2 — Route B (Services)',
    },
    color: '#FF8C00',
    closed: true,
    dashed: false,
    length_m: 1943.45,
    fiberType: 'OS2',
    fiberCount: 72,
    points_cad: [
      [30.0, -103.58],
      [55.0, -207.16],
      [55.0, -335.61],
      [64.45, -397.11],
      [525.0, -401.67],
      [390.0, -401.67],
      [390.0, -213.46],
      [500.1, 80.0],
      [204.1, 80.0],
    ],
  },

  DISTRIB_TERMINAL: {
    id: 'DISTRIB_TERMINAL',
    layer: 'distribution',
    name: {
      es: 'Distribución Terminal',
      en: 'Terminal Distribution Ring',
    },
    color: '#00FF00',
    closed: false,
    dashed: true,
    length_m: 711.18,
    fiberType: 'OS2',
    fiberCount: 24,
    uplinkNodes: ['N1', 'N2'],
    points_cad: [
      [45.0, -103.58],
      [20.0, -48.0],
      [75.0, -48.0],
      [75.0, -162.0],
      [180.0, -206.0],
      [280.0, -206.0],
      [102.0, -355.0],
      [79.45, -382.11],
    ],
  },

  DISTRIB_AIRSIDE: {
    id: 'DISTRIB_AIRSIDE',
    layer: 'distribution',
    name: {
      es: 'Distribución Airside / Pistas',
      en: 'Airside / Runway Distribution Ring',
    },
    color: '#FF0000',
    closed: false,
    dashed: true,
    length_m: 658.38,
    fiberType: 'OS2',
    fiberCount: 24,
    uplinkNodes: ['N3', 'N6'],
    points_cad: [
      [505.0, -386.67],
      [555.0, -335.0],
      [585.0, -220.0],
      [575.0, -90.0],
      [450.0, -90.0],
      [540.0, 10.0],
      [485.1, 65.0],
    ],
  },

  DISTRIB_CARGA: {
    id: 'DISTRIB_CARGA',
    layer: 'distribution',
    name: {
      es: 'Distribución Carga e Industrial',
      en: 'Cargo & Industrial Distribution Ring',
    },
    color: '#FF00FF',
    closed: false,
    dashed: true,
    length_m: 608.49,
    fiberType: 'OS2',
    fiberCount: 24,
    uplinkNodes: ['N4', 'N5'],
    points_cad: [
      [214.1, 65.0],
      [140.0, 65.0],
      [190.0, 115.0],
      [300.0, 115.0],
      [350.0, 10.0],
      [355.0, -130.0],
      [405.0, -213.46],
    ],
  },

  DISTRIB_PERIMETRO: {
    id: 'DISTRIB_PERIMETRO',
    layer: 'distribution',
    name: {
      es: 'Distribución Perímetro Campus',
      en: 'Campus Perimeter Distribution Ring',
    },
    color: '#00FFFF',
    closed: false,
    dashed: true,
    length_m: 2485.58,
    fiberType: 'OS2',
    fiberCount: 24,
    uplinkNodes: ['N5', 'N3'],
    points_cad: [
      [405.0, -213.46],
      [350.0, -260.0],
      [250.0, -495.0],
      [-60.0, -470.0],
      [-60.0, -120.0],
      [60.0, 150.0],
      [615.0, 150.0],
      [615.0, -386.67],
      [505.0, -386.67],
    ],
  },
};

export interface DimensionCotaSpec {
  id: string;
  label: string;
  length_m: number;
  start_cad: CadPoint;
  end_cad: CadPoint;
}

export const DIMENSION_COTAS: DimensionCotaSpec[] = [
  { id: 'C1', label: 'Salidas N-S', length_m: 207.16, start_cad: [0, 0], end_cad: [0, -207.16] },
  { id: 'C2', label: 'Salidas E-O', length_m: 90.0, start_cad: [0, 0], end_cad: [90, 0] },
  { id: 'C3', label: 'Galería N-S', length_m: 128.45, start_cad: [50, -207.16], end_cad: [50, -335.61] },
  { id: 'C4', label: 'Cuello Muelle', length_m: 25.65, start_cad: [90, -192], end_cad: [115.65, -192] },
  { id: 'C5', label: 'Llegadas N-S', length_m: 93.0, start_cad: [40, -335.61], end_cad: [40, -428.61] },
  { id: 'C6', label: 'Llegadas E-O', length_m: 78.9, start_cad: [40, -335.61], end_cad: [118.9, -335.61] },
  { id: 'C7', label: 'Muelle E-O', length_m: 304.0, start_cad: [115.65, -173.3], end_cad: [419.65, -173.3] },
  { id: 'C8', label: 'Cabeza Muelle', length_m: 63.4, start_cad: [419.65, -173.3], end_cad: [419.65, -236.7] },
  { id: 'C9', label: 'L Vert P0-P1', length_m: 173.21, start_cad: [405, -213.46], end_cad: [405, -386.67] },
  { id: 'C10', label: 'L Horiz P1-T', length_m: 100.0, start_cad: [405, -386.67], end_cad: [505, -386.67] },
  { id: 'C11', label: 'Hipotenusa P0-T', length_m: 200.0, start_cad: [405, -213.46], end_cad: [505, -386.67] },
  { id: 'C12', label: 'Cargo E-O', length_m: 90.0, start_cad: [169.1, 80], end_cad: [259.1, 80] },
  { id: 'C13', label: 'Cargo N-S', length_m: 30.0, start_cad: [169.1, 50], end_cad: [169.1, 80] },
  { id: 'C14', label: 'SSEI E-O', length_m: 120.0, start_cad: [425.1, 97.5], end_cad: [545.1, 97.5] },
  { id: 'C15', label: 'SSEI N-S', length_m: 65.0, start_cad: [425.1, 32.5], end_cad: [425.1, 97.5] },
  { id: 'C16', label: 'N4 ↔ N6', length_m: 271.0, start_cad: [214.1, 65], end_cad: [485.1, 65] },
];
