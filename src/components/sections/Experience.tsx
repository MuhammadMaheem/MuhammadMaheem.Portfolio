import { motion } from 'framer-motion';
import { BriefcaseBusiness, Calendar, Building2 } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { experiences } from '@/data/portfolio';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';

export function Experience() {
  const [ref, isInView] = useInView<HTMLElement>();

  return (
    <section id="experience" ref={ref} className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Experience"
          subtitle="Production work across AI systems, RAG pipelines, and full-stack SaaS delivery"
          sectionNumber="02"
        />

        <div className="space-y-5 max-w-5xl">
          {experiences.map((experience, index) => (
            <motion.div
              key={`${experience.company}-${experience.role}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.55, delay: 0.1 + index * 0.1 }}
            >
              <Card className="p-7">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      <BriefcaseBusiness className="w-5 h-5 text-[var(--color-accent-blue)]" />
                      {experience.role}
                    </h3>
                    <p className="font-body text-sm text-[var(--color-accent-purple)] mt-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {experience.company}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="font-body text-xs text-[var(--color-text-muted)] tracking-wider uppercase flex items-center md:justify-end gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {experience.period}
                    </p>
                    <p className="font-body text-xs text-[var(--color-accent-blue)] mt-1">
                      {experience.mode}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5">
                  {experience.highlights.map((highlight, highlightIndex) => (
                    <li
                      key={`${experience.company}-highlight-${highlightIndex}`}
                      className="font-body text-sm text-[var(--color-text-secondary)] flex items-start gap-2"
                    >
                      <span className="w-1 h-1 mt-2 bg-[var(--color-accent-purple)] flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
