/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from 'react';

/* ============================================================================
   Count-up hook for the hero "live" numbers - respects reduced motion.
   ============================================================================ */

export function useCountUp(target: number, durationMs = 1500) {
  const [value, setValue] = useState(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return prefersReduced ? target : 0;
  });

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      return;
    }

    let raf = 0;
    let start = 0;

    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/* ============================================================================
   Scroll-reveal wrapper
   ============================================================================ */

export const Reveal: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`mv-reveal ${inView ? 'mv-in-view' : ''} ${className}`}>
      {children}
    </div>
  );
};
