import type { CadPoint } from '../lib/coords';

export type FailureId =
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12';

export interface FailureScenarioSpec {
  id: FailureId;
  version: 'v1' | 'v2';
  title: { es: string; en: string };
  visualEffect: { es: string; en: string };
  affectedServices: { es: string; en: string };
  survivalMechanism: { es: string; en: string };
  recoveryTimeLabel: { es: string; en: string };
  recoverySpeed: 'sub50ms' | 'seconds' | 'minutes' | 'immediate';
  slaMet: boolean;
  degradedMode?: boolean;
  cutPoints_cad: readonly CadPoint[];
  disabledNodeId?: string;
  showRadioBackupLink?: boolean;
}

export const FAILURE_SCENARIOS: FailureScenarioSpec[] = [
  {
    id: 'F1',
    version: 'v1',
    title: {
      es: 'F1 · Corte de un tramo del Anillo 1 (A-N2N3)',
      en: 'F1 · Single Span Cut on Core Ring 1 (A-N2N3)',
    },
    visualEffect: {
      es: 'Los pulsos del Anillo 1 invierten sentido y rodean por el otro lado (ERPS G.8032).',
      en: 'Ring 1 pulses reverse direction and wrap around the opposite side (ERPS G.8032).',
    },
    affectedServices: { es: 'Ninguno', en: 'None' },
    survivalMechanism: {
      es: 'ERPS desbloquea el enlace RPL en el propio Anillo 1 sin migrar de anillo.',
      en: 'ERPS unblocks the RPL link inside Ring 1 without leaving the ring.',
    },
    recoveryTimeLabel: { es: '< 50 ms', en: '< 50 ms' },
    recoverySpeed: 'sub50ms',
    slaMet: true,
    cutPoints_cad: [[290.0, -384.5]],
  },
  {
    id: 'F2',
    version: 'v1',
    title: {
      es: 'F2 · Corte del mismo tramo en Ruta A y Ruta B (N2–N3)',
      en: 'F2 · Simultaneous Cut on Route A and Route B (N2–N3)',
    },
    visualEffect: {
      es: 'Cada anillo (Azul y Naranja) invierte sentido de forma independiente.',
      en: 'Each ring (Blue and Orange) wraps around independently in the opposite direction.',
    },
    affectedServices: { es: 'Ninguno', en: 'None' },
    survivalMechanism: {
      es: 'Ambos anillos conservan conectividad completa por el sentido contrario.',
      en: 'Both rings maintain full connectivity via the opposite direction.',
    },
    recoveryTimeLabel: { es: '< 50 ms', en: '< 50 ms' },
    recoverySpeed: 'sub50ms',
    slaMet: true,
    cutPoints_cad: [
      [290.0, -384.5],
      [290.0, -399.5],
    ],
  },
  {
    id: 'F3',
    version: 'v1',
    title: {
      es: 'F3 · Dos cortes en el Anillo 1 (A-N2N3 y A-N5N6)',
      en: 'F3 · Dual Cut Splitting Core Ring 1 (A-N2N3 & A-N5N6)',
    },
    visualEffect: {
      es: 'El Anillo 1 queda partido en dos; los servicios críticos migran visualmente al Anillo 2.',
      en: 'Ring 1 splits into two; critical services migrate onto Ring 2.',
    },
    affectedServices: {
      es: 'Ninguno (degradación breve durante convergencia)',
      en: 'None (brief convergence degradation)',
    },
    survivalMechanism: {
      es: 'Ruteo dinámico migra VRF-ATC, VRF-AGL y VRF-SEG hacia el Anillo 2 (que opera por debajo del 80 % de 100G).',
      en: 'Dynamic routing shifts VRF-ATC, VRF-AGL, and VRF-SEG onto Ring 2 (operating within 80% of 100G).',
    },
    recoveryTimeLabel: { es: 'Segundos (1–3 s)', en: 'Seconds (1–3 s)' },
    recoverySpeed: 'seconds',
    slaMet: true,
    cutPoints_cad: [
      [290.0, -384.5],
      [445.0, -74.0],
    ],
  },
  {
    id: 'F4',
    version: 'v1',
    title: {
      es: 'F4 · Pérdida total del nodo N1 (MDF-A)',
      en: 'F4 · Total Loss of Core Node N1 (MDF-A)',
    },
    visualEffect: {
      es: 'N1 se apaga; N5 (MDF-B) asume servicios centrales y el anillo Terminal sale por N2.',
      en: 'N1 powers down; N5 (MDF-B) takes over core servers and Terminal ring exits via N2.',
    },
    affectedServices: { es: 'Ninguno', en: 'None' },
    survivalMechanism: {
      es: 'Respaldo geográfico en MDF-B (N5) + dual-homing del anillo Terminal hacia N2 (Llegadas) + salida por Operador B.',
      en: 'Geographic redundancy at MDF-B (N5) + Terminal ring dual-homing via N2 + ISP Operator B.',
    },
    recoveryTimeLabel: { es: 'Segundos (2–5 s)', en: 'Seconds (2–5 s)' },
    recoverySpeed: 'seconds',
    slaMet: true,
    disabledNodeId: 'N1',
    cutPoints_cad: [[45.0, -103.58]],
  },
  {
    id: 'F5',
    version: 'v1',
    title: {
      es: 'F5 · Corte de la subida del anillo Terminal hacia N1',
      en: 'F5 · Terminal Distribution Uplink Cut to N1',
    },
    visualEffect: {
      es: 'El tráfico de R1_T..R6_T conmuta hacia la segunda subida en N2 (Llegadas).',
      en: 'Traffic from R1_T..R6_T switches to the second uplink at N2 (Arrivals).',
    },
    affectedServices: { es: 'Ninguno', en: 'None' },
    survivalMechanism: {
      es: 'Dual-homing del anillo de distribución Terminal entre N1 y N2 con ERPS.',
      en: 'Dual-homing of the Terminal distribution ring between N1 and N2 with ERPS.',
    },
    recoveryTimeLabel: { es: '< 50 ms', en: '< 50 ms' },
    recoverySpeed: 'sub50ms',
    slaMet: true,
    cutPoints_cad: [[32.5, -75.8]],
  },
  {
    id: 'F6',
    version: 'v1',
    title: {
      es: 'F6 · Torre (N3) aislada: 4 cables cortados (N2–N3 y N3–N5)',
      en: 'F6 · Control Tower (N3) Isolated: 4 Cables Cut (N2–N3 & N3–N5)',
    },
    visualEffect: {
      es: 'N3 pierde las 4 fibras; se activa el enlace de respaldo por radio (200 m, cota 11) entre N5 y N3.',
      en: 'N3 loses all 4 fibers; emergency 200 m radio link (Cota 11 hypotenuse) activates between N5 and N3.',
    },
    affectedServices: {
      es: 'Enlace de Torre en modo degradado (voz ATC y telemetría esencial)',
      en: 'Tower link in degraded mode (essential ATC voice & telemetry)',
    },
    survivalMechanism: {
      es: 'Escenario honesto de doble falla severa: radioenlace directo de 200 m entre cabeza del Muelle (N5) y Torre (N3) mantiene operación mínima.',
      en: 'Honest double-fault scenario: 200 m direct microwave backup between Pier Head (N5) and Tower (N3) sustains critical operations.',
    },
    recoveryTimeLabel: { es: 'Minutos (modo degradado)', en: 'Minutes (degraded mode)' },
    recoverySpeed: 'minutes',
    slaMet: false,
    degradedMode: true,
    showRadioBackupLink: true,
    cutPoints_cad: [
      [455.0, -386.67],
      [455.0, -401.67],
      [405.0, -300.0],
      [390.0, -300.0],
    ],
  },
  {
    id: 'F7',
    version: 'v1',
    title: {
      es: 'F7 · Caída de un switch de acceso (Rack R2_T)',
      en: 'F7 · Access Switch Failure (Rack R2_T)',
    },
    visualEffect: {
      es: 'R2_T queda en falla; el anillo Terminal continúa pasando y equipos críticos conmutan.',
      en: 'R2_T faults; Terminal ring passes through and dual-homed critical endpoints switch over.',
    },
    affectedServices: {
      es: 'Solo equipos no críticos de ese rack',
      en: 'Only single-homed non-critical devices on that rack',
    },
    survivalMechanism: {
      es: 'Equipos críticos (filtros/controles) tienen doble conexión a dos switches distintos.',
      en: 'Critical endpoints have dual-homed connections to two separate switches.',
    },
    recoveryTimeLabel: { es: 'Inmediato', en: 'Immediate' },
    recoverySpeed: 'immediate',
    slaMet: true,
    disabledNodeId: 'R2_T',
    cutPoints_cad: [[75.0, -48.0]],
  },
  {
    id: 'F8',
    version: 'v1',
    title: {
      es: 'F8 · Caída del Operador de Internet A (en N1)',
      en: 'F8 · ISP Operator A Outage (at N1)',
    },
    visualEffect: {
      es: 'La salida externa en N1 se apaga y todo el tráfico WAN sale por el Operador B en N5.',
      en: 'External WAN arrow at N1 turns off and traffic exits via Operator B at N5.',
    },
    affectedServices: { es: 'Ninguno', en: 'None' },
    survivalMechanism: {
      es: 'BGP multihoming con dos operadores por rutas y edificios opuestos (N1 y N5).',
      en: 'BGP multihoming with two carriers entering at opposite MDFs (N1 and N5).',
    },
    recoveryTimeLabel: { es: 'Segundos (BGP)', en: 'Seconds (BGP)' },
    recoverySpeed: 'seconds',
    slaMet: true,
    cutPoints_cad: [[15.0, -103.58]],
  },
  {
    id: 'F9',
    version: 'v2',
    title: {
      es: 'F9 · Corte de ambos sentidos Airside hacia bóveda AGL R3_A',
      en: 'F9 · Dual Airside Fiber Cut Isolating AGL Vault R3_A',
    },
    visualEffect: {
      es: 'R3_A queda aislada; las luces de Calle L mantienen su último paso de brillo (modo local) y Torre recibe alarma.',
      en: 'R3_A is isolated; Taxiway L lights hold their last brightness step (local mode) and Tower raises an alarm.',
    },
    affectedServices: {
      es: 'Telemetría remota de bóveda R3_A (luces siguen encendidas)',
      en: 'Remote monitoring of vault R3_A (taxiway lights stay illuminated)',
    },
    survivalMechanism: {
      es: 'Diseño fail-safe de los reguladores CCR: ante pérdida de comunicación con ALCMS, conservan la corriente activa y permiten operación manual en bóveda.',
      en: 'CCR fail-safe design: upon losing ALCMS comms, regulators latch their last current step and allow local manual operation.',
    },
    recoveryTimeLabel: { es: 'Inmediato (modo local)', en: 'Immediate (local fail-safe)' },
    recoverySpeed: 'immediate',
    slaMet: true,
    degradedMode: true,
    disabledNodeId: 'R3_A',
    cutPoints_cad: [
      [580.0, -155.0],
      [512.0, -90.0],
    ],
  },
  {
    id: 'F10',
    version: 'v2',
    title: {
      es: 'F10 · Caída del switch del IDF R1_T en Salidas',
      en: 'F10 · Terminal IDF R1_T Switch Failure in Departures',
    },
    visualEffect: {
      es: 'Pantallas, cámaras y APs de Salidas NO quedan sin PoE; R2_T y R3_T siguen operando.',
      en: 'Screens, cameras, and APs in Departures NW lose PoE; R2_T and R3_T continue normally.',
    },
    affectedServices: {
      es: 'Solo dispositivos de acceso de la zona NO de Salidas (R1_T)',
      en: 'Only access endpoints in Departures NW zone (R1_T)',
    },
    survivalMechanism: {
      es: 'La arquitectura en 3 capas aísla la falla a un único IDF; los mostradores/filtros críticos con doble conexión conmutan a R2_T.',
      en: '3-layer hierarchy isolates the fault to a single IDF; dual-homed critical desks fail over to R2_T.',
    },
    recoveryTimeLabel: { es: 'Inmediato (zonas vecinas)', en: 'Immediate (adjacent zones)' },
    recoverySpeed: 'immediate',
    slaMet: true,
    disabledNodeId: 'R1_T',
    cutPoints_cad: [[20.0, -48.0]],
  },
  {
    id: 'F11',
    version: 'v2',
    title: {
      es: 'F11 · Caída del servidor FIDS primario en MDF-A (N1)',
      en: 'F11 · Primary FIDS Server Failure in MDF-A (N1)',
    },
    visualEffect: {
      es: 'Las pantallas FIDS conmutan a la réplica activa en MDF-B (N5) por el Anillo 2.',
      en: 'All FIDS displays fail over to the active replica in MDF-B (N5) across Ring 2.',
    },
    affectedServices: {
      es: 'Ninguno (pantallas conservan imagen y pasan a MDF-B)',
      en: 'None (displays retain cache and switch to MDF-B)',
    },
    survivalMechanism: {
      es: 'Réplica síncrona AODB/FIDS en MDF-B (N5) alcanzable desde todos los IDFs por el anillo Terminal y el núcleo.',
      en: 'Synchronous AODB/FIDS replica at MDF-B (N5) reachable from all IDFs via the Terminal and Core rings.',
    },
    recoveryTimeLabel: { es: 'Segundos (sin pérdida visible)', en: 'Seconds (zero visual loss)' },
    recoverySpeed: 'seconds',
    slaMet: true,
    cutPoints_cad: [[45.0, -98.0]],
  },
  {
    id: 'F12',
    version: 'v2',
    title: {
      es: 'F12 · Intrusión en la cerca perimetral (Evento DAS-fibra)',
      en: 'F12 · Perimeter Fence Intrusion (Fiber-DAS Security Event)',
    },
    visualEffect: {
      es: 'Pico de retrodispersión a 920 m en el anillo Perímetro; la cámara CCTV-R4_P se orienta automáticamente.',
      en: 'Backscatter spike at 920 m on the Perimeter ring; camera CCTV-R4_P slews automatically to the target.',
    },
    affectedServices: {
      es: 'Ninguno (evento de seguridad física detectado por la fibra)',
      en: 'None (physical security event detected by the fiber itself)',
    },
    survivalMechanism: {
      es: 'Integración OT entre interrogador DAS-fibra (en N5) y sistema CCTV IP en VRF-SEG.',
      en: 'OT cross-subsystem integration between Fiber-DAS interrogator (at N5) and IP CCTV on VRF-SEG.',
    },
    recoveryTimeLabel: { es: 'Tiempo real (< 1 s)', en: 'Real-time (< 1 s)' },
    recoverySpeed: 'immediate',
    slaMet: true,
    cutPoints_cad: [[-60.0, -260.0]],
  },
];
