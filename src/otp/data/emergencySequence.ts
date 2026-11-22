import { FIBER_CABLES } from './fiber';
import type { VrfId } from './services';

export type EmergencyFaultMode = 'none' | 'single-cut' | 'dual-cut';

export interface EmergencyStepSpec {
  step: number;
  id: string;
  title: { es: string; en: string };
  detail: { es: string; en: string };
  vrf: VrfId;
  priority: string;
  routeLabel: { es: string; en: string };
  networkTime_ms: number;
  physicalTime_s: number;
  terminalOnly?: boolean;
  demo: true;
}

export interface TowerSseiHop {
  from: string;
  to: string;
  medium: string;
  distance_m: number;
  latency_us: number;
}

export const EMERGENCY_STEPS: EmergencyStepSpec[] = [
  {
    step: 1,
    id: 'emg-alarm',
    title: { es: '1. Alarma Torre (N3) → SSEI (N6)', en: '1. Tower (N3) → SSEI (N6) Crash Alarm' },
    detail: {
      es: 'El controlador pulsa la alarma roja; la señal viaja con prioridad máxima QoS hacia la sala de despacho SSEI.',
      en: 'Tower controller presses red crash button; signal travels at top QoS priority to SSEI dispatch.',
    },
    vrf: 'VRF-EMG',
    priority: 'Crítica (EF / CS5)',
    routeLabel: { es: 'N3 → Anillo Airside → N6', en: 'N3 → Airside Ring → N6' },
    networkTime_ms: 1.8,
    physicalTime_s: 0.5,
    demo: true,
  },
  {
    step: 2,
    id: 'emg-bays',
    title: { es: '2. Apertura Cocheras y Sirena ARFF', en: '2. ARFF Bay Doors & Siren' },
    detail: {
      es: 'El PLC de Cocheras enciende luces de emergencia, abre las 3 puertas seccionales y pone el semáforo en verde.',
      en: 'Bay PLC turns on emergency lights, raises 3 sectional doors, and sets exit traffic light green.',
    },
    vrf: 'VRF-EMG',
    priority: 'Crítica (EF)',
    routeLabel: { es: 'N6 → Switch Cocheras → PLC', en: 'N6 → Bay Switch → PLC' },
    networkTime_ms: 0.8,
    physicalTime_s: 8.0,
    demo: true,
  },
  {
    step: 3,
    id: 'emg-agl',
    title: { es: '3. Prioridad Luces AGL (Calle de Rodaje L)', en: '3. AGL Priority Lighting (Taxiway L)' },
    detail: {
      es: 'La Torre activa barras de parada y guiado luminoso hacia el punto del incidente en Taxiway L.',
      en: 'Tower activates stop-bars and taxiway routing guidance toward the Taxiway L incident.',
    },
    vrf: 'VRF-AGL',
    priority: 'Crítica (OT)',
    routeLabel: { es: 'N3 → Anillo Airside → R3_A', en: 'N3 → Airside Ring → R3_A' },
    networkTime_ms: 1.6,
    physicalTime_s: 1.2,
    demo: true,
  },
  {
    step: 4,
    id: 'emg-cctv',
    title: { es: '4. Orientación Automática CCTV', en: '4. Automated CCTV Slew-to-Cue' },
    detail: {
      es: 'Las cámaras perimetrales/airside cercanas se orientan al incidente y envían video al videowall SSEI.',
      en: 'Nearby airside/perimeter cameras slew to the incident and stream to SSEI videowall.',
    },
    vrf: 'VRF-SEG',
    priority: 'Alta (AF41)',
    routeLabel: { es: 'Cámaras Airside → N6 → Despacho', en: 'Airside Cams → N6 → Dispatch' },
    networkTime_ms: 45,
    physicalTime_s: 2.5,
    demo: true,
  },
  {
    step: 5,
    id: 'emg-access',
    title: { es: '5. Apertura de Accesos de Emergencia', en: '5. Emergency Gate Access Unlock' },
    detail: {
      es: 'Se desbloquean automáticamente los portones perimetrales y accesos viales de la zona afectada.',
      en: 'Perimeter vehicle gates in the affected sector unlock automatically for rescue units.',
    },
    vrf: 'VRF-SEG',
    priority: 'Alta (AF31)',
    routeLabel: { es: 'N6 → Controladora Accesos', en: 'N6 → Access Controller' },
    networkTime_ms: 120,
    physicalTime_s: 4.0,
    demo: true,
  },
  {
    step: 6,
    id: 'emg-terminal',
    title: { es: '6. Aviso en Terminal (FIDS y Megafonía)', en: '6. Terminal Advisory (FIDS & PA)' },
    detail: {
      es: 'Solo si el evento afecta operaciones de terminal: actualiza tableros FIDS y dispara mensaje de voz PA.',
      en: 'Only if terminal ops are affected: updates FIDS boards and triggers PA voice announcement.',
    },
    vrf: 'VRF-AERO',
    priority: 'Media (AF21)',
    routeLabel: { es: 'N1/N5 → IDFs Terminal → FIDS/PA', en: 'N1/N5 → Terminal IDFs → FIDS/PA' },
    networkTime_ms: 85,
    physicalTime_s: 3.0,
    terminalOnly: true,
    demo: true,
  },
];

