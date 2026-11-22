import type { CadPoint } from '../lib/coords';
import type { FloorId } from './floors';

export type WalkConnectorType =
  | 'walk'
  | 'escalator'
  | 'elevator'
  | 'stairs'
  | 'ramp';

export interface WalkNode {
  id: string;
  floor: FloorId;
  building: string;
  pos_cad: CadPoint;
  label: { es: string; en: string };
}

export interface WalkEdge {
  from: string;
  to: string;
  connector: WalkConnectorType;
  accessible: boolean;
  extraSeconds?: number;
}

export const VERTICAL_CONNECTORS: {
  id: string;
  building: string;
  pos_cad: CadPoint;
  type: 'escalator' | 'elevator' | 'stairs';
  label: { es: string; en: string };
}[] = [
  {
    id: 'vc-dep-escalator',
    building: 'departures',
    pos_cad: [45.0, -135.0],
    type: 'escalator',
    label: { es: 'Escaleras eléctricas Salidas Centro', en: 'Departures Center Escalators' },
  },
  {
    id: 'vc-dep-elevator',
    building: 'departures',
    pos_cad: [74.0, -172.0],
    type: 'elevator',
    label: { es: 'Elevador y escaleras Salidas Sur', en: 'Departures South Elevator' },
  },
  {
    id: 'vc-arr-elevator',
    building: 'arrivals',
    pos_cad: [52.0, -395.0],
    type: 'elevator',
    label: { es: 'Elevador Llegadas Oeste', en: 'Arrivals West Elevator' },
  },
  {
    id: 'vc-arr-escalator',
    building: 'arrivals',
    pos_cad: [92.0, -405.0],
    type: 'escalator',
    label: { es: 'Escaleras eléctricas Llegadas Este', en: 'Arrivals East Escalators' },
  },
  {
    id: 'vc-pier-escalator',
    building: 'pier',
    pos_cad: [255.0, -205.0],
    type: 'escalator',
    label: { es: 'Escaleras eléctricas Muelle Centro', en: 'Pier Center Escalators' },
  },
  {
    id: 'vc-pier-elevator',
    building: 'pier',
    pos_cad: [370.0, -205.0],
    type: 'elevator',
    label: { es: 'Elevador Cabeza del Muelle', en: 'Pier Head Elevator' },
  },
];

const PIER_GXS = [160, 200, 240, 280, 320, 370, 400] as const;

