import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  const [ref, isInView] = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="text-center mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        {subtitle && (
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="h-1 w-24 mx-auto mt-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
      />
    </div>
  );
}
