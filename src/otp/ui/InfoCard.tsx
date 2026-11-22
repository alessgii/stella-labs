import { Clock, Navigation, Store, X } from 'lucide-react';
import { POIS } from '../data/poi';
import { getTenantTemplateSpec } from '../data/templates';
import { getTenantById } from '../data/tenants';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

export function InfoCard() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const selectedPoiId = useAppStore((s) => s.selectedPoiId);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const routeTargetId = useAppStore((s) => s.routeTargetId);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const startRouteToPoi = useAppStore((s) => s.startRouteToPoi);
  const enterTenant = useAppStore((s) => s.enterTenant);

  if (mode !== 'passenger' || !selectedPoiId || focusedTenantId) return null;

  const poi = POIS.find((p) => p.id === selectedPoiId);
  if (!poi) return null;

  const tenant = getTenantById(poi.id);
  const t = language === 'es' ? es : en;

  const peekAction = tenant ? (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        enterTenant(tenant.id);
      }}
      className="rounded-full bg-[var(--color-obsidian)] px-3 py-1 text-[11px] font-medium text-[var(--color-paper)]"
    >
      {t.lod.enterTenant}
    </button>
  ) : poi.walkNodeId ? (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        startRouteToPoi(poi.id);
      }}
      className="rounded-full bg-[var(--color-obsidian)] px-3 py-1 text-[11px] font-medium text-[var(--color-paper)]"
    >
      {t.passenger.howToGetThere}
    </button>
  ) : null;

  return (
    <div className={routeTargetId ? 'hidden sm:block' : ''}>
      <MobileBottomSheet
        ariaLabel={poi.name[language]}
        desktopWidthClass="sm:w-88"
        peekTitle={poi.name[language]}
        peekSubtitle={`${t.passenger.categories[poi.category]} · ${t.floors[poi.floor]}`}
        peekAction={peekAction}
        defaultExpandedMobile={false}
      >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-[var(--color-ash)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-obsidian)]">
            {t.passenger.categories[poi.category]}
          </span>
          <span className="rounded-full border border-[var(--color-hairline)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-graphite)]">
            {t.floors[poi.floor]}
          </span>
          <span className="rounded-full bg-[var(--color-whisper)] px-2 py-0.5 text-[11px] text-[var(--color-graphite)]">
            {t.passenger.demoBadge}
          </span>
        </div>

        <button
          type="button"
          onClick={() => selectPoi(null)}
          aria-label="Cerrar tarjeta"
          className="rounded-full p-1 text-[var(--color-graphite)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h3 className="text-[18px] font-semibold tracking-[-0.01em] mb-1">
        {poi.name[language]}
      </h3>

      {poi.description && (
        <p className="text-[13px] leading-relaxed text-[var(--color-graphite)] mb-2">
          {poi.description[language]}
        </p>
      )}

      {poi.hours && (
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-graphite)] mb-3">
          <Clock className="h-3.5 w-3.5 stroke-[1.75]" />
          <span>
            {t.passenger.hours}: {poi.hours}
          </span>
        </div>
      )}

      {tenant && (() => {
        const spec = getTenantTemplateSpec(tenant.template, tenant.tier);
        const halfW = spec.width_m / 2;
        const halfD = spec.depth_m / 2;
        const furn = spec.objects.filter(
          (o) => o.category === 'furniture' || o.category === 'network',
        );
        return (
          <div className="mb-3 rounded-[6px] border border-[var(--color-hairline)] bg-[var(--color-ash)] p-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-graphite)] mb-1">
              <span>{language === 'es' ? 'Vista previa interior' : 'Interior preview'}</span>
              <span>
                {spec.width_m} × {spec.depth_m} m
              </span>
            </div>
            <svg
              viewBox={`${-halfW - 0.3} ${-halfD - 0.3} ${spec.width_m + 0.6} ${spec.depth_m + 0.6}`}
              className="w-full h-20 rounded bg-white border border-[var(--color-hairline)]"
            >
              <rect
                x={-halfW}
                y={-halfD}
                width={spec.width_m}
                height={spec.depth_m}
                fill={spec.tileColors[0]}
                stroke="#64748B"
                strokeWidth={0.1}
              />
              {furn.map((o) => (
                <rect
                  key={o.id}
                  x={o.position[0] - o.size[0] / 2}
                  y={o.position[2] - o.size[2] / 2}
                  width={o.size[0]}
                  height={o.size[2]}
                  fill={o.color}
                  rx={0.08}
                  opacity={0.9}
                />
              ))}
            </svg>
          </div>
        );
      })()}

      <div className="flex flex-col gap-2">
        {tenant && (
          <button
            type="button"
            onClick={() => enterTenant(tenant.id)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-obsidian)] bg-[var(--color-paper)] px-5 py-2 text-[14px] font-medium text-[var(--color-obsidian)] hover:bg-[var(--color-ash)] transition-colors cursor-pointer"
          >
            <Store className="h-4 w-4 stroke-[1.75]" />
            <span>{t.lod.enterTenant}</span>
          </button>
        )}

        {poi.walkNodeId && (
          <button
            type="button"
            onClick={() => startRouteToPoi(poi.id)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-obsidian)] px-5 py-2 text-[14px] font-medium text-[var(--color-paper)] hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Navigation className="h-4 w-4 stroke-[1.75]" />
            <span>{t.passenger.howToGetThere}</span>
          </button>
        )}
      </div>
      </MobileBottomSheet>
    </div>
  );
}
