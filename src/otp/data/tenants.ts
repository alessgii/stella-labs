import type { CadPoint } from '../lib/coords';
import { pointInPolygon } from '../lib/geometry';
import type { TerminalIdfId } from './devices';
import type { FloorId } from './floors';
import { POIS } from './poi';
import { DISTRIBUTION_RACKS } from './racks';
import { FLOOR_ZONES } from './zones';

export type TenantTemplate =
  | 'cafe'
  | 'tienda'
  | 'restaurante'
  | 'farmacia'
  | 'cambio'
  | 'duty-free'
  | 'sala-vip'
  | 'mostrador-aerolinea';

export type TenantTier = 'basico' | 'estandar' | 'premium';

export type TenantVrfId =
  | 'VRF-TENANT-FOOD'
  | 'VRF-TENANT-RETAIL'
  | 'VRF-TENANT-VIP'
  | 'VRF-AERO';

export interface TenantTierSpec {
  tier: TenantTier;
  label: { es: string; en: string };
  uplinkDescription: { es: string; en: string };
  slaPct: number;
  monthlyPriceDemo: string;
  redundantSwitch: boolean;
  dedicatedFiber: boolean;
  qosPriority: { es: string; en: string };
}

export const TENANT_TIER_SPECS: Record<TenantTier, TenantTierSpec> = {
  basico: {
    tier: 'basico',
    label: { es: 'Básico', en: 'Basic' },
    uplinkDescription: {
      es: '1 enlace cobre Cat6A PoE a un IDF, 1 VLAN aislada',
      en: '1× Cat6A PoE copper link to 1 IDF, 1 isolated VLAN',
    },
    slaPct: 99.5,
    monthlyPriceDemo: '120 EUR/mes (demo)',
    redundantSwitch: false,
    dedicatedFiber: false,
    qosPriority: { es: 'Estándar (Best Effort)', en: 'Standard (Best Effort)' },
  },
  estandar: {
    tier: 'estandar',
    label: { es: 'Estándar', en: 'Standard' },
    uplinkDescription: {
      es: '2 enlaces a dos switches distintos del IDF, VLANs separadas POS/Wi-Fi',
      en: '2× links to separate IDF switches, split POS/Wi-Fi VLANs',
    },
    slaPct: 99.9,
    monthlyPriceDemo: '260 EUR/mes (demo)',
    redundantSwitch: true,
    dedicatedFiber: false,
    qosPriority: { es: 'Media (POS priorizado)', en: 'Medium (POS prioritized)' },
  },
  premium: {
    tier: 'premium',
    label: { es: 'Premium', en: 'Premium' },
    uplinkDescription: {
      es: 'Fibra dedicada OS2 + convertidor, doble IDF, prioridad QoS alta',
      en: 'Dedicated OS2 fiber + converter, dual-IDF homing, high QoS priority',
    },
    slaPct: 99.99,
    monthlyPriceDemo: '580 EUR/mes (demo)',
    redundantSwitch: true,
    dedicatedFiber: true,
    qosPriority: { es: 'Alta (EF / AF41 garantizado)', en: 'High (EF / AF41 guaranteed)' },
  },
};

export interface Tenant {
  id: string;
  poiId: string;
  name: { es: string; en: string };
  template: TenantTemplate;
  footprint_cad: [number, number][];
  center_cad: CadPoint;
  floor: FloorId;
  building: string;
  zoneId: string;
  idf: TerminalIdfId;
  trayDistance_m: number;
  vrf: TenantVrfId;
  vlanId: number;
  tier: TenantTier;
  demo: true;
}

interface TenantSeedConfig {
  poiId: string;
  template: TenantTemplate;
  tier: TenantTier;
  vrf: TenantVrfId;
  zoneId: string;
}