export function computeTowerSseiHops(faultMode: EmergencyFaultMode): TowerSseiHop[] {
  const airsideCable = FIBER_CABLES.DISTRIB_AIRSIDE;
  const coreRing1 = FIBER_CABLES.NUCLEO_ANILLO1_RUTA_A;
  const airsideSpan_m = airsideCable ? Math.round(airsideCable.length_m * 0.42) : 640;
  const backupSpan_m = coreRing1 ? Math.round(coreRing1.length_m * 0.45) : 920;

  if (faultMode === 'dual-cut') {
    return [
      { from: 'Consola Torre (N3)', to: 'Radio Base TETRA/VHF', medium: 'Cobre Cat6A', distance_m: 12, latency_us: 1 },
      { from: 'Radio Base TETRA/VHF', to: 'Receptor SSEI (N6)', medium: 'Radioenlace respaldo (RF)', distance_m: 580, latency_us: 180000 },
      { from: 'Receptor SSEI (N6)', to: 'Teléfono Rojo / PLC Cocheras', medium: 'Cobre Cat6A', distance_m: 28, latency_us: 1 },
    ];
  }

  if (faultMode === 'single-cut') {
    return [
      { from: 'Consola Torre (N3)', to: 'Switch Core N3', medium: 'Cobre Cat6A', distance_m: 10, latency_us: 1 },
      { from: 'Switch Core N3', to: 'Nodo N5 (MDF-B)', medium: 'Fibra OS2 (Core Ring 1)', distance_m: Math.round(backupSpan_m * 0.55), latency_us: Math.round(backupSpan_m * 0.55 * 0.005) },
      { from: 'Nodo N5 (MDF-B)', to: 'Nodo N6 (SSEI)', medium: 'Fibra OS2 (Core Ring 1)', distance_m: Math.round(backupSpan_m * 0.45), latency_us: Math.round(backupSpan_m * 0.45 * 0.005) },
      { from: 'Nodo N6 (SSEI)', to: 'Sala Alarmas / Cocheras', medium: 'Fibra/Cat6A local', distance_m: 38, latency_us: 1 },
    ];
  }

  return [
    { from: 'Consola Torre (N3)', to: 'ODF Airside N3', medium: 'Cobre Cat6A / Patch', distance_m: 10, latency_us: 1 },
    { from: 'ODF Airside N3', to: 'Nodo N6 (SSEI)', medium: 'Fibra OS2 (Anillo Airside)', distance_m: airsideSpan_m, latency_us: Number((airsideSpan_m * 0.005).toFixed(2)) },
    { from: 'Nodo N6 (SSEI)', to: 'Sala Alarmas / Cocheras', medium: 'Cat6A / Fibra local', distance_m: 38, latency_us: 1 },
  ];
}
