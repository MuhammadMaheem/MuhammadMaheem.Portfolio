import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Calendar, Code2, Brain, Rocket } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { personalInfo, interests, softSkills } from '@/data/portfolio';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';

export function About() {
  const [ref, isInView] = useInView<HTMLElement>();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="about" ref={ref} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="About Me"
          subtitle="Passionate AI developer building the future with code and creativity"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Main Info Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white">
                    MM
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-2 rounded-2xl border-2 border-dashed border-cyan-500/30"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{personalInfo.name}</h3>
                  <p className="text-cyan-400">{personalInfo.title}</p>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed mb-6">
                I'm a passionate AI enthusiast currently pursuing my degree in Artificial Intelligence
                at Superior University. With a strong foundation in machine learning, computer vision,
                and natural language processing, I love building intelligent systems that solve
                real-world problems.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span>{personalInfo.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                  <span>4th Semester - AI Major</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span>{personalInfo.age} years old</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* What I Do */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 h-full">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-cyan-400" />
                What I Do
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Brain className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Machine Learning</h4>
                  <p className="text-sm text-slate-400">Building predictive models and intelligent systems</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Code2 className="w-8 h-8 text-cyan-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Web Development</h4>
                  <p className="text-sm text-slate-400">Creating modern, responsive applications</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Soft Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-sm rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Interests */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">Interests & Hobbies</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {interests.map((interest, index) => (
                  <motion.div
                    key={interest.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center group hover:border-cyan-500/50 transition-colors"
                  >
                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                      {interest.icon}
                    </span>
                    <span className="text-sm text-slate-300">{interest.name}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
