import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { skills } from '@/data/portfolio';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';
import { Monitor, Zap, Bot, Wrench } from 'lucide-react';

interface SkillTagProps {
  name: string;
  delay: number;
  isInView: boolean;
}

function SkillTag({ name, delay, isInView }: SkillTagProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="font-body text-xs px-4 py-2 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-green)] hover:text-[var(--color-accent-green)] transition-colors duration-300 cursor-default"
    >
      {name}
    </motion.div>
  );
}

interface SkillCategoryProps {
  title: string;
  items: { name: string; level: number }[];
  icon: React.ReactElement;
  delay: number;
  isInView: boolean;
}

function SkillCategory({ title, items, icon, delay, isInView }: SkillCategoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="p-6 h-full">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[var(--color-accent-green)]">{icon}</span>
          <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
            {title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((skill, index) => (
            <SkillTag
              key={skill.name}
              name={skill.name}
              delay={delay + index * 0.06}
              isInView={isInView}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export function Skills() {
  const [ref, isInView] = useInView<HTMLElement>();

  const categories = [
    {
      title: 'Programming Languages',
      items: skills.languages,
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      title: 'Frameworks & Libraries',
      items: skills.frameworks,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      title: 'AI & Machine Learning',
      items: skills.aiMl,
      icon: <Bot className="w-5 h-5" />,
    },
    {
      title: 'Tools & Technologies',
      items: skills.tools,
      icon: <Wrench className="w-5 h-5" />,
    },
  ];

  return (
    <section id="skills" ref={ref} className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Skills"
          subtitle="Technologies and tools I work with to bring ideas to life"
          sectionNumber="03"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((category, index) => (
            <SkillCategory
              key={category.title}
              {...category}
              delay={index * 0.12}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Tech Stack — horizontal row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 pt-10 border-t border-[var(--color-border-subtle)]"
        >
          <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-[var(--color-text-muted)] text-center mb-8">
            Technologies I Love Working With
          </h4>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Python',
              'FastAPI',
              'Next.js',
              'React',
              'TypeScript',
              'ChromaDB',
              'Groq',
              'LangGraph',
              'LangChain',
              'PostgreSQL',
            ].map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ delay: 0.8 + index * 0.04 }}
                whileHover={{ y: -3, borderColor: 'var(--color-accent-green)' }}
                className="font-body text-xs px-5 py-2.5 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] transition-colors duration-300 cursor-default"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
