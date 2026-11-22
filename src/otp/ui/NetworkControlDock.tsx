import { useMemo, useState } from 'react';
import {
  Activity,
  Calculator,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { FAILURE_SCENARIOS, type FailureId } from '../data/failures';
import { FIBER_CABLES, type FiberCableId } from '../data/fiber';
import {
  DOCUMENT_EXAMPLE_3_2KM,
  LINK_BUDGET_DEFAULTS,
} from '../data/linkBudgetDefaults';
import {
  NETWORK_SERVICES,
  RING_CAPACITY_GBPS,
  RING_SAFE_UTILIZATION_PCT,
} from '../data/services';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { calculateLinkBudget } from '../lib/linkBudget';
import { useAppStore, type NetworkPresetId } from '../store/useAppStore';

type DockTab = 'layers' | 'services' | 'budget' | 'failures';

const PRESET_IDS: NetworkPresetId[] = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
];

export function NetworkControlDock() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const presentationMode = useAppStore((s) => s.presentationMode);

  const networkPreset = useAppStore((s) => s.networkPreset);
  const networkLayers = useAppStore((s) => s.networkLayers);
  const trenchView = useAppStore((s) => s.trenchView);
  const threeLayerView = useAppStore((s) => s.threeLayerView);
  const activeFailureId = useAppStore((s) => s.activeFailureId);
  const ring1LoadGbps = useAppStore((s) => s.ring1LoadGbps);
  const ring2LoadGbps = useAppStore((s) => s.ring2LoadGbps);

  const applyNetworkPreset = useAppStore((s) => s.applyNetworkPreset);
  const toggleNetworkLayer = useAppStore((s) => s.toggleNetworkLayer);
  const toggleCableVisibility = useAppStore((s) => s.toggleCableVisibility);
  const setTrenchView = useAppStore((s) => s.setTrenchView);
  const setThreeLayerView = useAppStore((s) => s.setThreeLayerView);
  const setActiveFailureId = useAppStore((s) => s.setActiveFailureId);
  const setRing1LoadGbps = useAppStore((s) => s.setRing1LoadGbps);
  const setRing2LoadGbps = useAppStore((s) => s.setRing2LoadGbps);

  const [tab, setTab] = useState<DockTab>('layers');
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640,
  );

  // Link budget state
  const [selectedCableId, setSelectedCableId] = useState<FiberCableId | 'DOC_3_2KM'>(
    'NUCLEO_ANILLO1_RUTA_A',
  );
  const [alpha, setAlpha] = useState(LINK_BUDGET_DEFAULTS.attenuationDbPerKm);
  const [splices, setSplices] = useState(LINK_BUDGET_DEFAULTS.spliceCount);
  const [connectors, setConnectors] = useState(LINK_BUDGET_DEFAULTS.connectorPairs);
  const [cwdm, setCwdm] = useState(false);

  const length_m =
    selectedCableId === 'DOC_3_2KM'
      ? DOCUMENT_EXAMPLE_3_2KM.length_m!
      : FIBER_CABLES[selectedCableId].length_m;

  const budget = useMemo(
    () =>
      calculateLinkBudget({
        length_m,
        attenuationDbPerKm: alpha,
        spliceCount: splices,
        connectorPairs: connectors,
        includeCwdmMux: cwdm,
      }),
    [length_m, alpha, splices, connectors, cwdm],
  );

  if (mode !== 'network' || focusedZoneId !== null || presentationMode) {
    return null;
  }

  const t = language === 'es' ? es : en;
  const combinedLoadGbps = ring1LoadGbps + ring2LoadGbps;
  const combinedSafe = combinedLoadGbps <= RING_SAFE_UTILIZATION_PCT;
  const activeFailure = FAILURE_SCENARIOS.find((f) => f.id === activeFailureId);

  const selectDocExample = () => {
    setSelectedCableId('DOC_3_2KM');
    setSplices(DOCUMENT_EXAMPLE_3_2KM.spliceCount ?? 6);
    setConnectors(DOCUMENT_EXAMPLE_3_2KM.connectorPairs ?? 2);
  };

  return (
    <aside
      aria-label="Panel de control Red CAN"
      className="fixed bottom-0 inset-x-0 z-20 w-full max-h-[62vh] sm:top-29 sm:left-4 sm:bottom-auto sm:inset-x-auto sm:w-[410px] sm:max-h-[calc(100vh-19rem)] flex flex-col rounded-t-[14px] sm:rounded-[6px] border border-white/15 bg-slate-950/95 text-slate-100 backdrop-blur-sm text-[12px]"
    >
      {/* Mobile drag handle */}
      <div className="sm:hidden flex justify-center pt-1.5">
        <span className="h-1 w-9 rounded-full bg-white/25" />
      </div>

      {/* Tab Header */}
      <div className="flex items-center justify-between gap-1 px-2 py-1.5 sm:p-2 border-b border-white/10">
        <div className="grid grid-cols-4 gap-1 flex-1">
          {(
            [
              { id: 'layers', icon: Layers, label: t.networkDock.tabs.layers },
              { id: 'services', icon: Activity, label: t.networkDock.tabs.services },
              { id: 'budget', icon: Calculator, label: t.networkDock.tabs.budget },
              { id: 'failures', icon: ShieldAlert, label: t.networkDock.tabs.failures },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setCollapsed(false);
                }}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-[4px] px-1 sm:px-1.5 py-1.5 text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="truncate max-w-full">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir panel' : 'Contraer panel'}
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
        >
          {collapsed ? (
            <ChevronUp className="h-4 w-4 sm:rotate-180" />
          ) : (
            <ChevronDown className="h-4 w-4 sm:rotate-180" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="overflow-y-auto p-3 space-y-3">
          {/* ================= TAB 1: CAPAS & PRESETS 01-08 ================= */}
          {tab === 'layers' && (
            <>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                  {t.networkDock.tabs.layers}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {PRESET_IDS.map((pid) => (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => applyNetworkPreset(pid)}
                      className={`rounded-[4px] px-2.5 py-1 text-left text-[11px] font-medium border cursor-pointer ${
                        networkPreset === pid
                          ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                          : 'border-white/10 text-slate-300 hover:bg-white/8'
                      }`}
                    >
                      {t.networkDock.presets[pid]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Cable Toggles */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                  Trazados de Fibra (6)
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {Object.values(FIBER_CABLES).map((c) => {
                    const on = networkLayers.cables[c.id];
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCableVisibility(c.id)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border cursor-pointer ${
                          on
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/10 text-slate-500'
                        }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="truncate">
                          {c.id.replace('NUCLEO_', '').replace('DISTRIB_', 'D_')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Architectural / Logical Views */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setTrenchView(!trenchView)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
                    trenchView
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'border-white/15 text-slate-300'
                  }`}
                >
                  {t.networkDock.trenchView}
                </button>

                <button
                  type="button"
                  onClick={() => setThreeLayerView(!threeLayerView)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
                    threeLayerView
                      ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200'
                      : 'border-white/15 text-slate-300'
                  }`}
                >
                  {t.networkDock.threeLayerView}
                </button>

                <button
                  type="button"
                  onClick={() => toggleNetworkLayer('cotas')}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
                    networkLayers.cotas
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                      : 'border-white/15 text-slate-300'
                  }`}
                >
                  {t.networkDock.cotasLayer}
                </button>
              </div>
            </>
          )}

          {/* ================= TAB 2: SERVICIOS & MODO B ================= */}
          {tab === 'services' && (
            <>
              <div className="rounded-[6px] border border-white/10 bg-white/5 p-2.5 space-y-2">
                <label className="block">
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-sky-300 font-medium">
                      {t.networkDock.ring1Load}
                    </span>
                    <span className="tabular-nums font-semibold">
                      {ring1LoadGbps} Gbps / {RING_CAPACITY_GBPS}G
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={70}
                    step={5}
                    value={ring1LoadGbps}
                    onChange={(e) => setRing1LoadGbps(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </label>

                <label className="block">
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-amber-300 font-medium">
                      {t.networkDock.ring2Load}
                    </span>
                    <span className="tabular-nums font-semibold">
                      {ring2LoadGbps} Gbps / {RING_CAPACITY_GBPS}G
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={70}
                    step={5}
                    value={ring2LoadGbps}
                    onChange={(e) => setRing2LoadGbps(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </label>

                <div
                  className={`rounded-[4px] border p-2 text-[11px] ${
                    combinedSafe
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-500/20 border-red-500/50 text-red-200'
                  }`}
                >
                  <div className="flex justify-between font-semibold">
                    <span>{t.networkDock.combinedSurvivor}</span>
                    <span className="tabular-nums">{combinedLoadGbps} / 100 Gbps</span>
                  </div>
                  <div className="text-[10px] opacity-90 mt-0.5">
                    {combinedSafe
                      ? 'Cumple regla Modo B (≤ 80 %): si un anillo completo cae, el sobreviviente absorbe toda la carga sin saturarse.'
                      : 'ALERTA (> 80 %): si un anillo cae, el sobreviviente recibiría ' +
                        combinedLoadGbps +
                        ' Gbps y superaría el umbral seguro.'}
                  </div>
                </div>
              </div>

              {/* 7 VRF Services Matrix: mobile cards + desktop table */}
              <div className="sm:hidden space-y-1.5">
                {NETWORK_SERVICES.map((srv) => (
                  <div
                    key={srv.id}
                    className="rounded-[6px] border border-white/10 bg-white/5 p-2 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-100">{srv.name[language]}</span>
                      <span className="text-sky-300 font-medium whitespace-nowrap">{srv.vrf}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-300">
                      <span>
                        Anillo {srv.primaryRing} → {srv.backupRing}
                      </span>
                      <span>{srv.capacityLabel}</span>
                      <span className="tabular-nums font-medium">SLA {srv.slaPct}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto rounded-[6px] border border-white/10">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-white/5 text-slate-400">
                    <tr>
                      <th className="px-2 py-1">Servicio</th>
                      <th className="px-2 py-1">VRF</th>
                      <th className="px-2 py-1">Anillo</th>
                      <th className="px-2 py-1">Cap.</th>
                      <th className="px-2 py-1">SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {NETWORK_SERVICES.map((srv) => (
                      <tr key={srv.id}>
                        <td className="px-2 py-1 font-medium">{srv.name[language]}</td>
                        <td className="px-2 py-1 text-sky-300 whitespace-nowrap">
                          {srv.vrf}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {srv.primaryRing} → {srv.backupRing}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">{srv.capacityLabel}</td>
                        <td className="px-2 py-1 tabular-nums">{srv.slaPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= TAB 3: PRESUPUESTO ÓPTICO ================= */}
          {tab === 'budget' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={selectedCableId}
                    onChange={(e) => {
                      const val = e.target.value as FiberCableId | 'DOC_3_2KM';
                      setSelectedCableId(val);
                      if (val === 'DOC_3_2KM') {
                        setSplices(6);
                      } else {
                        setSplices(4);
                      }
                    }}
                    aria-label="Seleccionar tramo de fibra"
                    className="flex-1 rounded-[4px] border border-white/15 bg-slate-900 px-2 py-1 text-[11px]"
                  >
                    {Object.values(FIBER_CABLES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name[language]} ({c.length_m} m)
                      </option>
                    ))}
                    <option value="DOC_3_2KM">
                      Ejemplo documento MDF-A ↔ Torre (3,200 m)
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={selectDocExample}
                  className="w-full rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-200 hover:bg-sky-500/25 cursor-pointer"
                >
                  {t.networkDock.docExampleBtn}
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="text-[10px] text-slate-400">α (dB/km)</span>
                    <input
                      type="number"
                      step={0.05}
                      min={0.15}
                      max={1.0}
                      value={alpha}
                      onChange={(e) => setAlpha(Number(e.target.value))}
                      className="w-full rounded border border-white/15 bg-slate-900 px-2 py-1 text-[11px]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] text-slate-400">Empalmes (0.1dB)</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={splices}
                      onChange={(e) => setSplices(Number(e.target.value))}
                      className="w-full rounded border border-white/15 bg-slate-900 px-2 py-1 text-[11px]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] text-slate-400">Pares LC (0.5dB)</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={connectors}
                      onChange={(e) => setConnectors(Number(e.target.value))}
                      className="w-full rounded border border-white/15 bg-slate-900 px-2 py-1 text-[11px]"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setCwdm(!cwdm)}
                  aria-pressed={cwdm}
                  className={`w-full flex items-center justify-between rounded-[4px] px-3 py-1.5 text-[11px] font-medium border cursor-pointer ${
                    cwdm
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'border-white/15 text-slate-300 hover:bg-white/8'
                  }`}
                >
                  <span>{t.networkDock.cwdmToggle}</span>
                  <span>{cwdm ? 'ON (+2.5 dB)' : 'OFF'}</span>
                </button>
              </div>

              {/* Step-by-step Breakdown */}
              <div className="rounded-[6px] border border-white/10 bg-white/5 p-2.5 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Fibra ({budget.length_km} km × {alpha} dB/km):
                  </span>
                  <span className="tabular-nums font-medium">
                    {budget.fiberLoss_dB} dB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Empalmes ({splices} × 0.1 dB):
                  </span>
                  <span className="tabular-nums font-medium">
                    {budget.spliceLoss_dB} dB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Conectores ({connectors} × 0.5 dB):
                  </span>
                  <span className="tabular-nums font-medium">
                    {budget.connectorLoss_dB} dB
                  </span>
                </div>
                {cwdm && (
                  <div className="flex justify-between text-amber-300">
                    <span>Mux/Demux CWDM:</span>
                    <span className="tabular-nums font-medium">
                      +{budget.otherLoss_dB} dB
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-white/10 font-semibold">
                  <span>Pérdida total (A_T):</span>
                  <span className="tabular-nums">{budget.totalAttenuation_dB} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    P_RX (−8.2 dBm − {budget.totalAttenuation_dB} dB):
                  </span>
                  <span className="tabular-nums font-semibold">
                    {budget.rxPowerMin_dBm} dBm
                  </span>
                </div>
              </div>

              {/* Traffic Light Margin Verdict */}
              <div
                className={`rounded-[6px] border p-2.5 ${
                  budget.status === 'green'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                    : budget.status === 'yellow'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                      : 'bg-red-500/20 border-red-500/50 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-[13px]">
                  <span>Margen (P_RX − (−14.4 dBm)):</span>
                  <span className="tabular-nums">{budget.margin_dB} dB</span>
                </div>
                <div className="text-[11px] mt-0.5">
                  {budget.meetsMargin
                    ? 'VIABLE: supera el margen de seguridad recomendado de ≥ 3.0 dB.'
                    : 'INSUFICIENTE (< 3.0 dB): requiere corrección de ingeniería.'}
                </div>
                {budget.remediationSuggestions[language].length > 0 && (
                  <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[11px]">
                    {budget.remediationSuggestions[language].map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="text-[10px] text-slate-400 space-y-0.5">
                <div>
                  Disp. cromática (1310 nm): ~{budget.chromaticDispersion_ps} ps · PMD:{' '}
                  {budget.pmd_ps} ps (&lt; 10 ps límite 10G, no limita el diseño).
                </div>
                <div>{t.networkDock.referenceNote}</div>
              </div>
            </>
          )}

          {/* ================= TAB 4: SIMULADOR DE FALLAS F1-F12 ================= */}
          {tab === 'failures' && (
            <>
              {activeFailure && (
                <div className="rounded-[6px] border border-red-500/50 bg-red-500/15 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-red-300">
                      {activeFailure.title[language]}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveFailureId(null)}
                      className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-semibold text-slate-950 cursor-pointer"
                    >
                      {t.networkDock.restoreNetwork}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-200">
                    {activeFailure.visualEffect[language]}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-white/10">
                    <div>
                      <span className="text-slate-400">Recuperación:</span>{' '}
                      <strong className="text-amber-300">
                        {activeFailure.recoveryTimeLabel[language]}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">SLA:</span>{' '}
                      <strong
                        className={
                          activeFailure.slaMet ? 'text-emerald-300' : 'text-amber-300'
                        }
                      >
                        {activeFailure.slaMet ? 'Cumple SLA' : 'Operación degradada'}
                      </strong>
                    </div>
                  </div>
                  <div className="text-[11px] text-sky-200">
                    {activeFailure.survivalMechanism[language]}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {FAILURE_SCENARIOS.map((f) => {
                  const active = activeFailureId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setActiveFailureId(active ? null : (f.id as FailureId))
                      }
                      className={`w-full flex items-center justify-between gap-2 rounded-[4px] px-2.5 py-1.5 text-left border transition-colors cursor-pointer ${
                        active
                          ? 'bg-red-500/25 border-red-400 text-white'
                          : 'border-white/10 text-slate-300 hover:bg-white/8'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap
                          className={`h-3.5 w-3.5 shrink-0 ${
                            active
                              ? 'text-red-400'
                              : f.version === 'v2'
                                ? 'text-cyan-400'
                                : 'text-amber-400'
                          }`}
                        />
                        <span className="truncate font-medium">
                          {f.title[language]}
                        </span>
                      </div>
                      <span className="text-[10px] opacity-75 whitespace-nowrap">
                        {f.recoveryTimeLabel[language]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
