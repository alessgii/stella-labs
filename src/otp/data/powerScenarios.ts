export interface NodePowerProfile {
  id: string;
  label: { es: string; en: string };
  kind: 'core' | 'idf';
  upsMinutes: number;
  priorityTier: 1 | 2 | 3; // 1 = Crítico (ATC/AGL/SSEI), 2 = Seguridad/BHS, 3 = TI/Pasajeros
  services: string;
  demo: true;
}

export const GENERATOR_START_DELAY_S = 10; // demo reference
export const AGL_SECONDARY_SWITCH_REF = {
  es: 'Alimentación secundaria AGL: ≤ 1 s (CAT II/III) a ≤ 15 s (CAT I) — verificar con la norma vigente.',
  en: 'AGL secondary power switchover: ≤ 1 s (CAT II/III) to ≤ 15 s (CAT I) — verify against current standard.',
};

export const NODE_POWER_PROFILES: NodePowerProfile[] = [
  {
    id: 'N1',
    label: { es: 'N1 · MDF-A (Salidas)', en: 'N1 · MDF-A (Departures)' },
    kind: 'core',
    upsMinutes: 120,
    priorityTier: 1,
    services: 'VRF-ATC, VRF-SEG, VRF-AERO',
    demo: true,
  },
  {
    id: 'N3',
    label: { es: 'N3 · Torre de Control', en: 'N3 · Control Tower' },
    kind: 'core',
    upsMinutes: 180,
    priorityTier: 1,
    services: 'VRF-ATC, VRF-AGL, VRF-EMG',
    demo: true,
  },
  {
    id: 'N6',
    label: { es: 'N6 · Nave SSEI / Subestación', en: 'N6 · SSEI / Substation' },
    kind: 'core',
    upsMinutes: 180,
    priorityTier: 1,
    services: 'VRF-EMG, VRF-PWR, VRF-AGL',
    demo: true,
  },
  {
    id: 'N5',
    label: { es: 'N5 · MDF-B (Muelle)', en: 'N5 · MDF-B (Pier)' },
    kind: 'core',
    upsMinutes: 90,
    priorityTier: 2,
    services: 'VRF-SEG, VRF-AERO, VRF-PAX',
    demo: true,
  },
  {
    id: 'N4',
    label: { es: 'N4 · As World Cargo', en: 'N4 · As World Cargo' },
    kind: 'core',
    upsMinutes: 60,
    priorityTier: 2,
    services: 'VRF-CARGO, VRF-EXT, VRF-SEG',
    demo: true,
  },
  {
    id: 'N2',
    label: { es: 'N2 · Llegadas', en: 'N2 · Arrivals' },
    kind: 'core',
    upsMinutes: 60,
    priorityTier: 2,
    services: 'VRF-BHS, VRF-SEG, VRF-PAX',
    demo: true,
  },
  {
    id: 'R1_T–R3_T',
    label: { es: 'IDFs Salidas (R1_T–R3_T)', en: 'Departures IDFs (R1_T–R3_T)' },
    kind: 'idf',
    upsMinutes: 30,
    priorityTier: 3,
    services: 'VRF-AERO, VRF-PAX, VRF-TENANT',
    demo: true,
  },
  {
    id: 'R4_T–R6_T',
    label: { es: 'IDFs Muelle/Llegadas (R4_T–R6_T)', en: 'Pier/Arrivals IDFs (R4_T–R6_T)' },
    kind: 'idf',
    upsMinutes: 25,
    priorityTier: 3,
    services: 'VRF-AERO, VRF-PAX, VRF-TENANT',
    demo: true,
  },
];

export interface BlackoutNodeStatus {
  id: string;
  label: { es: string; en: string };
  upsMinutes: number;
  priorityTier: 1 | 2 | 3;
  alive: boolean;
  supply: 'grid' | 'ups' | 'generator' | 'shed';
}

export function simulateBlackoutAtMinute(
  elapsedMin: number,
  generatorStarted: boolean,
  gridCut: boolean,
): BlackoutNodeStatus[] {
  return NODE_POWER_PROFILES.map((n) => {
    if (!gridCut) {
      return { ...n, alive: true, supply: 'grid' };
    }
    if (generatorStarted) {
      return { ...n, alive: true, supply: elapsedMin < 0.2 ? 'ups' : 'generator' };
    }
    // Generator failed -> battery countdown & prioritized load shedding
    const alive = elapsedMin <= n.upsMinutes;
    return {
      ...n,
      alive,
      supply: alive ? 'ups' : 'shed',
    };
  });
}
