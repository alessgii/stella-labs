import type { CadPoint } from '../lib/coords';
import { rectFromCorners, rectToPolygon } from './buildings';
import type { FloorId } from './floors';

export type ZoneCategory =
  | 'public'
  | 'facility'
  | 'commercial'
  | 'food'
  | 'airline';

export interface ZoneStyleToken {
  id: ZoneCategory;
  token: string;
  fill: string;
  border: string;
  label: { es: string; en: string };
}

// Exact colors sampled from notes/plano_isotropico.png legend
export const ZONE_PALETTE: Record<ZoneCategory, ZoneStyleToken> = {
  public: {
    id: 'public',
    token: 'zone.public',
    fill: '#BDD9F0',
    border: '#9EC4E4',
    label: { es: 'Área pública', en: 'Public Area' },
  },
  facility: {
    id: 'facility',
    token: 'zone.facility',
    fill: '#91D8F7',
    border: '#4DBAE9',
    label: { es: 'Instalaciones del aeropuerto', en: 'Airport Facilities' },
  },
  commercial: {
    id: 'commercial',
    token: 'zone.commercial',
    fill: '#F0E1E0',
    border: '#F37B7E',
    label: { es: 'Zona comercial', en: 'Commercial Area' },
  },
  food: {
    id: 'food',
    token: 'zone.food',
    fill: '#E0EAA7',
    border: '#64C67C',
    label: { es: 'Comida y bebida', en: 'Food & Beverage' },
  },
  airline: {
    id: 'airline',
    token: 'zone.airline',
    fill: '#FFFBD6',
    border: '#FFDF70',
    label: { es: 'Aerolíneas, handling, boletos', en: 'Airlines, Handling, Tickets' },
  },
};

export interface FloorZoneSpec {
  id: string;
  buildingId: string;
  floor: FloorId;
  category: ZoneCategory;
  name: { es: string; en: string };
  polygon: readonly CadPoint[];
  elevOffset?: number;
}

