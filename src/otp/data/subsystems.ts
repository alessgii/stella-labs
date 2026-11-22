import { getServiceByVrf, type VrfId } from './services';

export type SubsystemId =
  | 'agl'
  | 'fids'
  | 'bhs'
  | 'das_fiber'
  | 'atc_navaids'
  | 'cctv'
  | 'access_xray'
  | 'cupps'
  | 'wifi_das_cell'
  | 'pa_voip'
  | 'lighting_dali'
  | 'pbb_400hz_pca'
  | 'fuel_scada'
  | 'ssei_substation'
  | 'emergency_dispatch'
  | 'power_scada'
  | 'cargo_ops'
  | 'external_links';

export interface Subsystem {
  id: SubsystemId;
  name: { es: string; en: string };
  summary: { es: string; en: string };
  domain: 'IT' | 'OT';
  criticality: 'critica' | 'alta' | 'media' | 'baja';
  vrf: VrfId;
  ring: { primary: 1 | 2; backup: 1 | 2 };
  slaPct: number;
  endpointMedia: 'cobre-poe' | 'fibra' | 'mixto';
  planExtension: boolean;
  whyFiber: { es: string; en: string };
  howItWorks: { es: string; en: string }[];
  assumptions: {
    bitrateMbpsPerDevice?: number;
    deviceCountHint?: string;
  };
  color: string;
  icon: string;
  zones: readonly string[];
  demo: true;
}

function ringFromVrf(vrf: VrfId): { primary: 1 | 2; backup: 1 | 2 } {
  const srv = getServiceByVrf(vrf);
  return { primary: srv.primaryRing, backup: srv.backupRing };
}