const TENANT_CONFIGS: TenantSeedConfig[] = [
  // Salidas GF
  { poiId: 'poi-food-dep-cafe', template: 'cafe', tier: 'estandar', vrf: 'VRF-TENANT-FOOD', zoneId: 'z-dep-gf-food-w1' },
  { poiId: 'poi-food-dep-bistro', template: 'restaurante', tier: 'estandar', vrf: 'VRF-TENANT-FOOD', zoneId: 'z-dep-gf-food-w2' },
  { poiId: 'poi-shop-bookstore', template: 'tienda', tier: 'basico', vrf: 'VRF-TENANT-RETAIL', zoneId: 'z-dep-gf-commercial-n' },
  { poiId: 'poi-checkin-a', template: 'mostrador-aerolinea', tier: 'estandar', vrf: 'VRF-AERO', zoneId: 'z-dep-gf-public' },
  { poiId: 'poi-checkin-b', template: 'mostrador-aerolinea', tier: 'estandar', vrf: 'VRF-AERO', zoneId: 'z-dep-gf-public' },
  { poiId: 'poi-airline-tickets-w', template: 'mostrador-aerolinea', tier: 'basico', vrf: 'VRF-AERO', zoneId: 'z-dep-gf-airline-west' },
  { poiId: 'poi-atm-dep', template: 'cambio', tier: 'estandar', vrf: 'VRF-TENANT-RETAIL', zoneId: 'z-dep-gf-public' },

  // Salidas F1
  { poiId: 'poi-food-dep-f1', template: 'restaurante', tier: 'estandar', vrf: 'VRF-TENANT-FOOD', zoneId: 'z-dep-f1-food' },
  { poiId: 'poi-transfer-desk-f1', template: 'mostrador-aerolinea', tier: 'estandar', vrf: 'VRF-AERO', zoneId: 'z-dep-f1-airline' },

  // Galería F1
  { poiId: 'poi-shop-dutyfree-gal', template: 'duty-free', tier: 'premium', vrf: 'VRF-TENANT-RETAIL', zoneId: 'z-gal-f1-commercial-1' },
  { poiId: 'poi-shop-pharmacy', template: 'farmacia', tier: 'estandar', vrf: 'VRF-TENANT-RETAIL', zoneId: 'z-gal-f1-commercial-2' },

  // Muelle F1
  { poiId: 'poi-shop-dutyfree-pier', template: 'duty-free', tier: 'premium', vrf: 'VRF-TENANT-RETAIL', zoneId: 'z-pier-f1-commercial-w' },
  { poiId: 'poi-shop-souvenirs', template: 'tienda', tier: 'basico', vrf: 'VRF-TENANT-RETAIL', zoneId: 'z-pier-f1-commercial-c' },
  { poiId: 'poi-food-court', template: 'restaurante', tier: 'premium', vrf: 'VRF-TENANT-FOOD', zoneId: 'z-pier-f1-food-court' },
  { poiId: 'poi-food-pier-oval', template: 'cafe', tier: 'estandar', vrf: 'VRF-TENANT-FOOD', zoneId: 'z-pier-f1-food-oval' },
  { poiId: 'poi-lounge-biz-c', template: 'sala-vip', tier: 'premium', vrf: 'VRF-TENANT-VIP', zoneId: 'z-pier-f1-biz-lounge-1' },
  { poiId: 'poi-lounge-vip', template: 'sala-vip', tier: 'premium', vrf: 'VRF-TENANT-VIP', zoneId: 'z-pier-f1-vip-lounge' },
  { poiId: 'poi-lounge-biz-e', template: 'sala-vip', tier: 'premium', vrf: 'VRF-TENANT-VIP', zoneId: 'z-pier-f1-biz-lounge-2' },

  // Llegadas GF & F1
  { poiId: 'poi-shop-arrivals', template: 'tienda', tier: 'basico', vrf: 'VRF-TENANT-RETAIL', zoneId: 'z-arr-gf-commercial' },
  { poiId: 'poi-food-arrivals', template: 'cafe', tier: 'basico', vrf: 'VRF-TENANT-FOOD', zoneId: 'z-arr-f1-food' },
];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically subdivides a zone bounding rectangle into ~6x8 m units
 * inset inside the zone polygon so units never invade corridors.
 */
