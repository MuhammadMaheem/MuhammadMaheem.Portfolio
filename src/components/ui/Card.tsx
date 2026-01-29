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
        'relative overflow-hidden rounded-2xl',
        'bg-slate-900/50 backdrop-blur-sm border border-slate-700/50',
        'transition-colors duration-300',
        hoverable && 'cursor-pointer group hover:border-cyan-500/50',
        className
      )}
      whileHover={hoverable && !disableHoverTransform ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {gradient && (
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none',
            `bg-gradient-to-br ${gradient}`
          )}
        />
      )}
      <div className="relative z-10 pointer-events-none">{children}</div>
      {hoverable && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
        </div>
      )}
    </motion.div>
  );
}
