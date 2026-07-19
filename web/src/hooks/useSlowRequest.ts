import { useEffect, useRef, useState } from 'react';

/**
 * Returns true once `active` has been true for longer than `thresholdMs`.
 * Used to show a "still working..." hint instead of leaving a bare spinner
 * during the free-tier cold start (Render's app server can take 50s+ to
 * wake up on the first request after idling).
 */
export function useSlowRequest(active: boolean, thresholdMs = 4000): boolean {
  const [slow, setSlow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setTimeout(() => setSlow(true), thresholdMs);
    } else {
      setSlow(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, thresholdMs]);

  return slow;
}
