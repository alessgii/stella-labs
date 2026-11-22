import type { VrfId } from './services';

export interface ColdChainStep {
  step: number;
  id: string;
  title: { es: string; en: string };
  detail: { es: string; en: string };
  vrf: VrfId;
  route: { es: string; en: string };
  bandwidthHint: string;
  networkTime_ms: number;
  demo: true;
}

export const COLD_CHAIN_STEPS: ColdChainStep[] = [
  {
    step: 1,
    id: 'cc-dock',
    title: { es: '1. Llegada al andén y pesaje', en: '1. Airside Dock Arrival & Weighing' },
    detail: {
      es: 'La báscula industrial registra el peso bruto del pallet farmacéutico en el WMS y la cámara LPR valida el vehículo.',
      en: 'Industrial scale logs pallet gross weight into WMS and LPR camera verifies carrier vehicle.',
    },
    vrf: 'VRF-CARGO',
    route: { es: 'Báscula (Cat6A) → Switch Andén → N4', en: 'Scale (Cat6A) → Dock Switch → N4' },
    bandwidthHint: '~0.2 Mbps',
    networkTime_ms: 1.4,
    demo: true,
  },
  {
    step: 2,
    id: 'cc-xray',
    title: { es: '2. Inspección por Rayos X', en: '2. X-Ray Cargo Screening' },
    detail: {
      es: 'El túnel de rayos X transfiere imágenes radiográficas de alta resolución hacia la estación de análisis AVSEC.',
      en: 'X-ray tunnel transfers high-resolution scan images to AVSEC screening workstation.',
    },
    vrf: 'VRF-CARGO',
    route: { es: 'Túnel Rayos X (OS2 10G) → N4 → Estación AVSEC', en: 'X-Ray (OS2 10G) → N4 → AVSEC Desk' },
    bandwidthHint: '~80–250 Mbps ráfaga',
    networkTime_ms: 18,
    demo: true,
  },
  {
    step: 3,
    id: 'cc-customs',
    title: { es: '3. Liberación aduanera (Enlace externo)', en: '3. Customs Release (External Link)' },
    detail: {
      es: 'La oficina de aduana consulta y valida el pedimento hacia el sistema aduanero exterior por Operador A (N1) con respaldo Operador B (N5).',
      en: 'Customs office validates manifest with external customs gateway via Carrier A (N1) with Carrier B (N5) backup.',
    },
    vrf: 'VRF-EXT',
    route: { es: 'Oficina Aduana → N4 → Anillo 2 → N1 → ISP A', en: 'Customs → N4 → Ring 2 → N1 → ISP A' },
    bandwidthHint: '~2 Mbps',
    networkTime_ms: 145,
    demo: true,
  },
  {
    step: 4,
    id: 'cc-cold',
    title: { es: '4. Ingreso a Cámara Fría (2–8 °C)', en: '4. Cold Room Storage (2–8 °C)' },
    detail: {
      es: 'Sensores PoE de temperatura/humedad reportan telemetría periódica al colector local y a la central de monitoreo.',
      en: 'PoE temp/RH sensors report periodic telemetry to local collector and central monitoring.',
    },
    vrf: 'VRF-CARGO',
    route: { es: 'Sensor T° (Cat6A PoE) → Switch Cámara Fría → N4', en: 'Temp Sensor (Cat6A PoE) → Cold Switch → N4' },
    bandwidthHint: '< 0.05 Mbps',
    networkTime_ms: 1.2,
    demo: true,
  },
  {
    step: 5,
    id: 'cc-alert',
    title: { es: '5. Alerta de cadena de frío (> 8 °C)', en: '5. Cold-Chain Excursion Alert (> 8 °C)' },
    detail: {
      es: 'Si la temperatura supera 8 °C, se dispara alarma sonora en puerta, aviso en Despacho Aduana y notificación externa al cliente.',
      en: 'If temperature exceeds 8 °C, door siren triggers plus dispatch alert and external customer notification.',
    },
    vrf: 'VRF-EXT',
    route: { es: 'Colector Frío → N4 → Despacho + ISP A/B', en: 'Cold Collector → N4 → Dispatch + ISP A/B' },
    bandwidthHint: '~0.5 Mbps',
    networkTime_ms: 65,
    demo: true,
  },
  {
    step: 6,
    id: 'cc-pickup',
    title: { es: '6. Recolección en Ventanilla Pública', en: '6. Public Pickup Counter Release' },
    detail: {
      es: 'El destinatario consulta su turno en el tótem y retira el envío certificado en la ventanilla pública (Lente Pasajeros).',
      en: 'Consignee checks queue screen and collects certified shipment at public pickup counter (Passenger Lens).',
    },
    vrf: 'VRF-CARGO',
    route: { es: 'N4 → Switch Ventanilla (Cat6A) → Terminal/Turnos', en: 'N4 → Pickup Switch (Cat6A) → Desk/Queue' },
    bandwidthHint: '~1.5 Mbps',
    networkTime_ms: 2.1,
    demo: true,
  },
];

