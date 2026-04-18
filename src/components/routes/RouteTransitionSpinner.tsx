import { Spin } from 'antd';
import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 250;

export default function RouteTransitionSpinner() {
  const isNavigating = useRouterState({
    select: (state) => state.isLoading || state.isTransitioning,
  });
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const visibleSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (isNavigating) {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (!visible && showTimerRef.current === null) {
        showTimerRef.current = window.setTimeout(() => {
          visibleSinceRef.current = Date.now();
          setVisible(true);
          showTimerRef.current = null;
        }, SHOW_DELAY_MS);
      }

      return;
    }

    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (!visible) {
      return;
    }

    const elapsed = visibleSinceRef.current ? Date.now() - visibleSinceRef.current : 0;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    hideTimerRef.current = window.setTimeout(() => {
      visibleSinceRef.current = null;
      setVisible(false);
      hideTimerRef.current = null;
    }, remaining);
  }, [isNavigating, visible]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return <Spin fullscreen size="large" aria-live="polite" aria-busy="true" />;
}
