import type { CadPoint } from '../lib/coords';
import type { FloorId } from './floors';
import type { SubsystemId } from './subsystems';

export type TerminalIdfId = 'R1_T' | 'R2_T' | 'R3_T' | 'R4_T' | 'R5_T' | 'R6_T';

export interface DeviceSpec {
  id: string;
  name: { es: string; en: string };
  subsystemId: SubsystemId;
  buildingId: 'departures' | 'pier' | 'arrivals';
  floor: FloorId;
  pos_cad: CadPoint;
  elev_m: number;
  idfId: TerminalIdfId;
  highEmiOrAtex?: boolean;
  demo: true;
}

export interface CableTraySegment {
  id: string;
  floor: FloorId;
  start_cad: CadPoint;
  end_cad: CadPoint;
  elev_m: number;
}

export interface VerticalRiserSpec {
  id: string;
  label: string;
  pos_cad: CadPoint;
  fromElev_m: number;
  toElev_m: number;
}

export const SALIDAS_TRAY_SEGMENTS: CableTraySegment[] = [
  // Ground Floor overhead cable trays (y = 3.2 m)
  { id: 'tray-gf-spine-w', floor: 'GF', start_cad: [20, -18], end_cad: [20, -192], elev_m: 3.2 },
  { id: 'tray-gf-spine-e', floor: 'GF', start_cad: [75, -18], end_cad: [75, -192], elev_m: 3.2 },
  { id: 'tray-gf-cross-n', floor: 'GF', start_cad: [12, -48], end_cad: [82, -48], elev_m: 3.2 },
  { id: 'tray-gf-cross-m', floor: 'GF', start_cad: [20, -103.58], end_cad: [75, -103.58], elev_m: 3.2 },
  { id: 'tray-gf-cross-s', floor: 'GF', start_cad: [12, -162], end_cad: [82, -162], elev_m: 3.2 },
  // First Floor mezzanine tray (y = 9.2 m)
  { id: 'tray-f1-spine-e', floor: 'F1', start_cad: [75, -90], end_cad: [75, -200], elev_m: 9.2 },
  { id: 'tray-f1-cross', floor: 'F1', start_cad: [40, -135], end_cad: [75, -135], elev_m: 9.2 },
];

export const SALIDAS_RISERS: VerticalRiserSpec[] = [
  { id: 'RISER-MDF-A', label: 'Riser MDF-A (PB ↔ P1)', pos_cad: [45.0, -103.58], fromElev_m: 3.2, toElev_m: 9.2 },
  { id: 'RISER-R3_T', label: 'Riser IDF R3_T (PB ↔ P1)', pos_cad: [75.0, -162.0], fromElev_m: 3.2, toElev_m: 9.2 },
];

export const SALIDAS_DUCT_ENTRIES: {
  id: string;
  route: 'A' | 'B';
  label: { es: string; en: string };
  points_cad: readonly CadPoint[];
}[] = [
  {
    id: 'duct-entry-a',
    route: 'A',
    label: { es: 'Acometida Ruta A (Galería X=65)', en: 'Route A Duct Entry (Gallery X=65)' },
    points_cad: [
      [65.0, -207.16],
      [65.0, -103.58],
      [45.0, -103.58],
    ],
  },
  {
    id: 'duct-entry-b',
    route: 'B',
    label: { es: 'Acometida Ruta B (Galería X=55 / lado opuesto)', en: 'Route B Duct Entry (Gallery X=55 / opposite side)' },
    points_cad: [
      [55.0, -207.16],
      [30.0, -103.58],
      [45.0, -103.58],
    ],
  },
];

// Deterministic PRNG (Mulberry32) so same seed = identical layout
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

const IDF_COORDS: Record<'R1_T' | 'R2_T' | 'R3_T', CadPoint> = {
  R1_T: [20.0, -48.0],
  R2_T: [75.0, -48.0],
  R3_T: [75.0, -162.0],
};

