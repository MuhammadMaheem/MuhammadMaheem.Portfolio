import { motion } from 'framer-motion';
import { GraduationCap, Calendar, MapPin, BookOpen } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';

export function Education() {
  const [ref, isInView] = useInView<HTMLElement>();

  return (
    <section id="education" ref={ref} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="Education"
          subtitle="My academic journey in the field of Artificial Intelligence"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
            
            <div className="flex flex-col md:flex-row gap-6 pt-4">
              {/* University Logo Placeholder */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="flex-shrink-0"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Bachelor's in Artificial Intelligence
                </h3>
                <p className="text-lg text-cyan-400 mb-4">Superior University</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>4th Semester (Current)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Lahore, Pakistan</span>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="flex items-center gap-2 text-white font-medium mb-3">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Key Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Machine Learning',
                      'Deep Learning',
                      'Computer Vision',
                      'Natural Language Processing',
                      'Data Structures',
                      'Algorithms',
                      'Linear Algebra',
                      'Probability & Statistics'
                    ].map((subject, index) => (
                      <motion.span
                        key={subject}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="px-3 py-1 text-sm rounded-full bg-slate-700/50 text-slate-300 border border-slate-600"
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
