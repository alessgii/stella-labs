export type VrfId =
  | 'VRF-ATC'
  | 'VRF-AGL'
  | 'VRF-SEG'
  | 'VRF-BHS'
  | 'VRF-AERO'
  | 'VRF-PAX'
  | 'VRF-ADM'
  | 'VRF-EMG'
  | 'VRF-PWR'
  | 'VRF-CARGO'
  | 'VRF-EXT';

export interface NetworkServiceSpec {
  id: string;
  vrf: VrfId;
  name: { es: string; en: string };
  domain: 'IT' | 'OT';
  criticality: 'critica' | 'alta' | 'media' | 'baja';
  primaryRing: 1 | 2;
  backupRing: 1 | 2;
  capacityLabel: string;
  defaultBandwidthGbps: number;
  slaPct: number;
  color: string;
  planExtension?: boolean;
  demo?: boolean;
}

export const RING_CAPACITY_GBPS = 100;
export const RING_SAFE_UTILIZATION_PCT = 80;

export const NETWORK_SERVICES: NetworkServiceSpec[] = [
  {
    id: 'srv-atc',
    vrf: 'VRF-ATC',
    name: { es: 'ATC / Navegación', en: 'ATC / Navigation' },
    domain: 'OT',
    criticality: 'critica',
    primaryRing: 1,
    backupRing: 2,
    capacityLabel: '1G–10G',
    defaultBandwidthGbps: 8,
    slaPct: 99.999,
    color: '#005AFF',
  },
  {
    id: 'srv-agl',
    vrf: 'VRF-AGL',
    name: { es: 'Luces AGL / ALCMS', en: 'AGL Lighting / ALCMS' },
    domain: 'OT',
    criticality: 'critica',
    primaryRing: 1,
    backupRing: 2,
    capacityLabel: '1G',
    defaultBandwidthGbps: 2,
    slaPct: 99.999,
    color: '#0EA5E9',
  },
  {
    id: 'srv-seg',
    vrf: 'VRF-SEG',
    name: { es: 'Seguridad (CCTV, accesos)', en: 'Security (CCTV, access)' },
    domain: 'OT',
    criticality: 'alta',
    primaryRing: 1,
    backupRing: 2,
    capacityLabel: '10G',
    defaultBandwidthGbps: 20,
    slaPct: 99.99,
    color: '#EF4444',
  },
  {
    id: 'srv-bhs',
    vrf: 'VRF-BHS',
    name: { es: 'Equipaje (BHS)', en: 'Baggage Handling (BHS)' },
    domain: 'OT',
    criticality: 'alta',
    primaryRing: 2,
    backupRing: 1,
    capacityLabel: '1G',
    defaultBandwidthGbps: 4,
    slaPct: 99.99,
    color: '#F59E0B',
  },
  {
    id: 'srv-aero',
    vrf: 'VRF-AERO',
    name: { es: 'Aerolíneas / Check-in / FIDS', en: 'Airlines / Check-in / FIDS' },
    domain: 'IT',
    criticality: 'media',
    primaryRing: 2,
    backupRing: 1,
    capacityLabel: '10G',
    defaultBandwidthGbps: 14,
    slaPct: 99.9,
    color: '#8B5CF6',
  },
  {
    id: 'srv-pax',
    vrf: 'VRF-PAX',
    name: { es: 'Wi-Fi pasajeros / DAS celular', en: 'Passenger Wi-Fi / Cellular DAS' },
    domain: 'IT',
    criticality: 'baja',
    primaryRing: 2,
    backupRing: 1,
    capacityLabel: '10G',
    defaultBandwidthGbps: 18,
    slaPct: 99.5,
    color: '#10B981',
  },
  {
    id: 'srv-adm',
    vrf: 'VRF-ADM',
    name: { es: 'Administración / BMS / PA', en: 'Administration / BMS / PA' },
    domain: 'IT',
    criticality: 'baja',
    primaryRing: 2,
    backupRing: 1,
    capacityLabel: '1G',
    defaultBandwidthGbps: 4,
    slaPct: 99.5,
    color: '#64748B',
  },
  {
    id: 'srv-emg',
    vrf: 'VRF-EMG',
    name: { es: 'Emergencia (alarmas, despacho, voz)', en: 'Emergency (alarms, dispatch, voice)' },
    domain: 'OT',
    criticality: 'critica',
    primaryRing: 1,
    backupRing: 2,
    capacityLabel: '1G',
    defaultBandwidthGbps: 1,
    slaPct: 99.999,
    color: '#F43F5E',
    planExtension: true,
    demo: true,
  },
  {
    id: 'srv-pwr',
    vrf: 'VRF-PWR',
    name: { es: 'Energía / SCADA eléctrico', en: 'Power / Electrical SCADA' },
    domain: 'OT',
    criticality: 'critica',
    primaryRing: 1,
    backupRing: 2,
    capacityLabel: '1G',
    defaultBandwidthGbps: 1,
    slaPct: 99.99,
    color: '#F59E0B',
    planExtension: true,
    demo: true,
  },
  {
    id: 'srv-cargo',
    vrf: 'VRF-CARGO',
    name: { es: 'Carga: rayos X, WMS, cadena de frío', en: 'Cargo: X-ray, WMS, cold chain' },
    domain: 'IT',
    criticality: 'alta',
    primaryRing: 2,
    backupRing: 1,
    capacityLabel: '10G',
    defaultBandwidthGbps: 8,
    slaPct: 99.9,
    color: '#06B6D4',
    planExtension: true,
    demo: true,
  },
  {
    id: 'srv-ext',
    vrf: 'VRF-EXT',
    name: { es: 'Enlaces externos (aduana, operadores)', en: 'External links (customs, carriers)' },
    domain: 'IT',
    criticality: 'media',
    primaryRing: 2,
    backupRing: 1,
    capacityLabel: '10G',
    defaultBandwidthGbps: 4,
    slaPct: 99.9,
    color: '#10B981',
    planExtension: true,
    demo: true,
  },
];

export function getServiceByVrf(vrf: VrfId): NetworkServiceSpec {
  const found = NETWORK_SERVICES.find((s) => s.vrf === vrf);
  if (!found) {
    throw new Error(`Unknown VRF: ${vrf}`);
  }
  return found;
}