function assignNearestSalidasIdf(
  pos: CadPoint,
  floor: FloorId,
): 'R1_T' | 'R2_T' | 'R3_T' {
  if (floor === 'F1') return 'R3_T';
  let bestId: 'R1_T' | 'R2_T' | 'R3_T' = 'R1_T';
  let bestDist = Infinity;
  for (const [id, pt] of Object.entries(IDF_COORDS) as [
    'R1_T' | 'R2_T' | 'R3_T',
    CadPoint,
  ][]) {
    const d = Math.abs(pt[0] - pos[0]) + Math.abs(pt[1] - pos[1]);
    if (d < bestDist) {
      bestDist = d;
      bestId = id;
    }
  }
  return bestId;
}

function generateSalidasDevices(): DeviceSpec[] {
  const rand = mulberry32(20260401);
  const devices: DeviceSpec[] = [];

  // 1. 24 FIDS Screens (Check-in islands, Domestic gates 50-57, Security/Hall, South Hall, F1 Mezzanine)
  const fidsPlacements: { pos: CadPoint; floor: FloorId; elev: number }[] = [
    // 6 above Check-in Island A
    ...[20, 30, 40, 50, 60, 70].map((x) => ({ pos: [x, -26.5] as CadPoint, floor: 'GF' as const, elev: 2.8 })),
    // 6 above Check-in Island B
    ...[20, 30, 40, 50, 60, 70].map((x) => ({ pos: [x, -46.5] as CadPoint, floor: 'GF' as const, elev: 2.8 })),
    // 4 at Domestic Gates 50-57
    ...[16, 34, 52, 70].map((x) => ({ pos: [x, -7.5] as CadPoint, floor: 'GF' as const, elev: 2.7 })),
    // 4 in West Entrance / Central / South Hall (including SW corner > 90m to demonstrate fiber!)
    { pos: [10, -82], floor: 'GF', elev: 2.8 },
    { pos: [10, -112], floor: 'GF', elev: 2.8 },
    { pos: [66, -98], floor: 'GF', elev: 2.8 },
    { pos: [8, -196], floor: 'GF', elev: 2.8 }, // > 90m from R3_T!
    // 4 on F1 Mezzanine (including F1 North > 90m from R3_T!)
    { pos: [42, -92], floor: 'F1', elev: 8.6 }, // > 90m from R3_T!
    { pos: [70, -112], floor: 'F1', elev: 8.6 },
    { pos: [52, -148], floor: 'F1', elev: 8.6 },
    { pos: [74, -184], floor: 'F1', elev: 8.6 },
  ];
  fidsPlacements.forEach((fp, idx) => {
    const num = String(idx + 1).padStart(3, '0');
    devices.push({
      id: `FIDS-${num}`,
      name: { es: `Pantalla FIDS-${num}`, en: `FIDS Display-${num}` },
      subsystemId: 'fids',
      buildingId: 'departures',
      floor: fp.floor,
      pos_cad: fp.pos,
      elev_m: fp.elev,
      idfId: assignNearestSalidasIdf(fp.pos, fp.floor),
      demo: true,
    });
  });

  // 2. 40 CUPPS Check-in workstations (20 on Island A, 20 on Island B)
  for (let i = 0; i < 40; i += 1) {
    const island = i < 20 ? 0 : 1;
    const slot = i % 20;
    const x = 16.5 + slot * 3.0;
    const y = island === 0 ? -27.5 : -47.5;
    const pos: CadPoint = [Number(x.toFixed(1)), y];
    devices.push({
      id: `CUPPS-${String(i + 1).padStart(3, '0')}`,
      name: { es: `Estación CUPPS-${i + 1}`, en: `CUPPS Workstation-${i + 1}` },
      subsystemId: 'cupps',
      buildingId: 'departures',
      floor: 'GF',
      pos_cad: pos,
      elev_m: 1.0,
      idfId: assignNearestSalidasIdf(pos, 'GF'),
      demo: true,
    });
  }

  // 3. 60 IP CCTV Cameras (50 GF, 10 F1)
  for (let i = 0; i < 60; i += 1) {
    const isF1 = i >= 50;
    const x = isF1 ? 40 + rand() * 46 : 4 + rand() * 82;
    const y = isF1 ? -90 - rand() * 110 : -5 - rand() * 198;
    const pos: CadPoint = [Number(x.toFixed(1)), Number(y.toFixed(1))];
    const floor: FloorId = isF1 ? 'F1' : 'GF';
    devices.push({
      id: `CCTV-${String(i + 1).padStart(3, '0')}`,
      name: { es: `Cámara CCTV-${i + 1}`, en: `CCTV Camera-${i + 1}` },
      subsystemId: 'cctv',
      buildingId: 'departures',
      floor,
      pos_cad: pos,
      elev_m: isF1 ? 9.5 : 3.5,
      idfId: assignNearestSalidasIdf(pos, floor),
      demo: true,
    });
  }

  // 4. 30 Wi-Fi Access Points (22 GF, 8 F1)
  for (let i = 0; i < 30; i += 1) {
    const isF1 = i >= 22;
    const col = i % 3;
    const row = Math.floor((isF1 ? i - 22 : i) / 3);
    const x = isF1 ? 46 + (i % 2) * 32 : 16 + col * 29 + (rand() - 0.5) * 4;
    const y = isF1 ? -96 - row * 30 : -15 - row * 25 + (rand() - 0.5) * 4;
    const pos: CadPoint = [Number(x.toFixed(1)), Number(y.toFixed(1))];
    const floor: FloorId = isF1 ? 'F1' : 'GF';
    devices.push({
      id: `AP-${String(i + 1).padStart(3, '0')}`,
      name: { es: `Access Point Wi-Fi-${i + 1}`, en: `Wi-Fi AP-${i + 1}` },
      subsystemId: 'wifi_das_cell',
      buildingId: 'departures',
      floor,
      pos_cad: pos,
      elev_m: isF1 ? 9.8 : 3.8,
      idfId: assignNearestSalidasIdf(pos, floor),
      demo: true,
    });
  }

  // 5. 60 PA / VoIP Speakers (48 GF, 12 F1)
  for (let i = 0; i < 60; i += 1) {
    const isF1 = i >= 48;
    const x = isF1 ? 42 + rand() * 44 : 6 + rand() * 78;
    const y = isF1 ? -92 - rand() * 108 : -8 - rand() * 192;
    const pos: CadPoint = [Number(x.toFixed(1)), Number(y.toFixed(1))];
    const floor: FloorId = isF1 ? 'F1' : 'GF';
    devices.push({
      id: `PA-${String(i + 1).padStart(3, '0')}`,
      name: { es: `Altavoz/VoIP PA-${i + 1}`, en: `PA/VoIP Speaker-${i + 1}` },
      subsystemId: 'pa_voip',
      buildingId: 'departures',
      floor,
      pos_cad: pos,
      elev_m: isF1 ? 9.8 : 3.8,
      idfId: assignNearestSalidasIdf(pos, floor),
      demo: true,
    });
  }

  // 6. 12 DALI Lighting Controllers (9 GF, 3 F1)
  for (let i = 0; i < 12; i += 1) {
    const isF1 = i >= 9;
    const x = isF1 ? 58 + (i - 9) * 12 : 18 + (i % 3) * 26;
    const y = isF1 ? -105 - (i - 9) * 38 : -32 - Math.floor(i / 3) * 65;
    const pos: CadPoint = [x, y];
    const floor: FloorId = isF1 ? 'F1' : 'GF';
    devices.push({
      id: `DALI-${String(i + 1).padStart(2, '0')}`,
      name: { es: `Controlador DALI-${i + 1}`, en: `DALI Controller-${i + 1}` },
      subsystemId: 'lighting_dali',
      buildingId: 'departures',
      floor,
      pos_cad: pos,
      elev_m: isF1 ? 9.4 : 3.4,
      idfId: assignNearestSalidasIdf(pos, floor),
      demo: true,
    });
  }

  // 7. 10 Access Control Readers
  for (let i = 0; i < 10; i += 1) {
    const x = i % 2 === 0 ? 84.0 : 12.0;
    const y = -18 - i * 19;
    const pos: CadPoint = [x, y];
    devices.push({
      id: `ACC-${String(i + 1).padStart(2, '0')}`,
      name: { es: `Lector Acceso-${i + 1}`, en: `Access Reader-${i + 1}` },
      subsystemId: 'access_xray',
      buildingId: 'departures',
      floor: 'GF',
      pos_cad: pos,
      elev_m: 1.4,
      idfId: assignNearestSalidasIdf(pos, 'GF'),
      demo: true,
    });
  }

  // 8. 4 Baggage X-Ray Scanners at Security & Check-in
  const xrayPositions: { pos: CadPoint; highEmi?: boolean }[] = [
    { pos: [68, -86] },
    { pos: [78, -98] },
    { pos: [68, -118] },
    { pos: [14, -182], highEmi: true }, // > 90m / remote baggage scanner -> fiber!
  ];
  xrayPositions.forEach((xp, idx) => {
    devices.push({
      id: `XRAY-0${idx + 1}`,
      name: { es: `Escáner Rayos X-0${idx + 1}`, en: `X-Ray Scanner-0${idx + 1}` },
      subsystemId: 'access_xray',
      buildingId: 'departures',
      floor: 'GF',
      pos_cad: xp.pos,
      elev_m: 1.2,
      idfId: assignNearestSalidasIdf(xp.pos, 'GF'),
      highEmiOrAtex: xp.highEmi,
      demo: true,
    });
  });

  return devices;
}

