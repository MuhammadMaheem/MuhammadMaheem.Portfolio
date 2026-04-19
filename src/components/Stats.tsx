import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { useState, useEffect } from 'react';

interface StatItemProps {
  value: number;
  label: string;
  suffix?: string;
  isInView: boolean;
  delay: number;
}

function StatItem({ value, label, suffix = '', isInView, delay }: StatItemProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay, duration: 0.5 }}
      className="text-center px-4 py-6 relative"
    >
      <div className="font-display text-4xl md:text-5xl font-bold text-[var(--color-accent-purple)] mb-2">
        {count}
        {suffix}
      </div>
      <div className="font-body text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase">
        {label}
      </div>
    </motion.div>
  );
}

export function Stats() {
  const [ref, isInView] = useInView<HTMLDivElement>();

  const stats = [
    { value: 2, label: 'Internships Completed', suffix: '' },
    { value: 8, label: 'REST API Endpoints Shipped', suffix: '+' },
    { value: 39, label: 'Hadiths Indexed', suffix: 'K+' },
    { value: 100, label: 'DQN Training Episodes', suffix: 'K+' },
  ];

  return (
    <div ref={ref} className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[var(--color-border-subtle)]"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative"
              style={{
                borderRight:
                  index < stats.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              }}
            >
              <StatItem key={stat.label} {...stat} isInView={isInView} delay={index * 0.1} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
