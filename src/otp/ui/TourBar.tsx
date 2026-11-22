import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Maximize2, X } from 'lucide-react';
import { TOUR_STEPS } from '../data/tour';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

const GLOSSARY_ITEMS = [
  {
    term: 'MDF (N1 / N5)',
    es: 'Cuarto principal de red donde llegan los anillos centrales de fibra óptica.',
    en: 'Main Distribution Frame: primary network room where core fiber rings meet.',
  },
  {
    term: 'IDF (Racks R1_T…)',
    es: 'Armario de comunicaciones cercano a los equipos; conecta dispositivos por cobre (≤ 90 m) o fibra.',
    en: 'Intermediate Distribution Frame: zone rack connecting nearby devices via copper (≤ 90 m) or fiber.',
  },
  {
    term: 'VRF',
    es: 'Red virtual aislada: separa el tráfico de cada sistema (equipaje, tiendas, bomberos) en la misma fibra.',
    en: 'Virtual Routing & Forwarding: isolated logical network separating traffic over shared fiber.',
  },
  {
    term: 'Anillo + ERPS (< 50 ms)',
    es: 'Cableado en bucle cerrado; si se corta un tramo, el tráfico da la vuelta automáticamente en < 50 ms.',
    en: 'Closed-loop cabling; if a span is cut, traffic reverses direction automatically in < 50 ms.',
  },
  {
    term: 'TI vs OT',
    es: 'TI = redes de usuarios y oficinas (Wi‑Fi, tiendas); OT = sistemas físicos críticos (pista, equipaje, bomberos).',
    en: 'IT = user & office networks (Wi-Fi, retail); OT = mission-critical physical systems (runway, baggage, fire).',
  },
  {
    term: 'Fibra OS2 vs Cat6A PoE',
    es: 'Cobre Cat6A PoE lleva datos y energía hasta 90 m; más allá de 90 m o con ruido eléctrico se usa fibra OS2.',
    en: 'Cat6A PoE copper carries data + power up to 90 m; beyond 90 m or near electrical noise, OS2 fiber is used.',
  },
  {
    term: 'FIDS / BHS / AGL / SSEI / DAS',
    es: 'FIDS: pantallas de vuelos · BHS: equipaje · AGL: luces de pista · SSEI: bomberos · DAS: sensor acústico en fibra.',
    en: 'FIDS: flight boards · BHS: baggage · AGL: airfield lights · ARFF/SSEI: fire station · DAS: fiber acoustic sensor.',
  },
  {
    term: 'CWDM / Presupuesto Óptico',
    es: 'Cálculo de pérdida de señal en la fibra; CWDM multiplexa varios canales de luz por un mismo hilo.',
    en: 'Fiber signal loss budget; CWDM multiplexes multiple light wavelengths over one fiber strand.',
  },
] as const;