export const SALIDAS_DEVICES: DeviceSpec[] = generateSalidasDevices();

export const PIER_DEVICES: DeviceSpec[] = [
  // 14 Gate FIDS displays + 14 PBB/400Hz/PCA controllers + 6 DALI controllers + 12 CCTV
  ...[160, 200, 240, 280, 320, 370, 400].flatMap((gx, idx): DeviceSpec[] => {
    const idfId: TerminalIdfId = gx <= 220 ? 'R4_T' : 'R5_T';
    return [
      {
        id: `FIDS-PIER-N${idx + 1}`,
        name: { es: `Pantalla Puerta Norte ${idx + 1}`, en: `North Gate Display ${idx + 1}` },
        subsystemId: 'fids',
        buildingId: 'pier',
        floor: 'F1',
        pos_cad: [gx, -191],
        elev_m: 8.6,
        idfId,
        demo: true,
      },
      {
        id: `FIDS-PIER-S${idx + 1}`,
        name: { es: `Pantalla Puerta Sur ${idx + 1}`, en: `South Gate Display ${idx + 1}` },
        subsystemId: 'fids',
        buildingId: 'pier',
        floor: 'F1',
        pos_cad: [gx, -219],
        elev_m: 8.6,
        idfId,
        demo: true,
      },
      {
        id: `PBB-N${idx + 1}`,
        name: { es: `Control PBB/400Hz Norte ${idx + 1}`, en: `PBB/400Hz North ${idx + 1}` },
        subsystemId: 'pbb_400hz_pca',
        buildingId: 'pier',
        floor: 'F1',
        pos_cad: [gx, -180],
        elev_m: 6.8,
        idfId,
        highEmiOrAtex: true,
        demo: true,
      },
      {
        id: `PBB-S${idx + 1}`,
        name: { es: `Control PBB/400Hz Sur ${idx + 1}`, en: `PBB/400Hz South ${idx + 1}` },
        subsystemId: 'pbb_400hz_pca',
        buildingId: 'pier',
        floor: 'F1',
        pos_cad: [gx, -230],
        elev_m: 6.8,
        idfId,
        highEmiOrAtex: true,
        demo: true,
      },
    ];
  }),
  ...[150, 210, 270, 330, 385].map((gx, idx): DeviceSpec => ({
    id: `DALI-PIER-0${idx + 1}`,
    name: { es: `Controlador DALI Muelle ${idx + 1}`, en: `Pier DALI Controller ${idx + 1}` },
    subsystemId: 'lighting_dali',
    buildingId: 'pier',
    floor: 'F1',
    pos_cad: [gx, -205],
    elev_m: 9.2,
    idfId: gx <= 220 ? 'R4_T' : 'R5_T',
    demo: true,
  })),
];

