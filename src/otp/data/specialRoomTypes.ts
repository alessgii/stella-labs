import type { CadPoint } from '../lib/coords';
import type { VrfId } from './services';
import type { TemplateObjectSpec, TenantTemplateSpec } from './templates';

export type SpecialBuildingId = 'ssei' | 'cargo';
export type SpecialSubZone = 'ssei' | 'substation' | 'cargo';
export type SpecialUseCase = 'emergency' | 'power' | 'cold-chain';

export interface SpecialRoomSpec {
  id: string;
  buildingId: SpecialBuildingId;
  subZone: SpecialSubZone;
  name: { es: string; en: string };
  shortLabel: { es: string; en: string };
  access: 'restricted' | 'public';
  footprint_cad: CadPoint[];
  center_cad: CadPoint;
  systems: string[];
  useCase?: SpecialUseCase;
  coreNodeId?: 'N4' | 'N6';
  idf: string;
  trayDistance_m: number;
  vrf: VrfId;
  vlanId: number;
  summary: { es: string; en: string };
  templateSpec: TenantTemplateSpec;
  demo: true;
}

export function rectCad(x1: number, y1: number, x2: number, y2: number): {
  footprint: CadPoint[];
  center: CadPoint;
} {
  return {
    footprint: [
      [x1, y1],
      [x2, y1],
      [x2, y2],
      [x1, y2],
    ],
    center: [Number(((x1 + x2) / 2).toFixed(2)), Number(((y1 + y2) / 2).toFixed(2))],
  };
}

export function roomCeilingLights(
  w: number,
  d: number,
  y: number,
  cols = 3,
  rows = 3,
): [number, number, number][] {
  const lights: [number, number, number][] = [];
  for (let ix = 0; ix < cols; ix++) {
    for (let iz = 0; iz < rows; iz++) {
      const x = -w * 0.3 + (cols > 1 ? (ix / (cols - 1)) * w * 0.6 : 0);
      const z = -d * 0.28 + (rows > 1 ? (iz / (rows - 1)) * d * 0.56 : 0);
      lights.push([Number(x.toFixed(2)), y, Number(z.toFixed(2))]);
    }
  }
  return lights;
}