export const WALK_NODES: WalkNode[] = [
  // Departures GF
  { id: 'w-dep-gf-entrance', floor: 'GF', building: 'departures', pos_cad: [8, -110], label: { es: 'Entrada Salidas', en: 'Departures Entrance' } },
  { id: 'w-dep-gf-checkin-b', floor: 'GF', building: 'departures', pos_cad: [45, -48], label: { es: 'Isla Check-in B', en: 'Check-in Island B' } },
  { id: 'w-dep-gf-checkin-a', floor: 'GF', building: 'departures', pos_cad: [45, -28], label: { es: 'Isla Check-in A', en: 'Check-in Island A' } },
  { id: 'w-dep-gf-north', floor: 'GF', building: 'departures', pos_cad: [45, -10], label: { es: 'Puertas Domésticas 50–57', en: 'Domestic Gates 50–57' } },
  { id: 'w-dep-gf-security', floor: 'GF', building: 'departures', pos_cad: [74, -104], label: { es: 'Filtros de Seguridad', en: 'Security Screening' } },
  { id: 'w-dep-gf-esc-base', floor: 'GF', building: 'departures', pos_cad: [45, -135], label: { es: 'Escaleras Salidas PB', en: 'Departures GF Escalator' } },
  { id: 'w-dep-gf-south', floor: 'GF', building: 'departures', pos_cad: [62, -165], label: { es: 'Hall Sur Salidas', en: 'Departures South Hall' } },
  { id: 'w-dep-gf-elev-base', floor: 'GF', building: 'departures', pos_cad: [74, -172], label: { es: 'Elevador Salidas PB', en: 'Departures GF Elevator' } },

  // Departures F1
  { id: 'w-dep-f1-center', floor: 'F1', building: 'departures', pos_cad: [56, -135], label: { es: 'Mezzanine Salidas P1', en: 'Departures F1 Mezzanine' } },
  { id: 'w-dep-f1-elev-top', floor: 'F1', building: 'departures', pos_cad: [74, -172], label: { es: 'Elevador Salidas P1', en: 'Departures F1 Elevator' } },
  { id: 'w-dep-f1-junction', floor: 'F1', building: 'departures', pos_cad: [74, -206], label: { es: 'Enlace Galería / Muelle', en: 'Gallery / Pier Junction' } },

  // Gallery F1
  { id: 'w-gal-f1-north', floor: 'F1', building: 'gallery', pos_cad: [68, -214], label: { es: 'Galería Norte', en: 'North Gallery' } },
  { id: 'w-gal-f1-mid', floor: 'F1', building: 'gallery', pos_cad: [68, -265], label: { es: 'Galería Comercial', en: 'Shopping Gallery' } },
  { id: 'w-gal-f1-south', floor: 'F1', building: 'gallery', pos_cad: [68, -320], label: { es: 'Galería Sur', en: 'South Gallery' } },

  // Arrivals F1 & GF
  { id: 'w-arr-f1-hall', floor: 'F1', building: 'arrivals', pos_cad: [68, -365], label: { es: 'Hall Llegadas P1', en: 'Arrivals F1 Hall' } },
  { id: 'w-arr-f1-baggage', floor: 'F1', building: 'arrivals', pos_cad: [85, -388], label: { es: 'Equipaje P1 (1–3)', en: 'F1 Baggage Claim (1–3)' } },
  { id: 'w-arr-f1-elev-top', floor: 'F1', building: 'arrivals', pos_cad: [52, -395], label: { es: 'Elevador Llegadas P1', en: 'Arrivals F1 Elevator' } },
  { id: 'w-arr-f1-esc-top', floor: 'F1', building: 'arrivals', pos_cad: [92, -405], label: { es: 'Escaleras Llegadas P1', en: 'Arrivals F1 Escalator' } },
  { id: 'w-arr-gf-elev-base', floor: 'GF', building: 'arrivals', pos_cad: [52, -395], label: { es: 'Elevador Llegadas PB', en: 'Arrivals GF Elevator' } },
  { id: 'w-arr-gf-esc-base', floor: 'GF', building: 'arrivals', pos_cad: [92, -405], label: { es: 'Escaleras Llegadas PB', en: 'Arrivals GF Escalator' } },
  { id: 'w-arr-gf-hall', floor: 'GF', building: 'arrivals', pos_cad: [48, -395], label: { es: 'Hall Llegadas PB', en: 'Arrivals GF Hall' } },
  { id: 'w-arr-gf-baggage', floor: 'GF', building: 'arrivals', pos_cad: [85, -388], label: { es: 'Equipaje PB (4–6)', en: 'GF Baggage Claim (4–6)' } },

  // Neck F1
  { id: 'w-neck-f1-west', floor: 'F1', building: 'neck', pos_cad: [92, -215], label: { es: 'Cuello al Muelle', en: 'Pier Neck' } },
  { id: 'w-neck-f1-east', floor: 'F1', building: 'neck', pos_cad: [118, -205], label: { es: 'Entrada Muelle', en: 'Pier Entrance' } },

  // Pier F1 spine + N/S finger spurs
  ...PIER_GXS.flatMap((gx): WalkNode[] => {
    const northY = gx === 240 || gx === 280 ? -186 : gx >= 370 ? -176 : -188;
    const southY = gx === 240 || gx === 280 ? -224 : gx >= 370 ? -234 : -222;
    return [
      { id: `w-pier-f1-${gx}`, floor: 'F1', building: 'pier', pos_cad: [gx, -205], label: { es: `Corredor Muelle (${gx}m)`, en: `Pier Concourse (${gx}m)` } },
      { id: `w-pier-f1-${gx}-n`, floor: 'F1', building: 'pier', pos_cad: [gx, northY], label: { es: `Acceso Puertas Norte (${gx}m)`, en: `North Gates Access (${gx}m)` } },
      { id: `w-pier-f1-${gx}-s`, floor: 'F1', building: 'pier', pos_cad: [gx, southY], label: { es: `Acceso Puertas Sur (${gx}m)`, en: `South Gates Access (${gx}m)` } },
    ];
  }),
];

