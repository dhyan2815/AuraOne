import { useEffect, useRef, useState } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import TopBar from './TopBar';
import { sectionFor } from './sections';

const Layout = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const { pathname } = useLocation();
  const section = sectionFor(pathname);
  const reduceMotion = useReducedMotion();
  const outlet = useOutlet();

  // Navigation direction by route depth: deeper slides in from the right, back from the left.
  const depth = pathname.split('/').filter(Boolean).length;
  const nav = useRef({ path: pathname, depth, dir: 0 });
  if (nav.current.path !== pathname) {
    nav.current = { path: pathname, depth, dir: Math.sign(depth - nav.current.depth) };
  }
  const dir = nav.current.dir;

  // Skip the colour flood on first paint; only section changes flood.
  const lastSection = useRef(section.key);
  const [flood, setFlood] = useState<string | null>(null);
  useEffect(() => {
    if (lastSection.current !== section.key) {
      lastSection.current = section.key;
      if (!reduceMotion) setFlood(section.key);
    }
  }, [section.key, reduceMotion]);

  const pageVariants = {
    initial: (d: number) => ({ opacity: 0, x: reduceMotion ? 0 : d * 48, y: reduceMotion || d ? 0 : 24 }),
    animate: {
      opacity: 1, x: 0, y: 0,
      transition: { duration: reduceMotion ? 0.15 : 0.5, ease: [0.2, 0.8, 0.3, 1], delay: flood ? 0.3 : 0 },
    },
    exit: (d: number) => ({ opacity: 0, x: reduceMotion ? 0 : -d * 32, transition: { duration: 0.18, ease: 'easeIn' } }),
  };

  return (
    <div className={`${section.cls} min-h-screen overflow-x-hidden bg-water text-ink transition-colors duration-300`}>
      <TopBar theme={theme} onToggleTheme={toggleTheme} />

      <AnimatePresence>
        {flood && (
          <motion.div
            key={flood}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-30 bg-sec"
            initial={{ clipPath: 'circle(0% at 40% 40px)', opacity: 1 }}
            animate={{ clipPath: 'circle(150% at 40% 40px)', opacity: [1, 1, 0] }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            onAnimationComplete={() => setFlood(null)}
          />
        )}
      </AnimatePresence>

      <div aria-hidden="true" className="lm-lobe-br" />

      <main className="relative z-[1]">
        <AnimatePresence mode="popLayout" custom={dir}>
          <motion.div
            key={pathname}
            className="lm-main min-w-0"
            custom={dir}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
