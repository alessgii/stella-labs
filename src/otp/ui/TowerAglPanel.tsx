import { AlertTriangle, Lightbulb, Moon, Radio, Sun } from 'lucide-react';
import {
  AGL_BRIGHTNESS_STEPS,
  AGL_CIRCUITS,
} from '../data/agl';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { FIBER_PROPAGATION_US_PER_KM } from '../lib/pathTrace';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

export function TowerAglPanel() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const aglBrightnessStep = useAppStore((s) => s.aglBrightnessStep);
  const aglPresetMode = useAppStore((s) => s.aglPresetMode);
  const activeAglCircuits = useAppStore((s) => s.activeAglCircuits);
  const showSchematicRunway = useAppStore((s) => s.showSchematicRunway);
  const aglNightMode = useAppStore((s) => s.aglNightMode);
  const aglFailedLampSimulated = useAppStore((s) => s.aglFailedLampSimulated);
  const lastAglCommandCircuitId = useAppStore((s) => s.lastAglCommandCircuitId);

  const setAglBrightnessStep = useAppStore((s) => s.setAglBrightnessStep);
  const setAglPresetMode = useAppStore((s) => s.setAglPresetMode);
  const toggleAglCircuit = useAppStore((s) => s.toggleAglCircuit);
  const setShowSchematicRunway = useAppStore((s) => s.setShowSchematicRunway);
  const setAglNightMode = useAppStore((s) => s.setAglNightMode);
  const setAglFailedLampSimulated = useAppStore((s) => s.setAglFailedLampSimulated);
  const setActiveUseCaseModal = useAppStore((s) => s.setActiveUseCaseModal);

  if (focusedZoneId !== 'tower' && focusedZoneId !== 'airside') return null;

  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';

  const lastCircuit =
    AGL_CIRCUITS.find((c) => c.id === lastAglCommandCircuitId) ?? AGL_CIRCUITS[0];
  const propLatUs = Number(
    ((lastCircuit.fiberDistanceFromTower_m / 1000) * FIBER_PROPAGATION_US_PER_KM).toFixed(2),
  );

  return (
    <MobileBottomSheet
      ariaLabel={t.depths.aglTitle}
      dark={isNetwork || aglNightMode}
      desktopWidthClass="sm:w-96"
      desktopPositionClass="sm:top-29 sm:right-4 sm:bottom-auto"
      peekTitle={t.depths.aglTitle}
      peekSubtitle={`ALCMS · VRF-AGL · ${propLatUs} µs`}
      defaultExpandedMobile={false}
    >
      <div className="text-[12px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>ALCMS · VRF-AGL (Anillo 1 → 2)</span>
          </div>
          <h3 className="text-[15px] font-semibold">{t.depths.aglTitle}</h3>
          <p className="text-[11px] opacity-75">{t.depths.aglSubtitle}</p>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-1 mb-2.5">
        {(['day', 'night', 'low-vis'] as const).map((preset) => {
          const active = aglPresetMode === preset;
          const label =
            preset === 'day'
              ? t.depths.presetDay
              : preset === 'night'
                ? t.depths.presetNight
                : t.depths.presetLowVis;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => setAglPresetMode(preset)}
              className={`rounded-full px-2 py-1 text-[11px] font-medium border cursor-pointer ${
                active
                  ? 'bg-sky-500 border-sky-500 text-slate-950'
                  : 'border-current/15 hover:bg-current/10'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 5 Brightness Steps */}
      <div className="mb-2.5">
        <div className="font-medium mb-1">{t.depths.brightnessStep}</div>
        <div className="grid grid-cols-5 gap-1">
          {AGL_BRIGHTNESS_STEPS.map((st) => {
            const active = aglBrightnessStep === st.step;
            return (
              <button
                key={st.step}
                type="button"
                onClick={() => setAglBrightnessStep(st.step)}
                className={`rounded-[4px] py-1 text-center text-[11px] font-semibold border cursor-pointer ${
                  active
                    ? 'bg-amber-400 border-amber-400 text-slate-950'
                    : 'border-current/15 hover:bg-current/10'
                }`}
              >
                <div>P{st.step}</div>
                <div className="text-[10px] font-normal opacity-80">
                  {st.currentAmps}A
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Circuits */}
      <div className="space-y-1 mb-2.5">
        {AGL_CIRCUITS.filter((c) => !c.isSchematicRunway).map((c) => {
          const on = activeAglCircuits.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleAglCircuit(c.id)}
              className={`w-full flex items-center justify-between gap-2 rounded-[4px] px-2.5 py-1.5 text-left border cursor-pointer ${
                on
                  ? 'border-sky-500/40 bg-sky-500/10'
                  : 'border-current/10 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="truncate font-medium">{c.name[language]}</span>
              </div>
              <span className="text-[10px] opacity-75 shrink-0">
                CCR {c.vaultId} ({c.fiberDistanceFromTower_m}m)
              </span>
            </button>
          );
        })}
      </div>

      {/* Telemetry readout */}
      <div className="rounded-[4px] border border-current/10 bg-current/5 p-2 mb-2.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 font-medium text-sky-400">
            <Radio className="h-3 w-3" />
            <span>N3 → {lastCircuit.vaultId}</span>
          </span>
          <span className="tabular-nums">
            {lastCircuit.fiberDistanceFromTower_m} m · ~{propLatUs} µs
          </span>
        </div>
        <div className="mt-1 opacity-75">{t.depths.powerCableNote}</div>
      </div>

      {/* Toggles: Night view, Schematic Runway, Failed Lamp */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setAglNightMode(!aglNightMode)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
            aglNightMode
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : 'border-current/15'
          }`}
        >
          {aglNightMode ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          <span>{t.depths.nightView}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSchematicRunway(!showSchematicRunway)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
            showSchematicRunway
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'border-current/15'
          }`}
        >
          {t.depths.schematicRunway}
        </button>

        <button
          type="button"
          onClick={() => setAglFailedLampSimulated(!aglFailedLampSimulated)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
            aglFailedLampSimulated
              ? 'bg-red-600 border-red-600 text-white'
              : 'border-current/15'
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          <span>
            {aglFailedLampSimulated
              ? t.depths.clearLampFault
              : t.depths.simulateLampFault}
          </span>
        </button>
      </div>

      {aglFailedLampSimulated && (
        <div className="mt-2 rounded-[4px] border border-red-500/50 bg-red-500/15 p-2 text-[11px] font-medium text-red-300">
          {t.depths.lampFaultAlarm}
        </div>
      )}

      <button
        type="button"
        onClick={() => setActiveUseCaseModal('emergency')}
        className="mt-2.5 w-full rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-500 cursor-pointer"
      >
        {language === 'es' ? 'Declarar emergencia Torre ↔ SSEI' : 'Declare Tower ↔ SSEI Emergency'}
      </button>
      </div>
    </MobileBottomSheet>
  );
}