export interface XrayUtilizationResult {
  mbps: number;
  gbps: number;
  utilizationPct: number;
  status: 'green' | 'amber' | 'red';
}

export function calculateXrayLinkUtilization(
  scansPerHour: number,
  imageSizeMb: number,
  linkSpeedGbps: 1 | 10,
): XrayUtilizationResult {
  // 1 MB = 8 Mb; spread over 3600 s with 2.5x peak burst factor for real-time review
  const avgMbps = (scansPerHour * imageSizeMb * 8) / 3600;
  const peakMbps = Number((avgMbps * 2.5).toFixed(2));
  const gbps = Number((peakMbps / 1000).toFixed(4));
  const linkMbps = linkSpeedGbps * 1000;
  const utilizationPct = Number(Math.min(100, (peakMbps / linkMbps) * 100).toFixed(2));
  const status: 'green' | 'amber' | 'red' =
    utilizationPct >= 80 ? 'red' : utilizationPct >= 55 ? 'amber' : 'green';
  return { mbps: peakMbps, gbps, utilizationPct, status };
}

export interface BuildingFaultItem {
  id: string;
  question: { es: string; en: string };
  severity: 'green' | 'amber' | 'red';
  recovery: { es: string; en: string };
  impact: { es: string; en: string };
}

export const CARGO_SSEI_FAULTS: BuildingFaultItem[] = [
  {
    id: 'bf-cargo-ring',
    question: { es: 'Corte en Anillo de Distribución Carga', en: 'Cut in Cargo Distribution Ring' },
    severity: 'green',
    recovery: { es: '< 50 ms (anillo cerrado)', en: '< 50 ms (closed ring)' },
    impact: {
      es: 'El tráfico de Rayos X, WMS y Cámara Fría conmuta por el sentido opuesto hacia N4 sin pérdida de sesión.',
      en: 'X-Ray, WMS, and Cold Room traffic fails over to the opposite ring direction toward N4 seamlessly.',
    },
  },
  {
    id: 'bf-n4-down',
    question: { es: 'Caída total de Nodo Núcleo N4', en: 'Core Node N4 complete outage' },
    severity: 'red',
    recovery: { es: 'Manual / reemplazo módulo', en: 'Manual / module replacement' },
    impact: {
      es: 'As World Cargo queda sin salida al núcleo (sin aduana externa); sensores de cámara fría registran datos localmente en memoria.',
      en: 'As World Cargo loses core uplink (no external customs); cold room sensors buffer telemetry locally.',
    },
  },
  {
    id: 'bf-ext-isp',
    question: { es: 'Caída de Operador Externo A (N1)', en: 'External Carrier A outage (N1)' },
    severity: 'amber',
    recovery: { es: '~1–3 s (BGP / ruta respaldo)', en: '~1–3 s (BGP / backup route)' },
    impact: {
      es: 'Las consultas aduanales y alertas de cadena de frío conmutan automáticamente por Operador B en N5.',
      en: 'Customs queries and cold-chain alerts fail over automatically via Carrier B at N5.',
    },
  },
  {
    id: 'bf-room-sw',
    question: { es: 'Falla de switch de una sala (ej. Cámara Fría)', en: 'Room switch failure (e.g. Cold Room)' },
    severity: 'red',
    recovery: { es: 'Cambio de switch / enlace', en: 'Switch / link replacement' },
    impact: {
      es: 'La sala pierde monitoreo remoto en línea, pero la alarma sonora y el registrador local con batería siguen operando.',
      en: 'Room loses online remote monitoring, while local audible alarm and battery logger continue running.',
    },
  },
];
