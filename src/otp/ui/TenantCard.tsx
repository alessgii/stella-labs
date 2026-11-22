import { Clock, Cpu, Lock, Navigation, Network, Store, X } from 'lucide-react';
import { POIS } from '../data/poi';
import { TENANT_TIER_SPECS, type TenantTemplate } from '../data/tenants';
import { getInspectableSpace } from '../lib/inspectableSpace';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';
import { MobileBottomSheet } from './MobileBottomSheet';

const TEMPLATE_LABELS: Record<TenantTemplate, { es: string; en: string }> = {
  cafe: { es: 'Cafetería', en: 'Café' },
  tienda: { es: 'Tienda', en: 'Shop' },
  restaurante: { es: 'Restaurante', en: 'Restaurant' },
  farmacia: { es: 'Farmacia', en: 'Pharmacy' },
  cambio: { es: 'Casa de cambio', en: 'Currency Exchange' },
  'duty-free': { es: 'Duty Free', en: 'Duty Free' },
  'sala-vip': { es: 'Sala VIP', en: 'VIP Lounge' },
  'mostrador-aerolinea': { es: 'Mostrador aerolínea', en: 'Airline Desk' },
};

export function TenantCard() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedTenantId = useAppStore((s) => s.focusedTenantId);
  const selectedLocalObjectId = useAppStore((s) => s.selectedLocalObjectId);
  const exitTenant = useAppStore((s) => s.exitTenant);
  const startRouteToPoi = useAppStore((s) => s.startRouteToPoi);
  const selectLocalObject = useAppStore((s) => s.selectLocalObject);
  const setMode = useAppStore((s) => s.setMode);

  if (mode !== 'passenger' || !focusedTenantId || selectedLocalObjectId) return null;

  const space = getInspectableSpace(focusedTenantId);
  if (!space) return null;

  const tenant = space.tenant;
  const poi = tenant ? POIS.find((p) => p.id === tenant.poiId) : undefined;
  const t = language === 'es' ? es : en;
  const tierSpec = tenant ? TENANT_TIER_SPECS[tenant.tier] : undefined;

  return (
    <MobileBottomSheet
      ariaLabel={space.name[language]}
      desktopWidthClass="sm:w-88"
      peekTitle={space.name[language]}
      peekSubtitle={
        tierSpec
          ? `${space.idf} (${space.trayDistance_m} m) · ${tierSpec.label[language]}`
          : `${space.idf} · ${space.vrf}`
      }
      peekAction={
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMode('network');
          }}
          className="rounded-full bg-[var(--color-obsidian)] px-3 py-1 text-[11px] font-medium text-[var(--color-paper)]"
        >
          {language === 'es' ? 'Ver red' : 'Network'}
        </button>
      }
      defaultExpandedMobile={false}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {tenant ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ash)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-obsidian)]">
              <Store className="h-3 w-3 stroke-[1.75]" />
              <span>{TEMPLATE_LABELS[tenant.template][language]}</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                space.access === 'restricted'
                  ? 'bg-amber-500/15 text-amber-800'
                  : 'bg-emerald-500/15 text-emerald-800'
              }`}
            >
              <Lock className="h-3 w-3 stroke-[1.75]" />
              <span>
                {space.access === 'restricted'
                  ? language === 'es'
                    ? 'Vista informativa · acceso restringido'
                    : 'Informative view · restricted access'
                  : language === 'es'
                    ? 'Acceso público'
                    : 'Public access'}
              </span>
            </span>
          )}
          <span className="rounded-full border border-[var(--color-hairline)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-graphite)]">
            {t.floors[space.floor]}
          </span>
          <span className="rounded-full bg-[var(--color-whisper)] px-2 py-0.5 text-[11px] text-[var(--color-graphite)]">
            {t.passenger.demoBadge}
          </span>
        </div>

        <button
          type="button"
          onClick={exitTenant}
          aria-label={t.lod.exitTenant}
          className="rounded-full p-1 text-[var(--color-graphite)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h3 className="text-[18px] font-semibold tracking-[-0.01em] mb-1">
        {space.name[language]}
      </h3>

      {(poi?.description || space.summary) && (
        <p className="text-[13px] leading-relaxed text-[var(--color-graphite)] mb-2">
          {(poi?.description ?? space.summary)?.[language]}
        </p>
      )}

      {poi?.hours && (
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-graphite)] mb-2">
          <Clock className="h-3.5 w-3.5 stroke-[1.75]" />
          <span>
            {t.passenger.hours}: {poi.hours}
          </span>
        </div>
      )}

      <div className="rounded-[6px] bg-[var(--color-ash)] px-3 py-2 text-[12px] text-[var(--color-graphite)] mb-3">
        <div className="flex items-center justify-between">
          <span>{t.tenant.servedByIdf}:</span>
          <span className="font-medium text-[var(--color-obsidian)]">
            {space.idf} ({space.trayDistance_m} m)
          </span>
        </div>
        {tierSpec ? (
          <div className="flex items-center justify-between mt-0.5">
            <span>{t.tenant.tierLabel}:</span>
            <button
              type="button"
              onClick={() => setMode('network')}
              className="font-medium text-[var(--color-obsidian)] underline decoration-black/30 underline-offset-2 hover:text-sky-700 cursor-pointer"
            >
              {tierSpec.label[language]} · {language === 'es' ? 'Ver planes' : 'View plans'} →
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-0.5">
            <span>VRF:</span>
            <span className="font-medium text-[var(--color-obsidian)]">{space.vrf}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            const firstHotspot = space.spec.objects.find((o) => o.isHotspot);
            if (firstHotspot) selectLocalObject(firstHotspot.id);
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-obsidian)] px-5 py-2 text-[14px] font-medium text-[var(--color-paper)] hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Cpu className="h-4 w-4 stroke-[1.75]" />
          <span>{language === 'es' ? 'Inspeccionar equipos' : 'Inspect equipment'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('network')}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)] px-5 py-2 text-[13px] font-medium text-[var(--color-obsidian)] hover:bg-[var(--color-ash)] transition-colors cursor-pointer"
        >
          <Network className="h-4 w-4 stroke-[1.75]" />
          <span>{t.tenant.viewComms}</span>
        </button>

        {poi?.walkNodeId && (
          <button
            type="button"
            onClick={() => startRouteToPoi(poi.id)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)] px-5 py-2 text-[13px] font-medium text-[var(--color-obsidian)] hover:bg-[var(--color-ash)] transition-colors cursor-pointer"
          >
            <Navigation className="h-4 w-4 stroke-[1.75]" />
            <span>{t.passenger.howToGetThere}</span>
          </button>
        )}
      </div>
    </MobileBottomSheet>
  );
}
