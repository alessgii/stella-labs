import { DoorOpen, Lock, Network, Play, X } from 'lucide-react';
import { getSpecialRoomById } from '../data/previews';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

export function RoomPreviewCard() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const selectedSpecialRoomId = useAppStore((s) => s.selectedSpecialRoomId);
  const selectSpecialRoom = useAppStore((s) => s.selectSpecialRoom);
  const enterTenant = useAppStore((s) => s.enterTenant);
  const setMode = useAppStore((s) => s.setMode);
  const setActiveUseCaseModal = useAppStore((s) => s.setActiveUseCaseModal);

  if (
    (focusedZoneId !== 'ssei' && focusedZoneId !== 'cargo') ||
    focusedTenantId !== null ||
    !selectedSpecialRoomId
  ) {
    return null;
  }

  const room = getSpecialRoomById(selectedSpecialRoomId);
  if (!room) return null;

  const isNetwork = mode === 'network';

  const useCaseLabel =
    room.useCase === 'emergency'
      ? language === 'es'
        ? 'Iniciar Emergencia Integrada'
        : 'Start Integrated Emergency'
      : room.useCase === 'power'
        ? language === 'es'
          ? 'Abrir Panel de Energía / Apagón'
          : 'Open Power / Blackout Panel'
        : room.useCase === 'cold-chain'
          ? language === 'es'
            ? 'Seguir Paquete (Cadena de Frío)'
            : 'Track Package (Cold Chain)'
          : null;

  return (
    <MobileBottomSheet
      ariaLabel={room.name[language]}
      dark={isNetwork}
      desktopWidthClass="sm:w-96"
      peekTitle={room.name[language]}
      peekSubtitle={`${room.vrf} · ${room.templateSpec.objects.length} equipos`}
      peekAction={
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            enterTenant(room.id);
          }}
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            isNetwork
              ? 'bg-sky-500 text-slate-950'
              : 'bg-[var(--color-obsidian)] text-[var(--color-paper)]'
          }`}
        >
          {language === 'es' ? 'Entrar' : 'Enter'}
        </button>
      }
      defaultExpandedMobile={true}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              room.access === 'restricted'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>
              {room.access === 'restricted'
                ? language === 'es'
                  ? 'Vista informativa · acceso restringido'
                  : 'Informative view · restricted access'
                : language === 'es'
                  ? 'Acceso público'
                  : 'Public access'}
            </span>
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              isNetwork
                ? 'bg-white/10 text-slate-300'
                : 'bg-[var(--color-whisper)] text-[var(--color-graphite)]'
            }`}
          >
            Demo
          </span>
        </div>

        <button
          type="button"
          onClick={() => selectSpecialRoom(null)}
          aria-label="Cerrar tarjeta"
          className={`rounded-full p-1 cursor-pointer ${
            isNetwork
              ? 'text-slate-400 hover:bg-white/10 hover:text-white'
              : 'text-[var(--color-graphite)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1">
        {room.name[language]}
      </h3>
      <p
        className={`text-[12px] leading-relaxed mb-2 ${
          isNetwork ? 'text-slate-300' : 'text-[var(--color-graphite)]'
        }`}
      >
        {room.summary[language]}
      </p>

      {/* System chips */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        {room.systems.map((sys) => (
          <span
            key={sys}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
              isNetwork
                ? 'bg-white/10 text-slate-200'
                : 'bg-[var(--color-ash)] text-[var(--color-obsidian)]'
            }`}
          >
            {sys}
          </span>
        ))}
      </div>

      {/* Key metrics */}
      <div
        className={`rounded-[6px] border p-2 text-[11px] space-y-0.5 mb-3 ${
          isNetwork
            ? 'border-white/10 bg-white/5'
            : 'border-[var(--color-hairline)] bg-[var(--color-ash)]'
        }`}
      >
        <div className="flex justify-between">
          <span className="opacity-75">
            {language === 'es' ? 'Objetos / equipos (demo)' : 'Objects / equipment (demo)'}:
          </span>
          <span className="font-semibold">{room.templateSpec.objects.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">VRF / IDF:</span>
          <span className="font-semibold">
            {room.vrf} · {room.idf}
          </span>
        </div>
        {room.coreNodeId && (
          <div className="flex justify-between">
            <span className="opacity-75">
              {language === 'es' ? 'Nodo de núcleo' : 'Core Node'}:
            </span>
            <span className="font-semibold text-sky-400">{room.coreNodeId}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => enterTenant(room.id)}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
            isNetwork
              ? 'bg-sky-500 text-slate-950 hover:bg-sky-400'
              : 'bg-[var(--color-obsidian)] text-[var(--color-paper)] hover:bg-neutral-800'
          }`}
        >
          <DoorOpen className="h-4 w-4" />
          <span>{language === 'es' ? 'Entrar a la sala' : 'Enter room'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode(isNetwork ? 'passenger' : 'network')}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
            isNetwork
              ? 'border-white/15 bg-white/5 text-slate-100 hover:bg-white/10'
              : 'border-[var(--color-hairline)] bg-[var(--color-paper)] text-[var(--color-obsidian)] hover:bg-[var(--color-ash)]'
          }`}
        >
          <Network className="h-3.5 w-3.5" />
          <span>
            {isNetwork
              ? language === 'es'
                ? 'Ver en Lente Pasajeros'
                : 'View in Passenger Lens'
              : language === 'es'
                ? 'Ver su comunicación'
                : 'View its network'}
          </span>
        </button>

        {useCaseLabel && room.useCase && (
          <button
            type="button"
            onClick={() => setActiveUseCaseModal(room.useCase!)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-4 py-1.5 text-[12px] font-medium text-rose-400 hover:bg-rose-500/25 transition-colors cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>{useCaseLabel}</span>
          </button>
        )}
      </div>
    </MobileBottomSheet>
  );
}