export function makeRoomNetworkPack(
  prefix: string,
  w: number,
  d: number,
  h: number,
  rackPos: [number, number, number],
  demarcPos: [number, number, number],
  primaryPos: [number, number, number],
  primaryLabel: { es: string; en: string },
  screenPos: [number, number, number],
  screenLabel: { es: string; en: string },
): TemplateObjectSpec[] {
  return [
    {
      id: `${prefix}-pos`,
      label: primaryLabel,
      category: 'tech',
      position: primaryPos,
      size: [0.45, 0.36, 0.34],
      color: '#0EA5E9',
      isHotspot: true,
      subsystem: 'pos',
      switchPort: 1,
      poeWatts: 12,
      cableType: 'Cat6A',
      cableLength_m: 9.2,
      functionDesc: {
        es: 'Equipo principal de operación conectado por cobre Cat6A al switch de la sala.',
        en: 'Primary operational terminal wired via Cat6A copper to room switch.',
      },
    },
    {
      id: `${prefix}-demarc`,
      label: { es: 'Caja de demarcación / ODF fibra', en: 'Fiber ODF / Demarcation box' },
      category: 'network',
      position: demarcPos,
      size: [0.48, 0.56, 0.2],
      color: '#F59E0B',
      isHotspot: true,
      subsystem: 'uplink',
      cableType: 'OS2',
      functionDesc: {
        es: 'Terminación de fibra óptica OS2 hacia el nodo de núcleo del edificio.',
        en: 'OS2 optical fiber termination toward the building core node.',
      },
    },
    {
      id: `${prefix}-rack`,
      label: { es: 'Gabinete / Switch PoE + UPS', en: 'Cabinet / PoE Switch + UPS' },
      category: 'network',
      position: rackPos,
      size: [0.7, 1.4, 0.52],
      color: '#10B981',
      isHotspot: true,
      subsystem: 'power',
      poeWatts: 95,
      functionDesc: {
        es: 'Rack con switch industrial, patch panel y respaldo UPS dedicado.',
        en: 'Rack housing industrial switch, patch panel, and dedicated UPS.',
      },
    },
    {
      id: `${prefix}-cam-1`,
      label: { es: 'Cámara domo acceso', en: 'Entrance dome camera' },
      category: 'tech',
      position: [-w * 0.34, h - 0.28, d * 0.4],
      size: [0.24, 0.18, 0.24],
      shape: 'dome',
      color: '#F43F5E',
      isHotspot: true,
      subsystem: 'cctv',
      switchPort: 3,
      poeWatts: 8,
      cableType: 'Cat6A',
      cableLength_m: 12.5,
      functionDesc: {
        es: 'Cámara CCTV PoE cubriendo el acceso de la sala.',
        en: 'PoE CCTV camera covering room entrance.',
      },
    },
    {
      id: `${prefix}-cam-2`,
      label: { es: 'Cámara domo interior', en: 'Interior dome camera' },
      category: 'tech',
      position: [w * 0.34, h - 0.28, d * 0.4],
      size: [0.24, 0.18, 0.24],
      shape: 'dome',
      color: '#F43F5E',
      isHotspot: true,
      subsystem: 'cctv',
      switchPort: 4,
      poeWatts: 8,
      cableType: 'Cat6A',
      cableLength_m: 8.6,
      functionDesc: {
        es: 'Cámara CCTV PoE de monitoreo operativo.',
        en: 'PoE CCTV camera for operational monitoring.',
      },
    },
    {
      id: `${prefix}-ap`,
      label: { es: 'Access Point Wi-Fi industrial', en: 'Industrial Wi-Fi Access Point' },
      category: 'tech',
      position: [0, h - 0.16, 0.2],
      size: [0.32, 0.09, 0.32],
      shape: 'cylinder',
      color: '#38BDF8',
      isHotspot: true,
      subsystem: 'wifi',
      switchPort: 5,
      poeWatts: 15,
      cableType: 'Cat6A',
      cableLength_m: 7.4,
      functionDesc: {
        es: 'Cobertura inalámbrica para tabletas y terminales portátiles.',
        en: 'Wireless coverage for handheld terminals and tablets.',
      },
    },
    {
      id: `${prefix}-screen`,
      label: screenLabel,
      category: 'tech',
      position: screenPos,
      size: [1.3, 0.72, 0.1],
      color: '#A855F7',
      isHotspot: true,
      subsystem: 'signage',
      switchPort: 6,
      poeWatts: 0,
      cableType: 'Cat6A',
      cableLength_m: 7.8,
      functionDesc: {
        es: 'Monitor de estado en tiempo real conectado al sistema del edificio.',
        en: 'Real-time status monitor connected to building systems.',
      },
    },
    {
      id: `${prefix}-spk-1`,
      label: { es: 'Altavoz megafonía 1', en: 'PA speaker 1' },
      category: 'fixture',
      position: [-w * 0.22, h - 0.08, 0],
      size: [0.26, 0.07, 0.26],
      shape: 'cylinder',
      color: '#94A3B8',
    },
    {
      id: `${prefix}-spk-2`,
      label: { es: 'Altavoz megafonía 2', en: 'PA speaker 2' },
      category: 'fixture',
      position: [w * 0.22, h - 0.08, 0],
      size: [0.26, 0.07, 0.26],
      shape: 'cylinder',
      color: '#94A3B8',
    },
    {
      id: `${prefix}-smoke`,
      label: { es: 'Detector de humo', en: 'Smoke detector' },
      category: 'fixture',
      position: [0, h - 0.08, -d * 0.18],
      size: [0.18, 0.07, 0.18],
      shape: 'cylinder',
      color: '#E2E8F0',
    },
    {
      id: `${prefix}-exit-sign`,
      label: { es: 'Señal salida de emergencia', en: 'Emergency exit sign' },
      category: 'fixture',
      position: [0, h - 0.25, d * 0.48],
      size: [0.55, 0.22, 0.06],
      color: '#10B981',
    },
    {
      id: `${prefix}-patch-tray`,
      label: { es: 'Bandeja empalmes fibra óptica', en: 'Fiber splice tray' },
      category: 'fixture',
      position: [demarcPos[0], demarcPos[1] + 0.42, demarcPos[2]],
      size: [0.36, 0.16, 0.18],
      color: '#F59E0B',
    },
  ];
}
