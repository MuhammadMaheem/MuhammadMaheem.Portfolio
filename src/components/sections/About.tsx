import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Calendar, Code2, Brain, Rocket } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { personalInfo, interests, softSkills } from '@/data/portfolio';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';

export function About() {
  const [ref, isInView] = useInView<HTMLElement>();

  return (
    <section id="about" ref={ref} className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="About"
          subtitle="Passionate AI developer building the future with code and creativity"
          sectionNumber="01"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info Card — spans 7 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <Card className="p-8 h-full">
              {/* Avatar + name row */}
              <div className="flex items-start gap-5 mb-8">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-20 h-20 flex items-center justify-center text-2xl font-display font-bold text-[var(--color-text-primary)]"
                    style={{
                      border: '2px solid var(--color-border-strong)',
                    }}
                  >
                    MM
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
                    {personalInfo.name}
                  </h3>
                  <p className="font-body text-sm text-[var(--color-accent-blue)] mt-0.5">
                    {personalInfo.title}
                  </p>
                </div>
              </div>

              <div className="max-w-3xl">
                <p className="font-body text-sm text-[var(--color-text-secondary)] leading-relaxed mb-8">
                  I&apos;m an AI Developer and Machine Learning Engineer focused on production-grade
                  RAG systems, LLM evaluation workflows, and full-stack SaaS delivery. I currently
                  ship real systems as a paid intern while completing my BSc in Artificial
                  Intelligence at Superior University.
                </p>
              </div>

              {/* Info rows */}
              <div className="space-y-4">
                {[
                  { icon: <MapPin className="w-4 h-4" />, text: personalInfo.location },
                  { icon: <GraduationCap className="w-4 h-4" />, text: '4th Semester — AI Major' },
                  { icon: <Calendar className="w-4 h-4" />, text: `${personalInfo.age} years old` },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 font-body text-sm text-[var(--color-text-secondary)]"
                  >
                    <span className="text-[var(--color-accent-purple)]">{icon}</span>
                    {text}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* What I Do — spans 5 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <Card className="p-8 h-full">
              <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-[var(--color-accent-blue)]" />
                What I Do
              </h3>

              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: <Brain className="w-6 h-6" />,
                    title: 'RAG & LLM Systems',
                    desc: 'Grounded retrieval, embedding pipelines, and quality-gated evaluation',
                    color: 'var(--color-accent-green)',
                  },
                  {
                    icon: <Code2 className="w-6 h-6" />,
                    title: 'AI SaaS Engineering',
                    desc: 'FastAPI + Next.js production systems with secure APIs and dashboards',
                    color: 'var(--color-accent-purple)',
                  },
                ].map(({ icon, title, desc, color }) => (
                  <div
                    key={title}
                    className="p-4 border border-[var(--color-border-subtle)]"
                    style={{ borderLeft: `2px solid ${color}` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5" style={{ color }}>
                        {icon}
                      </span>
                      <div>
                        <h4 className="font-body text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">
                          {title}
                        </h4>
                        <p className="font-body text-xs text-[var(--color-text-muted)]">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Soft Skills */}
              <h4 className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] mb-3">
                Soft Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {softSkills.map((skill) => (
                  <span
                    key={skill}
                    className="font-body text-xs px-3 py-1.5 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Interests — full width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-12"
          >
            <Card className="p-8">
              <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-6">
                Interests & Hobbies
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {interests.map((interest, index) => (
                  <motion.div
                    key={interest.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.4 + index * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="p-4 border border-[var(--color-border-subtle)] text-center hover:border-[var(--color-accent-blue)] transition-colors duration-300"
                  >
                    <span className="text-2xl block mb-2">{interest.icon}</span>
                    <span className="font-body text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase">
                      {interest.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