export const ARRIVALS_DEVICES: DeviceSpec[] = [
  // BHS PLC Cabinets (high EMI -> fiber!) + FIDS Baggage boards + DALI controllers
  {
    id: 'PLC-BHS-DEP-01',
    name: { es: 'Gabinete PLC Clasificador BHS Salidas', en: 'Departures BHS Sorter PLC Cabinet' },
    subsystemId: 'bhs',
    buildingId: 'departures',
    floor: 'GF',
    pos_cad: [45.0, -58.0],
    elev_m: 1.5,
    idfId: 'R2_T',
    highEmiOrAtex: true,
    demo: true,
  },
  {
    id: 'PLC-BHS-ARR-01',
    name: { es: 'Gabinete PLC Carrusel 4 (BHS)', en: 'Carousel 4 BHS PLC Cabinet' },
    subsystemId: 'bhs',
    buildingId: 'arrivals',
    floor: 'GF',
    pos_cad: [74.0, -363.0],
    elev_m: 1.4,
    idfId: 'R6_T',
    highEmiOrAtex: true,
    demo: true,
  },
  {
    id: 'PLC-BHS-ARR-02',
    name: { es: 'Gabinete PLC Carrusel 5 (BHS)', en: 'Carousel 5 BHS PLC Cabinet' },
    subsystemId: 'bhs',
    buildingId: 'arrivals',
    floor: 'GF',
    pos_cad: [74.0, -388.0],
    elev_m: 1.4,
    idfId: 'R6_T',
    highEmiOrAtex: true,
    demo: true,
  },
  {
    id: 'PLC-BHS-ARR-03',
    name: { es: 'Gabinete PLC Carrusel 6 (BHS)', en: 'Carousel 6 BHS PLC Cabinet' },
    subsystemId: 'bhs',
    buildingId: 'arrivals',
    floor: 'GF',
    pos_cad: [74.0, -413.0],
    elev_m: 1.4,
    idfId: 'R6_T',
    highEmiOrAtex: true,
    demo: true,
  },
  ...[363, 388, 413].map((y, idx): DeviceSpec => ({
    id: `FIDS-ARR-0${idx + 1}`,
    name: { es: `Pantalla Equipaje Llegadas ${idx + 1}`, en: `Arrivals Baggage Display ${idx + 1}` },
    subsystemId: 'fids',
    buildingId: 'arrivals',
    floor: 'GF',
    pos_cad: [55.0, -y],
    elev_m: 2.8,
    idfId: 'R6_T',
    demo: true,
  })),
  ...[355, 390, 420].map((y, idx): DeviceSpec => ({
    id: `DALI-ARR-0${idx + 1}`,
    name: { es: `Controlador DALI Llegadas ${idx + 1}`, en: `Arrivals DALI Controller ${idx + 1}` },
    subsystemId: 'lighting_dali',
    buildingId: 'arrivals',
    floor: 'GF',
    pos_cad: [82.0, -y],
    elev_m: 3.4,
    idfId: 'R6_T',
    demo: true,
  })),
];

