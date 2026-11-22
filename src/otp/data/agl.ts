import type { CadPoint } from '../lib/coords';

export type AglCircuitType =
  | 'taxiway-centerline'
  | 'taxiway-edge'
  | 'stop-bar'
  | 'apron-flood'
  | 'runway-edge';

export type AglPresetMode = 'day' | 'night' | 'low-vis';

export interface AglBrightnessStepSpec {
  step: 1 | 2 | 3 | 4 | 5;
  currentAmps: number; // Reference constant current regulator (CCR) output
  intensityFactor: number;
  label: { es: string; en: string };
}

export const AGL_BRIGHTNESS_STEPS: AglBrightnessStepSpec[] = [
  { step: 1, currentAmps: 2.8, intensityFactor: 0.25, label: { es: 'Paso 1 (2.8 A · Día)', en: 'Step 1 (2.8 A · Day)' } },
  { step: 2, currentAmps: 3.4, intensityFactor: 0.45, label: { es: 'Paso 2 (3.4 A · Crepúsculo)', en: 'Step 2 (3.4 A · Dusk)' } },
  { step: 3, currentAmps: 4.1, intensityFactor: 0.68, label: { es: 'Paso 3 (4.1 A · Noche)', en: 'Step 3 (4.1 A · Night)' } },
  { step: 4, currentAmps: 5.2, intensityFactor: 0.85, label: { es: 'Paso 4 (5.2 A · Niebla)', en: 'Step 4 (5.2 A · Fog)' } },
  { step: 5, currentAmps: 6.6, intensityFactor: 1.0, label: { es: 'Paso 5 (6.6 A · CAT III Máx)', en: 'Step 5 (6.6 A · CAT III Max)' } },
];

export interface AglCircuit {
  id: string;
  name: { es: string; en: string };
  type: AglCircuitType;
  vaultId: 'R5_A' | 'R3_A' | 'R2_A';
  color: string;
  spacing_m: number;
  points_cad: readonly CadPoint[];
  powerLoop_cad: readonly CadPoint[];
  fiberPath_cad: readonly CadPoint[];
  fiberDistanceFromTower_m: number;
  isSchematicRunway?: boolean;
  demo: true;
}

// Real Airside fiber path segments from N3 (505, -386.67) -> R1_A -> R2_A -> R3_A -> R5_A
const FIBER_TO_R2A: readonly CadPoint[] = [
  [505.0, -386.67],
  [555.0, -335.0],
  [585.0, -220.0],
];

const FIBER_TO_R3A: readonly CadPoint[] = [
  ...FIBER_TO_R2A,
  [575.0, -90.0],
];

const FIBER_TO_R5A: readonly CadPoint[] = [
  ...FIBER_TO_R3A,
  [450.0, -90.0],
];