export const SUBSYSTEMS: Subsystem[] = [
  {
    id: 'agl',
    name: {
      es: 'AGL / ALCMS (Iluminación aeronáutica)',
      en: 'AGL / ALCMS (Airfield Ground Lighting)',
    },
    summary: {
      es: 'Control y monitoreo de luces de rodaje, plataforma y barras de parada desde la Torre.',
      en: 'Control and monitoring of taxiway, apron, and stop-bar lighting from the Tower.',
    },
    domain: 'OT',
    criticality: 'critica',
    vrf: 'VRF-AGL',
    ring: ringFromVrf('VRF-AGL'),
    slaPct: 99.999,
    endpointMedia: 'fibra',
    planExtension: false,
    whyFiber: {
      es: 'Opera en campo abierto con ruido electromagnético de radares y riesgo de descargas atmosféricas. La fibra óptica brinda aislamiento galvánico total entre la Torre y los reguladores CCR de alta corriente a cientos de metros.',
      en: 'Operates outdoors under radar EMI and lightning exposure. Optical fiber provides complete galvanic isolation between the Control Tower and high-current CCR vaults hundreds of meters away.',
    },
    howItWorks: [
      {
        es: 'El controlador selecciona paso de brillo (1–5) o modo (Día/Noche/Baja visibilidad) en la consola ALCMS de Torre (N3).',
        en: 'Controller selects brightness step (1–5) or mode (Day/Night/Low Visibility) on the Tower ALCMS console (N3).',
      },
      {
        es: 'El servidor ALCMS redundante envía comandos Ethernet sobre la fibra Airside (VRF-AGL, Anillo 1) hacia las bóvedas R5_A, R3_A y R2_A.',
        en: 'Redundant ALCMS servers send Ethernet frames over Airside fiber (VRF-AGL, Ring 1) to vaults R5_A, R3_A, and R2_A.',
      },
      {
        es: 'Cada regulador de corriente constante (CCR) ajusta la corriente (referencia 2.8–6.6 A) en el circuito serie de potencia hacia las lámparas.',
        en: 'Each Constant Current Regulator (CCR) adjusts current (2.8–6.6 A reference) on the series power loop feeding the lamps.',
      },
      {
        es: 'Los CCR y módulos de monitoreo reportan fallas de lámpara o circuito abierto de vuelta a la Torre; si ambos enlaces fallan, la bóveda pasa a modo local.',
        en: 'CCRs report lamp or open-circuit faults back to the Tower; if both fiber paths fail, the vault holds its last state in local mode.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 5,
      deviceCountHint: '3 bóvedas CCR + ~120 luminarias de rodaje (referencia)',
    },
    color: '#0EA5E9',
    icon: 'Lightbulb',
    zones: ['airside', 'tower', 'ssei'],
    demo: true,
  },
  {
    id: 'fids',
    name: {
      es: 'FIDS (Pantallas de información de vuelos)',
      en: 'FIDS (Flight Information Display System)',
    },
    summary: {
      es: 'Tableros de salidas, llegadas y pantallas de puerta sincronizados con la AODB.',
      en: 'Departures, arrivals, and gate boards synchronized with the AODB.',
    },
    domain: 'IT',
    criticality: 'media',
    vrf: 'VRF-AERO',
    ring: ringFromVrf('VRF-AERO'),
    slaPct: 99.9,
    endpointMedia: 'mixto',
    planExtension: false,
    whyFiber: {
      es: 'El núcleo y la distribución Terminal transportan el tráfico desde el servidor FIDS/CMS en MDF-A (con réplica en MDF-B) a todos los edificios. El último tramo desde el IDF usa cobre Cat6A PoE hasta 90 m y fibra óptica solo cuando supera esa distancia.',
      en: 'Core and Terminal distribution carry feeds from FIDS/CMS servers in MDF-A (replicated in MDF-B) across buildings. Last-mile drops from IDFs use Cat6A PoE up to 90 m and fiber beyond 90 m.',
    },
    howItWorks: [
      {
        es: 'La base operacional AODB actualiza horarios, puertas asignadas y estados de vuelo en tiempo real.',
        en: 'The AODB operational database updates schedules, gate assignments, and flight statuses.',
      },
      {
        es: 'El servidor FIDS/CMS en MDF-A (N1), respaldado por réplica en MDF-B (N5), renderiza y distribuye las plantillas.',
        en: 'The FIDS/CMS server at MDF-A (N1), backed by MDF-B (N5) replication, pushes display updates.',
      },
      {
        es: 'Los paquetes viajan por el Anillo 2 del núcleo (VRF-AERO) y bajan por el anillo Terminal al switch del IDF cercano.',
        en: 'Traffic traverses Core Ring 2 (VRF-AERO) and the Terminal distribution ring to the nearest IDF switch.',
      },
      {
        es: 'Del IDF a la pantalla: cobre Cat6A + PoE si el recorrido ortogonal ≤ 90 m, o fibra con convertidor si excede 90 m.',
        en: 'From IDF to display: Cat6A + PoE if orthogonal tray distance ≤ 90 m, or fiber with media converter beyond 90 m.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 4,
      deviceCountHint: '24 pantallas en Salidas + 14 de puerta en Muelle + 12 en Llegadas (ref.)',
    },
    color: '#8B5CF6',
    icon: 'Monitor',
    zones: ['departures', 'pier', 'arrivals'],
    demo: true,
  },
  {
    id: 'bhs',
    name: {
      es: 'Equipaje (BHS — Manejo de equipaje)',
      en: 'BHS (Baggage Handling System)',
    },
    summary: {
      es: 'Cintas transportadoras, clasificadores y carruseles controlados por PLCs industriales.',
      en: 'Conveyors, sorters, and baggage carousels controlled by industrial PLCs.',
    },
    domain: 'OT',
    criticality: 'alta',
    vrf: 'VRF-BHS',
    ring: ringFromVrf('VRF-BHS'),
    slaPct: 99.99,
    endpointMedia: 'fibra',
    planExtension: false,
    whyFiber: {
      es: 'Los motores y variadores de frecuencia de las cintas generan intenso ruido electromagnético (EMI) y las distancias entre clasificación en Salidas y Llegadas superan los 90 m. La fibra elimina lazos de tierra e interferencias.',
      en: 'Conveyor motors and VFDs generate severe electromagnetic noise (EMI) and spans between Departures sorting and Arrivals exceed 90 m. Fiber prevents ground loops and EMI.',
    },
    howItWorks: [
      {
        es: 'Lectores ópticos/RFID y escáneres en Salidas identifican cada maleta y consultan su vuelo.',
        en: 'Optical/RFID readers and scanners in Departures identify each bag and look up its flight.',
      },
      {
        es: 'PLCs industriales con PROFINET/EtherNet/IP coordinan desviadores y cintas mediante anillos industriales locales.',
        en: 'Industrial PLCs running PROFINET/EtherNet/IP coordinate diverters and belts over local industrial rings.',
      },
      {
        es: 'Los gabinetes PLC se enlazan por fibra hacia los IDF y suben por el Anillo 2 (respaldo Anillo 1) en VRF-BHS.',
        en: 'PLC cabinets uplink over fiber to IDFs and ride Core Ring 2 (backup Ring 1) inside VRF-BHS.',
      },
      {
        es: 'En Llegadas, los 3 carruseles por piso reciben el flujo asignado y reportan telemetría al centro de control.',
        en: 'In Arrivals, the 3 carousels per floor receive assigned bags and stream telemetry to the control room.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 12,
      deviceCountHint: '6 carruseles + 2 clasificadores + PLCs (referencia)',
    },
    color: '#F59E0B',
    icon: 'Luggage',
    zones: ['departures', 'arrivals'],
    demo: true,
  },
  {
    id: 'das_fiber',
    name: {
      es: 'Sensado de fibra perimetral (DAS-fibra)',
      en: 'Perimeter Fiber Sensing (Fiber DAS)',
    },
    summary: {
      es: 'Sensado acústico distribuido: la propia fibra detecta intrusiones a lo largo de la cerca.',
      en: 'Distributed Acoustic Sensing: the optical fiber itself detects fence intrusions.',
    },
    domain: 'OT',
    criticality: 'alta',
    vrf: 'VRF-SEG',
    ring: ringFromVrf('VRF-SEG'),
    slaPct: 99.99,
    endpointMedia: 'fibra',
    planExtension: true,
    whyFiber: {
      es: 'La fibra oscura dedicada actúa simultáneamente como medio y sensor continuo a lo largo de 2,485 m de perímetro sin requerir energía eléctrica ni electrónica activa en la cerca.',
      en: 'Dedicated dark fiber acts as a continuous passive sensor across the 2,485 m perimeter without requiring field power or active electronics on the fence.',
    },
    howItWorks: [
      {
        es: 'El interrogador óptico ubicado en la Torre (N3) inyecta pulsos láser coherentes por 2 hilos dedicados del anillo Perímetro.',
        en: 'The optical interrogator at the Tower (N3) injects coherent laser pulses into 2 dedicated fibers of the Perimeter ring.',
      },
      {
        es: 'Las vibraciones en la cerca (trepar, cortar, cavar) alteran la retrodispersión de Rayleigh en el punto exacto.',
        en: 'Fence vibrations (climbing, cutting, digging) modulate Rayleigh backscatter at the exact impact location.',
      },
      {
        es: 'Calculando el tiempo de retorno de la luz, el interrogador ubica el evento en metros a lo largo de la fibra.',
        en: 'Measuring optical round-trip time, the interrogator pinpoints the event in meters along the cable.',
      },
      {
        es: 'La consola de seguridad en VRF-SEG dispara la alarma y orienta automáticamente la cámara CCTV más cercana.',
        en: 'The security console on VRF-SEG raises an alarm and automatically slews the nearest CCTV camera.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 25,
      deviceCountHint: '1 interrogador en N3 cubriendo 2,485.58 m de anillo Perímetro (ref.)',
    },
    color: '#06B6D4',
    icon: 'Waves',
    zones: ['perimeter', 'tower'],
    demo: true,
  },
  {
    id: 'atc_navaids',
    name: {
      es: 'ATC / Radares / ILS-VOR-DME / A-SMGCS / AWOS',
      en: 'ATC / Radars / ILS-VOR-DME / A-SMGCS / AWOS',
    },
    summary: {
      es: 'Ayudas a la navegación, vigilancia en superficie y sensores meteorológicos.',
      en: 'Navigation aids, surface movement radar, and airport weather stations.',
    },
    domain: 'OT',
    criticality: 'critica',
    vrf: 'VRF-ATC',
    ring: ringFromVrf('VRF-ATC'),
    slaPct: 99.999,
    endpointMedia: 'fibra',
    planExtension: false,
    whyFiber: {
      es: 'Estaciones distribuidas a cientos de metros o kilómetros en entorno de alta potencia RF. Exigen inmunidad total a EMI, latencia determinista y disponibilidad 99.999 %.',
      en: 'Stations sit hundreds of meters to kilometers away near high-power RF transmitters. They require full EMI immunity, deterministic latency, and 99.999% availability.',
    },
    howItWorks: [
      {
        es: 'Sensores AWOS, estaciones ILS/VOR/DME y radares de superficie capturan datos continuos en tiempo real.',
        en: 'AWOS sensors, ILS/VOR/DME stations, and surface radars capture continuous real-time telemetry.',
      },
      {
        es: 'Los enlaces ópticos dedicados ingresan por los nodos Airside hacia la Torre de Control (N3) por dos acometidas opuestas.',
        en: 'Dedicated optical feeds enter via Airside nodes toward the Control Tower (N3) through dual opposite duct entries.',
      },
      {
        es: 'El tráfico circula aislado en VRF-ATC sobre el Anillo 1 del núcleo (respaldo Anillo 2, < 50 ms ERPS).',
        en: 'Traffic stays isolated in VRF-ATC on Core Ring 1 (Ring 2 backup, < 50 ms ERPS).',
      },
      {
        es: 'El sistema A-SMGCS fusiona radar y posiciones para los controladores en cabina y enlaces ANSP externos.',
        en: 'A-SMGCS fuses radar and surface tracks for Tower controllers and external ANSP links.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 40,
      deviceCountHint: 'Radares, estaciones ILS/AWOS y consolas Torre (referencia)',
    },
    color: '#005AFF',
    icon: 'Radar',
    zones: ['tower', 'airside', 'perimeter'],
    demo: true,
  },
  {
    id: 'cctv',
    name: {
      es: 'CCTV IP (Videovigilancia)',
      en: 'IP CCTV (Video Surveillance)',
    },
    summary: {
      es: 'Cientos de cámaras IP de alta definición en terminales, plataforma y perímetro.',
      en: 'Hundreds of HD IP cameras across terminals, apron, and perimeter.',
    },
    domain: 'OT',
    criticality: 'alta',
    vrf: 'VRF-SEG',
    ring: ringFromVrf('VRF-SEG'),
    slaPct: 99.99,
    endpointMedia: 'mixto',
    planExtension: false,
    whyFiber: {
      es: 'Genera el mayor volumen de tráfico continuo sostenido del campus. En interiores llega cobre PoE desde cada IDF (≤ 90 m), mientras que las cámaras remotas de plataforma y perímetro usan fibra hasta el poste.',
      en: 'Generates the highest sustained traffic volume on campus. Indoor cameras use PoE copper from IDFs (≤ 90 m), whereas remote apron and perimeter poles use direct fiber.',
    },
    howItWorks: [
      {
        es: 'Cada cámara codifica flujo H.264/H.265 continuo hacia su switch de acceso IDF (PoE en interiores, fibra si > 90 m).',
        en: 'Each camera streams continuous H.264/H.265 video to its IDF access switch (PoE indoors, fiber if > 90 m).',
      },
      {
        es: 'Los anillos de distribución concentran los flujos hacia MDF-A (N1) y MDF-B (N5) en VRF-SEG.',
        en: 'Distribution rings aggregate video streams toward MDF-A (N1) and MDF-B (N5) inside VRF-SEG.',
      },
      {
        es: 'Los grabadores NVR almacenan video redundante y permiten análisis ante alertas de acceso o DAS-fibra.',
        en: 'NVRs store redundant video and support instant retrieval upon access or Fiber-DAS alerts.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 8,
      deviceCountHint: '60 cámaras en Salidas + 120 en resto del campus (referencia)',
    },
    color: '#EF4444',
    icon: 'Video',
    zones: ['departures', 'pier', 'arrivals', 'cargo', 'perimeter'],
    demo: true,
  },
  {
    id: 'access_xray',
    name: {
      es: 'Control de accesos y Rayos X',
      en: 'Access Control & X-Ray Screening',
    },
    summary: {
      es: 'Lectores de puertas restringidas y escáneres de equipaje en filtros de seguridad.',
      en: 'Restricted-door card readers and baggage X-ray scanners at security checkpoints.',
    },
    domain: 'OT',
    criticality: 'alta',
    vrf: 'VRF-SEG',
    ring: ringFromVrf('VRF-SEG'),
    slaPct: 99.99,
    endpointMedia: 'mixto',
    planExtension: false,
    whyFiber: {
      es: 'Los escáneres de rayos X transfieren imágenes pesadas hacia estaciones de inspección remota y exigen aislamiento lógico en VRF-SEG. La fibra troncal conecta los filtros; los lectores cercanos usan cobre.',
      en: 'X-ray scanners transmit large image payloads to remote screening stations and require VRF-SEG isolation. Fiber links the checkpoints; nearby readers use copper.',
    },
    howItWorks: [
      {
        es: 'Lectores biométricos/RFID validan credenciales contra controladoras conectadas al IDF por Cat6A.',
        en: 'Biometric/RFID readers validate credentials via controllers wired over Cat6A to the IDF.',
      },
      {
        es: 'Los equipos de rayos X envían imágenes de alta resolución a puestos de análisis por enlace Gigabit.',
        en: 'X-ray machines send high-resolution scans to inspection workstations over Gigabit links.',
      },
      {
        es: 'El tráfico viaja por VRF-SEG en el Anillo 1 hacia servidores de seguridad en MDF-A/MDF-B.',
        en: 'Traffic rides VRF-SEG on Ring 1 to security servers in MDF-A/MDF-B.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 15,
      deviceCountHint: '10 lectores + 4 escáneres rayos X en Salidas (referencia)',
    },
    color: '#DC2626',
    icon: 'ShieldCheck',
    zones: ['departures', 'pier', 'arrivals', 'cargo'],
    demo: true,
  },
  {
    id: 'cupps',
    name: {
      es: 'CUPPS / CUTE (Check-in y Puertas comunes)',
      en: 'CUPPS / CUTE (Common-Use Check-in & Gates)',
    },
    summary: {
      es: 'Estaciones compartidas de facturación, lectura de pases de abordar e impresoras.',
      en: 'Shared check-in desks, boarding pass readers, and baggage tag printers.',
    },
    domain: 'IT',
    criticality: 'media',
    vrf: 'VRF-AERO',
    ring: ringFromVrf('VRF-AERO'),
    slaPct: 99.9,
    endpointMedia: 'cobre-poe',
    planExtension: false,
    whyFiber: {
      es: 'Las islas de check-in y puertas de embarque están atendidas por IDFs dedicados dentro de un radio ≤ 90 m en cobre Cat6A; la fibra del anillo Terminal garantiza continuidad entre ambos MDFs y las plataformas de aerolíneas.',
      en: 'Check-in islands and boarding gates sit within 90 m Cat6A reach of dedicated IDFs; the Terminal fiber ring ensures continuity to both MDFs and airline hosts.',
    },
    howItWorks: [
      {
        es: 'Cada mostrador (isla 1 e isla 2) conecta terminal, lector e impresora por cobre Cat6A al IDF (R1_T/R2_T).',
        en: 'Each desk (Island 1 & Island 2) connects via Cat6A copper to its IDF (R1_T/R2_T).',
      },
      {
        es: 'Los switches de acceso etiquetan VLAN por aerolínea dentro de VRF-AERO.',
        en: 'Access switches tag per-airline VLANs inside VRF-AERO.',
      },
      {
        es: 'La troncal del Anillo 2 lleva las sesiones hacia los servidores centrales y salidas externas en MDF-A/MDF-B.',
        en: 'Ring 2 carries sessions to central servers and external airline gateways at MDF-A/MDF-B.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 3,
      deviceCountHint: '40 estaciones CUPPS en 2 islas de Salidas + puertas del Muelle (ref.)',
    },
    color: '#A855F7',
    icon: 'Ticket',
    zones: ['departures', 'pier'],
    demo: true,
  },
  {
    id: 'wifi_das_cell',
    name: {
      es: 'Wi-Fi pasajeros y Sistema de Antenas Distribuidas (DAS celular)',
      en: 'Passenger Wi-Fi & Cellular Distributed Antenna System (Cellular DAS)',
    },
    summary: {
      es: 'Cobertura inalámbrica para pasajeros y antenas celulares interiores alimentadas por fibra.',
      en: 'Passenger wireless connectivity and fiber-fed indoor cellular distributed antennas.',
    },
    domain: 'IT',
    criticality: 'baja',
    vrf: 'VRF-PAX',
    ring: ringFromVrf('VRF-PAX'),
    slaPct: 99.5,
    endpointMedia: 'mixto',
    planExtension: false,
    whyFiber: {
      es: 'No confundir el DAS celular (antenas distribuidas de telefonía móvil) con el DAS-fibra perimetral: aquí la fibra transporta radio sobre fibra a unidades remotas celulares y da enlace de alta capacidad a los IDFs de puntos de acceso Wi-Fi.',
      en: 'Distinct from perimeter Fiber-DAS sensing: Cellular DAS uses fiber to feed remote indoor cellular radio heads alongside high-capacity uplinks to Wi-Fi IDF switches.',
    },
    howItWorks: [
      {
        es: 'Los puntos de acceso Wi-Fi se conectan por cobre Cat6A PoE+ (≤ 90 m) a los switches IDF; los nodos celulares remotos reciben fibra.',
        en: 'Wi-Fi APs connect via Cat6A PoE+ (≤ 90 m) to IDF switches; remote cellular heads receive fiber.',
      },
      {
        es: 'Todo el tráfico de pasajeros se aísla estrictamente en VRF-PAX (Anillo 2) sin visibilidad hacia redes OT.',
        en: 'Passenger traffic stays strictly isolated in VRF-PAX (Ring 2) with zero reachability to OT networks.',
      },
      {
        es: 'Controladoras WLAN y cabeceras celulares en MDF-A/MDF-B encaminan hacia los operadores de internet.',
        en: 'WLAN controllers and cellular headends in MDF-A/MDF-B route to external internet/carrier links.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 25,
      deviceCountHint: '30 Access Points en Salidas + 45 en Muelle/Llegadas (referencia)',
    },
    color: '#10B981',
    icon: 'Wifi',
    zones: ['departures', 'gallery', 'pier', 'arrivals'],
    demo: true,
  },
  {
    id: 'pa_voip',
    name: {
      es: 'Megafonía y VoIP (PA — Public Address)',
      en: 'Public Address & VoIP (PA)',
    },
    summary: {
      es: 'Voceo automático de vuelos, telefonía IP operativa y mensajes de evacuación.',
      en: 'Automated flight announcements, operational IP telephony, and emergency voice.',
    },
    domain: 'IT',
    criticality: 'alta',
    vrf: 'VRF-ADM',
    ring: ringFromVrf('VRF-ADM'),
    slaPct: 99.5,
    endpointMedia: 'cobre-poe',
    planExtension: true,
    whyFiber: {
      es: 'Requiere bajo ancho de banda pero alta disponibilidad y sincronización en todo el campus para avisos simultáneos sin ecos entre Salidas, Galería, Muelle y Llegadas.',
      en: 'Requires low bandwidth but high campus-wide availability and synchronization for announcements across Departures, Gallery, Pier, and Arrivals.',
    },
    howItWorks: [
      {
        es: 'La consola PA / AODB genera avisos de embarque y mensajes operativos en audio IP (AoIP).',
        en: 'The PA console / AODB generates boarding calls and operational announcements over Audio-over-IP.',
      },
      {
        es: 'Los flujos multicast viajan con QoS prioritario desde MDF-A/MDF-B hasta los IDFs de cada edificio.',
        en: 'Multicast streams travel with QoS priority from MDF-A/MDF-B to building IDFs.',
      },
      {
        es: 'Amplificadores y altavoces IP PoE en techo se enlazan en cobre Cat6A desde el IDF más cercano.',
        en: 'PoE IP speakers and zone amplifiers connect via Cat6A copper from the nearest IDF.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 0.5,
      deviceCountHint: '60 altavoces/teléfonos VoIP en Salidas (referencia)',
    },
    color: '#64748B',
    icon: 'Volume2',
    zones: ['departures', 'gallery', 'pier', 'arrivals'],
    demo: true,
  },
  {
    id: 'lighting_dali',
    name: {
      es: 'Iluminación de terminal (BMS / DALI)',
      en: 'Terminal Lighting (BMS / DALI)',
    },
    summary: {
      es: 'Control centralizado de escenas de iluminación interior por zonas mediante pasarelas DALI.',
      en: 'Centralized indoor lighting scene control by zone through DALI gateways.',
    },
    domain: 'OT',
    criticality: 'media',
    vrf: 'VRF-ADM',
    ring: ringFromVrf('VRF-ADM'),
    slaPct: 99.5,
    endpointMedia: 'cobre-poe',
    planExtension: true,
    whyFiber: {
      es: 'La fibra NO llega a cada luminaria: llega al cuarto IDF para enlazar las pasarelas DALI con el servidor BMS central; desde cada controlador sale bus local DALI/cobre hacia los grupos de luminarias.',
      en: 'Fiber does NOT run to individual ceiling fixtures: it reaches the IDF to link DALI gateways with the central BMS, while local copper DALI buses drive luminaires.',
    },
    howItWorks: [
      {
        es: 'El operador o programación horaria del BMS elige una escena (Día, Noche, Limpieza, Emergencia).',
        en: 'BMS schedule or operator selects a scene (Day, Night, Cleaning, Emergency).',
      },
      {
        es: 'La orden BACnet/IP viaja por fibra hasta el IDF correspondiente.',
        en: 'BACnet/IP commands travel over fiber to the target building IDF.',
      },
      {
        es: 'Los controladores DALI en el IDF traducen la escena al bus de cobre de 2 hilos hacia cada grupo de luminarias.',
        en: 'DALI controllers in the IDF translate the scene onto the 2-wire copper bus per luminaire zone.',
      },
      {
        es: 'Si se corta el enlace al BMS, el controlador conserva la última escena y pasa a control local.',
        en: 'If the BMS link drops, the controller retains the last active scene in local fallback mode.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 0.2,
      deviceCountHint: '12 controladores DALI en Salidas cubriendo ~180 luminarias (ref.)',
    },
    color: '#EAB308',
    icon: 'Sun',
    zones: ['departures', 'gallery', 'pier', 'arrivals'],
    demo: true,
  },
  {
    id: 'pbb_400hz_pca',
    name: {
      es: 'PBB, 400 Hz y PCA (Mangas de abordaje)',
      en: 'PBB, 400 Hz & PCA (Boarding Bridges)',
    },
    summary: {
      es: 'Monitoreo de pasarelas telescópicas, energía a 400 Hz y aire preacondicionado en los 14 fingers.',
      en: 'Monitoring of passenger boarding bridges, 400 Hz ground power, and PCA across 14 fingers.',
    },
    domain: 'OT',
    criticality: 'alta',
    vrf: 'VRF-AERO',
    ring: ringFromVrf('VRF-AERO'),
    slaPct: 99.9,
    endpointMedia: 'fibra',
    planExtension: true,
    whyFiber: {
      es: 'El muelle mide 304 m de largo y los convertidores de 400 Hz y compresores PCA generan alto ruido eléctrico en plataforma; la fibra ofrece enlaces seguros hacia los 14 fingers.',
      en: 'The pier spans 304 m and 400 Hz converters / PCA units produce strong apron EMI; fiber safely links all 14 fingers.',
    },
    howItWorks: [
      {
        es: 'Sensores y PLCs en cada pasarela (PBB), unidad 400 Hz y equipo PCA registran acoplamiento y consumo.',
        en: 'PLCs on each PBB, 400 Hz converter, and PCA unit log docking status and load telemetry.',
      },
      {
        es: 'Los datos se agregan en R4_T, R5_T y MDF-B (N5) a lo largo de la escalerilla del Muelle.',
        en: 'Telemetry aggregates into R4_T, R5_T, and MDF-B (N5) along the Pier cable tray.',
      },
      {
        es: 'La información alimenta mantenimiento predictivo y facturación de servicios en tierra.',
        en: 'Data feeds predictive maintenance and ground-handling billing systems.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 2,
      deviceCountHint: '14 fingers × (PBB + 400 Hz + PCA) (referencia)',
    },
    color: '#F97316',
    icon: 'Plane',
    zones: ['pier', 'airside'],
    demo: true,
  },
  {
    id: 'fuel_scada',
    name: {
      es: 'Combustible e hidrantes (SCADA ATEX)',
      en: 'Jet Fuel Farm & Hydrants (ATEX SCADA)',
    },
    summary: {
      es: 'Supervisión y paro de emergencia de tanques, bombas y válvulas de combustible.',
      en: 'Supervision and emergency shutdown of fuel tanks, pumps, and hydrant valves.',
    },
    domain: 'OT',
    criticality: 'critica',
    vrf: 'VRF-AGL',
    ring: ringFromVrf('VRF-AGL'),
    slaPct: 99.999,
    endpointMedia: 'fibra',
    planExtension: true,
    whyFiber: {
      es: 'Zona con atmósfera potencialmente explosiva (ATEX): la fibra óptica es dieléctrica, no transporta corriente eléctrica y no puede producir chispas ante una falla física.',
      en: 'Potentially explosive atmosphere (ATEX): optical fiber is dielectric, carries zero electrical current, and cannot generate sparks.',
    },
    howItWorks: [
      {
        es: 'RTUs y sensores de presión/nivel en la planta de combustible (R5_C) recolectan telemetría.',
        en: 'RTUs and pressure/level sensors at the fuel farm (R5_C) collect telemetry.',
      },
      {
        es: 'La fibra ingresa directamente al gabinete blindado por ducto exclusivo sin conductores metálicos.',
        en: 'All-dielectric fiber enters the explosion-proof cabinet without metallic conductors.',
      },
      {
        es: 'El anillo Carga (N4–N5) entrega los datos al SCADA central y a SSEI/Torre con respaldo en ambos anillos.',
        en: 'The Cargo ring (N4–N5) delivers data to central SCADA and SSEI/Tower with dual-ring backup.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 2,
      deviceCountHint: 'Planta de combustible R5_C + válvulas de plataforma (referencia)',
    },
    color: '#E11D48',
    icon: 'Flame',
    zones: ['cargo', 'airside'],
    demo: true,
  },
  {
    id: 'ssei_substation',
    name: {
      es: 'SSEI (Bomberos) y Subestación Eléctrica (IEC 61850)',
      en: 'SSEI Fire Rescue & Electrical Substation (IEC 61850)',
    },
    summary: {
      es: 'Despacho de emergencias aeronáuticas y teleprotección eléctrica entre subestaciones.',
      en: 'Aviation fire dispatch and electrical substation teleprotection.',
    },
    domain: 'OT',
    criticality: 'critica',
    vrf: 'VRF-SEG',
    ring: ringFromVrf('VRF-SEG'),
    slaPct: 99.999,
    endpointMedia: 'fibra',
    planExtension: true,
    whyFiber: {
      es: 'Los relés de protección eléctrica (mensajes tipo IEC 61850) requieren inmunidad a elevación de potencial de tierra y a ruido de alta tensión; el cuartel SSEI no puede perder enlace de despacho con la Torre.',
      en: 'Electrical protection relays (IEC 61850 messaging) require immunity to ground potential rise and HV EMI; SSEI fire dispatch cannot lose connectivity to the Tower.',
    },
    howItWorks: [
      {
        es: 'La subestación en Nave SSEI (N6) intercambia estados de interruptores y disparos de protección por fibra.',
        en: 'The substation in SSEI (N6) exchanges breaker states and protection trips over fiber.',
      },
      {
        es: 'El despacho SSEI mantiene canales de voz, alarmas de pista y planos en tiempo real con la Torre (N3).',
        en: 'SSEI dispatch maintains real-time voice, runway crash alarms, and telemetry with the Tower (N3).',
      },
      {
        es: 'El nodo N6 enlaza directamente con N5 y N3 por el Anillo 1 y Anillo 2, y con el anillo Airside.',
        en: 'Node N6 links directly to N5 and N3 via Core Ring 1 & 2 plus the Airside ring.',
      },
    ],
    assumptions: {
      bitrateMbpsPerDevice: 10,
      deviceCountHint: 'Nave SSEI (N6) + relés IEC 61850 + subestación AGL (referencia)',
    },
    color: '#F43F5E',
    icon: 'Siren',
    zones: ['ssei', 'tower'],
    demo: true,
  },
  {
    id: 'emergency_dispatch',
    name: { es: 'Emergencia integrada (SSEI ↔ Torre)', en: 'Integrated Emergency (SSEI ↔ Tower)' },
    summary: { es: 'Alarma de accidente, apertura de cocheras, prioridad AGL y despacho de rescate.', en: 'Crash alarm, bay door automation, AGL priority, and rescue dispatch.' },
    domain: 'OT',
    criticality: 'critica',
    vrf: 'VRF-EMG',
    ring: ringFromVrf('VRF-EMG'),
    slaPct: 99.999,
    endpointMedia: 'mixto',
    planExtension: true,
    whyFiber: {
      es: 'La alarma Torre → SSEI usa fibra dedicada sobre Anillo Airside y respaldo por el doble anillo de núcleo con prioridad QoS máxima.',
      en: 'Tower → SSEI crash alarm rides Airside fiber with dual-core ring backup and top QoS priority.',
    },
    howItWorks: [
      { es: 'Torre (N3) activa alarma de accidente hacia SSEI (N6).', en: 'Tower (N3) triggers crash alarm to SSEI (N6).' },
      { es: 'Controlador local abre cocheras, activa semáforo y orienta cámaras CCTV.', en: 'Local PLC opens bay doors, activates exit light, and slews CCTV.' },
      { es: 'Si falla la ruta directa Airside, el tráfico conmuta por el doble anillo de núcleo.', en: 'If direct Airside path fails, traffic reroutes over the dual core ring.' },
    ],
    assumptions: { bitrateMbpsPerDevice: 5, deviceCountHint: 'Consola despacho + 3 bahías + telefonía roja (demo)' },
    color: '#F43F5E',
    icon: 'Siren',
    zones: ['ssei', 'tower', 'airside'],
    demo: true,
  },
  {
    id: 'power_scada',
    name: { es: 'Energía / SCADA eléctrico', en: 'Power / Electrical SCADA' },
    summary: { es: 'Protecciones IEC 61850, transferencia automática, UPS y generadores.', en: 'IEC 61850 protection relays, ATS, UPS, and standby generators.' },
    domain: 'OT',
    criticality: 'critica',
    vrf: 'VRF-PWR',
    ring: ringFromVrf('VRF-PWR'),
    slaPct: 99.99,
    endpointMedia: 'fibra',
    planExtension: true,
    whyFiber: {
      es: 'La fibra dieléctrica evita lazos de tierra y soporta disparos de protección eléctrica en milisegundos sin interferencia electromagnética.',
      en: 'Dielectric fiber prevents ground loops and carries millisecond electrical protection trips free of EMI.',
    },
    howItWorks: [
      { es: 'Relevadores en Media Tensión intercambian mensajes GOOSE por fibra local.', en: 'MV protection relays exchange GOOSE trips over local fiber.' },
      { es: 'SCADA envía estado de UPS y generadores hacia N6.', en: 'SCADA forwards UPS and generator status to N6.' },
      { es: 'Ante corte externo, el ATS transfiere cargas críticas manteniendo la red activa.', en: 'On grid loss, ATS transfers critical loads keeping the network alive.' },
    ],
    assumptions: { bitrateMbpsPerDevice: 4, deviceCountHint: 'Celdas MT + 2 generadores + banco UPS (demo)' },
    color: '#F59E0B',
    icon: 'Zap',
    zones: ['ssei'],
    demo: true,
  },
  {
    id: 'cargo_ops',
    name: { es: 'Carga: Rayos X, WMS y Cadena de Frío', en: 'Cargo: X-Ray, WMS & Cold Chain' },
    summary: { es: 'Imágenes pesadas de inspección, inventario WMS y monitoreo térmico continuo.', en: 'High-bitrate X-ray scans, WMS inventory, and cold-chain telemetry.' },
    domain: 'IT',
    criticality: 'alta',
    vrf: 'VRF-CARGO',
    ring: ringFromVrf('VRF-CARGO'),
    slaPct: 99.9,
    endpointMedia: 'mixto',
    planExtension: true,
    whyFiber: {
      es: 'Las imágenes de rayos X y las naves industriales con motores/montacargas requieren troncales de fibra 10G hacia N4.',
      en: 'High-res X-ray scans and noisy industrial machinery justify 10G fiber trunks to N4.',
    },
    howItWorks: [
      { es: 'Escáner de carga envía imágenes al puesto de revisión por enlace Gigabit/10G.', en: 'Cargo X-ray sends scans to review workstation over Gigabit/10G.' },
      { es: 'Sensores de cámara fría reportan temperatura por cobre PoE al colector.', en: 'Cold-room sensors report temperature over PoE copper to collector.' },
      { es: 'El tráfico viaja en VRF-CARGO por el Anillo 2 hacia servidores centrales y N4.', en: 'Traffic rides VRF-CARGO on Ring 2 to central servers and N4.' },
    ],
    assumptions: { bitrateMbpsPerDevice: 25, deviceCountHint: 'Rayos X + cámara fría + WMS Carga (demo)' },
    color: '#06B6D4',
    icon: 'Package',
    zones: ['cargo'],
    demo: true,
  },
  {
    id: 'external_links',
    name: { es: 'Enlaces externos (Aduana y Operadores)', en: 'External Links (Customs & Carriers)' },
    summary: { es: 'Salida redundante por operadores A y B hacia aduana, aerolíneas y pagos.', en: 'Dual-carrier external uplink to customs, airlines, and processors.' },
    domain: 'IT',
    criticality: 'media',
    vrf: 'VRF-EXT',
    ring: ringFromVrf('VRF-EXT'),
    slaPct: 99.9,
    endpointMedia: 'fibra',
    planExtension: true,
    whyFiber: {
      es: 'Dos operadores externos ingresan por rutas físicas distintas (N1 y N5) para liberar pedimentos aduaneros sin punto único de falla.',
      en: 'Two carriers enter via diverse physical paths (N1 & N5) for resilient customs clearance.',
    },
    howItWorks: [
      { es: 'Oficina de aduana en Carga (N4) consulta sistema externo vía VRF-EXT.', en: 'Customs office at Cargo (N4) queries external gateway via VRF-EXT.' },
      { es: 'Si cae el operador principal en N1, conmuta al respaldo en N5.', en: 'On N1 carrier loss, traffic fails over to N5.' },
      { es: 'Las listas ACL aíslan el tráfico externo de las VRFs operacionales OT.', en: 'ACL policies isolate external traffic from OT operational VRFs.' },
    ],
    assumptions: { bitrateMbpsPerDevice: 20, deviceCountHint: 'Aduana + enlaces externos Carga (demo)' },
    color: '#10B981',
    icon: 'Globe',
    zones: ['cargo', 'departures', 'pier'],
    demo: true,
  },
];

export function getSubsystemById(id: SubsystemId): Subsystem {
  const found = SUBSYSTEMS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown subsystem: ${id}`);
  return found;
}