export const ALL_TERMINAL_DEVICES: DeviceSpec[] = [
  ...SALIDAS_DEVICES,
  ...PIER_DEVICES,
  ...ARRIVALS_DEVICES,
];

export function getDeviceById(id: string): DeviceSpec | undefined {
  return ALL_TERMINAL_DEVICES.find((d) => d.id === id);
}

export interface DemoFlightRow {
  time: string;
  flight: string;
  destination: string;
  gate: string;
  statusEs: string;
  statusEn: string;
  lastCall?: boolean;
}

export const DEMO_FIDS_FLIGHTS: DemoFlightRow[] = [
  { time: '14:15', flight: 'CR-204', destination: 'Viena / Vienna', gate: '14', statusEs: 'Último llamado', statusEn: 'Last Call', lastCall: true },
  { time: '14:30', flight: 'AT-512', destination: 'Múnich / Munich', gate: '24', statusEs: 'Abordando', statusEn: 'Boarding' },
  { time: '14:55', flight: 'NR-118', destination: 'Madrid', gate: '08', statusEs: 'A tiempo', statusEn: 'On Time' },
  { time: '15:10', flight: 'DL-407', destination: 'Cluj (Doméstico)', gate: '52', statusEs: 'Abordando', statusEn: 'Boarding' },
  { time: '15:40', flight: 'SK-890', destination: 'París / Paris', gate: '31', statusEs: 'A tiempo', statusEn: 'On Time' },
];