export const AGL_CIRCUITS: AglCircuit[] = [
  {
    id: 'AGL-TWY-L-CL',
    name: { es: 'Eje Calle de Rodaje L (Verde)', en: 'Taxiway L Centerline (Green)' },
    type: 'taxiway-centerline',
    vaultId: 'R3_A',
    color: '#22C55E',
    spacing_m: 18,
    points_cad: [
      [140.0, -75.0],
      [450.0, -50.0],
    ],
    powerLoop_cad: [
      [575.0, -90.0],
      [450.0, -50.0],
      [140.0, -75.0],
    ],
    fiberPath_cad: FIBER_TO_R3A,
    fiberDistanceFromTower_m: 320.8,
    demo: true,
  },
  {
    id: 'AGL-TWY-L-EDGE',
    name: { es: 'Bordes Calle de Rodaje L (Azul)', en: 'Taxiway L Edge Lights (Blue)' },
    type: 'taxiway-edge',
    vaultId: 'R3_A',
    color: '#3B82F6',
    spacing_m: 30,
    points_cad: [
      [140.0, -64.0],
      [450.0, -39.0],
    ],
    powerLoop_cad: [
      [575.0, -90.0],
      [450.0, -39.0],
      [140.0, -64.0],
    ],
    fiberPath_cad: FIBER_TO_R3A,
    fiberDistanceFromTower_m: 320.8,
    demo: true,
  },
  {
    id: 'AGL-TWY-K-CL',
    name: { es: 'Eje Calle de Rodaje K (Verde)', en: 'Taxiway K Centerline (Green)' },
    type: 'taxiway-centerline',
    vaultId: 'R2_A',
    color: '#22C55E',
    spacing_m: 18,
    points_cad: [
      [180.0, -340.0],
      [450.0, -315.0],
    ],
    powerLoop_cad: [
      [585.0, -220.0],
      [450.0, -315.0],
      [180.0, -340.0],
    ],
    fiberPath_cad: FIBER_TO_R2A,
    fiberDistanceFromTower_m: 190.4,
    demo: true,
  },
  {
    id: 'AGL-TWY-K-EDGE',
    name: { es: 'Bordes Calle de Rodaje K (Azul)', en: 'Taxiway K Edge Lights (Blue)' },
    type: 'taxiway-edge',
    vaultId: 'R2_A',
    color: '#3B82F6',
    spacing_m: 30,
    points_cad: [
      [180.0, -351.0],
      [450.0, -326.0],
    ],
    powerLoop_cad: [
      [585.0, -220.0],
      [450.0, -326.0],
      [180.0, -351.0],
    ],
    fiberPath_cad: FIBER_TO_R2A,
    fiberDistanceFromTower_m: 190.4,
    demo: true,
  },
  {
    id: 'AGL-STOP-BARS',
    name: { es: 'Barras de Parada L y K (Rojo)', en: 'Taxiway L & K Stop Bars (Red)' },
    type: 'stop-bar',
    vaultId: 'R5_A',
    color: '#EF4444',
    spacing_m: 3.5,
    points_cad: [
      [448.0, -61.0],
      [448.0, -40.0],
    ],
    powerLoop_cad: [
      [450.0, -90.0],
      [448.0, -61.0],
      [448.0, -40.0],
    ],
    fiberPath_cad: FIBER_TO_R5A,
    fiberDistanceFromTower_m: 445.8,
    demo: true,
  },
  {
    id: 'AGL-APRON-FLOOD',
    name: { es: 'Reflectores Plataforma Apron 1', en: 'Apron 1 Floodlighting' },
    type: 'apron-flood',
    vaultId: 'R5_A',
    color: '#FEF08A',
    spacing_m: 40,
    points_cad: [
      [160.0, -172.0],
      [405.0, -172.0],
    ],
    powerLoop_cad: [
      [450.0, -90.0],
      [405.0, -172.0],
      [160.0, -172.0],
    ],
    fiberPath_cad: FIBER_TO_R5A,
    fiberDistanceFromTower_m: 445.8,
    demo: true,
  },
  {
    id: 'AGL-SCHEMATIC-RWY',
    name: {
      es: 'Pista Esquemática (fuera del plano CAD)',
      en: 'Schematic Runway (outside CAD plan)',
    },
    type: 'runway-edge',
    vaultId: 'R2_A',
    color: '#F8FAFC',
    spacing_m: 35,
    points_cad: [
      [140.0, -472.0],
      [540.0, -472.0],
    ],
    powerLoop_cad: [
      [585.0, -220.0],
      [540.0, -472.0],
      [140.0, -472.0],
    ],
    fiberPath_cad: FIBER_TO_R2A,
    fiberDistanceFromTower_m: 190.4,
    isSchematicRunway: true,
    demo: true,
  },
];

export function sampleCircuitLampPoints(circuit: AglCircuit): CadPoint[] {
  const pts: CadPoint[] = [];
  for (let i = 0; i < circuit.points_cad.length - 1; i += 1) {
    const a = circuit.points_cad[i];
    const b = circuit.points_cad[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const count = Math.max(2, Math.floor(len / circuit.spacing_m) + 1);
    for (let k = 0; k < count; k += 1) {
      const t = k / (count - 1);
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return pts;
}
