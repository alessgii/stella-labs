import { useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MobileBottomSheetProps {
  ariaLabel: string;
  dark?: boolean;
  zIndexClass?: string;
  desktopWidthClass?: string;
  desktopPositionClass?: string;
  mobileMaxHeightClass?: string;
  peekTitle: string;
  peekSubtitle?: string;
  peekAction?: ReactNode;
  defaultExpandedMobile?: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export function MobileBottomSheet({
  ariaLabel,
  dark = false,
  zIndexClass = 'z-20',
  desktopWidthClass = 'sm:w-96',
  desktopPositionClass = 'sm:bottom-4 sm:right-4',
  mobileMaxHeightClass = 'max-h-[48vh]',
  peekTitle,
  peekSubtitle,
  peekAction,
  defaultExpandedMobile = false,
  children,
}: MobileBottomSheetProps) {
  const [expanded, setExpanded] = useState(defaultExpandedMobile);
  const touchStartY = useRef<number | null>(null);

  return (
    <aside
      aria-label={ariaLabel}
      className={`fixed bottom-0 inset-x-0 sm:inset-x-auto ${desktopPositionClass} ${zIndexClass} w-full ${desktopWidthClass} rounded-t-[14px] sm:rounded-[6px] border backdrop-blur-md transition-all ${
        dark
          ? 'border-white/15 bg-slate-950/94 text-slate-100'
          : 'border-[var(--color-hairline)] bg-[var(--color-paper)]/98 text-[var(--color-obsidian)]'
      }`}
    >
      {/* Mobile-only collapsible peek bar with swipe + tap */}
      <div
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          if (touchStartY.current === null) return;
          const dy = e.changedTouches[0].clientY - touchStartY.current;
          if (dy < -24) setExpanded(true);
          if (dy > 24) setExpanded(false);
          touchStartY.current = null;
        }}
        className="sm:hidden px-3.5 pt-2 pb-2.5"
      >
        <div className="w-full flex flex-col items-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={peekTitle}
            className="w-full flex justify-center py-0.5 cursor-pointer"
          >
            <span
              className={`h-1 w-9 rounded-full mb-1.5 ${
                dark ? 'bg-white/25' : 'bg-black/20'
              }`}
            />
          </button>
          <div className="w-full flex items-center justify-between gap-2 text-left">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="min-w-0 flex-1 text-left cursor-pointer"
            >
              <div className="text-[14px] font-semibold truncate">{peekTitle}</div>
              {peekSubtitle && (
                <div
                  className={`text-[11px] truncate ${
                    dark ? 'text-slate-400' : 'text-[var(--color-graphite)]'
                  }`}
                >
                  {peekSubtitle}
                </div>
              )}
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              {peekAction}
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="p-0.5 cursor-pointer"
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4 opacity-70" />
                ) : (
                  <ChevronUp className="h-4 w-4 opacity-70" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content: always visible on sm+, collapsible on mobile */}
      <div
        className={`${
          expanded ? `block ${mobileMaxHeightClass} overflow-y-auto px-4 pb-4 pt-1` : 'hidden'
        } sm:block sm:max-h-[calc(100vh-8.5rem)] sm:overflow-y-auto sm:p-4`}
      >
        {children}
      </div>
    </aside>
  );
}
