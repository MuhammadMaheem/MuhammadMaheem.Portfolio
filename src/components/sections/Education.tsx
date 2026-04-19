import { motion } from 'framer-motion';
import { GraduationCap, Calendar, MapPin, BookOpen } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';

const subjects = [
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'Data Structures',
  'Algorithms',
  'Linear Algebra',
  'Probability & Statistics',
];

export function Education() {
  const [ref, isInView] = useInView<HTMLElement>();

  return (
    <section id="education" ref={ref} className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Education"
          subtitle="My academic journey in the field of Artificial Intelligence"
          sectionNumber="05"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-3xl"
        >
          <Card className="p-8 relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 w-16 h-[2px] bg-[var(--color-accent-purple)]" />

            <div className="flex flex-col md:flex-row gap-8">
              {/* University Icon */}
              <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
                <div className="w-20 h-20 border border-[var(--color-border-strong)] flex items-center justify-center">
                  <GraduationCap className="w-9 h-9 text-[var(--color-accent-purple)]" />
                </div>
              </motion.div>

              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-1">
                  Bachelor&apos;s in Artificial Intelligence
                </h3>
                <p className="font-body text-sm text-[var(--color-accent-blue)] mb-5">
                  Superior University, Lahore
                </p>

                {/* Meta info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 font-body text-xs text-[var(--color-text-muted)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-accent-purple)]" />
                    2024 - 2028 | 4th Semester (Current)
                  </div>
                  <div className="flex items-center gap-2 font-body text-xs text-[var(--color-text-muted)]">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-accent-purple)]" />
                    Lahore, Pakistan | CGPA 3.58 / 4.0
                  </div>
                </div>

                {/* Subjects */}
                <div className="border-t border-[var(--color-border-subtle)] pt-5">
                  <h4 className="flex items-center gap-2 font-body text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent-purple)]" />
                    Key Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject, index) => (
                      <motion.span
                        key={subject}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                        transition={{ delay: 0.4 + index * 0.04 }}
                        className="font-body text-xs px-3 py-1.5 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
                      >
                        {subject}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
