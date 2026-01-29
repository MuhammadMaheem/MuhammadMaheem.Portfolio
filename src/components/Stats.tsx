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
      className="text-center p-6"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
        {count}{suffix}
      </div>
      <div className="text-slate-400 text-sm uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

export function Stats() {
  const [ref, isInView] = useInView<HTMLDivElement>();

  const stats = [
    { value: 8, label: 'Projects Completed', suffix: '+' },
    { value: 5, label: 'Technologies Mastered', suffix: '+' },
    { value: 4, label: 'Semesters Completed', suffix: '' },
    { value: 100, label: 'Learning Enthusiasm', suffix: '%' }
  ];

  return (
    <div ref={ref} className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50"
        >
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              {...stat}
              isInView={isInView}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