export function TourBar() {
  const language = useAppStore((s) => s.language);
  const tourActive = useAppStore((s) => s.tourActive);
  const tourTrack = useAppStore((s) => s.tourTrack);
  const tourStepIndex = useAppStore((s) => s.tourStepIndex);
  const presentationMode = useAppStore((s) => s.presentationMode);

  const startTour = useAppStore((s) => s.startTour);
  const stopTour = useAppStore((s) => s.stopTour);
  const setTourStep = useAppStore((s) => s.setTourStep);
  const setPresentationMode = useAppStore((s) => s.setPresentationMode);

  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const steps = TOUR_STEPS.filter((s) => s.track === tourTrack);
  const current = steps[tourStepIndex] ?? steps[0];

  useEffect(() => {
    if (!tourActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTourStep(tourStepIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTourStep(tourStepIndex - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopTour();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tourActive, tourStepIndex, setTourStep, stopTour]);

  if (!tourActive || !current) return null;

  const t = language === 'es' ? es : en;

  return (
    <div
      role="region"
      aria-label="Recorrido guiado"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-2rem)] max-w-2xl rounded-[6px] border border-white/20 bg-slate-950/96 text-slate-100 backdrop-blur-md ${
        presentationMode ? 'p-5 text-[16px]' : 'p-3.5 text-[13px]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {/* Track Selector */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => startTour('topology')}
            className={`rounded-full px-3 py-1 text-[11px] font-medium border cursor-pointer ${
              tourTrack === 'topology'
                ? 'bg-sky-500 border-sky-500 text-slate-950 font-semibold'
                : 'border-white/15 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t.networkDock.tourTopology}
          </button>
          <button
            type="button"
            onClick={() => startTour('systems')}
            className={`rounded-full px-3 py-1 text-[11px] font-medium border cursor-pointer ${
              tourTrack === 'systems'
                ? 'bg-sky-500 border-sky-500 text-slate-950 font-semibold'
                : 'border-white/15 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t.networkDock.tourSystems}
          </button>
        </div>

        {/* Glossary, Presentation Mode, Minimize & Close */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setGlossaryOpen((v) => !v)}
            aria-pressed={glossaryOpen}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
              glossaryOpen
                ? 'bg-emerald-400 border-emerald-400 text-slate-950 font-semibold'
                : 'border-white/15 text-slate-300 hover:bg-white/10'
            }`}
          >
            <BookOpen className="h-3 w-3" />
            <span>{language === 'es' ? 'Glosario' : 'Glossary'}</span>
          </button>
          <button
            type="button"
            onClick={() => setPresentationMode(!presentationMode)}
            aria-pressed={presentationMode}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border cursor-pointer ${
              presentationMode
                ? 'bg-amber-400 border-amber-400 text-slate-950 font-semibold'
                : 'border-white/15 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">{t.networkDock.presentationMode}</span>
            <span className="sm:hidden">{language === 'es' ? 'Presentar' : 'Present'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMinimized((v) => !v)}
            aria-label={minimized ? 'Expandir guía' : 'Minimizar guía'}
            className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
          >
            {minimized ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={stopTour}
            aria-label="Salir del recorrido"
            className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {glossaryOpen && !minimized && (
        <div className="mb-3 max-h-44 overflow-y-auto rounded-[6px] border border-emerald-400/30 bg-slate-900/95 p-2.5 text-[11px] space-y-1.5">
          <div className="font-semibold text-emerald-300">
            {language === 'es'
              ? 'Glosario rápido para la exposición'
              : 'Quick Presentation Glossary'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {GLOSSARY_ITEMS.map((item) => (
              <div
                key={item.term}
                className="rounded border border-white/10 bg-white/5 px-2 py-1.5"
              >
                <div className="font-semibold text-sky-300">{item.term}</div>
                <div className="text-slate-300 leading-snug">{item[language]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!minimized && (
        <>
          <h3
            className={`font-semibold text-sky-300 mb-1 ${
              presentationMode ? 'text-[18px] sm:text-[20px]' : 'text-[15px]'
            }`}
          >
            {current.title[language]}
          </h3>
          <p
            className={`text-slate-200 leading-relaxed mb-3 ${
              presentationMode ? 'text-[14px] sm:text-[16px]' : 'text-[13px]'
            }`}
          >
            {current.caption[language]}
          </p>
        </>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
        <span className="text-[11px] text-slate-400 tabular-nums">
          Paso {tourStepIndex + 1} / {steps.length} · ← / → / Esc
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={tourStepIndex === 0}
            onClick={() => setTourStep(tourStepIndex - 1)}
            aria-label="Paso anterior"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[12px] disabled:opacity-35 hover:bg-white/10 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Anterior</span>
          </button>
          <button
            type="button"
            disabled={tourStepIndex >= steps.length - 1}
            onClick={() => setTourStep(tourStepIndex + 1)}
            aria-label="Siguiente paso"
            className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-3.5 py-1 text-[12px] font-semibold text-slate-950 disabled:opacity-35 hover:bg-sky-400 cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
