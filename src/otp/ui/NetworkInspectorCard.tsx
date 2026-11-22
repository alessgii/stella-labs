import { X } from 'lucide-react';
import { FIBER_CABLES, type FiberCableId } from '../data/fiber';
import { CORE_NODES } from '../data/nodes';
import { DISTRIBUTION_RACKS } from '../data/racks';
import { NETWORK_SERVICES } from '../data/services';
import { useAppStore } from '../store/useAppStore';

export function NetworkInspectorCard() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const inspectedElement = useAppStore((s) => s.inspectedElement);
  const distributionFiberCount = useAppStore((s) => s.distributionFiberCount);
  const setInspectedElement = useAppStore((s) => s.setInspectedElement);
  const setDistributionFiberCount = useAppStore((s) => s.setDistributionFiberCount);

  if (mode !== 'network' || !inspectedElement) return null;

  if (inspectedElement.kind === 'node') {
    const node = CORE_NODES.find((n) => n.id === inspectedElement.id);
    if (!node) return null;
    return (
      <aside className="fixed bottom-0 inset-x-0 z-20 w-full max-h-[70vh] overflow-y-auto rounded-t-[14px] sm:bottom-4 sm:right-4 sm:left-auto sm:inset-x-auto sm:w-88 sm:rounded-[6px] border border-white/15 bg-slate-950/95 p-3.5 text-[12px] text-slate-100 backdrop-blur-sm">
        <div className="sm:hidden flex justify-center -mt-1 mb-2">
          <span className="h-1 w-9 rounded-full bg-white/25" />
        </div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
              NODO NÚCLEO · {node.id}
            </span>
            <h3 className="text-[15px] font-semibold mt-1">{node.name[language]}</h3>
          </div>
          <button
            type="button"
            onClick={() => setInspectedElement(null)}
            className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-slate-300 mb-2">{node.role[language]}</p>
        <div className="grid grid-cols-2 gap-1.5 rounded bg-white/5 p-2 text-[11px]">
          <div>
            <span className="text-slate-400">CAD (X, Y):</span>{' '}
            <strong className="tabular-nums">
              ({node.pos_cad[0]}, {node.pos_cad[1]}) m
            </strong>
          </div>
          <div>
            <span className="text-slate-400">Fibra Núcleo:</span>{' '}
            <strong>OS2 72 hilos</strong>
          </div>
        </div>
      </aside>
    );
  }

  if (inspectedElement.kind === 'rack') {
    const rack = DISTRIBUTION_RACKS.find((r) => r.id === inspectedElement.id);
    if (!rack) return null;
    const cable = FIBER_CABLES[rack.ring];
    return (
      <aside className="fixed bottom-0 inset-x-0 z-20 w-full max-h-[70vh] overflow-y-auto rounded-t-[14px] sm:bottom-4 sm:right-4 sm:left-auto sm:inset-x-auto sm:w-88 sm:rounded-[6px] border border-white/15 bg-slate-950/95 p-3.5 text-[12px] text-slate-100 backdrop-blur-sm">
        <div className="sm:hidden flex justify-center -mt-1 mb-2">
          <span className="h-1 w-9 rounded-full bg-white/25" />
        </div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              RACK IDF · {rack.id}
            </span>
            <h3 className="text-[15px] font-semibold mt-1">
              {language === 'es' ? rack.label : rack.labelEn}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setInspectedElement(null)}
            className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 rounded bg-white/5 p-2 text-[11px]">
          <div>
            <span className="text-slate-400">CAD (X, Y):</span>{' '}
            <strong className="tabular-nums">
              ({rack.x_cad}, {rack.y_cad}) m
            </strong>
          </div>
          <div>
            <span className="text-slate-400">Doble subida:</span>{' '}
            <strong>
              {rack.uplinks[0]} y {rack.uplinks[1]}
            </strong>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400">Anillo:</span>{' '}
            <strong>{cable.name[language]}</strong>
          </div>
        </div>
      </aside>
    );
  }

  const cable = FIBER_CABLES[inspectedElement.id as FiberCableId];
  if (!cable) return null;
  const isCore = cable.layer === 'core';
  const ringServices = NETWORK_SERVICES.filter((s) =>
    cable.id === 'NUCLEO_ANILLO1_RUTA_A' ? s.primaryRing === 1 : s.primaryRing === 2,
  );

  return (
    <aside className="fixed bottom-0 inset-x-0 z-20 w-full max-h-[70vh] overflow-y-auto rounded-t-[14px] sm:bottom-4 sm:right-4 sm:left-auto sm:inset-x-auto sm:w-92 sm:rounded-[6px] border border-white/15 bg-slate-950/95 p-3.5 text-[12px] text-slate-100 backdrop-blur-sm">
      <div className="sm:hidden flex justify-center -mt-1 mb-2">
        <span className="h-1 w-9 rounded-full bg-white/25" />
      </div>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-950"
            style={{ backgroundColor: cable.color }}
          >
            {cable.id}
          </span>
          <h3 className="text-[15px] font-semibold mt-1">{cable.name[language]}</h3>
        </div>
        <button
          type="button"
          onClick={() => setInspectedElement(null)}
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 rounded bg-white/5 p-2 text-[11px] mb-2">
        <div>
          <span className="text-slate-400">Longitud CAD:</span>{' '}
          <strong className="tabular-nums">{cable.length_m} m</strong>
        </div>
        <div>
          <span className="text-slate-400">Fibra:</span>{' '}
          <strong>
            OS2 {isCore ? '72h' : `${distributionFiberCount}h`}
          </strong>
        </div>
        {!isCore && (
          <div className="col-span-2 flex items-center justify-between pt-1 border-t border-white/10">
            <span className="text-slate-400">Hilos dist. (configurable):</span>
            <div className="flex gap-1">
              {[24, 48, 72, 96].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setDistributionFiberCount(cnt)}
                  className={`rounded px-1.5 py-0.5 text-[10px] border cursor-pointer ${
                    distributionFiberCount === cnt
                      ? 'bg-sky-500 border-sky-500 text-slate-950 font-semibold'
                      : 'border-white/15 text-slate-300'
                  }`}
                >
                  {cnt}h
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isCore && (
        <div className="text-[11px] text-slate-300">
          <div className="text-slate-400 mb-1">Servicios primarios en este anillo:</div>
          <div className="flex flex-wrap gap-1">
            {ringServices.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]"
              >
                {s.vrf}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
