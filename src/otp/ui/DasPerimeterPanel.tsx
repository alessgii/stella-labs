import { useMemo } from 'react';
import { ShieldAlert, Video, Waves, X } from 'lucide-react';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { analyzePerimeterIntrusion } from '../lib/dasFiber';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

export function DasPerimeterPanel() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const dasIntrusionCad = useAppStore((s) => s.dasIntrusionCad);
  const dasEventType = useAppStore((s) => s.dasEventType);
  const triggerDasIntrusion = useAppStore((s) => s.triggerDasIntrusion);

  const analysis = useMemo(() => {
    if (!dasIntrusionCad) return null;
    return analyzePerimeterIntrusion(dasIntrusionCad, dasEventType);
  }, [dasIntrusionCad, dasEventType]);

  if (focusedZoneId !== 'perimeter' && !dasIntrusionCad) return null;

  const t = language === 'es' ? es : en;
  const isNetwork = mode === 'network';

  return (
    <MobileBottomSheet
      ariaLabel={t.depths.dasTitle}
      dark={isNetwork}
      desktopWidthClass="sm:w-96"
      desktopPositionClass="sm:top-29 sm:right-4 sm:bottom-auto"
      peekTitle={t.depths.dasTitle}
      peekSubtitle="DAS-FIBRA · VRF-SEG (2,485.58 m)"
      defaultExpandedMobile={false}
    >
      <div className="text-[12px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-500">
            <Waves className="h-3.5 w-3.5" />
            <span>DAS-FIBRA · VRF-SEG (2,485.58 m)</span>
          </div>
          <h3 className="text-[15px] font-semibold">{t.depths.dasTitle}</h3>
          <p className="text-[11px] opacity-75">{t.depths.dasSubtitle}</p>
        </div>
        {dasIntrusionCad && (
          <button
            type="button"
            onClick={() => triggerDasIntrusion(null)}
            aria-label={t.depths.dasClear}
            className="rounded-full p-1 opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="text-[11px] opacity-80 mb-1.5">{t.depths.dasClickHint}</div>
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          type="button"
          onClick={() => triggerDasIntrusion([320, 150], 'cut')}
          className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-medium cursor-pointer"
        >
          {t.depths.dasSimulateNorth}
        </button>
        <button
          type="button"
          onClick={() => triggerDasIntrusion([-60, -260], 'climb')}
          className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-medium cursor-pointer"
        >
          {t.depths.dasSimulateWest}
        </button>
        <button
          type="button"
          onClick={() => triggerDasIntrusion([250, -495], 'dig')}
          className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-medium cursor-pointer"
        >
          {t.depths.dasSimulateSouth}
        </button>
      </div>

      {analysis && (
        <>
          <div className="rounded-[6px] border border-red-500/40 bg-red-500/15 p-2.5 mb-2.5">
            <div className="flex items-center justify-between font-semibold text-red-400 mb-1">
              <span className="inline-flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>ALARMA ACÚSTICA ({analysis.eventType.toUpperCase()})</span>
              </span>
              <span className="tabular-nums">{analysis.arcDistance_m} m</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div>
                <span className="opacity-70">{t.depths.dasArcDist}:</span>{' '}
                <strong>{analysis.arcDistance_m} m</strong>
              </div>
              <div>
                <span className="opacity-70">{t.depths.dasRoundTrip}:</span>{' '}
                <strong>{analysis.roundTripLightTime_us} µs</strong>
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
              <Video className="h-3.5 w-3.5" />
              <span>
                {t.depths.dasSlewCamera}: CCTV-{analysis.nearestCctvRackId} (
                {Math.round((analysis.cameraAzimuthRad * 180) / Math.PI)}°)
              </span>
            </div>
          </div>

          {/* SVG Rayleigh Backscatter Distance-Intensity Graph */}
          <div className="rounded-[6px] border border-current/15 bg-slate-900 text-slate-200 p-2 mb-2">
            <div className="text-[10px] font-medium text-cyan-300 mb-1">
              {t.depths.dasWaveformTitle}
            </div>
            <svg viewBox="0 0 320 90" className="w-full h-22 overflow-visible">
              <line x1="0" y1="78" x2="320" y2="78" stroke="#334155" strokeWidth="1" />
              <polyline
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2"
                points={analysis.waveform
                  .map((pt) => {
                    const x = (pt.distance_m / analysis.totalFiberLength_m) * 310 + 5;
                    const y = 76 - Math.min(70, pt.intensity_dB * 1.6);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ')}
              />
              {/* Spike marker */}
              <circle
                cx={(analysis.arcDistance_m / analysis.totalFiberLength_m) * 310 + 5}
                cy={14}
                r={3.5}
                fill="#EF4444"
              />
              <text x="6" y="88" fontSize="8" fill="#94A3B8">
                0 m (N5)
              </text>
              <text x="135" y="88" fontSize="8" fill="#F87171">
                Pico: {analysis.arcDistance_m} m
              </text>
              <text x="262" y="88" fontSize="8" fill="#94A3B8">
                2486 m (N3)
              </text>
            </svg>
          </div>
        </>
      )}

      <div className="text-[11px] opacity-75">{t.depths.dasDedicatedNote}</div>
      </div>
    </MobileBottomSheet>
  );
}