function buildFootprintInZone(
  pos: CadPoint,
  zonePolygon: readonly CadPoint[],
  template: TenantTemplate,
  rand: () => number,
): { footprint: [number, number][]; center: CadPoint } {
  const xs = zonePolygon.map((p) => p[0]);
  const ys = zonePolygon.map((p) => p[1]);
  const minX = Math.min(...xs) + 0.6;
  const maxX = Math.max(...xs) - 0.6;
  const minY = Math.min(...ys) + 0.6;
  const maxY = Math.max(...ys) - 0.6;

  // Target unit size (~6x8 m, slightly larger for VIP/duty-free/airline islands)
  const targetW =
    template === 'mostrador-aerolinea'
      ? 14
      : template === 'duty-free' || template === 'sala-vip'
        ? 10
        : 6.5 + (rand() - 0.5) * 0.6;
  const targetH =
    template === 'mostrador-aerolinea'
      ? 5.0
      : template === 'duty-free' || template === 'sala-vip'
        ? 8.5
        : 7.5 + (rand() - 0.5) * 0.6;

  const availW = Math.max(4, maxX - minX);
  const availH = Math.max(4, maxY - minY);
  const w = Math.min(targetW, availW);
  const h = Math.min(targetH, availH);

  // Snap center inside zone bounds
  const cx = Math.max(minX + w / 2, Math.min(maxX - w / 2, pos[0]));
  const cy = Math.max(minY + h / 2, Math.min(maxY - h / 2, pos[1]));

  const x1 = Number((cx - w / 2).toFixed(2));
  const x2 = Number((cx + w / 2).toFixed(2));
  const y1 = Number((cy - h / 2).toFixed(2));
  const y2 = Number((cy + h / 2).toFixed(2));

  const rect: [number, number][] = [
    [x1, y2],
    [x2, y2],
    [x2, y1],
    [x1, y1],
  ];

  // Verify center is inside zone polygon
  if (!pointInPolygon([cx, cy], zonePolygon)) {
    const fallbackCx = (minX + maxX) / 2;
    const fallbackCy = (minY + maxY) / 2;
    return {
      footprint: [
        [fallbackCx - w / 2, fallbackCy + h / 2],
        [fallbackCx + w / 2, fallbackCy + h / 2],
        [fallbackCx + w / 2, fallbackCy - h / 2],
        [fallbackCx - w / 2, fallbackCy - h / 2],
      ],
      center: [Number(fallbackCx.toFixed(2)), Number(fallbackCy.toFixed(2))],
    };
  }

  return {
    footprint: rect,
    center: [Number(cx.toFixed(2)), Number(cy.toFixed(2))],
  };
}

/**
 * Assigns the nearest Terminal IDF (R1_T..R6_T) by orthogonal cable-tray distance.
 */
export function assignNearestTerminalIdf(
  center_cad: CadPoint,
  floor: FloorId,
): { idf: TerminalIdfId; trayDistance_m: number } {
  const terminalRacks = DISTRIBUTION_RACKS.filter(
    (r) => r.ring === 'DISTRIB_TERMINAL',
  );
  let bestId: TerminalIdfId = 'R1_T';
  let bestDist = Infinity;

  const verticalRiser = floor === 'F1' ? 6.0 : 0.0;
  const trayDrop = 3.2;

  for (const r of terminalRacks) {
    const orth =
      Math.abs(center_cad[0] - r.x_cad) +
      Math.abs(center_cad[1] - r.y_cad) +
      verticalRiser +
      trayDrop;
    if (orth < bestDist) {
      bestDist = orth;
      bestId = r.id as TerminalIdfId;
    }
  }

  return {
    idf: bestId,
    trayDistance_m: Number(bestDist.toFixed(1)),
  };
}

function generateTenants(): Tenant[] {
  const rand = mulberry32(20261119);
  return TENANT_CONFIGS.map((cfg, idx) => {
    const poi = POIS.find((p) => p.id === cfg.poiId);
    if (!poi) {
      throw new Error(`Missing POI for tenant: ${cfg.poiId}`);
    }
    const zone = FLOOR_ZONES.find((z) => z.id === cfg.zoneId);
    if (!zone) {
      throw new Error(`Missing zone for tenant: ${cfg.zoneId}`);
    }

    const { footprint, center } = buildFootprintInZone(
      poi.pos_cad,
      zone.polygon,
      cfg.template,
      rand,
    );
    const { idf, trayDistance_m } = assignNearestTerminalIdf(center, poi.floor);

    return {
      id: poi.id,
      poiId: poi.id,
      name: poi.name,
      template: cfg.template,
      footprint_cad: footprint,
      center_cad: center,
      floor: poi.floor,
      building: poi.building,
      zoneId: cfg.zoneId,
      idf,
      trayDistance_m,
      vrf: cfg.vrf,
      vlanId: 301 + idx,
      tier: cfg.tier,
      demo: true,
    };
  });
}

export const TENANTS: Tenant[] = generateTenants();

export function getTenantById(id: string): Tenant | undefined {
  return TENANTS.find((t) => t.id === id);
}