export const WALK_EDGES: WalkEdge[] = [
  // Departures GF internal
  { from: 'w-dep-gf-entrance', to: 'w-dep-gf-checkin-b', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-checkin-b', to: 'w-dep-gf-checkin-a', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-checkin-a', to: 'w-dep-gf-north', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-entrance', to: 'w-dep-gf-security', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-checkin-b', to: 'w-dep-gf-security', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-entrance', to: 'w-dep-gf-esc-base', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-security', to: 'w-dep-gf-esc-base', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-entrance', to: 'w-dep-gf-south', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-esc-base', to: 'w-dep-gf-south', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-south', to: 'w-dep-gf-elev-base', connector: 'walk', accessible: true },
  { from: 'w-dep-gf-security', to: 'w-dep-gf-elev-base', connector: 'walk', accessible: true },

  // Departures vertical connectors GF <-> F1
  { from: 'w-dep-gf-esc-base', to: 'w-dep-f1-center', connector: 'escalator', accessible: false, extraSeconds: 20 },
  { from: 'w-dep-gf-elev-base', to: 'w-dep-f1-elev-top', connector: 'elevator', accessible: true, extraSeconds: 40 },

  // Departures F1 -> Gallery & Neck
  { from: 'w-dep-f1-center', to: 'w-dep-f1-elev-top', connector: 'walk', accessible: true },
  { from: 'w-dep-f1-elev-top', to: 'w-dep-f1-junction', connector: 'walk', accessible: true },
  { from: 'w-dep-f1-junction', to: 'w-gal-f1-north', connector: 'walk', accessible: true },
  { from: 'w-dep-f1-junction', to: 'w-neck-f1-west', connector: 'walk', accessible: true },

  // Gallery F1 -> Arrivals F1
  { from: 'w-gal-f1-north', to: 'w-gal-f1-mid', connector: 'walk', accessible: true },
  { from: 'w-gal-f1-mid', to: 'w-gal-f1-south', connector: 'walk', accessible: true },
  { from: 'w-gal-f1-south', to: 'w-arr-f1-hall', connector: 'walk', accessible: true },

  // Arrivals F1 & GF + vertical connectors
  { from: 'w-arr-f1-hall', to: 'w-arr-f1-baggage', connector: 'walk', accessible: true },
  { from: 'w-arr-f1-hall', to: 'w-arr-f1-elev-top', connector: 'walk', accessible: true },
  { from: 'w-arr-f1-baggage', to: 'w-arr-f1-esc-top', connector: 'walk', accessible: true },
  { from: 'w-arr-f1-elev-top', to: 'w-arr-gf-elev-base', connector: 'elevator', accessible: true, extraSeconds: 40 },
  { from: 'w-arr-f1-esc-top', to: 'w-arr-gf-esc-base', connector: 'escalator', accessible: false, extraSeconds: 20 },
  { from: 'w-arr-gf-elev-base', to: 'w-arr-gf-hall', connector: 'walk', accessible: true },
  { from: 'w-arr-gf-hall', to: 'w-arr-gf-baggage', connector: 'walk', accessible: true },
  { from: 'w-arr-gf-baggage', to: 'w-arr-gf-esc-base', connector: 'walk', accessible: true },

  // Neck -> Pier F1 spine
  { from: 'w-neck-f1-west', to: 'w-neck-f1-east', connector: 'walk', accessible: true },
  { from: 'w-neck-f1-east', to: 'w-pier-f1-160', connector: 'walk', accessible: true },

  // Pier F1 spine & finger branches
  ...PIER_GXS.slice(0, -1).map((gx, idx): WalkEdge => ({
    from: `w-pier-f1-${gx}`,
    to: `w-pier-f1-${PIER_GXS[idx + 1]}`,
    connector: 'walk',
    accessible: true,
  })),
  ...PIER_GXS.flatMap((gx): WalkEdge[] => [
    { from: `w-pier-f1-${gx}`, to: `w-pier-f1-${gx}-n`, connector: 'walk', accessible: true },
    { from: `w-pier-f1-${gx}`, to: `w-pier-f1-${gx}-s`, connector: 'walk', accessible: true },
  ]),
];
