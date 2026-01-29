import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Code2, Sparkles, ChevronLeft, ChevronRight, X, Target, Zap } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { projects, type Project } from '@/data/portfolio';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';
import { TiltCard } from '@/components/ui/TiltCard';
import { Button } from '@/components/ui/Button';

interface ProjectCardProps {
  project: Project;
  index: number;
  isInView: boolean;
  onClick: () => void;
}

function ProjectCard({ project, index, isInView, onClick }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <TiltCard className="h-full">
        <Card
          hoverable
          gradient={project.gradient}
          onClick={onClick}
          disableHoverTransform
          className="p-0 h-full overflow-hidden"
        >
          {/* Project Image */}
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src={project.images[0]}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${project.gradient} opacity-60 pointer-events-none`} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
            
            {/* Category Badge */}
            <span className="absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full bg-slate-900/80 text-cyan-400 border border-cyan-500/30 backdrop-blur-sm">
              {project.category}
            </span>
            
            {/* Icon */}
            <span className="absolute bottom-3 left-4 text-4xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
              {project.icon}
            </span>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
              {project.title}
            </h3>

            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
              {project.shortDesc}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs rounded bg-slate-800/80 text-slate-300"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="px-2 py-1 text-xs rounded bg-slate-800/80 text-slate-500">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center text-cyan-400 text-sm font-medium transition-all duration-300 group-hover:gap-2">
              <span>View Details</span>
              <ExternalLink className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </Card>
      </TiltCard>
    </motion.div>
  );
}

interface ImageSlideshowProps {
  images: string[];
  title: string;
}

function ImageSlideshow({ images, title }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Slideshow Container */}
      <div className="relative rounded-xl overflow-hidden group">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-64 md:h-80 object-cover cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsFullscreen(true)}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-cyan-400 w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Click to expand hint */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-900/70 text-slate-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Click to expand
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-cyan-500 transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-800 text-white hover:bg-cyan-500 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-800 text-white hover:bg-cyan-500 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-slate-800 text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
          >
            <div className="relative w-full h-full bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col">
              {/* Header Gradient Bar */}
              <div className={`h-2 bg-gradient-to-r ${project.gradient} flex-shrink-0`} />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-4 z-10 p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Title Section */}
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <motion.span 
                      className="text-6xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                    >
                      {project.icon}
                    </motion.span>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {project.title}
                      </h2>
                      <span className={`inline-block px-4 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r ${project.gradient} text-white`}>
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Image Slideshow */}
                  <ImageSlideshow images={project.images} title={project.title} />

                  {/* Description */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      About This Project
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-lg">
                      {project.fullDesc}
                    </p>
                  </div>

                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Features */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-cyan-400" />
                        Key Features
                      </h3>
                      <ul className="space-y-3">
                        {project.features.map((feature, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 text-slate-300"
                          >
                            <span className="w-2 h-2 mt-2 bg-cyan-400 rounded-full flex-shrink-0" />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Challenges & Impact */}
                    <div className="space-y-6">
                      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-400" />
                          Challenges Overcome
                        </h3>
                        <p className="text-slate-300">{project.challenges}</p>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          Impact & Value
                        </h3>
                        <p className="text-slate-300">{project.impact}</p>
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {project.technologies.map((tech, index) => (
                        <motion.span
                          key={tech}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className={`px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r ${project.gradient} text-white cursor-default`}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Projects() {
  const [ref, isInView] = useInView<HTMLElement>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', ...new Set(projects.map((p) => p.category))];
  const filteredProjects =
    filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" ref={ref} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="Featured Projects"
          subtitle="A showcase of my work in AI, ML, and web development"
        />

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === category
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isInView={isInView}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {/* Project Modal */}
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
}
