import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent
} from "react";

const STORAGE_KEY = "blindfold-sidebar-width";
const DEFAULT_WIDTH = 300;
const MIN_WIDTH = 240;
const MAX_WIDTH = 400;

function readStoredWidth() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  const parsed = saved ? Number.parseInt(saved, 10) : DEFAULT_WIDTH;

  if (!Number.isFinite(parsed)) {
    return DEFAULT_WIDTH;
  }

  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parsed));
}

export function useSidebarResize(enabled: boolean) {
  const [width, setWidth] = useState(readStoredWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, String(width));
  }, [enabled, width]);

  const shellStyle = enabled
    ? ({ "--sidebar-width": `${width}px` } as CSSProperties)
    : undefined;

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) {
        return;
      }

      event.preventDefault();

      const startX = event.clientX;
      const startWidth = width;

      setIsResizing(true);
      document.body.classList.add("is-sidebar-resizing");

      const onMove = (moveEvent: globalThis.PointerEvent) => {
        const nextWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, startWidth + (startX - moveEvent.clientX))
        );

        setWidth(nextWidth);
      };

      const onUp = () => {
        setIsResizing(false);
        document.body.classList.remove("is-sidebar-resizing");

        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [enabled, width]
  );

  return { sidebarWidth: width, isResizing, shellStyle, startResize };
}
