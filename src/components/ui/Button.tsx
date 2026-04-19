import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className,
  icon
}: ButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2 font-medium relative overflow-hidden',
    'font-body transition-all duration-300',
    'focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
    {
      'bg-[var(--color-accent-blue)] text-[var(--color-text-primary)] hover:bg-[#4a9bd9]':
        variant === 'primary',
      'bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)]':
        variant === 'secondary',
      'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-purple)] hover:bg-[var(--color-bg-surface)]':
        variant === 'ghost'
    },
    {
      'px-4 py-2 text-xs tracking-wider uppercase': size === 'sm',
      'px-8 py-3.5 text-sm tracking-widest uppercase': size === 'md',
      'px-10 py-4 text-sm tracking-widest uppercase': size === 'lg'
    },
    className
  );

  const content = (
    <>
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={baseStyles}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className={baseStyles}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
    >
      {content}
    </motion.button>
  );
}
