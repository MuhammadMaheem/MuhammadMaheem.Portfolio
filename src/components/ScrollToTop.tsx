import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 font-body text-[10px] tracking-widest uppercase px-3 py-2 border border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)] bg-[var(--color-bg-surface)]/80 backdrop-blur-sm transition-colors"
          aria-label="Scroll to top"
        >
          ↑ Top
        </motion.button>
      )}
    </AnimatePresence>
  );
}
