import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  sectionNumber?: string;
}

export function SectionTitle({ title, subtitle, sectionNumber }: SectionTitleProps) {
  const [ref, isInView] = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="mb-16 md:mb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Section number watermark */}
        {sectionNumber && (
          <span
            className="absolute -top-6 -left-2 md:-top-10 md:-left-4 text-[5rem] md:text-[8rem] font-display font-bold leading-none pointer-events-none select-none"
            style={{
              color: 'var(--color-border-subtle)',
              opacity: 0.4,
              zIndex: 0,
            }}
          >
            {sectionNumber}
          </span>
        )}

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-[var(--color-text-primary)] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm md:text-base text-[var(--color-text-secondary)] font-body max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
          {/* Gold underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-[2px] w-16 md:w-20 mt-4 bg-[var(--color-accent-purple)] origin-left"
          />
        </div>
      </motion.div>
    </div>
  );
}
