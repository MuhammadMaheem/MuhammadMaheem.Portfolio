import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { skills } from '@/data/portfolio';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';
import { Monitor, Zap, Bot, Wrench, Code, Atom, Flame, Eye, Database, Package, Rocket, BarChart, Link, Calculator } from 'lucide-react';

interface SkillTagProps {
  name: string;
  delay: number;
  isInView: boolean;
  color: string;
  icon: React.ReactElement;
}

function SkillTag({ name, delay, isInView, color, icon }: SkillTagProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`group relative flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br ${color} cursor-pointer transition-shadow hover:shadow-lg hover:shadow-cyan-500/20`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-white font-medium text-sm">{name}</span>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </motion.div>
  );
}

interface SkillCategoryProps {
  title: string;
  items: { name: string; level: number }[];
  color: string;
  iconSet: React.ReactElement[];
  categoryIcon: React.ReactElement;
  delay: number;
  isInView: boolean;
}

function SkillCategory({ title, items, color, iconSet, categoryIcon, delay, isInView }: SkillCategoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="p-6 h-full">
        <div className="flex items-center gap-3 mb-6">
          <motion.span 
            className="text-3xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {categoryIcon}
          </motion.span>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {items.map((skill, index) => (
            <SkillTag
              key={skill.name}
              name={skill.name}
              delay={delay + index * 0.08}
              isInView={isInView}
              color={color}
              icon={iconSet[index % iconSet.length]}
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
      color: 'from-cyan-600/90 to-blue-600/90',
      categoryIcon: <Monitor className="w-6 h-6" />,
      iconSet: [<Code className="w-4 h-4" />, <Code className="w-4 h-4" />, <Code className="w-4 h-4" />]
    },
    {
      title: 'Frameworks & Libraries',
      items: skills.frameworks,
      color: 'from-purple-600/90 to-pink-600/90',
      categoryIcon: <Zap className="w-6 h-6" />,
      iconSet: [<Atom className="w-4 h-4" />, <Code className="w-4 h-4" />, <Package className="w-4 h-4" />, <Flame className="w-4 h-4" />, <Database className="w-4 h-4" />]
    },
    {
      title: 'AI & Machine Learning',
      items: skills.aiMl,
      color: 'from-green-600/90 to-emerald-600/90',
      categoryIcon: <Bot className="w-6 h-6" />,
      iconSet: [<Code className="w-4 h-4" />, <Eye className="w-4 h-4" />, <Database className="w-4 h-4" />, <Code className="w-4 h-4" />, <Code className="w-4 h-4" />]
    },
    {
      title: 'Tools & Technologies',
      items: skills.tools,
      color: 'from-orange-600/90 to-red-600/90',
      categoryIcon: <Wrench className="w-6 h-6" />,
      iconSet: [<Package className="w-4 h-4" />, <Database className="w-4 h-4" />, <Eye className="w-4 h-4" />, <Code className="w-4 h-4" />]
    }
  ];

  return (
    <section id="skills" ref={ref} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="Skills & Expertise"
          subtitle="Technologies and tools I work with to bring ideas to life"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <SkillCategory
              key={category.title}
              {...category}
              delay={index * 0.15}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Tech Stack Floating Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <h4 className="text-center text-slate-400 text-sm uppercase tracking-wider mb-6">
            Technologies I Love Working With
          </h4>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Python', icon: <Code className="w-5 h-5" /> },
              { name: 'React', icon: <Atom className="w-5 h-5" /> },
              { name: 'PyTorch', icon: <Flame className="w-5 h-5" /> },
              { name: 'OpenCV', icon: <Eye className="w-5 h-5" /> },
              { name: 'FastAPI', icon: <Rocket className="w-5 h-5" /> },
              { name: 'Next.js', icon: <Code className="w-5 h-5" /> },
              { name: 'ChromaDB', icon: <Database className="w-5 h-5" /> },
              { name: 'Streamlit', icon: <BarChart className="w-5 h-5" /> },
              { name: 'LangChain', icon: <Link className="w-5 h-5" /> },
              { name: 'TensorFlow', icon: <Calculator className="w-5 h-5" /> }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ delay: 0.8 + index * 0.05, type: 'spring', stiffness: 200 }}
                whileHover={{ 
                  scale: 1.15, 
                  y: -8,
                  boxShadow: '0 10px 30px -10px rgba(6, 182, 212, 0.4)'
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/70 border border-slate-700 text-slate-300 font-medium hover:border-cyan-500/50 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span className="text-xl">{tech.icon}</span>
                <span>{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
