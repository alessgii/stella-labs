import type { CadPoint } from '../lib/coords';

export interface RectCad {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function rectToPolygon(r: RectCad): CadPoint[] {
  return [
    [r.minX, r.maxY],
    [r.maxX, r.maxY],
    [r.maxX, r.minY],
    [r.minX, r.minY],
  ];
}

export function rectFromCorners(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): RectCad {
  return {
    minX: Math.min(x1, x2),
    maxX: Math.max(x1, x2),
    minY: Math.min(y1, y2),
    maxY: Math.max(y1, y2),
  };
}

export interface TechRoomSpec {
  id: string;
  nodeId: string;
  name: { es: string; en: string };
  outer: RectCad;
  inner: RectCad;
  height_m: number;
  doorMark?: readonly [CadPoint, CadPoint];
}

export interface FingerSpec {
  id: string;
  side: 'N' | 'S';
  gx: number;
  gy: number;
  arm: RectCad;
  head: RectCad;
}

export interface BuildingFootprint {
  id: string;
  name: { es: string; en: string };
  outer: readonly CadPoint[];
  inner?: readonly CadPoint[];
  height_m: number;
  hasF1: boolean;
  navigable: boolean;
  labelCad: CadPoint;
}

// 4.1 Departures + MDF-A (N1)
const DEPARTURES_OUTER_RECT = rectFromCorners(0.0, 0.0, 90.0, -207.16);
const DEPARTURES_INNER_RECT = rectFromCorners(0.7, -0.7, 89.3, -206.46);

const DEPARTURES_PILLAR_YS = [-20, -40, -60, -80, -100, -120, -140, -160, -180];
export const DEPARTURES_PILLARS: RectCad[] = DEPARTURES_PILLAR_YS.flatMap((y) => [
  rectFromCorners(-0.4, y - 0.4, 0.4, y + 0.4),
  rectFromCorners(89.6, y - 0.4, 90.4, y + 0.4),
]);

export const DEPARTURES_DIVIDERS: RectCad[] = [
  rectFromCorners(0.7, -65.0, 89.3, -65.5),
  rectFromCorners(0.7, -145.0, 89.3, -145.5),
];

export const DEPARTURES_CHECKIN_ISLANDS: RectCad[] = [
  rectFromCorners(15.0, -25.0, 75.0, -30.0),
  rectFromCorners(15.0, -45.0, 75.0, -50.0),
];

// 4.2 Gallery Connector N-S
const GALLERY_OUTER_RECT = rectFromCorners(50.0, -207.16, 90.0, -335.61);
const GALLERY_INNER_RECT = rectFromCorners(50.7, -207.86, 89.3, -334.91);

export const GALLERY_CORRIDOR_LINES: readonly [CadPoint, CadPoint][] = [
  [
    [65.0, -208.0],
    [65.0, -335.0],
  ],
  [
    [75.0, -208.0],
    [75.0, -335.0],
  ],
];

// 4.3 Neck to Pier
const NECK_OUTER_RECT = rectFromCorners(90.0, -192.0, 115.65, -239.0);
const NECK_INNER_RECT = rectFromCorners(90.7, -192.7, 114.95, -238.3);

export const NECK_CORRIDOR_LINES: readonly [CadPoint, CadPoint][] = [
  [
    [91.0, -212.0],
    [115.0, -212.0],
  ],
  [
    [91.0, -218.0],
    [115.0, -218.0],
  ],
];

// 4.4 Arrivals + South Wing + N2
const ARRIVALS_OUTER_RECT = rectFromCorners(40.0, -335.61, 118.9, -428.61);
const ARRIVALS_INNER_RECT = rectFromCorners(40.7, -336.31, 118.2, -427.91);

const ARRIVALS_SOUTH_OUTER_RECT = rectFromCorners(65.0, -428.61, 103.0, -516.0);
const ARRIVALS_SOUTH_INNER_RECT = rectFromCorners(65.7, -429.31, 102.3, -515.3);

export const BAGGAGE_CAROUSEL_FOOTPRINTS: RectCad[] = [
  rectFromCorners(55.0, -360.0, 72.0, -366.0),
  rectFromCorners(55.0, -385.0, 72.0, -391.0),
  rectFromCorners(55.0, -410.0, 72.0, -416.0),
];

// 4.5 Passenger Pier (20 vertices) + MDF-B (N5) + 14 Fingers
export const PIER_OUTER_POLYGON: readonly CadPoint[] = [
  [115.65, -190.0],
  [215.0, -190.0],
  [215.0, -183.5],
  [300.0, -183.5],
  [300.0, -186.0],
  [340.0, -186.0],
  [358.0, -173.3],
  [402.0, -173.3],
  [414.5, -182.0],
  [419.65, -195.0],
  [419.65, -215.0],
  [414.5, -228.0],
  [402.0, -236.7],
  [358.0, -236.7],
  [340.0, -224.0],
  [300.0, -224.0],
  [300.0, -226.5],
  [215.0, -226.5],
  [215.0, -220.0],
  [115.65, -220.0],
];

export const PIER_INNER_POLYGON: readonly CadPoint[] = [
  [116.35, -190.7],
  [214.3, -190.7],
  [214.3, -184.2],
  [299.3, -184.2],
  [299.3, -186.7],
  [339.3, -186.7],
  [357.3, -174.0],
  [401.3, -174.0],
  [413.8, -182.7],
  [418.95, -195.7],
  [418.95, -214.3],
  [413.8, -227.3],
  [401.3, -236.0],
  [357.3, -236.0],
  [339.3, -223.3],
  [299.3, -223.3],
  [299.3, -225.8],
  [214.3, -225.8],
  [214.3, -219.3],
  [116.35, -219.3],
];

export const PIER_CORRIDOR_LINES: readonly [CadPoint, CadPoint][] = [
  [
    [116.0, -202.0],
    [360.0, -202.0],
  ],
  [
    [116.0, -208.0],
    [360.0, -208.0],
  ],
];

const FINGER_GXS = [160, 200, 240, 280, 320, 370, 400] as const;

function fingerAnchorY(gx: number, side: 'N' | 'S'): number {
  if (gx === 240 || gx === 280) return side === 'N' ? -183.5 : -226.5;
  if (gx === 370 || gx === 400) return side === 'N' ? -173.3 : -236.7;
  return side === 'N' ? -186.0 : -224.0;
}

export const PIER_FINGERS: FingerSpec[] = FINGER_GXS.flatMap((gx, idx) => {
  const gyN = fingerAnchorY(gx, 'N');
  const gyS = fingerAnchorY(gx, 'S');
  return [
    {
      id: `finger-N-${idx + 1}`,
      side: 'N' as const,
      gx,
      gy: gyN,
      arm: rectFromCorners(gx - 1.5, gyN, gx + 1.5, gyN + 8.0),
      head: rectFromCorners(gx - 3.5, gyN + 8.0, gx + 3.5, gyN + 12.0),
    },
    {
      id: `finger-S-${idx + 1}`,
      side: 'S' as const,
      gx,
      gy: gyS,
      arm: rectFromCorners(gx - 1.5, gyS, gx + 1.5, gyS - 8.0),
      head: rectFromCorners(gx - 3.5, gyS - 8.0, gx + 3.5, gyS - 12.0),
    },
  ];
});

// 4.6 Control Tower (N3)
export const CONTROL_TOWER = {
  id: 'tower',
  name: { es: 'Torre de Control', en: 'Control Tower' },
  center_cad: [505.0, -386.67] as CadPoint,
  shaftHeight_m: 30.0,
  cabHeight_m: 8.0,
  totalHeight_m: 38.0,
  outerRadius: 14.0,
  outerInnerRadius: 12.8,
  coreOuterRadius: 6.0,
  coreInnerRadius: 5.2,
  ribAnglesDeg: [0, 45, 90, 135, 180, 225, 270, 315] as const,
  ductChambers: [
    {
      id: 'acometida-oeste',
      center_cad: [485.0, -386.67] as CadPoint,
      rect: rectFromCorners(484.0, -387.67, 486.0, -385.67),
    },
    {
      id: 'acometida-este',
      center_cad: [525.0, -386.67] as CadPoint,
      rect: rectFromCorners(524.0, -387.67, 526.0, -385.67),
    },
  ],
};

// 4.7 Cargo & Auxiliary SSEI
const CARGO_OUTER_RECT = rectFromCorners(169.1, 50.0, 259.1, 80.0);
const CARGO_INNER_RECT = rectFromCorners(169.8, 50.7, 258.4, 79.3);
export const CARGO_DOCKS: RectCad[] = [175, 183, 191, 199, 207, 215, 223, 231, 239, 247].map(
  (dx) => rectFromCorners(dx, 48.0, dx + 5.0, 50.0),
);

const SSEI_OUTER_RECT = rectFromCorners(425.1, 32.5, 545.1, 97.5);
const SSEI_INNER_RECT = rectFromCorners(425.8, 33.2, 544.4, 96.8);
export const SSEI_BAYS: RectCad[] = [435, 450, 465, 480, 495, 510, 525].map((dx) =>
  rectFromCorners(dx, 30.5, dx + 10.0, 32.5),
);

// Technical Rooms (containing core nodes N1, N2, N4, N5, N6)
export const TECH_ROOMS: TechRoomSpec[] = [
  {
    id: 'mdf-a',
    nodeId: 'N1',
    name: { es: 'Cuarto Técnico MDF-A (N1)', en: 'MDF-A Technical Room (N1)' },
    outer: rectFromCorners(36.0, -97.58, 54.0, -109.58),
    inner: rectFromCorners(36.35, -97.93, 53.65, -109.23),
    height_m: 4.5,
    doorMark: [
      [43.0, -97.58],
      [43.0, -96.08],
    ],
  },
  {
    id: 'room-n2',
    nodeId: 'N2',
    name: { es: 'Sala Técnica Llegadas (N2)', en: 'Arrivals Tech Room (N2)' },
    outer: rectFromCorners(71.45, -377.11, 87.45, -387.11),
    inner: rectFromCorners(71.8, -377.46, 87.1, -386.76),
    height_m: 4.5,
  },
  {
    id: 'room-n4',
    nodeId: 'N4',
    name: { es: 'Sala Técnica Carga (N4)', en: 'Cargo Tech Room (N4)' },
    outer: rectFromCorners(207.1, 60.0, 221.1, 70.0),
    inner: rectFromCorners(207.45, 60.35, 220.75, 69.65),
    height_m: 4.5,
  },
  {
    id: 'mdf-b',
    nodeId: 'N5',
    name: { es: 'Cuarto Técnico MDF-B (N5)', en: 'MDF-B Technical Room (N5)' },
    outer: rectFromCorners(397.0, -207.46, 413.0, -219.46),
    inner: rectFromCorners(397.35, -207.81, 412.65, -219.11),
    height_m: 4.5,
  },
  {
    id: 'room-n6',
    nodeId: 'N6',
    name: { es: 'Sala Técnica SSEI (N6)', en: 'SSEI Tech Room (N6)' },
    outer: rectFromCorners(477.1, 60.0, 493.1, 70.0),
    inner: rectFromCorners(477.45, 60.35, 492.75, 69.65),
    height_m: 4.5,
  },
];

export const BUILDINGS: BuildingFootprint[] = [
  {
    id: 'departures',
    name: { es: 'Salidas', en: 'Departures' },
    outer: rectToPolygon(DEPARTURES_OUTER_RECT),
    inner: rectToPolygon(DEPARTURES_INNER_RECT),
    height_m: 14.0,
    hasF1: true,
    navigable: true,
    labelCad: [45.0, -185.0],
  },
  {
    id: 'gallery',
    name: { es: 'Galería Conectora', en: 'Connecting Gallery' },
    outer: rectToPolygon(GALLERY_OUTER_RECT),
    inner: rectToPolygon(GALLERY_INNER_RECT),
    height_m: 9.0,
    hasF1: true,
    navigable: true,
    labelCad: [70.0, -271.0],
  },
  {
    id: 'neck',
    name: { es: 'Cuello al Muelle', en: 'Pier Neck' },
    outer: rectToPolygon(NECK_OUTER_RECT),
    inner: rectToPolygon(NECK_INNER_RECT),
    height_m: 10.5,
    hasF1: true,
    navigable: true,
    labelCad: [103.0, -215.0],
  },
  {
    id: 'arrivals',
    name: { es: 'Llegadas', en: 'Arrivals' },
    outer: rectToPolygon(ARRIVALS_OUTER_RECT),
    inner: rectToPolygon(ARRIVALS_INNER_RECT),
    height_m: 12.0,
    hasF1: true,
    navigable: true,
    labelCad: [79.0, -350.0],
  },
  {
    id: 'arrivals_south',
    name: { es: 'Ala Sur Llegadas', en: 'Arrivals South Wing' },
    outer: rectToPolygon(ARRIVALS_SOUTH_OUTER_RECT),
    inner: rectToPolygon(ARRIVALS_SOUTH_INNER_RECT),
    height_m: 10.0,
    hasF1: false,
    navigable: true,
    labelCad: [84.0, -472.0],
  },
  {
    id: 'pier',
    name: { es: 'Muelle de Pasajeros', en: 'Passenger Pier' },
    outer: PIER_OUTER_POLYGON,
    inner: PIER_INNER_POLYGON,
    height_m: 11.5,
    hasF1: true,
    navigable: true,
    labelCad: [265.0, -205.0],
  },
  {
    id: 'cargo',
    name: { es: 'As World Cargo', en: 'As World Cargo' },
    outer: rectToPolygon(CARGO_OUTER_RECT),
    inner: rectToPolygon(CARGO_INNER_RECT),
    height_m: 11.0,
    hasF1: false,
    navigable: false,
    labelCad: [214.1, 65.0],
  },
  {
    id: 'ssei',
    name: { es: 'Nave Auxiliar SSEI', en: 'SSEI Auxiliary Building' },
    outer: rectToPolygon(SSEI_OUTER_RECT),
    inner: rectToPolygon(SSEI_INNER_RECT),
    height_m: 12.0,
    hasF1: false,
    navigable: false,
    labelCad: [485.1, 65.0],
  },
];
