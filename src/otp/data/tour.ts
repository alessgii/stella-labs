import type { NavigableZoneId } from './lodZones';
import type { FailureId } from './failures';

export type TourTrackId = 'topology' | 'systems';

export interface TourStepSpec {
  step: number;
  track: TourTrackId;
  title: { es: string; en: string };
  caption: { es: string; en: string };
  mode: 'passenger' | 'network';
  focusedZoneId: NavigableZoneId | null;
  networkPreset?: string;
  itOtLens?: boolean;
  failureId?: FailureId | null;
  selectDeviceId?: string | null;
  selectIdfId?: 'R1_T' | 'R2_T' | 'R3_T' | null;
  triggerDasCad?: readonly [number, number] | null;
  tenantId?: string | null;
  useCase?: 'emergency' | 'power' | 'cold-chain' | null;
}

export const TOUR_STEPS: TourStepSpec[] = [
  // ================= TRACK 1: TOPOLOGÍA CAN (v1 — 10 Pasos) =================
  {
    step: 1,
    track: 'topology',
    title: { es: '1. El Campus Aeroportuario Completo', en: '1. Complete Airport Campus' },
    caption: {
      es: 'Extensión de 675 × 666 m en escala 1:1 CAD: Salidas, Galería, Cuello, Llegadas, Muelle de 20 vértices (14 fingers), Torre de Control, Carga y Nave SSEI.',
      en: '675 × 666 m 1:1 CAD campus: Departures, Gallery, Neck, Arrivals, 20-vertex Pier (14 fingers), Control Tower, Cargo, and SSEI.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '01',
    itOtLens: false,
    failureId: null,
  },
  {
    step: 2,
    track: 'topology',
    title: { es: '2. Redes de Usuarios (TI) vs Sistemas Críticos (OT)', en: '2. User Networks (IT) vs Critical Systems (OT)' },
    caption: {
      es: 'La fibra sirve a dos mundos: redes TI (Wi‑Fi, tiendas, aerolíneas) y sistemas críticos OT (control aéreo, luces de pista, equipaje y energía) que exigen disponibilidad del 99.999 %.',
      en: 'Fiber serves two worlds: IT networks (Wi-Fi, shops, airlines) and critical OT systems (ATC, runway lights, baggage, power) requiring 99.999% availability.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '01',
    itOtLens: true,
    failureId: null,
  },
  {
    step: 3,
    track: 'topology',
    title: { es: '3. Los 6 Nodos Principales del Núcleo (N1–N6)', en: '3. The 6 Core Network Nodes (N1–N6)' },
    caption: {
      es: 'Cuartos principales conectados en bucle: N1 (Salidas, MDF-A) → N2 (Llegadas) → N3 (Torre) → N5 (Muelle, MDF-B) → N6 (Bomberos SSEI) → N4 (Carga) → N1.',
      en: 'Main equipment rooms linked in a loop: N1 (Departures, MDF-A) → N2 (Arrivals) → N3 (Tower) → N5 (Pier, MDF-B) → N6 (ARFF Fire) → N4 (Cargo) → N1.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '03',
    itOtLens: false,
    failureId: null,
  },
  {
    step: 4,
    track: 'topology',
    title: { es: '4. Doble Anillo de Fibra y Ductos Separados', en: '4. Dual Fiber Ring & Separate Ducts' },
    caption: {
      es: 'Anillo 1 Crítico (Azul, 1.78 km) y Anillo 2 Servicios (Naranja, 1.94 km) viajan por ductos físicos separados para que una excavación no corte ambos a la vez.',
      en: 'Critical Ring 1 (Blue, 1.78 km) and Services Ring 2 (Orange, 1.94 km) run through separate underground ducts so a single dig cannot cut both.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '04',
    itOtLens: false,
    failureId: null,
  },
  {
    step: 5,
    track: 'topology',
    title: { es: '5. Modo B: Ambos Anillos Activos con Respaldo', en: '5. Mode B: Both Rings Active with Headroom' },
    caption: {
      es: 'Ambos anillos trabajan activos al mismo tiempo. La suma de sus cargas (30 + 40 = 70 Gbps) cabe en un solo anillo (< 80 % de 100G) si el otro llega a fallar.',
      en: 'Both rings carry traffic simultaneously. Their combined load (30 + 40 = 70 Gbps) fits on a single ring (< 80% of 100G) if the other fails.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '04',
    itOtLens: false,
    failureId: null,
  },
  {
    step: 6,
    track: 'topology',
    title: { es: '6. Anillos de Distribución y Racks de Zona (IDF)', en: '6. Distribution Rings & Zone Racks (IDF)' },
    caption: {
      es: '4 anillos secundarios (Terminal, Lado Aire, Carga y Perímetro) conectan 22 armarios de comunicaciones (IDF), cada uno con doble enlace a nodos distintos del núcleo.',
      en: '4 secondary rings (Terminal, Airside, Cargo, Perimeter) link 22 zone racks (IDFs), each dual-homed to two distinct core nodes.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '01',
    itOtLens: false,
    failureId: null,
  },
  {
    step: 7,
    track: 'topology',
    title: { es: '7. Falla F1: Corte Simple (< 50 ms automático)', en: '7. Fault F1: Single Cut (< 50 ms Failover)' },
    caption: {
      es: 'Al cortarse un tramo de fibra, el protocolo de anillo (ERPS) detecta la falla y redirige el tráfico por el sentido contrario en menos de 50 milisegundos sin cortes.',
      en: 'When a fiber span is cut, the ring protection protocol (ERPS) reroutes traffic the opposite way in under 50 milliseconds with zero downtime.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '04',
    failureId: 'F1',
  },
  {
    step: 8,
    track: 'topology',
    title: { es: '8. Falla F3: Doble Corte en Anillo 1', en: '8. Fault F3: Dual Cut on Ring 1' },
    caption: {
      es: 'Dos cortes parten el Anillo 1; los servicios críticos migran automáticamente al Anillo 2 en segundos gracias a la reserva de capacidad del Modo B.',
      en: 'Two cuts split Ring 1; critical services migrate onto Ring 2 within seconds thanks to Mode B capacity headroom.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '04',
    failureId: 'F3',
  },
  {
    step: 9,
    track: 'topology',
    title: { es: '9. Falla F6: Torre Aislada y Enlace por Radio', en: '9. Fault F6: Isolated Tower & Radio Backup' },
    caption: {
      es: 'Ante el corte extremo de los 4 cables hacia N3, entra en operación degradada el radioenlace de respaldo de 200 m (hipotenusa cota 11) entre N5 y N3.',
      en: 'Under an extreme 4-cable cut to N3, the 200 m backup radio link (Cota 11 hypotenuse) between N5 and N3 sustains degraded operations.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '04',
    failureId: 'F6',
  },
  {
    step: 10,
    track: 'topology',
    title: { es: '10. Presupuesto Óptico y CWDM', en: '10. Optical Link Budget & CWDM' },
    caption: {
      es: 'Cálculo paso a paso de pérdidas (fibra OS2 0.35 dB/km, empalmes 0.1 dB, conectores 0.5 dB) y demostración del caso con mux CWDM (+2.5 dB) y cómo corregirlo.',
      en: 'Step-by-step loss calculation (OS2 0.35 dB/km, splices 0.1 dB, connectors 0.5 dB) and demonstration of CWDM mux (+2.5 dB) remediation.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '01',
    failureId: null,
  },

  // ================= TRACK 2: SISTEMAS Y LENTES (v2 — 12 Pasos) =================
  {
    step: 1,
    track: 'systems',
    title: { es: '1. Salidas en Lente Pasajeros: El Lugar', en: '1. Departures in Passenger Lens: The Place' },
    caption: {
      es: 'Entramos al edificio de Salidas: islas de check-in A y B, filtros de seguridad, pantallas FIDS, tiendas, cafeterías y puertas domésticas 50–57.',
      en: 'Entering Departures: check-in islands A & B, security lanes, FIDS boards, shops, cafes, and domestic gates 50–57.',
    },
    mode: 'passenger',
    focusedZoneId: 'departures',
    selectDeviceId: 'FIDS-003',
    failureId: null,
  },
  {
    step: 2,
    track: 'systems',
    title: { es: '2. Mismo Edificio en Lente Red: La Fibra', en: '2. Same Building in Network Lens: The Fiber' },
    caption: {
      es: 'Al cambiar a Lente Red sin mover la cámara, vemos el nodo principal (MDF-A), los racks de zona (IDF), bandejas de cables y ductos de entrada.',
      en: 'Switching to Network Lens in place reveals the main node (MDF-A), zone racks (IDFs), cable trays, and dual duct entries.',
    },
    mode: 'network',
    focusedZoneId: 'departures',
    selectDeviceId: null,
    failureId: null,
  },
  {
    step: 3,
    track: 'systems',
    title: { es: '3. Pantalla de Vuelos (FIDS) y Ruta Completa', en: '3. Flight Screen (FIDS) & Full Path Trace' },
    caption: {
      es: 'Trazado completo desde la pantalla hasta el servidor: Pantalla → Switch de rack (IDF) → Anillo Terminal → Nodo central N1 → Servidor en red aislada (VRF-AERO).',
      en: 'Full path from display to server: Display → Rack Switch (IDF) → Terminal Ring → Core Node N1 → Server on isolated network (VRF-AERO).',
    },
    mode: 'network',
    focusedZoneId: 'departures',
    selectDeviceId: 'FIDS-003',
    failureId: null,
  },
  {
    step: 4,
    track: 'systems',
    title: { es: '4. Regla de 90 m: Cobre vs Fibra Óptica', en: '4. 90 m Rule: Copper vs Optical Fiber' },
    caption: {
      es: 'Usamos cable de cobre (Cat6A PoE) hasta 90 m; si un equipo está más lejos (ej. 107 m) o hay ruido eléctrico, se conecta con fibra óptica. El rack muestra su uso de capacidad.',
      en: 'Cat6A PoE copper reaches up to 90 m; beyond that (e.g. 107 m) or near electrical noise, fiber is used. The rack card shows capacity usage.',
    },
    mode: 'network',
    focusedZoneId: 'departures',
    selectDeviceId: 'FIDS-020',
    selectIdfId: 'R1_T',
    failureId: null,
  },
  {
    step: 5,
    track: 'systems',
    title: { es: '5. Iluminación de Terminal (BMS / DALI)', en: '5. Terminal Lighting (BMS / DALI)' },
    caption: {
      es: 'La fibra llega al IDF; desde el controlador DALI sale bus de cobre hacia las luminarias por escena (Día, Noche, Limpieza, Emergencia).',
      en: 'Fiber terminates at the IDF; local copper DALI buses drive ceiling fixtures by scene (Day, Night, Cleaning, Emergency).',
    },
    mode: 'network',
    focusedZoneId: 'departures',
    selectDeviceId: 'DALI-01',
    failureId: null,
  },
  {
    step: 6,
    track: 'systems',
    title: { es: '6. Muelle: Puertas 1–39, PBB y 400 Hz', en: '6. Pier: Gates 1–39, PBB & 400 Hz' },
    caption: {
      es: 'En el Muelle (304 m), los 14 fingers monitorizan pasarelas PBB, convertidores 400 Hz y PCA por fibra hacia R4_T, R5_T y MDF-B (N5) por inmunidad a EMI.',
      en: 'Along the 304 m Pier, all 14 fingers monitor PBB, 400 Hz, and PCA units over fiber to R4_T, R5_T, and MDF-B (N5) for EMI immunity.',
    },
    mode: 'network',
    focusedZoneId: 'pier',
    selectDeviceId: 'PBB-N4',
    failureId: null,
  },
  {
    step: 7,
    track: 'systems',
    title: { es: '7. Equipaje (BHS): Ruido Electromagnético y PLCs', en: '7. Baggage (BHS): Motor EMI & Industrial PLCs' },
    caption: {
      es: 'En Llegadas, los carruseles y clasificadores operan con PLCs PROFINET sobre fibra hacia R6_T y N2 en VRF-BHS para evitar ruido de motores y variadores.',
      en: 'In Arrivals, carousels and sorters use PROFINET PLCs over fiber to R6_T and N2 in VRF-BHS to avoid motor and VFD electromagnetic noise.',
    },
    mode: 'network',
    focusedZoneId: 'arrivals',
    selectDeviceId: 'PLC-BHS-ARR-01',
    failureId: null,
  },
  {
    step: 8,
    track: 'systems',
    title: { es: '8. Airside: Calles de Rodaje L/K y Bóvedas AGL', en: '8. Airside: Taxiways L/K & AGL Vaults' },
    caption: {
      es: 'El anillo Airside enlaza la Torre (N3) con las bóvedas CCR (R2_A, R3_A, R5_A). La fibra lleva datos de control; el cable serie amarillo lleva la corriente (2.8–6.6 A).',
      en: 'The Airside ring links the Tower (N3) with CCR vaults (R2_A, R3_A, R5_A). Fiber carries control data; the yellow series loop carries power (2.8–6.6 A).',
    },
    mode: 'network',
    focusedZoneId: 'airside',
    selectDeviceId: null,
    failureId: null,
  },
  {
    step: 9,
    track: 'systems',
    title: { es: '9. Consola de Torre: Orden de Brillo ALCMS', en: '9. Tower Console: ALCMS Brightness Command' },
    caption: {
      es: 'Desde la consola de Torre (N3), un cambio de paso de brillo viaja en ~1.6 µs hasta la bóveda CCR, ajusta las luces de rodaje y devuelve telemetría.',
      en: 'From the Tower console (N3), a brightness command reaches the CCR vault in ~1.6 µs, updates taxiway intensity, and returns lamp telemetry.',
    },
    mode: 'network',
    focusedZoneId: 'tower',
    selectDeviceId: null,
    failureId: null,
  },
  {
    step: 10,
    track: 'systems',
    title: { es: '10. Falla F9: Bóveda AGL Aislada (Modo Local)', en: '10. Fault F9: Isolated AGL Vault (Local Mode)' },
    caption: {
      es: 'Si se cortan ambos sentidos de fibra hacia R3_A, los reguladores CCR mantienen encendidas las luces en el último paso de brillo (fail-safe local).',
      en: 'If both fiber directions to R3_A are cut, CCR regulators fail-safe locally by holding the last active brightness step.',
    },
    mode: 'network',
    focusedZoneId: 'airside',
    failureId: 'F9',
  },
  {
    step: 11,
    track: 'systems',
    title: { es: '11. Perímetro: DAS-fibra e Intrusión Acústica', en: '11. Perimeter: Fiber-DAS & Acoustic Intrusion' },
    caption: {
      es: 'Dos hilos dedicados del anillo Perímetro (2,485.58 m) actúan como sensor acústico: detectan la intrusión a 920 m y orientan la cámara CCTV-R4_P.',
      en: 'Two dedicated fibers in the 2,485.58 m Perimeter ring act as an acoustic sensor: pinpointing an intrusion at 920 m and slewing camera CCTV-R4_P.',
    },
    mode: 'network',
    focusedZoneId: 'perimeter',
    failureId: 'F12',
    triggerDasCad: [-60, -260],
  },
  {
    step: 12,
    track: 'systems',
    title: { es: '12. Cierre: Lente TI / OT sobre una Sola Red CAN', en: '12. Conclusion: IT / OT Lens on One CAN Network' },
    caption: {
      es: 'Una sola infraestructura física de fibra óptica soporta tanto la experiencia del pasajero (TI) como las operaciones críticas aeronáuticas (OT) con aislamiento VRF y redundancia total.',
      en: 'A single physical optical fiber infrastructure powers both passenger experience (IT) and mission-critical aviation operations (OT) with VRF isolation and full redundancy.',
    },
    mode: 'network',
    focusedZoneId: null,
    networkPreset: '01',
    itOtLens: true,
    failureId: null,
    triggerDasCad: null,
  },
  {
    step: 13,
    track: 'systems',
    title: { es: '13. Interior de un Local: Boutique (Vista Pasajeros)', en: '13. Store Interior: Boutique (Passenger View)' },
    caption: {
      es: 'Al entrar a un local se abre su vista interior: mobiliario, caja de cobro (POS), cámaras de seguridad, antena Wi‑Fi y su propio mini-rack de red.',
      en: 'Entering a store opens its interior view: furniture, POS checkout, security cameras, Wi-Fi access point, and its own mini network rack.',
    },
    mode: 'passenger',
    focusedZoneId: 'pier',
    tenantId: 'poi-shop-souvenirs',
  },
  {
    step: 14,
    track: 'systems',
    title: { es: '14. Red Interna del Local: Cafetería y Red Aislada (VRF)', en: '14. Store Network View: Café & Isolated Network (VRF)' },
    caption: {
      es: 'En Lente Red el mobiliario se vuelve semitransparente para ver las tuberías de red, la conexión al rack cercano (IDF R1_T) y cómo su tráfico viaja aislado (VRF).',
      en: 'In Network Lens furniture turns translucent to reveal network conduits, the link to the nearby rack (IDF R1_T), and isolated traffic (VRF).',
    },
    mode: 'network',
    focusedZoneId: 'departures',
    tenantId: 'poi-food-dep-cafe',
  },
  {
    step: 15,
    track: 'systems',
    title: { es: '15. Sala VIP: Fibra Dedicada y Salida a Internet Propia', en: '15. VIP Lounge: Dedicated Fiber & Own Internet Exit' },
    caption: {
      es: 'Por estar a más de 90 m y ser servicio Premium, la Sala VIP usa fibra óptica dedicada hasta el rack R5_T y sale por su propio proveedor de internet (ISP B).',
      en: 'Being over 90 m away with Premium tier, the VIP Lounge uses dedicated fiber to rack R5_T and exits via its own internet provider (ISP B).',
    },
    mode: 'network',
    focusedZoneId: 'pier',
    tenantId: 'poi-lounge-vip',
  },
  {
    step: 16,
    track: 'systems',
    title: { es: '16. Estación de Bomberos (SSEI): Alerta por Fibra', en: '16. Fire Station (ARFF): Emergency Alert over Fiber' },
    caption: {
      es: 'La alarma desde Torre hacia Bomberos viaja en milisegundos con prioridad máxima en su red aislada, abriendo portones, encendiendo luces de pista y orientando cámaras.',
      en: 'The Tower → Fire Station alarm travels in milliseconds with top priority on its isolated network, opening bay doors, switching runway lights, and aiming cameras.',
    },
    mode: 'network',
    focusedZoneId: 'ssei',
    useCase: 'emergency',
  },
  {
    step: 17,
    track: 'systems',
    title: { es: '17. Falla durante Emergencia: Ruta Alterna y Radio', en: '17. Fault during Emergency: Alternate Path & Radio' },
    caption: {
      es: 'Al cortar el enlace primario (F6), el anillo conmuta por el núcleo N5/N1 en < 50 ms; si ambos caminos caen, entra el respaldo de radio VHF/DMR.',
      en: 'Cutting the primary link (F6) reroutes the ring via core N5/N1 in < 50 ms; if both paths fail, VHF/DMR radio backup takes over.',
    },
    mode: 'network',
    focusedZoneId: 'ssei',
    failureId: 'F6',
    useCase: 'emergency',
  },
  {
    step: 18,
    track: 'systems',
    title: { es: '18. Subestación: Apagón, UPS y Descarga de Cargas', en: '18. Substation: Blackout, UPS & Load Shedding' },
    caption: {
      es: 'La fibra pasiva no requiere energía; lo que cae son los switches activos. Sin generador, las baterías priorizan ATC/AGL/SSEI y descargan Wi-Fi y locales (demo).',
      en: 'Passive fiber needs no power; active switches do. Without generators, batteries prioritize ATC/AGL/ARFF and shed Wi-Fi and retail (demo).',
    },
    mode: 'network',
    focusedZoneId: 'ssei',
    useCase: 'power',
  },
  {
    step: 19,
    track: 'systems',
    title: { es: '19. As World Cargo: Cadena de Frío y Rayos X', en: '19. As World Cargo: Cold Chain & X-Ray' },
    caption: {
      es: 'Un paquete farmacéutico recorre recepción, rayos X (1G vs 10G), cámara fría (2–8 °C) y enlace externo aduana/aerolínea sobre fibra OS2 aislada en VRF-CARGO.',
      en: 'A pharma shipment flows through dock, X-ray (1G vs 10G), cold storage (2–8 °C), and customs/airline external links over OS2 fiber isolated in VRF-CARGO.',
    },
    mode: 'network',
    focusedZoneId: 'cargo',
    useCase: 'cold-chain',
  },
];
