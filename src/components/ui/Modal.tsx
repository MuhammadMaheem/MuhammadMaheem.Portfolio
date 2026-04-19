import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  gradient?: string;
}

export function Modal({ isOpen, onClose, children, title, gradient }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--color-bg-primary)]/90 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]"
          >
            {/* Top accent bar */}
            {gradient && (
              <div
                className={cn(
                  'absolute top-0 left-0 right-0 h-1',
                  `bg-gradient-to-r ${gradient}`
                )}
              />
            )}
            <div className="relative">
              <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[var(--color-bg-surface)]/95 backdrop-blur-md border-b border-[var(--color-border-subtle)]">
                {title && (
                  <h2 className="text-xl font-display font-bold text-[var(--color-text-primary)]">{title}</h2>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 pb-6">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
