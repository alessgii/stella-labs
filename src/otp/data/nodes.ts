import type { CadPoint } from '../lib/coords';

export interface CoreNodeSpec {
  id: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6';
  name: { es: string; en: string };
  role: { es: string; en: string };
  buildingId: string;
  techRoomId: string;
  pos_cad: CadPoint;
  radius_m: number;
  hasInternetExit?: 'A' | 'B';
}

export interface TowerFeedSpec {
  id: string;
  name: { es: string; en: string };
  pos_cad: CadPoint;
  radius_m: number;
}

// Core ring geographic sequence: N1 -> N2 -> N3 -> N5 -> N6 -> N4 -> N1
export const CORE_RING_ORDER: readonly CoreNodeSpec['id'][] = [
  'N1',
  'N2',
  'N3',
  'N5',
  'N6',
  'N4',
];

export const CORE_NODES: CoreNodeSpec[] = [
  {
    id: 'N1',
    name: { es: 'MDF-A (Centro Salidas)', en: 'MDF-A (Departures Core)' },
    role: {
      es: 'Centro de datos principal, servidores centrales y salida Operador A',
      en: 'Primary data center, core servers, and ISP Operator A exit',
    },
    buildingId: 'departures',
    techRoomId: 'mdf-a',
    pos_cad: [45.0, -103.58],
    radius_m: 20.0,
    hasInternetExit: 'A',
  },
  {
    id: 'N2',
    name: { es: 'Terminal de Llegadas', en: 'Arrivals Terminal' },
    role: {
      es: 'Nodo núcleo sur; concentra distribución de Llegadas y equipaje',
      en: 'South core node; aggregates Arrivals and baggage distribution',
    },
    buildingId: 'arrivals',
    techRoomId: 'room-n2',
    pos_cad: [79.45, -382.11],
    radius_m: 20.0,
  },
  {
    id: 'N3',
    name: { es: 'Torre de Control (T)', en: 'Control Tower (T)' },
    role: {
      es: 'Nodo crítico ATC, ayudas a la navegación y radares de superficie',
      en: 'Critical ATC node, navigation aids, and surface radars',
    },
    buildingId: 'tower',
    techRoomId: 'tower',
    pos_cad: [505.0, -386.67],
    radius_m: 20.0,
  },
  {
    id: 'N4',
    name: { es: 'Carga y Hangares', en: 'Cargo & Hangars' },
    role: {
      es: 'Nodo industrial norte en As World Cargo',
      en: 'North industrial core node at As World Cargo',
    },
    buildingId: 'cargo',
    techRoomId: 'room-n4',
    pos_cad: [214.1, 65.0],
    radius_m: 20.0,
  },
  {
    id: 'N5',
    name: { es: 'MDF-B (Cabeza Muelle / P0)', en: 'MDF-B (Pier Head / P0)' },
    role: {
      es: 'Centro de datos secundario de respaldo geográfico y salida Operador B',
      en: 'Secondary geographically redundant data center and ISP Operator B exit',
    },
    buildingId: 'pier',
    techRoomId: 'mdf-b',
    pos_cad: [405.0, -213.46],
    radius_m: 20.0,
    hasInternetExit: 'B',
  },
  {
    id: 'N6',
    name: { es: 'Edificio Auxiliar (SSEI / Subestación)', en: 'Auxiliary Building (SSEI / Substation)' },
    role: {
      es: 'Servicios de emergencia SSEI y subestación eléctrica principal',
      en: 'Emergency fire/rescue (SSEI) and main electrical substation',
    },
    buildingId: 'ssei',
    techRoomId: 'room-n6',
    pos_cad: [485.1, 65.0],
    radius_m: 20.0,
  },
];

export const TOWER_FEEDS: TowerFeedSpec[] = [
  {
    id: 'TOWER_FEED_WEST',
    name: { es: 'Acometida Oeste Torre T', en: 'Tower T West Duct Entry' },
    pos_cad: [485.0, -386.67],
    radius_m: 3.0,
  },
  {
    id: 'TOWER_FEED_EAST',
    name: { es: 'Acometida Este Torre T', en: 'Tower T East Duct Entry' },
    pos_cad: [525.0, -386.67],
    radius_m: 3.0,
  },
];
