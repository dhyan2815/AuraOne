// Tick a number up/down to its new value instead of snapping.

import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

const Count = ({ n }: { n: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) { el.textContent = String(n); from.current = n; return; }
    const controls = animate(from.current, n, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => { el.textContent = String(Math.round(v)); from.current = v; },
    });
    return () => controls.stop();
  }, [n, reduce]);

  return <span ref={ref} className="tabular-nums">{n}</span>;
};

export default Count;
