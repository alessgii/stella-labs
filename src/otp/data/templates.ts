import type { TenantTemplate, TenantTier } from './tenants';

export type LocalSubsystemId = 'pos' | 'wifi' | 'cctv' | 'signage' | 'office' | 'power' | 'uplink';

export interface TemplateObjectSpec {
  id: string;
  label: { es: string; en: string };
  category: 'structure' | 'furniture' | 'tech' | 'network' | 'fixture';
  position: [number, number, number];
  size: [number, number, number];
  rotationY?: number;
  color: string;
  opacity?: number;
  shape?: 'box' | 'cylinder' | 'dome';
  isHotspot?: boolean;
  subsystem?: LocalSubsystemId;
  switchPort?: number;
  poeWatts?: number;
  cableType?: 'Cat6A' | 'OS2' | 'Power';
  cableLength_m?: number;
  functionDesc?: { es: string; en: string };
}

export interface ProductInstanceSpec {
  kind: 'mug' | 'magnet' | 'keychain' | 'shirt' | 'plush' | 'pastry' | 'bottle' | 'plate';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export interface ConduitSegmentSpec {
  id: string;
  subsystem: LocalSubsystemId;
  points: [number, number, number][];
}

export interface TenantTemplateSpec {
  template: TenantTemplate;
  width_m: number;
  depth_m: number;
  height_m: number;
  doorwayWidth_m: number;
  tileColors: [string, string];
  accentColor: string;
  objects: TemplateObjectSpec[];
  products: ProductInstanceSpec[];
  ceilingLights: [number, number, number][];
  cableTray: [number, number, number][][];
  conduits: ConduitSegmentSpec[];
}

function buildGridLights(w: number, d: number, y: number, cols = 3, rows = 3): [number, number, number][] {
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

function makeTechPack(
  prefix: string,
  w: number,
  d: number,
  h: number,
  posPos: [number, number, number],
  screenPos: [number, number, number],
  rackPos: [number, number, number],
  demarcPos: [number, number, number],
): TemplateObjectSpec[] {
  return [
    {
      id: `${prefix}-pos`,
      label: { es: 'Terminal POS + lector tarjeta', en: 'POS terminal + card reader' },
      category: 'tech',
      position: posPos,
      size: [0.32, 0.3, 0.28],
      color: '#0EA5E9',
      isHotspot: true,
      subsystem: 'pos',
      switchPort: 1,
      poeWatts: 12,
      cableType: 'Cat6A',
      cableLength_m: 8.5,
      functionDesc: {
        es: 'Terminal de punto de venta y pinpad EMV conectado por VLAN aislada de caja.',
        en: 'Point-of-sale terminal and EMV pinpad on isolated checkout VLAN.',
      },
    },
    {
      id: `${prefix}-printer`,
      label: { es: 'Impresora térmica IP', en: 'IP thermal printer' },
      category: 'tech',
      position: [posPos[0] + 0.36, posPos[1] - 0.06, posPos[2]],
      size: [0.18, 0.16, 0.22],
      color: '#1E293B',
      isHotspot: true,
      subsystem: 'pos',
      switchPort: 2,
      poeWatts: 0,
      cableType: 'Cat6A',
      cableLength_m: 8.8,
      functionDesc: {
        es: 'Impresora de tickets conectada al switch PoE del local.',
        en: 'Receipt printer wired to local PoE switch.',
      },
    },
    {
      id: `${prefix}-demarc`,
      label: { es: 'Caja de demarcación de red', en: 'Network demarcation box' },
      category: 'network',
      position: demarcPos,
      size: [0.42, 0.52, 0.16],
      color: '#0EA5E9',
      isHotspot: true,
      subsystem: 'uplink',
      cableType: 'Cat6A',
      functionDesc: {
        es: 'Frontera física entre el cableado del aeropuerto (IDF) y la red del establecimiento.',
        en: 'Physical demarcation between airport IDF cabling and tenant LAN.',
      },
    },
    {
      id: `${prefix}-rack`,
      label: { es: 'Mini-rack 6U + Switch PoE 8P + UPS', en: '6U Mini-Rack + 8P PoE Switch + UPS' },
      category: 'network',
      position: rackPos,
      size: [0.64, 0.72, 0.44],
      color: '#10B981',
      isHotspot: true,
      subsystem: 'power',
      poeWatts: 65,
      functionDesc: {
        es: 'Gabinete mural 6U con patch panel Cat6A, switch PoE de 8 puertos y UPS 600 VA.',
        en: '6U wall cabinet with Cat6A patch panel, 8-port PoE switch, and 600 VA UPS.',
      },
    },
    {
      id: `${prefix}-cam-1`,
      label: { es: 'Cámara domo entrada Oeste', en: 'West entrance dome camera' },
      category: 'tech',
      position: [-w * 0.32, h - 0.25, d * 0.42],
      size: [0.22, 0.16, 0.22],
      shape: 'dome',
      color: '#F43F5E',
      isHotspot: true,
      subsystem: 'cctv',
      switchPort: 3,
      poeWatts: 7,
      cableType: 'Cat6A',
      cableLength_m: 11.2,
      functionDesc: {
        es: 'Cámara IP PoE cubriendo el acceso principal.',
        en: 'PoE IP dome camera covering main entrance.',
      },
    },
    {
      id: `${prefix}-cam-2`,
      label: { es: 'Cámara domo interior / caja', en: 'Interior / counter dome camera' },
      category: 'tech',
      position: [w * 0.32, h - 0.25, d * 0.42],
      size: [0.22, 0.16, 0.22],
      shape: 'dome',
      color: '#F43F5E',
      isHotspot: true,
      subsystem: 'cctv',
      switchPort: 4,
      poeWatts: 7,
      cableType: 'Cat6A',
      cableLength_m: 7.4,
      functionDesc: {
        es: 'Cámara IP PoE cubriendo la zona de atención y cobro.',
        en: 'PoE IP dome camera covering service counter.',
      },
    },
    {
      id: `${prefix}-ap`,
      label: { es: 'Access Point Wi-Fi 6 (techo)', en: 'Ceiling Wi-Fi 6 Access Point' },
      category: 'tech',
      position: [0, h - 0.15, 0.2],
      size: [0.3, 0.08, 0.3],
      shape: 'cylinder',
      color: '#38BDF8',
      isHotspot: true,
      subsystem: 'wifi',
      switchPort: 5,
      poeWatts: 15,
      cableType: 'Cat6A',
      cableLength_m: 6.8,
      functionDesc: {
        es: 'Punto de acceso Wi-Fi 6 PoE+ para operación del personal y huéspedes.',
        en: 'PoE+ Wi-Fi 6 access point for staff and guest connectivity.',
      },
    },
    {
      id: `${prefix}-screen`,
      label: { es: 'Pantalla digital informativa', en: 'Digital signage screen' },
      category: 'tech',
      position: screenPos,
      size: [1.1, 0.62, 0.08],
      color: '#A855F7',
      isHotspot: true,
      subsystem: 'signage',
      switchPort: 6,
      poeWatts: 0,
      cableType: 'Cat6A',
      cableLength_m: 6.5,
      functionDesc: {
        es: 'Pantalla digital conectada por Ethernet para menú, tarifas o vuelos.',
        en: 'Ethernet-connected digital display for menus, rates, or flight info.',
      },
    },
    {
      id: `${prefix}-speaker-1`,
      label: { es: 'Altavoz de techo Oeste', en: 'Ceiling speaker West' },
      category: 'fixture',
      position: [-w * 0.24, h - 0.08, 0],
      size: [0.24, 0.06, 0.24],
      shape: 'cylinder',
      color: '#94A3B8',
    },
    {
      id: `${prefix}-speaker-2`,
      label: { es: 'Altavoz de techo Este', en: 'Ceiling speaker East' },
      category: 'fixture',
      position: [w * 0.24, h - 0.08, 0],
      size: [0.24, 0.06, 0.24],
      shape: 'cylinder',
      color: '#94A3B8',
    },
    {
      id: `${prefix}-smoke`,
      label: { es: 'Detector de humo', en: 'Smoke detector' },
      category: 'fixture',
      position: [0, h - 0.08, -d * 0.18],
      size: [0.16, 0.06, 0.16],
      shape: 'cylinder',
      color: '#E2E8F0',
    },
  ];
}

function buildTiendaProducts(): ProductInstanceSpec[] {
  const items: ProductInstanceSpec[] = [];
  const mugColors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#EC4899'];
  const shirtColors = ['#1E293B', '#2563EB', '#DC2626', '#059669', '#F8FAFC'];
  const plushColors = ['#D97706', '#9333EA', '#E11D48', '#0284C7'];

  for (let i = 0; i < 6; i++) {
    items.push({
      kind: 'mug',
      position: [-0.55 + (i % 3) * 0.35, 0.92, 1.28 + Math.floor(i / 3) * 0.4],
      size: [0.1, 0.12, 0.1],
      color: mugColors[i % mugColors.length],
    });
  }
  for (let i = 0; i < 4; i++) {
    items.push({
      kind: 'plush',
      position: [0.35 + (i % 2) * 0.25, 0.96, 1.3 + Math.floor(i / 2) * 0.35],
      size: [0.18, 0.22, 0.16],
      color: plushColors[i % plushColors.length],
    });
  }
  const gondolaCenters: [number, number][] = [
    [-1.7, -0.35],
    [-1.7, 0.55],
    [0.35, -0.35],
    [0.35, 0.55],
  ];
  gondolaCenters.forEach(([gx, gz], gIdx) => {
    for (let s = 0; s < 5; s++) {
      items.push({
        kind: 'shirt',
        position: [gx - 0.8 + s * 0.4, 0.72, gz],
        size: [0.28, 0.08, 0.34],
        color: shirtColors[(s + gIdx) % shirtColors.length],
      });
      items.push({
        kind: 'mug',
        position: [gx - 0.8 + s * 0.4, 1.28, gz],
        size: [0.1, 0.13, 0.1],
        color: mugColors[(s + gIdx) % mugColors.length],
      });
    }
  });
  return items;
}

const TIENDA_SPEC: TenantTemplateSpec = {
  template: 'tienda',
  width_m: 8,
  depth_m: 6,
  height_m: 3.2,
  doorwayWidth_m: 4.0,
  tileColors: ['#F1F5F9', '#E2E8F0'],
  accentColor: '#334155',
  objects: [
    { id: 'tienda-facade-sign', label: { es: 'Letrero fachada entrada', en: 'Entrance facade sign' }, category: 'fixture', position: [0, 2.75, 2.96], size: [2.6, 0.32, 0.1], color: '#0F172A' },
    { id: 'tienda-shutter-rail', label: { es: 'Riel de reja enrollable', en: 'Rolling shutter rail' }, category: 'structure', position: [0, 2.48, 2.94], size: [4.1, 0.14, 0.16], color: '#64748B' },
    { id: 'tienda-eas-west', label: { es: 'Pedestal antihurto Oeste', en: 'EAS Pedestal West' }, category: 'fixture', position: [-1.2, 0.78, 2.7], size: [0.12, 1.56, 0.42], color: '#CBD5E1' },
    { id: 'tienda-eas-east', label: { es: 'Pedestal antihurto Este', en: 'EAS Pedestal East' }, category: 'fixture', position: [1.2, 0.78, 2.7], size: [0.12, 1.56, 0.42], color: '#CBD5E1' },
    { id: 'tienda-central-table', label: { es: 'Mesa de exhibición central', en: 'Central display table' }, category: 'furniture', position: [0, 0.42, 1.5], size: [1.6, 0.84, 1.0], color: '#D6B89C' },
    { id: 'tienda-rug', label: { es: 'Alfombra de entrada', en: 'Entrance rug' }, category: 'fixture', position: [0, 0.015, 1.6], size: [2.8, 0.03, 2.0], color: '#94A3B8' },
    { id: 'tienda-gondola-1', label: { es: 'Góndola 1 (Noroeste)', en: 'Gondola 1 (NW)' }, category: 'furniture', position: [-1.7, 0.8, -0.35], size: [2.2, 1.6, 0.5], color: '#E2E8F0' },
    { id: 'tienda-gondola-2', label: { es: 'Góndola 2 (Suroeste)', en: 'Gondola 2 (SW)' }, category: 'furniture', position: [-1.7, 0.8, 0.55], size: [2.2, 1.6, 0.5], color: '#E2E8F0' },
    { id: 'tienda-gondola-3', label: { es: 'Góndola 3 (Centro Norte)', en: 'Gondola 3 (Center N)' }, category: 'furniture', position: [0.35, 0.8, -0.35], size: [1.8, 1.6, 0.5], color: '#CBD5E1' },
    { id: 'tienda-gondola-4', label: { es: 'Góndola 4 (Centro Sur)', en: 'Gondola 4 (Center S)' }, category: 'furniture', position: [0.35, 0.8, 0.55], size: [1.8, 1.6, 0.5], color: '#CBD5E1' },
    { id: 'tienda-wall-shelf-1', label: { es: 'Estante muro Oeste 1', en: 'West wall shelf 1' }, category: 'furniture', position: [-3.75, 1.1, -0.7], size: [0.42, 2.0, 0.85], color: '#94A3B8' },
    { id: 'tienda-wall-shelf-2', label: { es: 'Estante muro Oeste 2', en: 'West wall shelf 2' }, category: 'furniture', position: [-3.75, 1.1, 0.2], size: [0.42, 2.0, 0.85], color: '#94A3B8' },
    { id: 'tienda-wall-shelf-3', label: { es: 'Estante muro Oeste 3', en: 'West wall shelf 3' }, category: 'furniture', position: [-3.75, 1.1, 1.1], size: [0.42, 2.0, 0.85], color: '#94A3B8' },
    { id: 'tienda-postcard-rack', label: { es: 'Exhibidor giratorio de postales', en: 'Rotating postcard rack' }, category: 'furniture', position: [-2.8, 0.88, 1.85], size: [0.48, 1.76, 0.48], shape: 'cylinder', color: '#475569' },
    { id: 'tienda-bargain-bin', label: { es: 'Canasta de ofertas', en: 'Bargain bin' }, category: 'furniture', position: [1.75, 0.42, 2.05], size: [0.85, 0.84, 0.65], color: '#F59E0B' },
    { id: 'tienda-checkout-desk', label: { es: 'Mostrador de caja', en: 'Checkout counter' }, category: 'furniture', position: [2.75, 0.5, 0.4], size: [0.7, 1.0, 1.6], color: '#334155' },
    { id: 'tienda-cash-drawer', label: { es: 'Cajón de dinero', en: 'Cash drawer' }, category: 'fixture', position: [2.75, 0.9, 0.05], size: [0.42, 0.12, 0.42], color: '#0F172A' },
    { id: 'tienda-scanner', label: { es: 'Lector de código de barras', en: 'Barcode scanner' }, category: 'fixture', position: [2.52, 1.08, 0.18], size: [0.12, 0.16, 0.12], color: '#475569' },
    { id: 'tienda-cashier-chair', label: { es: 'Silla de cajero', en: 'Cashier stool' }, category: 'furniture', position: [3.35, 0.45, 0.4], size: [0.46, 0.9, 0.46], shape: 'cylinder', color: '#1E293B' },
    { id: 'tienda-backroom-wall-w', label: { es: 'Muro divisorio bodega', en: 'Backroom partition wall' }, category: 'structure', position: [-0.75, 1.6, -1.5], size: [6.5, 3.2, 0.14], color: '#E2E8F0' },
    { id: 'tienda-backroom-wall-e', label: { es: 'Muro divisorio puerta', en: 'Backroom door jamb' }, category: 'structure', position: [3.72, 1.6, -1.5], size: [0.56, 3.2, 0.14], color: '#E2E8F0' },
    { id: 'tienda-backroom-rack', label: { es: 'Estantería de bodega con cajas', en: 'Storage shelf with boxes' }, category: 'furniture', position: [-2.2, 1.0, -2.55], size: [2.4, 2.0, 0.65], color: '#94A3B8' },
    { id: 'tienda-storage-box-1', label: { es: 'Cajas de inventario 1', en: 'Inventory boxes 1' }, category: 'fixture', position: [-2.6, 1.15, -2.55], size: [0.65, 0.42, 0.5], color: '#D97706' },
    { id: 'tienda-storage-box-2', label: { es: 'Cajas de inventario 2', en: 'Inventory boxes 2' }, category: 'fixture', position: [-1.7, 1.15, -2.55], size: [0.65, 0.42, 0.5], color: '#B45309' },
    ...makeTechPack('tienda', 8, 6, 3.2, [2.62, 1.16, 0.4], [2.75, 2.35, 0.4], [2.6, 1.45, -2.74], [3.5, 1.2, -2.86]),
  ],
  products: buildTiendaProducts(),
  ceilingLights: buildGridLights(8, 6, 3.15),
  cableTray: [
    [[2.6, 2.9, -2.6], [2.6, 2.9, 2.55]],
    [[2.6, 2.9, 0.5], [0, 2.9, 0.5]],
    [[2.6, 2.9, 2.55], [-2.6, 2.9, 2.55]],
  ],
  conduits: [
    { id: 'cond-pos', subsystem: 'pos', points: [[2.6, 2.9, 0.4], [2.6, 1.16, 0.4]] },
    { id: 'cond-screen', subsystem: 'signage', points: [[2.6, 2.9, 0.4], [2.75, 2.35, 0.4]] },
    { id: 'cond-cam1', subsystem: 'cctv', points: [[-2.6, 2.9, 2.55], [-2.6, 2.95, 2.55]] },
    { id: 'cond-cam2', subsystem: 'cctv', points: [[2.6, 2.9, 2.55], [2.6, 2.95, 2.55]] },
    { id: 'cond-ap', subsystem: 'wifi', points: [[0, 2.9, 0.2], [0, 3.05, 0.2]] },
    { id: 'cond-rack', subsystem: 'uplink', points: [[2.6, 1.8, -2.65], [2.6, 2.9, -2.6]] },
  ],
};

const CAFE_SPEC: TenantTemplateSpec = {
  template: 'cafe',
  width_m: 8,
  depth_m: 6,
  height_m: 3.2,
  doorwayWidth_m: 4.0,
  tileColors: ['#F5EBE0', '#E3D5CA'],
  accentColor: '#78350F',
  objects: [
    { id: 'cafe-facade-sign', label: { es: 'Letrero cafetería', en: 'Café facade sign' }, category: 'fixture', position: [0, 2.75, 2.96], size: [2.6, 0.32, 0.1], color: '#451A03' },
    { id: 'cafe-counter-main', label: { es: 'Barra de servicio y barista', en: 'Barista service counter' }, category: 'furniture', position: [-0.6, 0.52, -0.7], size: [4.2, 1.04, 0.85], color: '#78350F' },
    { id: 'cafe-pastry-case', label: { es: 'Vitrina refrigerada de repostería', en: 'Pastry glass display' }, category: 'furniture', position: [-2.0, 1.18, -0.7], size: [1.2, 0.55, 0.72], color: '#BAE6FD', opacity: 0.6 },
    { id: 'cafe-espresso', label: { es: 'Máquina espresso 2 grupos', en: '2-group espresso machine' }, category: 'fixture', position: [-0.3, 1.24, -0.78], size: [0.85, 0.44, 0.52], color: '#94A3B8' },
    { id: 'cafe-grinder', label: { es: 'Molino de café', en: 'Coffee grinder' }, category: 'fixture', position: [0.35, 1.22, -0.78], size: [0.24, 0.4, 0.24], color: '#1E293B' },
    { id: 'cafe-back-counter', label: { es: 'Mueble trasero preparación', en: 'Back prep credenza' }, category: 'furniture', position: [-1.2, 0.48, -2.55], size: [3.6, 0.96, 0.65], color: '#92400E' },
    { id: 'cafe-fridge', label: { es: 'Refrigerador bebidas', en: 'Beverage fridge' }, category: 'furniture', position: [-3.4, 1.05, -2.55], size: [0.8, 2.1, 0.7], color: '#CBD5E1' },
    { id: 'cafe-condiment-bar', label: { es: 'Estación de azúcar y servilletas', en: 'Condiment station' }, category: 'furniture', position: [3.2, 0.48, 0.6], size: [0.7, 0.96, 1.0], color: '#B45309' },
    { id: 'cafe-bin', label: { es: 'Contenedor de reciclaje', en: 'Recycling bin' }, category: 'fixture', position: [3.2, 0.42, 1.5], size: [0.45, 0.84, 0.45], color: '#475569' },
    // 4 cafe tables + 8 chairs
    ...([-2.4, -0.6, 1.2] as const).flatMap((tx, idx) => [
      { id: `cafe-table-${idx + 1}`, label: { es: `Mesa redonda ${idx + 1}`, en: `Round table ${idx + 1}` }, category: 'furniture' as const, position: [tx, 0.37, 1.5] as [number, number, number], size: [0.85, 0.74, 0.85] as [number, number, number], shape: 'cylinder' as const, color: '#D97706' },
      { id: `cafe-chair-${idx * 2 + 1}`, label: { es: `Silla ${idx * 2 + 1}`, en: `Chair ${idx * 2 + 1}` }, category: 'furniture' as const, position: [tx - 0.55, 0.4, 1.5] as [number, number, number], size: [0.4, 0.8, 0.4] as [number, number, number], shape: 'cylinder' as const, color: '#451A03' },
      { id: `cafe-chair-${idx * 2 + 2}`, label: { es: `Silla ${idx * 2 + 2}`, en: `Chair ${idx * 2 + 2}` }, category: 'furniture' as const, position: [tx + 0.55, 0.4, 1.5] as [number, number, number], size: [0.4, 0.8, 0.4] as [number, number, number], shape: 'cylinder' as const, color: '#451A03' },
    ]),
    { id: 'cafe-table-4', label: { es: 'Mesa alta ventana', en: 'High window table' }, category: 'furniture', position: [-3.2, 0.52, 0.4], size: [0.7, 1.04, 1.2], color: '#92400E' },
    ...makeTechPack('cafe', 8, 6, 3.2, [0.95, 1.18, -0.7], [-0.4, 2.25, -2.85], [2.6, 1.45, -2.74], [3.5, 1.2, -2.86]),
  ],
  products: [
    ...Array.from({ length: 6 }, (_, i) => ({
      kind: 'pastry' as const,
      position: [-2.35 + (i % 3) * 0.32, 1.12, -0.82 + Math.floor(i / 3) * 0.24] as [number, number, number],
      size: [0.16, 0.08, 0.16] as [number, number, number],
      color: i % 2 === 0 ? '#D97706' : '#F59E0B',
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      kind: 'mug' as const,
      position: [-0.55 + i * 0.18, 1.5, -0.78] as [number, number, number],
      size: [0.09, 0.1, 0.09] as [number, number, number],
      color: '#FFFFFF',
    })),
  ],
  ceilingLights: buildGridLights(8, 6, 3.15),
  cableTray: [
    [[2.6, 2.9, -2.6], [2.6, 2.9, 2.5]],
    [[2.6, 2.9, -0.7], [-0.5, 2.9, -0.7]],
    [[2.6, 2.9, 2.5], [-2.6, 2.9, 2.5]],
  ],
  conduits: [
    { id: 'cafe-cond-pos', subsystem: 'pos', points: [[0.95, 2.9, -0.7], [0.95, 1.18, -0.7]] },
    { id: 'cafe-cond-scr', subsystem: 'signage', points: [[-0.4, 2.9, -2.6], [-0.4, 2.25, -2.85]] },
    { id: 'cafe-cond-cam1', subsystem: 'cctv', points: [[-2.56, 2.9, 2.52], [-2.56, 2.95, 2.52]] },
    { id: 'cafe-cond-cam2', subsystem: 'cctv', points: [[2.56, 2.9, 2.52], [2.56, 2.95, 2.52]] },
    { id: 'cafe-cond-ap', subsystem: 'wifi', points: [[0, 2.9, 0.2], [0, 3.05, 0.2]] },
    { id: 'cafe-cond-rack', subsystem: 'uplink', points: [[2.6, 1.8, -2.65], [2.6, 2.9, -2.6]] },
  ],
};

const SALA_VIP_SPEC: TenantTemplateSpec = {
  template: 'sala-vip',
  width_m: 12,
  depth_m: 8,
  height_m: 3.4,
  doorwayWidth_m: 3.2,
  tileColors: ['#E2E8F0', '#CBD5E1'],
  accentColor: '#0F172A',
  objects: [
    { id: 'vip-facade-sign', label: { es: 'Letrero Sala VIP', en: 'VIP Lounge sign' }, category: 'fixture', position: [0, 2.9, 3.96], size: [3.2, 0.36, 0.1], color: '#0F172A' },
    { id: 'vip-reception-desk', label: { es: 'Mostrador de recepción y acceso', en: 'Reception check-in desk' }, category: 'furniture', position: [-3.2, 0.54, 2.6], size: [2.4, 1.08, 0.8], color: '#1E293B' },
    { id: 'vip-carpet-lounge', label: { es: 'Alfombra zona de descanso', en: 'Lounge area rug' }, category: 'fixture', position: [-1.8, 0.015, -0.4], size: [6.2, 0.03, 4.4], color: '#334155' },
    // 6 plush armchairs + 2 sofas + 3 coffee tables
    ...([
      [-3.8, -1.6], [-2.2, -1.6], [-3.8, 0.6], [-2.2, 0.6], [-0.4, -1.6], [-0.4, 0.6],
    ] as const).map(([ax, az], idx) => ({
      id: `vip-armchair-${idx + 1}`,
      label: { es: `Sillón lounge ${idx + 1}`, en: `Lounge armchair ${idx + 1}` },
      category: 'furniture' as const,
      position: [ax, 0.42, az] as [number, number, number],
      size: [0.95, 0.84, 0.95] as [number, number, number],
      color: '#1E40AF',
    })),
    { id: 'vip-coffee-1', label: { es: 'Mesa de centro Oeste', en: 'West coffee table' }, category: 'furniture', position: [-3.0, 0.24, -0.5], size: [1.1, 0.48, 0.7], color: '#D6B89C' },
    { id: 'vip-coffee-2', label: { es: 'Mesa de centro Este', en: 'East coffee table' }, category: 'furniture', position: [-0.4, 0.24, -0.5], size: [0.9, 0.48, 0.7], color: '#D6B89C' },
    // Buffet & bar counter
    { id: 'vip-buffet', label: { es: 'Barra de buffet y bebidas', en: 'Buffet & beverage bar' }, category: 'furniture', position: [3.2, 0.54, -2.4], size: [4.2, 1.08, 0.9], color: '#475569' },
    { id: 'vip-cooler', label: { es: 'Enfriador de vinos y bebidas', en: 'Beverage cooler' }, category: 'furniture', position: [5.2, 1.0, -3.4], size: [0.9, 2.0, 0.7], color: '#94A3B8' },
    // Quiet work-pod desks
    { id: 'vip-workdesk-1', label: { es: 'Estación de trabajo 1', en: 'Work pod desk 1' }, category: 'furniture', position: [3.6, 0.38, 1.2], size: [1.6, 0.76, 0.7], color: '#CBD5E1' },
    { id: 'vip-workdesk-2', label: { es: 'Estación de trabajo 2', en: 'Work pod desk 2' }, category: 'furniture', position: [3.6, 0.38, 2.4], size: [1.6, 0.76, 0.7], color: '#CBD5E1' },
    { id: 'vip-closet-wall', label: { es: 'Muro cuarto técnico VIP', en: 'VIP telecom closet wall' }, category: 'structure', position: [1.6, 1.7, -3.1], size: [0.14, 3.4, 1.8], color: '#E2E8F0' },
    ...makeTechPack('vip', 12, 8, 3.4, [-3.2, 1.2, 2.6], [-1.8, 2.2, -3.88], [0.6, 1.45, -3.65], [1.2, 1.2, -3.86]),
  ],
  products: [
    ...Array.from({ length: 5 }, (_, i) => ({
      kind: 'plate' as const,
      position: [1.8 + i * 0.65, 1.12, -2.4] as [number, number, number],
      size: [0.32, 0.08, 0.32] as [number, number, number],
      color: i % 2 === 0 ? '#E2E8F0' : '#F59E0B',
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      kind: 'bottle' as const,
      position: [4.5 + i * 0.22, 1.18, -2.4] as [number, number, number],
      size: [0.1, 0.28, 0.1] as [number, number, number],
      color: '#10B981',
    })),
  ],
  ceilingLights: buildGridLights(12, 8, 3.35, 4, 3),
  cableTray: [
    [[0.6, 3.1, -3.5], [0.6, 3.1, 3.2]],
    [[0.6, 3.1, 2.6], [-3.2, 3.1, 2.6]],
    [[0.6, 3.1, 3.2], [-3.8, 3.1, 3.2]],
    [[0.6, 3.1, 3.2], [3.8, 3.1, 3.2]],
  ],
  conduits: [
    { id: 'vip-cond-pos', subsystem: 'pos', points: [[-3.2, 3.1, 2.6], [-3.2, 1.2, 2.6]] },
    { id: 'vip-cond-scr', subsystem: 'signage', points: [[-1.8, 3.1, -3.6], [-1.8, 2.2, -3.88]] },
    { id: 'vip-cond-cam1', subsystem: 'cctv', points: [[-3.84, 3.1, 3.36], [-3.84, 3.15, 3.36]] },
    { id: 'vip-cond-cam2', subsystem: 'cctv', points: [[3.84, 3.1, 3.36], [3.84, 3.15, 3.36]] },
    { id: 'vip-cond-ap', subsystem: 'wifi', points: [[0, 3.1, 0.2], [0, 3.25, 0.2]] },
    { id: 'vip-cond-rack', subsystem: 'uplink', points: [[0.6, 1.8, -3.65], [0.6, 3.1, -3.5]] },
  ],
};

const RESTAURANTE_SPEC: TenantTemplateSpec = {
  template: 'restaurante',
  width_m: 10,
  depth_m: 7,
  height_m: 3.3,
  doorwayWidth_m: 4.5,
  tileColors: ['#F3E8DE', '#E7D5C4'],
  accentColor: '#9A3412',
  objects: [
    { id: 'rest-facade-sign', label: { es: 'Letrero restaurante', en: 'Restaurant sign' }, category: 'fixture', position: [0, 2.8, 3.46], size: [3.0, 0.34, 0.1], color: '#7C2D12' },
    { id: 'rest-host-stand', label: { es: 'Podio de recepción', en: 'Host podium' }, category: 'furniture', position: [1.6, 0.56, 2.7], size: [0.7, 1.12, 0.6], color: '#9A3412' },
    { id: 'rest-kitchen-pass', label: { es: 'Barra de pase cocina', en: 'Kitchen pass counter' }, category: 'furniture', position: [-1.0, 0.54, -1.7], size: [5.4, 1.08, 0.9], color: '#7C2D12' },
    { id: 'rest-prep-island', label: { es: 'Mesa acero cocina', en: 'Steel kitchen prep table' }, category: 'furniture', position: [-1.5, 0.46, -2.9], size: [3.6, 0.92, 0.75], color: '#94A3B8' },
    ...([
      [-3.2, 0.2], [-0.4, 0.2], [2.4, 0.2], [-3.2, 1.9], [-0.4, 1.9], [2.4, 1.9],
    ] as const).flatMap(([tx, tz], idx) => [
      { id: `rest-table-${idx + 1}`, label: { es: `Mesa comedor ${idx + 1}`, en: `Dining table ${idx + 1}` }, category: 'furniture' as const, position: [tx, 0.38, tz] as [number, number, number], size: [1.2, 0.76, 0.85] as [number, number, number], color: '#B45309' },
      { id: `rest-chair-a-${idx + 1}`, label: { es: `Silla ${idx * 2 + 1}`, en: `Chair ${idx * 2 + 1}` }, category: 'furniture' as const, position: [tx, 0.42, tz - 0.6] as [number, number, number], size: [0.42, 0.84, 0.42] as [number, number, number], color: '#451A03' },
      { id: `rest-chair-b-${idx + 1}`, label: { es: `Silla ${idx * 2 + 2}`, en: `Chair ${idx * 2 + 2}` }, category: 'furniture' as const, position: [tx, 0.42, tz + 0.6] as [number, number, number], size: [0.42, 0.84, 0.42] as [number, number, number], color: '#451A03' },
    ]),
    ...makeTechPack('rest', 10, 7, 3.3, [1.6, 1.24, 2.7], [-1.0, 2.35, -2.1], [3.6, 1.45, -3.2], [4.3, 1.2, -3.35]),
  ],
  products: Array.from({ length: 8 }, (_, i) => ({
    kind: 'plate' as const,
    position: [-2.8 + i * 0.55, 1.12, -1.7] as [number, number, number],
    size: [0.28, 0.06, 0.28] as [number, number, number],
    color: '#FFFFFF',
  })),
  ceilingLights: buildGridLights(10, 7, 3.25),
  cableTray: [
    [[3.6, 3.0, -3.1], [3.6, 3.0, 2.9]],
    [[3.6, 3.0, 2.7], [1.6, 3.0, 2.7]],
    [[3.6, 3.0, 2.9], [-3.2, 3.0, 2.9]],
  ],
  conduits: [
    { id: 'rest-cond-pos', subsystem: 'pos', points: [[1.6, 3.0, 2.7], [1.6, 1.24, 2.7]] },
    { id: 'rest-cond-scr', subsystem: 'signage', points: [[-1.0, 3.0, -2.1], [-1.0, 2.35, -2.1]] },
    { id: 'rest-cond-cam1', subsystem: 'cctv', points: [[-3.2, 3.0, 2.94], [-3.2, 3.05, 2.94]] },
    { id: 'rest-cond-cam2', subsystem: 'cctv', points: [[3.2, 3.0, 2.94], [3.2, 3.05, 2.94]] },
    { id: 'rest-cond-ap', subsystem: 'wifi', points: [[0, 3.0, 0.2], [0, 3.15, 0.2]] },
    { id: 'rest-cond-rack', subsystem: 'uplink', points: [[3.6, 1.8, -3.1], [3.6, 3.0, -3.1]] },
  ],
};

const FARMACIA_SPEC: TenantTemplateSpec = {
  template: 'farmacia',
  width_m: 8,
  depth_m: 6,
  height_m: 3.2,
  doorwayWidth_m: 4.0,
  tileColors: ['#FFFFFF', '#ECFDF5'],
  accentColor: '#059669',
  objects: [
    { id: 'farm-facade-sign', label: { es: 'Letrero Farmacia', en: 'Pharmacy sign' }, category: 'fixture', position: [0, 2.75, 2.96], size: [2.6, 0.32, 0.1], color: '#059669' },
    { id: 'farm-cross', label: { es: 'Cruz luminosa farmacia', en: 'Pharmacy cross sign' }, category: 'fixture', position: [-2.6, 2.2, 2.92], size: [0.55, 0.55, 0.1], color: '#10B981' },
    { id: 'farm-rx-counter', label: { es: 'Mostrador de recetas y cobro', en: 'Prescription counter' }, category: 'furniture', position: [0, 0.52, -0.8], size: [4.6, 1.04, 0.8], color: '#FFFFFF' },
    { id: 'farm-privacy-glass', label: { es: 'Mampara de privacidad', en: 'Privacy divider' }, category: 'fixture', position: [-1.4, 1.32, -0.5], size: [0.06, 0.6, 0.7], color: '#A7F3D0', opacity: 0.65 },
    { id: 'farm-island', label: { es: 'Isla central cuidado personal', en: 'Personal care island' }, category: 'furniture', position: [-0.4, 0.68, 1.0], size: [2.4, 1.36, 0.6], color: '#D1FAE5' },
    ...([-3.75, -3.75, -3.75] as const).map((wx, idx) => ({
      id: `farm-shelf-w-${idx + 1}`,
      label: { es: `Anaquel muro Oeste ${idx + 1}`, en: `West wall shelf ${idx + 1}` },
      category: 'furniture' as const,
      position: [wx, 1.05, -0.8 + idx * 1.1] as [number, number, number],
      size: [0.42, 2.1, 0.95] as [number, number, number],
      color: '#A7F3D0',
    })),
    { id: 'farm-med-cabinet-1', label: { es: 'Estantería medicamentos A', en: 'Medicine cabinet A' }, category: 'furniture', position: [-2.0, 1.1, -2.65], size: [2.2, 2.2, 0.55], color: '#FFFFFF' },
    { id: 'farm-med-cabinet-2', label: { es: 'Refrigerador vacunas', en: 'Medical refrigerator' }, category: 'furniture', position: [0.2, 1.05, -2.65], size: [0.9, 2.1, 0.65], color: '#CBD5E1' },
    { id: 'farm-stool-1', label: { es: 'Taburete farmacéutico 1', en: 'Pharmacist stool 1' }, category: 'furniture', position: [-0.8, 0.42, -1.4], size: [0.42, 0.84, 0.42], shape: 'cylinder', color: '#059669' },
    { id: 'farm-stool-2', label: { es: 'Taburete farmacéutico 2', en: 'Pharmacist stool 2' }, category: 'furniture', position: [0.8, 0.42, -1.4], size: [0.42, 0.84, 0.42], shape: 'cylinder', color: '#059669' },
    { id: 'farm-waiting-bench', label: { es: 'Banca de espera', en: 'Waiting bench' }, category: 'furniture', position: [2.8, 0.25, 1.4], size: [0.55, 0.5, 1.6], color: '#10B981' },
    { id: 'farm-scale', label: { es: 'Báscula digital', en: 'Digital scale' }, category: 'fixture', position: [3.2, 0.6, 2.4], size: [0.42, 1.2, 0.45], color: '#94A3B8' },
    { id: 'farm-back-wall', label: { es: 'Muro almacén medicamentos', en: 'Backroom divider' }, category: 'structure', position: [1.5, 1.6, -1.8], size: [1.8, 3.2, 0.14], color: '#E2E8F0' },
    ...makeTechPack('farm', 8, 6, 3.2, [1.1, 1.18, -0.8], [0, 2.2, -2.6], [2.6, 1.45, -2.74], [3.5, 1.2, -2.86]),
  ],
  products: Array.from({ length: 12 }, (_, i) => ({
    kind: 'bottle' as const,
    position: [-1.4 + (i % 6) * 0.36, i < 6 ? 1.42 : 0.92, i < 6 ? 1.0 : 1.0] as [number, number, number],
    size: [0.1, 0.18, 0.1] as [number, number, number],
    color: i % 3 === 0 ? '#10B981' : i % 3 === 1 ? '#0EA5E9' : '#FFFFFF',
  })),
  ceilingLights: buildGridLights(8, 6, 3.15),
  cableTray: [
    [[2.6, 2.9, -2.6], [2.6, 2.9, 2.5]],
    [[2.6, 2.9, -0.8], [1.1, 2.9, -0.8]],
    [[2.6, 2.9, 2.5], [-2.56, 2.9, 2.5]],
  ],
  conduits: [
    { id: 'farm-cond-pos', subsystem: 'pos', points: [[1.1, 2.9, -0.8], [1.1, 1.18, -0.8]] },
    { id: 'farm-cond-scr', subsystem: 'signage', points: [[0, 2.9, -2.6], [0, 2.2, -2.6]] },
    { id: 'farm-cond-cam1', subsystem: 'cctv', points: [[-2.56, 2.9, 2.52], [-2.56, 2.95, 2.52]] },
    { id: 'farm-cond-cam2', subsystem: 'cctv', points: [[2.56, 2.9, 2.52], [2.56, 2.95, 2.52]] },
    { id: 'farm-cond-ap', subsystem: 'wifi', points: [[0, 2.9, 0.2], [0, 3.05, 0.2]] },
    { id: 'farm-cond-rack', subsystem: 'uplink', points: [[2.6, 1.8, -2.65], [2.6, 2.9, -2.6]] },
  ],
};

const CAMBIO_SPEC: TenantTemplateSpec = {
  template: 'cambio',
  width_m: 6,
  depth_m: 5,
  height_m: 3.1,
  doorwayWidth_m: 3.4,
  tileColors: ['#EFF6FF', '#DBEAFE'],
  accentColor: '#1D4ED8',
  objects: [
    { id: 'cambio-facade-sign', label: { es: 'Letrero Casa de Cambio', en: 'Currency Exchange sign' }, category: 'fixture', position: [0, 2.65, 2.46], size: [2.4, 0.3, 0.1], color: '#1E3A8A' },
    { id: 'cambio-teller-desk', label: { es: 'Mostrador blindado de ventanillas', en: 'Secure teller counter' }, category: 'furniture', position: [0, 0.54, 0.2], size: [4.2, 1.08, 0.85], color: '#1E3A8A' },
    { id: 'cambio-glass-1', label: { es: 'Cristal de seguridad Ventanilla 1', en: 'Security glass Window 1' }, category: 'fixture', position: [-1.0, 1.54, 0.56], size: [1.8, 0.9, 0.05], color: '#BAE6FD', opacity: 0.45 },
    { id: 'cambio-glass-2', label: { es: 'Cristal de seguridad Ventanilla 2', en: 'Security glass Window 2' }, category: 'fixture', position: [1.0, 1.54, 0.56], size: [1.8, 0.9, 0.05], color: '#BAE6FD', opacity: 0.45 },
    { id: 'cambio-stool-1', label: { es: 'Silla cajero 1', en: 'Teller chair 1' }, category: 'furniture', position: [-1.0, 0.45, -0.55], size: [0.46, 0.9, 0.46], shape: 'cylinder', color: '#0F172A' },
    { id: 'cambio-stool-2', label: { es: 'Silla cajero 2', en: 'Teller chair 2' }, category: 'furniture', position: [1.0, 0.45, -0.55], size: [0.46, 0.9, 0.46], shape: 'cylinder', color: '#0F172A' },
    { id: 'cambio-safe', label: { es: 'Caja fuerte de valores', en: 'Cash vault safe' }, category: 'furniture', position: [-2.1, 0.55, -1.9], size: [0.75, 1.1, 0.7], color: '#334155' },
    { id: 'cambio-atm-1', label: { es: 'Cajero automático 1', en: 'ATM Kiosk 1' }, category: 'furniture', position: [-2.4, 0.85, 1.6], size: [0.6, 1.7, 0.65], color: '#1E293B' },
    { id: 'cambio-atm-2', label: { es: 'Cajero automático 2', en: 'ATM Kiosk 2' }, category: 'furniture', position: [2.4, 0.85, 1.6], size: [0.6, 1.7, 0.65], color: '#1E293B' },
    { id: 'cambio-stanchion-1', label: { es: 'Poste unifila Oeste', en: 'Queue stanchion West' }, category: 'fixture', position: [-1.1, 0.45, 1.6], size: [0.12, 0.9, 0.12], shape: 'cylinder', color: '#64748B' },
    { id: 'cambio-stanchion-2', label: { es: 'Poste unifila Este', en: 'Queue stanchion East' }, category: 'fixture', position: [1.1, 0.45, 1.6], size: [0.12, 0.9, 0.12], shape: 'cylinder', color: '#64748B' },
    { id: 'cambio-back-cred', label: { es: 'Archivero de oficina', en: 'Office credenza' }, category: 'furniture', position: [-0.6, 0.42, -2.0], size: [1.6, 0.84, 0.55], color: '#475569' },
    { id: 'cambio-counter-tray-1', label: { es: 'Bandeja pasavalores 1', en: 'Pass-through tray 1' }, category: 'fixture', position: [-1.0, 1.1, 0.45], size: [0.4, 0.06, 0.3], color: '#CBD5E1' },
    { id: 'cambio-counter-tray-2', label: { es: 'Bandeja pasavalores 2', en: 'Pass-through tray 2' }, category: 'fixture', position: [1.0, 1.1, 0.45], size: [0.4, 0.06, 0.3], color: '#CBD5E1' },
    ...makeTechPack('cambio', 6, 5, 3.1, [-0.9, 1.22, 0.1], [0, 2.05, -2.35], [1.8, 1.4, -2.2], [2.4, 1.2, -2.36]),
  ],
  products: [],
  ceilingLights: buildGridLights(6, 5, 3.05, 2, 2),
  cableTray: [
    [[1.8, 2.8, -2.1], [1.8, 2.8, 2.1]],
    [[1.8, 2.8, 0.1], [-0.9, 2.8, 0.1]],
    [[1.8, 2.8, 2.1], [-1.92, 2.8, 2.1]],
  ],
  conduits: [
    { id: 'cam-cond-pos', subsystem: 'pos', points: [[-0.9, 2.8, 0.1], [-0.9, 1.22, 0.1]] },
    { id: 'cam-cond-scr', subsystem: 'signage', points: [[0, 2.8, -2.1], [0, 2.05, -2.35]] },
    { id: 'cam-cond-cam1', subsystem: 'cctv', points: [[-1.92, 2.8, 2.1], [-1.92, 2.85, 2.1]] },
    { id: 'cam-cond-cam2', subsystem: 'cctv', points: [[1.92, 2.8, 2.1], [1.92, 2.85, 2.1]] },
    { id: 'cam-cond-ap', subsystem: 'wifi', points: [[0, 2.8, 0.2], [0, 2.95, 0.2]] },
    { id: 'cam-cond-rack', subsystem: 'uplink', points: [[1.8, 1.75, -2.2], [1.8, 2.8, -2.1]] },
  ],
};

const DUTY_FREE_SPEC: TenantTemplateSpec = {
  template: 'duty-free',
  width_m: 10,
  depth_m: 7,
  height_m: 3.4,
  doorwayWidth_m: 5.0,
  tileColors: ['#FAF5FF', '#F3E8FF'],
  accentColor: '#7E22CE',
  objects: [
    { id: 'df-facade-sign', label: { es: 'Portal Tienda Libre de Impuestos', en: 'Duty Free portal sign' }, category: 'fixture', position: [0, 2.9, 3.46], size: [3.6, 0.36, 0.1], color: '#581C87' },
    { id: 'df-eas-1', label: { es: 'Antena antihurto Oeste', en: 'EAS gate West' }, category: 'fixture', position: [-1.8, 0.8, 3.2], size: [0.14, 1.6, 0.42], color: '#CBD5E1' },
    { id: 'df-eas-2', label: { es: 'Antena antihurto Este', en: 'EAS gate East' }, category: 'fixture', position: [1.8, 0.8, 3.2], size: [0.14, 1.6, 0.42], color: '#CBD5E1' },
    { id: 'df-gondola-1', label: { es: 'Isla perfumería 1', en: 'Perfume island 1' }, category: 'furniture', position: [-2.4, 0.72, 0.4], size: [2.2, 1.44, 0.9], color: '#E9D5FF' },
    { id: 'df-gondola-2', label: { es: 'Isla perfumería 2', en: 'Perfume island 2' }, category: 'furniture', position: [-2.4, 0.72, 1.8], size: [2.2, 1.44, 0.9], color: '#E9D5FF' },
    { id: 'df-gondola-3', label: { es: 'Isla licores y chocolates 1', en: 'Spirits & confectionery 1' }, category: 'furniture', position: [0.6, 0.72, 0.4], size: [2.2, 1.44, 0.9], color: '#DDD6FE' },
    { id: 'df-gondola-4', label: { es: 'Isla licores y chocolates 2', en: 'Spirits & confectionery 2' }, category: 'furniture', position: [0.6, 0.72, 1.8], size: [2.2, 1.44, 0.9], color: '#DDD6FE' },
    { id: 'df-wall-cab-1', label: { es: 'Vitrina lujo Oeste 1', en: 'Luxury wall cabinet 1' }, category: 'furniture', position: [-4.7, 1.15, 0.2], size: [0.45, 2.3, 1.8], color: '#581C87' },
    { id: 'df-wall-cab-2', label: { es: 'Vitrina lujo Oeste 2', en: 'Luxury wall cabinet 2' }, category: 'furniture', position: [-4.7, 1.15, 2.1], size: [0.45, 2.3, 1.5], color: '#581C87' },
    { id: 'df-checkout-island', label: { es: 'Isla doble de cajas', en: 'Dual checkout counter' }, category: 'furniture', position: [3.4, 0.52, 0.8], size: [0.9, 1.04, 2.8], color: '#3B0764' },
    { id: 'df-cashier-1', label: { es: 'Silla caja 1', en: 'Cashier stool 1' }, category: 'furniture', position: [4.1, 0.45, 0.1], size: [0.44, 0.9, 0.44], shape: 'cylinder', color: '#1E293B' },
    { id: 'df-cashier-2', label: { es: 'Silla caja 2', en: 'Cashier stool 2' }, category: 'furniture', position: [4.1, 0.45, 1.5], size: [0.44, 0.9, 0.44], shape: 'cylinder', color: '#1E293B' },
    { id: 'df-backroom-wall', label: { es: 'Muro almacén fiscal', en: 'Bonded stockroom wall' }, category: 'structure', position: [-1.0, 1.7, -1.8], size: [7.4, 3.4, 0.14], color: '#E2E8F0' },
    { id: 'df-stock-rack', label: { es: 'Anaquel bodega fiscal', en: 'Bonded stock rack' }, category: 'furniture', position: [-2.5, 1.05, -2.9], size: [3.2, 2.1, 0.7], color: '#94A3B8' },
    ...makeTechPack('df', 10, 7, 3.4, [3.3, 1.18, 0.8], [3.5, 2.45, 0.8], [3.6, 1.45, -3.1], [4.3, 1.2, -3.35]),
  ],
  products: Array.from({ length: 16 }, (_, i) => ({
    kind: 'bottle' as const,
    position: [-3.1 + (i % 4) * 0.45 + (i >= 8 ? 3.0 : 0), 1.58, (Math.floor(i / 4) % 2 === 0 ? 0.4 : 1.8)] as [number, number, number],
    size: [0.1, 0.24, 0.1] as [number, number, number],
    color: i % 3 === 0 ? '#A855F7' : i % 3 === 1 ? '#F59E0B' : '#EC4899',
  })),
  ceilingLights: buildGridLights(10, 7, 3.35),
  cableTray: [
    [[3.6, 3.1, -3.0], [3.6, 3.1, 2.9]],
    [[3.6, 3.1, 0.8], [3.3, 3.1, 0.8]],
    [[3.6, 3.1, 2.9], [-3.2, 3.1, 2.9]],
  ],
  conduits: [
    { id: 'df-cond-pos', subsystem: 'pos', points: [[3.3, 3.1, 0.8], [3.3, 1.18, 0.8]] },
    { id: 'df-cond-scr', subsystem: 'signage', points: [[3.5, 3.1, 0.8], [3.5, 2.45, 0.8]] },
    { id: 'df-cond-cam1', subsystem: 'cctv', points: [[-3.2, 3.1, 2.94], [-3.2, 3.15, 2.94]] },
    { id: 'df-cond-cam2', subsystem: 'cctv', points: [[3.2, 3.1, 2.94], [3.2, 3.15, 2.94]] },
    { id: 'df-cond-ap', subsystem: 'wifi', points: [[0, 3.1, 0.2], [0, 3.25, 0.2]] },
    { id: 'df-cond-rack', subsystem: 'uplink', points: [[3.6, 1.8, -3.1], [3.6, 3.1, -3.0]] },
  ],
};

const MOSTRADOR_SPEC: TenantTemplateSpec = {
  template: 'mostrador-aerolinea',
  width_m: 10,
  depth_m: 5,
  height_m: 3.3,
  doorwayWidth_m: 6.0,
  tileColors: ['#F8FAFC', '#E2E8F0'],
  accentColor: '#B45309',
  objects: [
    { id: 'desk-facade-sign', label: { es: 'Cintillo aerolínea', en: 'Airline header sign' }, category: 'fixture', position: [0, 2.8, 2.46], size: [4.2, 0.34, 0.1], color: '#B45309' },
    ...([-3.0, -1.0, 1.0, 3.0] as const).flatMap((dx, idx) => [
      { id: `desk-counter-${idx + 1}`, label: { es: `Mostrador Check-in ${idx + 1}`, en: `Check-in desk ${idx + 1}` }, category: 'furniture' as const, position: [dx, 0.52, -0.2] as [number, number, number], size: [1.45, 1.04, 0.8] as [number, number, number], color: '#D97706' },
      { id: `desk-scale-${idx + 1}`, label: { es: `Báscula equipaje ${idx + 1}`, en: `Baggage scale ${idx + 1}` }, category: 'fixture' as const, position: [dx, 0.1, 0.62] as [number, number, number], size: [1.1, 0.2, 0.6] as [number, number, number], color: '#475569' },
      { id: `desk-chair-${idx + 1}`, label: { es: `Silla agente ${idx + 1}`, en: `Agent chair ${idx + 1}` }, category: 'furniture' as const, position: [dx, 0.45, -1.0] as [number, number, number], size: [0.46, 0.9, 0.46] as [number, number, number], shape: 'cylinder' as const, color: '#1E293B' },
    ]),
    { id: 'desk-stanchion-1', label: { es: 'Unifila Oeste', en: 'Queue stanchion West' }, category: 'fixture', position: [-3.8, 0.45, 1.8], size: [0.12, 0.9, 0.12], shape: 'cylinder', color: '#64748B' },
    { id: 'desk-stanchion-2', label: { es: 'Unifila Este', en: 'Queue stanchion East' }, category: 'fixture', position: [3.8, 0.45, 1.8], size: [0.12, 0.9, 0.12], shape: 'cylinder', color: '#64748B' },
    ...makeTechPack('desk', 10, 5, 3.3, [-1.0, 1.18, -0.2], [0, 2.25, -2.3], [3.8, 1.45, -2.1], [4.4, 1.2, -2.35]),
  ],
  products: [],
  ceilingLights: buildGridLights(10, 5, 3.25, 3, 2),
  cableTray: [
    [[3.8, 3.0, -2.0], [3.8, 3.0, 2.1]],
    [[3.8, 3.0, -0.2], [-3.0, 3.0, -0.2]],
    [[3.8, 3.0, 2.1], [-3.2, 3.0, 2.1]],
  ],
  conduits: [
    { id: 'desk-cond-pos', subsystem: 'pos', points: [[-1.0, 3.0, -0.2], [-1.0, 1.18, -0.2]] },
    { id: 'desk-cond-scr', subsystem: 'signage', points: [[0, 3.0, -2.0], [0, 2.25, -2.3]] },
    { id: 'desk-cond-cam1', subsystem: 'cctv', points: [[-3.2, 3.0, 2.1], [-3.2, 3.05, 2.1]] },
    { id: 'desk-cond-cam2', subsystem: 'cctv', points: [[3.2, 3.0, 2.1], [3.2, 3.05, 2.1]] },
    { id: 'desk-cond-ap', subsystem: 'wifi', points: [[0, 3.0, 0.2], [0, 3.15, 0.2]] },
    { id: 'desk-cond-rack', subsystem: 'uplink', points: [[3.8, 1.8, -2.1], [3.8, 3.0, -2.0]] },
  ],
};

const TEMPLATE_MAP: Record<TenantTemplate, TenantTemplateSpec> = {
  tienda: TIENDA_SPEC,
  cafe: CAFE_SPEC,
  restaurante: RESTAURANTE_SPEC,
  farmacia: FARMACIA_SPEC,
  cambio: CAMBIO_SPEC,
  'duty-free': DUTY_FREE_SPEC,
  'sala-vip': SALA_VIP_SPEC,
  'mostrador-aerolinea': MOSTRADOR_SPEC,
};

export function getTenantTemplateSpec(
  template: TenantTemplate,
  _tier: TenantTier = 'estandar',
): TenantTemplateSpec {
  return TEMPLATE_MAP[template];
}
