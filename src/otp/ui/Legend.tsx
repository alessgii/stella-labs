import { ZONE_PALETTE, type ZoneCategory } from '../data/zones';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

const CATEGORIES: ZoneCategory[] = [
  'public',
  'facility',
  'commercial',
  'food',
  'airline',
];

export function Legend() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const activeZoneFilter = useAppStore((s) => s.activeZoneFilter);
  const setActiveZoneFilter = useAppStore((s) => s.setActiveZoneFilter);
  const selectedZoneId = useAppStore((s) => s.selectedZoneId);
  const selectedPoiId = useAppStore((s) => s.selectedPoiId);
  const selectedDeviceId = useAppStore((s) => s.selectedDeviceId);

  const hasBottomRightModal =
    selectedZoneId !== null ||
    selectedPoiId !== null ||
    selectedDeviceId !== null;

  if (mode !== 'passenger' || hasBottomRightModal) return null;

  const t = language === 'es' ? es : en;

  return (
    <div
      aria-label={t.passenger.legendTitle}
      className="fixed right-4 bottom-4 z-10 hidden md:flex flex-col gap-1 rounded-[6px] border border-[var(--color-hairline)] bg-[var(--color-paper)]/95 p-2.5 text-[12px] text-[var(--color-obsidian)] backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-0.5 px-1">
        <span className="inline-block rounded border border-[#383535] bg-[#FFF212] px-1.5 py-0.2 text-[10px] font-semibold text-[#1E293B]">
          GATES
        </span>
        <span className="font-medium text-[var(--color-graphite)]">
          {t.passenger.legendTitle}
        </span>
      </div>

      {CATEGORIES.map((cat) => {
        const token = ZONE_PALETTE[cat];
        const active = activeZoneFilter === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveZoneFilter(active ? null : cat)}
            aria-pressed={active}
            className={`flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors cursor-pointer ${
              active
                ? 'bg-[var(--color-obsidian)] text-[var(--color-paper)]'
                : 'hover:bg-[var(--color-ash)]'
            }`}
          >
            <span
              className="h-3 w-4 shrink-0 rounded-[2px] border"
              style={{
                backgroundColor: token.fill,
                borderColor: token.border,
              }}
            />
            <span className="font-medium">{token.label[language]}</span>
          </button>
        );
      })}
    </div>
  );
}
