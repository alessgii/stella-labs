import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Eye,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { TENANT_TIER_SPECS, type TenantTier } from '../data/tenants';
import { getInspectableSpace } from '../lib/inspectableSpace';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

const TIER_ORDER: TenantTier[] = ['basico', 'estandar', 'premium'];

export function TenantNetworkPanel() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const selectedLocalObjectId = useAppStore((s) => s.selectedLocalObjectId);
  const exitTenant = useAppStore((s) => s.exitTenant);
  const setMode = useAppStore((s) => s.setMode);
  const triggerTenantIsolationTest = useAppStore((s) => s.triggerTenantIsolationTest);
  const tenantIsolationTestTick = useAppStore((s) => s.tenantIsolationTestTick);
  const setHoveredLogicalHop = useAppStore((s) => s.setHoveredLogicalHop);
  const setTenantCampusTraceActive = useAppStore((s) => s.setTenantCampusTraceActive);

  const [activeTab, setActiveTab] = useState<'summary' | 'tiers' | 'faults'>('summary');
  const [showSaleSim, setShowSaleSim] = useState(false);
  const [activeBizFault, setActiveBizFault] = useState<number | null>(null);

  if (mode !== 'network' || !focusedTenantId || selectedLocalObjectId) return null;

  const space = getInspectableSpace(focusedTenantId);
  if (!space) return null;

  const tenant = space.tenant ?? {
    id: space.id,
    poiId: space.id,
    name: space.name,
    template: 'cambio' as const,
    footprint_cad: [],
    center_cad: [0, 0] as [number, number],
    floor: space.floor,
    building: space.buildingId,
    zoneId: space.buildingId,
    idf: space.idf as 'R1_T',
    trayDistance_m: space.trayDistance_m,
    vrf: space.vrf as 'VRF-TENANT-RETAIL',
    vlanId: space.vlanId,
    tier: 'premium' as const,
    demo: true as const,
  };

  const t = language === 'es' ? es : en;
  const tierSpec = TENANT_TIER_SPECS[tenant.tier];
  const usesFiber = space.usesFiber;
  const coreNodeId =
    space.coreNodeId ??
    (space.buildingId === 'ssei'
      ? 'N6'
      : space.buildingId === 'cargo'
        ? 'N4'
        : tenant.idf === 'R4_T' || tenant.idf === 'R5_T' || tenant.idf === 'R6_T'
          ? 'N5'
          : 'N1');
  const ispExit =
    coreNodeId === 'N5' || coreNodeId === 'N6'
      ? 'ISP Operador B (N5)'
      : 'ISP Operador A (N1)';
  const spec = space.spec;
  const defaultHotspot = spec.objects.find((o) => o.isHotspot);
  const logicalHops: {
    key: 'endpoint' | 'switch' | 'idf' | 'ring' | 'core' | 'isp';
    title: string;
    meta: string;
  }[] = [
    {
      key: 'endpoint',
      title: defaultHotspot ? defaultHotspot.label[language].split(' ')[0] : 'POS',
      meta: `Cat6A · ${defaultHotspot?.cableLength_m ?? 8.5} m`,
    },
    {
      key: 'switch',
      title: 'Switch 6U',
      meta: `VLAN ${tenant.vlanId}`,
    },
    {
      key: 'idf',
      title: `IDF ${tenant.idf}`,
      meta: `${usesFiber ? 'OS2' : 'Cat6A'} · ${tenant.trayDistance_m} m`,
    },
    {
      key: 'ring',
      title: language === 'es' ? 'Anillo Term.' : 'Term. Ring',
      meta: 'OS2 · 10G',
    },
    {
      key: 'core',
      title: `Núcleo ${coreNodeId}`,
      meta: tenant.vrf,
    },
    {
      key: 'isp',
      title: coreNodeId === 'N1' ? 'ISP A' : 'ISP B',
      meta: language === 'es' ? 'Salida ext.' : 'Ext. exit',
    },
  ];

  const allowedTargets =
    language === 'es'
      ? [
          'Salida a Internet (ISP A/B)',
          'Procesador de pagos externo',
          'Nube corporativa del inquilino',
          ...(tenant.template === 'mostrador-aerolinea' || tenant.template === 'sala-vip'
            ? ['VRF-AERO (FIDS / CUPPS lectura)']
            : []),
        ]
      : [
          'Internet Uplink (ISP A/B)',
          'External Payment Processor',
          'Tenant Corporate Cloud',
          ...(tenant.template === 'mostrador-aerolinea' || tenant.template === 'sala-vip'
            ? ['VRF-AERO (FIDS / CUPPS read-only)']
            : []),
        ];

  const blockedTargets =
    language === 'es'
      ? [
          'VRF-AGL (Luces pista)',
          'VRF-ATC (Torre / Radar)',
          'VRF-SEG (CCTV / Accesos)',
          'VRF-BHS (Equipaje)',
          'Otros locales (VLAN aisladas)',
        ]
      : [
          'VRF-AGL (Airfield AGL)',
          'VRF-ATC (Tower / Radar)',
          'VRF-SEG (CCTV / Access)',
          'VRF-BHS (Baggage)',
          'Other tenants (isolated VLANs)',
        ];

  return (
    <MobileBottomSheet
      ariaLabel={tenant.name[language]}
      dark
      desktopWidthClass="sm:w-[390px]"
      peekTitle={tenant.name[language]}
      peekSubtitle={`${tenant.vrf} · VLAN ${tenant.vlanId} · ${tenant.idf}`}
      defaultExpandedMobile={false}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
            <Store className="h-3 w-3" />
            <span>{tenant.vrf}</span>
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-200">
            VLAN {tenant.vlanId}
          </span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">
            {tierSpec.label[language]}
          </span>
        </div>

        <button
          type="button"
          onClick={exitTenant}
          aria-label={t.lod.exitTenant}
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-white mb-2">
        {tenant.name[language]}
      </h3>

      {/* Connection summary */}
      <div className="rounded-[6px] border border-white/10 bg-white/5 p-2.5 text-[12px] space-y-1 mb-3">
        <div className="flex justify-between">
          <span className="text-slate-400">{t.tenant.servedByIdf}:</span>
          <span className="font-medium text-slate-100">
            {tenant.idf} ({tenant.trayDistance_m} m)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">{t.networkInterior.medium}:</span>
          <span className={`font-medium ${usesFiber ? 'text-amber-300' : 'text-sky-300'}`}>
            {usesFiber
              ? language === 'es'
                ? 'Fibra OS2 + convertidor'
                : 'OS2 Fiber + converter'
              : t.networkInterior.copperMedium}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">{language === 'es' ? 'Salida externa' : 'External exit'}:</span>
          <span className="font-medium text-emerald-300">{ispExit}</span>
        </div>
      </div>

      {/* Section tabs so Planes & Fallas are always visible without scrolling */}
      <div className="grid grid-cols-3 gap-1 rounded-[6px] border border-white/10 bg-white/5 p-1 mb-3 text-[11px] font-medium">
        {(
          [
            { id: 'summary', label: language === 'es' ? 'Ruta y VRF' : 'Route & VRF' },
            { id: 'tiers', label: language === 'es' ? 'Planes (3)' : 'Plans (3)' },
            { id: 'faults', label: language === 'es' ? 'Fallas (5)' : 'Faults (5)' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded px-2 py-1 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <>
          {/* 2D Horizontal Logical Diagram */}
      <div className="mb-3 rounded-[6px] border border-white/10 bg-white/5 p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-200">
            {language === 'es' ? 'Diagrama lógico (salto a salto)' : 'Logical hop diagram'}
          </span>
          <button
            type="button"
            onClick={() => setTenantCampusTraceActive(true)}
            className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-medium text-sky-300 hover:bg-sky-500/30 transition-colors cursor-pointer"
          >
            <MapPin className="h-3 w-3" />
            <span>{language === 'es' ? 'Ver en el campus' : 'View on campus'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
          {logicalHops.map((hop, idx) => (
            <div key={hop.key} className="flex items-center gap-1 shrink-0">
              <div
                onMouseEnter={() => setHoveredLogicalHop(hop.key)}
                onMouseLeave={() => setHoveredLogicalHop(null)}
                className="rounded border border-white/15 bg-slate-900/90 px-2 py-1 text-[10px] hover:border-sky-400/60 transition-colors cursor-default"
              >
                <div className="font-semibold text-slate-100 whitespace-nowrap">{hop.title}</div>
                <div className="text-slate-400 whitespace-nowrap">{hop.meta}</div>
              </div>
              {idx < logicalHops.length - 1 && (
                <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Segmentation policy */}
      <div className="mb-3">
        <div className="text-[12px] font-semibold text-slate-200 mb-1.5">
          {t.tenant.policyTitle}
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-[6px] border border-emerald-500/25 bg-emerald-500/10 p-2">
            <div className="flex items-center gap-1 font-semibold text-emerald-300 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{language === 'es' ? 'Permitido' : 'Allowed'}</span>
            </div>
            <ul className="space-y-0.5 text-slate-200">
              {allowedTargets.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[6px] border border-rose-500/25 bg-rose-500/10 p-2">
            <div className="flex items-center gap-1 font-semibold text-rose-300 mb-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{language === 'es' ? 'Bloqueado (ACL)' : 'Blocked (ACL)'}</span>
            </div>
            <ul className="space-y-0.5 text-slate-200">
              {blockedTargets.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={triggerTenantIsolationTest}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1.5 text-[12px] font-medium text-rose-200 hover:bg-rose-500/25 transition-colors cursor-pointer"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{t.tenant.testIsolation}</span>
        </button>

        {tenantIsolationTestTick > 0 && (
          <div className="mt-1.5 rounded-[6px] border border-rose-500/30 bg-rose-950/60 px-2.5 py-1.5 text-[11px] text-rose-200">
            {language === 'es'
              ? `Paquete de prueba desde VLAN ${tenant.vlanId} bloqueado en el borde de ${tenant.vrf} al intentar alcanzar VRF-AGL.`
              : `Test packet from VLAN ${tenant.vlanId} dropped at ${tenant.vrf} edge when targeting VRF-AGL.`}
          </div>
        )}

        <p className="mt-1.5 text-[10px] text-slate-400">
          {language === 'es'
            ? 'Ilustra el principio de segmentación de red; no constituye certificación PCI DSS.'
            : 'Illustrates network segmentation principles; does not constitute PCI DSS certification.'}
        </p>
      </div>

      {/* Simulated Card Sale Flow */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setShowSaleSim((v) => !v)}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-[12px] font-medium text-emerald-200 hover:bg-emerald-500/25 transition-colors cursor-pointer"
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>{t.tenant.saleFlow}</span>
        </button>

        {showSaleSim && (
          <div className="mt-1.5 rounded-[6px] border border-emerald-500/25 bg-emerald-950/35 p-2.5 text-[11px] space-y-1">
            <div className="font-semibold text-emerald-300">
              {language === 'es'
                ? 'Flujo de autorización (valores de referencia demo)'
                : 'Authorization flow (demo reference values)'}
            </div>
            <div className="text-slate-200">
              1. POS → Switch 6U (<span className="text-sky-300">~0.2 ms</span>) → IDF {tenant.idf} (<span className="text-sky-300">~0.3 ms</span>)
            </div>
            <div className="text-slate-200">
              2. Fibra interna Anillo + Núcleo {coreNodeId} (<span className="text-sky-300">~0.02 ms · 5 µs/km</span>)
            </div>
            <div className="text-slate-200">
              3. {ispExit} → Procesador de pagos → Respuesta (<span className="text-amber-300">~620 ms</span>)
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5">
              {language === 'es'
                ? 'Nota técnica: la fibra interna aporta microsegundos; el tiempo total (~620 ms) lo domina la autorización bancaria externa.'
                : 'Technical note: internal fiber adds microseconds; external bank authorization dominates total latency (~620 ms).'}
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {activeTab === 'faults' && (
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-200 mb-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span>{t.tenant.businessFailures}</span>
        </div>
        <div className="space-y-1 text-[11px]">
          {(
            [
              {
                q: language === 'es' ? `Corte enlace hacia ${tenant.idf}` : `Cut link to ${tenant.idf}`,
                a:
                  tenant.tier === 'basico'
                    ? language === 'es'
                      ? 'Sin enlace único: caen POS y Wi-Fi; solo cobro en efectivo hasta reparar.'
                      : 'Single link lost: POS and Wi-Fi down; cash-only until repaired.'
                    : language === 'es'
                      ? 'Doble enlace en IDF conmuta en < 1 s; POS y Wi-Fi siguen operando.'
                      : 'Dual IDF uplink fails over in < 1 s; POS and Wi-Fi stay online.',
              },
              {
                q: language === 'es' ? 'Falla eléctrica en el local' : 'Store power outage',
                a:
                  language === 'es'
                    ? 'El UPS 600 VA del mini-rack 6U mantiene POS/switch ~15–20 min para cerrar ventas.'
                    : 'The 6U mini-rack 600 VA UPS keeps POS/switch alive ~15–20 min to close tabs.',
              },
              {
                q: language === 'es' ? 'Saturación del Anillo Terminal' : 'Terminal Ring congestion',
                a:
                  language === 'es'
                    ? `QoS ${tierSpec.qosPriority[language]} prioriza paquetes POS sobre tráfico Wi-Fi.`
                    : `QoS ${tierSpec.qosPriority[language]} prioritizes POS packets over Wi-Fi.`,
              },
              {
                q: language === 'es' ? `Caída de salida ${ispExit}` : `${ispExit} outage`,
                a:
                  language === 'es'
                    ? 'El núcleo conmuta salida externa por el operador de respaldo (N1 ↔ N5).'
                    : 'Core reroutes external traffic via backup ISP exit (N1 ↔ N5).',
              },
              {
                q: language === 'es' ? 'Tráfico anómalo desde Wi-Fi hacia pista' : 'Rogue Wi-Fi traffic toward airfield',
                a:
                  language === 'es'
                    ? `Bloqueado en borde de ${tenant.vrf}; VRF-AGL y VRF-ATC permanecen intactos.`
                    : `Dropped at ${tenant.vrf} edge; VRF-AGL and VRF-ATC remain untouched.`,
              },
            ] as const
          ).map((item, idx) => {
            const open = activeBizFault === idx;
            return (
              <div key={item.q} className="rounded-[6px] border border-white/10 bg-white/5">
                <button
                  type="button"
                  onClick={() => setActiveBizFault(open ? null : idx)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-left text-slate-200 hover:bg-white/5 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="text-slate-400">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className="px-2.5 pb-2 text-slate-300 border-t border-white/10 pt-1">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {activeTab === 'tiers' && (
      <div className="mb-3">
        <div className="text-[12px] font-semibold text-slate-200 mb-1.5">
          {language === 'es' ? 'Planes de conexión para negocios (demo)' : 'Business Connection Plans (demo)'}
        </div>
        <div className="space-y-1.5 text-[11px]">
          {TIER_ORDER.map((tierKey) => {
            const spec = TENANT_TIER_SPECS[tierKey];
            const active = tierKey === tenant.tier;
            return (
              <div
                key={tierKey}
                className={`rounded-[6px] border p-2.5 ${
                  active
                    ? 'border-amber-400/50 bg-amber-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className={active ? 'text-amber-300' : 'text-slate-200'}>
                    {spec.label[language]} {active ? (language === 'es' ? '(Contratado)' : '(Active)') : ''}
                  </span>
                  <span className="text-slate-300">
                    SLA {spec.slaPct}% · {spec.monthlyPriceDemo}
                  </span>
                </div>
                <div className="text-slate-300 mt-0.5">{spec.uplinkDescription[language]}</div>
                <div className="text-slate-400 mt-0.5">QoS: {spec.qosPriority[language]}</div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      <button
        type="button"
        onClick={() => setMode('passenger')}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer"
      >
        <Eye className="h-4 w-4" />
        <span>{t.tenant.backToPassenger}</span>
      </button>
    </MobileBottomSheet>
  );
}
