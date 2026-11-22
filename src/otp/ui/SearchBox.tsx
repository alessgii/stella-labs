import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { SALIDAS_DEVICES } from '../data/devices';
import { POIS, type POI } from '../data/poi';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { useAppStore } from '../store/useAppStore';

export function SearchBox() {
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const selectPoi = useAppStore((s) => s.selectPoi);
  const selectDevice = useAppStore((s) => s.selectDevice);
  const startRouteToPoi = useAppStore((s) => s.startRouteToPoi);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = language === 'es' ? es : en;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && mode === 'passenger') {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return POIS.filter((p) => {
      const nameMatch =
        p.name.es.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q);
      const catMatch =
        p.category.toLowerCase().includes(q) ||
        t.passenger.categories[p.category].toLowerCase().includes(q);
      const idMatch = p.id.toLowerCase().includes(q);
      return nameMatch || catMatch || idMatch;
    }).slice(0, 8);
  }, [query, t]);

  const deviceResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !q.includes('fids')) return [];
    return SALIDAS_DEVICES.filter(
      (d) =>
        d.subsystemId === 'fids' &&
        (d.id.toLowerCase().includes(q) ||
          d.name.es.toLowerCase().includes(q) ||
          d.name.en.toLowerCase().includes(q)),
    ).slice(0, 4);
  }, [query]);

  if (mode !== 'passenger' || focusedZoneId === 'ssei' || focusedZoneId === 'cargo') return null;

  const pickPoi = (poi: POI) => {
    selectPoi(poi.id, true, true);
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
  };

  const quickPick = (matchFn: (p: POI) => boolean, routeImmediately = false) => {
    const hit = POIS.find(matchFn);
    if (!hit) return;
    selectPoi(hit.id, true, true);
    if (routeImmediately) startRouteToPoi(hit.id);
    setFocused(false);
  };

  return (
    <div className="fixed top-29 left-4 z-20 w-[calc(100vw-2rem)] sm:w-88 flex flex-col gap-1.5">
      {/* Search Pill Input (DESIGN.md spec) */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[var(--color-smoke)] stroke-[1.75]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 180)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.passenger.searchPlaceholder}
          aria-label={t.passenger.searchPlaceholder}
          className="w-full rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/96 pl-10 pr-9 py-2 text-[14px] text-[var(--color-obsidian)] placeholder:text-[var(--color-graphite)] focus:outline-none backdrop-blur-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 rounded-full p-0.5 text-[var(--color-graphite)] hover:bg-[var(--color-ash)] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Quick Chips: single horizontal row on mobile */}
      <div className="flex flex-nowrap sm:flex-wrap gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap">
        <button
          type="button"
          onClick={() => quickPick((p) => p.id === 'gate-24', true)}
          className="rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/95 px-2.5 py-1 text-[12px] font-medium text-[var(--color-obsidian)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          {t.passenger.quickChips.gate}
        </button>
        <button
          type="button"
          onClick={() => quickPick((p) => p.id === 'poi-wc-dep-n')}
          className="rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/95 px-2.5 py-1 text-[12px] font-medium text-[var(--color-obsidian)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          {t.passenger.quickChips.restrooms}
        </button>
        <button
          type="button"
          onClick={() => quickPick((p) => p.id === 'poi-food-court')}
          className="rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/95 px-2.5 py-1 text-[12px] font-medium text-[var(--color-obsidian)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          {t.passenger.quickChips.food}
        </button>
        <button
          type="button"
          onClick={() => quickPick((p) => p.id === 'poi-shop-dutyfree-gal')}
          className="rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/95 px-2.5 py-1 text-[12px] font-medium text-[var(--color-obsidian)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          {t.passenger.quickChips.shops}
        </button>
        <button
          type="button"
          onClick={() => quickPick((p) => p.id === 'poi-shuttle-train')}
          className="rounded-full border border-[var(--color-hairline)] bg-[var(--color-paper)]/95 px-2.5 py-1 text-[12px] font-medium text-[var(--color-obsidian)] hover:bg-[var(--color-ash)] cursor-pointer"
        >
          {t.passenger.quickChips.transport}
        </button>
        {focusedZoneId === 'departures' && (
          <button
            type="button"
            onClick={() => {
              selectPoi(null);
              selectDevice('FIDS-003', true);
            }}
            className="rounded-full border border-violet-300 bg-violet-50 px-2.5 py-1 text-[12px] font-medium text-violet-900 hover:bg-violet-100 cursor-pointer"
          >
            FIDS-003
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {focused && (results.length > 0 || deviceResults.length > 0) && (
        <ul
          role="listbox"
          className="max-h-64 overflow-y-auto rounded-[6px] border border-[var(--color-hairline)] bg-[var(--color-paper)] p-1 divide-y divide-[var(--color-hairline)]"
        >
          {deviceResults.map((dev) => (
            <li key={dev.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectPoi(null);
                  selectDevice(dev.id, true);
                  setQuery('');
                  setFocused(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-[var(--color-ash)] rounded-[4px] cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-violet-800 truncate">
                    {dev.name[language]}
                  </div>
                  <div className="text-[11px] text-[var(--color-graphite)]">
                    FIDS · Salidas · {t.floors[dev.floor]}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-800">
                  {dev.floor}
                </span>
              </button>
            </li>
          ))}
          {results.map((poi) => (
            <li key={poi.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickPoi(poi);
                }}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-[var(--color-ash)] rounded-[4px] cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[var(--color-obsidian)] truncate">
                    {poi.name[language]}
                  </div>
                  <div className="text-[11px] text-[var(--color-graphite)]">
                    {t.passenger.categories[poi.category]} · {t.floors[poi.floor]}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--color-ash)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-obsidian)]">
                  {poi.floor}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
