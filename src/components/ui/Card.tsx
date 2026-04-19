import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  gradient?: string;
  disableHoverTransform?: boolean;
}

export function Card({
  children,
  className,
  onClick,
  hoverable = false,
  gradient,
  disableHoverTransform = false
}: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden',
        'bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]',
        'transition-colors duration-500',
        hoverable && 'cursor-pointer group hover:border-[var(--color-accent-blue)]',
        className
      )}
      whileHover={hoverable && !disableHoverTransform ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {gradient && (
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none',
            `bg-gradient-to-br ${gradient}`
          )}
        />
      )}
      {/* Corner accent */}
      {hoverable && (
        <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-[var(--color-accent-blue)]" />
          <div className="absolute top-0 right-0 h-full w-[1px] bg-[var(--color-accent-blue)]" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