export const FLOOR_ZONES: FloorZoneSpec[] = [
  // ================= SALIDAS (GF) =================
  {
    id: 'z-dep-gf-public',
    buildingId: 'departures',
    floor: 'GF',
    category: 'public',
    name: { es: 'Hall Público Salidas', en: 'Departures Public Hall' },
    polygon: rectToPolygon(rectFromCorners(2.0, -204.0, 88.0, -3.0)),
    elevOffset: 0.03,
  },
  {
    id: 'z-dep-gf-airline-north',
    buildingId: 'departures',
    floor: 'GF',
    category: 'airline',
    name: { es: 'Mostradores Domésticos', en: 'Domestic Airlines Desks' },
    polygon: rectToPolygon(rectFromCorners(12.0, -18.0, 48.0, -12.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-gf-airline-west',
    buildingId: 'departures',
    floor: 'GF',
    category: 'airline',
    name: { es: 'Boletos y Atención Aerolíneas', en: 'Airline Tickets & Handling' },
    polygon: rectToPolygon(rectFromCorners(2.5, -198.0, 10.0, -150.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-gf-commercial-n',
    buildingId: 'departures',
    floor: 'GF',
    category: 'commercial',
    name: { es: 'Galería Comercial Norte', en: 'North Commercial Strip' },
    polygon: rectToPolygon(rectFromCorners(12.0, -11.5, 44.0, -6.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-gf-food-n',
    buildingId: 'departures',
    floor: 'GF',
    category: 'food',
    name: { es: 'Cafetería Puertas Domésticas', en: 'Domestic Gates Café' },
    polygon: rectToPolygon(rectFromCorners(48.0, -15.0, 62.0, -6.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-gf-food-w1',
    buildingId: 'departures',
    floor: 'GF',
    category: 'food',
    name: { es: 'Café Acceso Oeste', en: 'West Entrance Café' },
    polygon: rectToPolygon(rectFromCorners(3.0, -100.0, 16.0, -76.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-gf-food-w2',
    buildingId: 'departures',
    floor: 'GF',
    category: 'food',
    name: { es: 'Restaurante Hall Sur', en: 'South Hall Bistro' },
    polygon: rectToPolygon(rectFromCorners(3.0, -142.0, 16.0, -120.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-gf-security',
    buildingId: 'departures',
    floor: 'GF',
    category: 'facility',
    name: { es: 'Filtros de Seguridad Salidas', en: 'Departures Security Screening' },
    polygon: rectToPolygon(rectFromCorners(62.0, -140.0, 86.0, -72.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-gf-assistance',
    buildingId: 'departures',
    floor: 'GF',
    category: 'facility',
    name: { es: 'Módulo de Asistencia', en: 'Special Assistance Desk' },
    polygon: rectToPolygon(rectFromCorners(54.0, -196.0, 78.0, -176.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-gf-facility-ne',
    buildingId: 'departures',
    floor: 'GF',
    category: 'facility',
    name: { es: 'Control Doméstico NE', en: 'NE Domestic Facility' },
    polygon: rectToPolygon(rectFromCorners(76.0, -14.0, 87.5, -3.5)),
    elevOffset: 0.06,
  },

  // ================= SALIDAS (F1) =================
  {
    id: 'z-dep-f1-public',
    buildingId: 'departures',
    floor: 'F1',
    category: 'public',
    name: { es: 'Vestíbulo Mezzanine Salidas', en: 'Departures F1 Mezzanine' },
    polygon: rectToPolygon(rectFromCorners(36.0, -204.0, 88.0, -87.0)),
    elevOffset: 0.03,
  },
  {
    id: 'z-dep-f1-food',
    buildingId: 'departures',
    floor: 'F1',
    category: 'food',
    name: { es: 'Restaurante Panorámico P1', en: 'F1 Panoramic Restaurant' },
    polygon: rectToPolygon(rectFromCorners(38.0, -118.0, 86.0, -90.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-dep-f1-airline',
    buildingId: 'departures',
    floor: 'F1',
    category: 'airline',
    name: { es: 'Atención en Tránsito P1', en: 'F1 Transfer Desk' },
    polygon: rectToPolygon(rectFromCorners(38.0, -152.0, 56.0, -126.0)),
    elevOffset: 0.06,
  },

  // ================= GALERÍA Y CUELLO (F1) =================
  {
    id: 'z-gal-f1-public',
    buildingId: 'gallery',
    floor: 'F1',
    category: 'public',
    name: { es: 'Conexión entre Terminales', en: 'Connection Between Terminals' },
    polygon: rectToPolygon(rectFromCorners(51.5, -334.0, 74.0, -208.5)),
    elevOffset: 0.03,
  },
  {
    id: 'z-gal-f1-commercial-1',
    buildingId: 'gallery',
    floor: 'F1',
    category: 'commercial',
    name: { es: 'Duty Free Galería Norte', en: 'Gallery North Duty Free' },
    polygon: rectToPolygon(rectFromCorners(75.5, -262.0, 88.0, -214.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-gal-f1-commercial-2',
    buildingId: 'gallery',
    floor: 'F1',
    category: 'commercial',
    name: { es: 'Tiendas Galería Sur', en: 'Gallery South Retail' },
    polygon: rectToPolygon(rectFromCorners(75.5, -326.0, 88.0, -270.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-neck-f1-public',
    buildingId: 'neck',
    floor: 'F1',
    category: 'public',
    name: { es: 'Acceso al Muelle', en: 'Pier Access Corridor' },
    polygon: rectToPolygon(rectFromCorners(91.0, -236.0, 114.5, -194.0)),
    elevOffset: 0.03,
  },

  // ================= LLEGADAS (GF & F1) =================
  {
    id: 'z-arr-gf-public',
    buildingId: 'arrivals',
    floor: 'GF',
    category: 'public',
    name: { es: 'Hall Llegadas PB', en: 'Arrivals Ground Hall' },
    polygon: rectToPolygon(rectFromCorners(41.5, -426.0, 117.0, -338.0)),
    elevOffset: 0.03,
  },
  {
    id: 'z-arr-gf-commercial',
    buildingId: 'arrivals_south',
    floor: 'GF',
    category: 'commercial',
    name: { es: 'Comercios Llegadas Sur', en: 'Arrivals South Retail' },
    polygon: rectToPolygon(rectFromCorners(67.0, -475.0, 101.0, -432.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-arr-f1-public',
    buildingId: 'arrivals',
    floor: 'F1',
    category: 'public',
    name: { es: 'Hall Llegadas P1', en: 'Arrivals First Floor Hall' },
    polygon: rectToPolygon(rectFromCorners(41.5, -426.0, 117.0, -338.0)),
    elevOffset: 0.03,
  },
  {
    id: 'z-arr-f1-baggage',
    buildingId: 'arrivals',
    floor: 'F1',
    category: 'facility',
    name: { es: 'Reclamo de Equipaje P1 (1–3)', en: 'F1 Baggage Claim (1–3)' },
    polygon: rectToPolygon(rectFromCorners(53.0, -420.0, 115.0, -352.0)),
    elevOffset: 0.04,
  },
  {
    id: 'z-arr-f1-food',
    buildingId: 'arrivals',
    floor: 'F1',
    category: 'food',
    name: { es: 'Cafetería Llegadas P1', en: 'F1 Arrivals Café' },
    polygon: rectToPolygon(rectFromCorners(92.0, -424.0, 116.0, -402.0)),
    elevOffset: 0.06,
  },

  // ================= MUELLE / PIER (F1) =================
  {
    id: 'z-pier-f1-public',
    buildingId: 'pier',
    floor: 'F1',
    category: 'public',
    name: { es: 'Corredor Principal Muelle', en: 'Pier Main Concourse' },
    polygon: rectToPolygon(rectFromCorners(118.0, -218.0, 395.0, -192.0)),
    elevOffset: 0.03,
  },
  {
    id: 'z-pier-f1-commercial-w',
    buildingId: 'pier',
    floor: 'F1',
    category: 'commercial',
    name: { es: 'Duty Free Muelle Oeste', en: 'Pier West Duty Free' },
    polygon: rectToPolygon(rectFromCorners(140.0, -218.0, 210.0, -210.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-pier-f1-commercial-c',
    buildingId: 'pier',
    floor: 'F1',
    category: 'commercial',
    name: { es: 'Boutiques Muelle Centro', en: 'Pier Center Boutiques' },
    polygon: rectToPolygon(rectFromCorners(220.0, -198.0, 290.0, -186.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-pier-f1-food-court',
    buildingId: 'pier',
    floor: 'F1',
    category: 'food',
    name: { es: 'Food Court Muelle', en: 'Pier Food Court' },
    polygon: rectToPolygon(rectFromCorners(225.0, -224.0, 295.0, -212.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-pier-f1-food-oval',
    buildingId: 'pier',
    floor: 'F1',
    category: 'food',
    name: { es: 'Restaurante Cabeza Muelle', en: 'Pier Head Bistro' },
    polygon: rectToPolygon(rectFromCorners(352.0, -214.0, 386.0, -190.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-pier-f1-biz-lounge-1',
    buildingId: 'pier',
    floor: 'F1',
    category: 'facility',
    name: { es: 'Business Lounge Central', en: 'Central Business Lounge' },
    polygon: rectToPolygon(rectFromCorners(302.0, -198.0, 336.0, -188.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-pier-f1-vip-lounge',
    buildingId: 'pier',
    floor: 'F1',
    category: 'facility',
    name: { es: 'VIP Lounge', en: 'VIP Lounge' },
    polygon: rectToPolygon(rectFromCorners(358.0, -187.0, 396.0, -176.0)),
    elevOffset: 0.06,
  },
  {
    id: 'z-pier-f1-biz-lounge-2',
    buildingId: 'pier',
    floor: 'F1',
    category: 'facility',
    name: { es: 'Business Lounge Cabeza', en: 'Pier Head Business Lounge' },
    polygon: rectToPolygon(rectFromCorners(362.0, -233.0, 398.0, -220.0)),
    elevOffset: 0.06,
  },
];
