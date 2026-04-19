import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Code2,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { projects, type Project } from '@/data/portfolio';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';
import { TiltCard } from '@/components/ui/TiltCard';

interface ProjectCardProps {
  project: Project;
  index: number;
  isInView: boolean;
  onClick: () => void;
}

function ProjectCard({ project, index, isInView, onClick }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <TiltCard glareEnabled className="h-full">
        <Card
          hoverable
          onClick={onClick}
          disableHoverTransform
          className="p-0 h-full overflow-hidden group"
        >
          {/* Project Image */}
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src={project.images[0]}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-surface)] via-transparent to-transparent" />

            {/* Category Badge */}
            <span className="absolute top-3 right-3 font-body text-[10px] tracking-wider uppercase px-3 py-1 bg-[var(--color-bg-primary)]/80 text-[var(--color-accent-blue)] border border-[var(--color-border-subtle)] backdrop-blur-sm">
              {project.category}
            </span>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent-blue)] transition-colors duration-300">
              {project.title}
            </h3>
            <p className="font-body text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2 leading-relaxed">
              {project.shortDesc}
            </p>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="font-body text-[10px] px-2 py-1 border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="font-body text-[10px] px-2 py-1 border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>

            {/* View Details link */}
            <div className="flex items-center text-[var(--color-accent-blue)] font-body text-xs tracking-wider uppercase gap-2 group-hover:gap-3 transition-all duration-300">
              <span>View Details</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
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

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div className="relative rounded-none overflow-hidden group border border-[var(--color-border-subtle)]">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${title} — Image ${currentIndex + 1}`}
          className="w-full h-64 md:h-80 object-cover cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsFullscreen(true)}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-bg-primary)]/80 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--color-accent-blue)]"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-bg-primary)]/80 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--color-accent-blue)]"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-[2px] transition-all ${
                index === currentIndex
                  ? 'w-6 bg-[var(--color-accent-blue)]'
                  : 'w-2 bg-[var(--color-text-muted)]/50 hover:bg-[var(--color-text-muted)]'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--color-bg-primary)]/95 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${title} — Image ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-xs text-[var(--color-text-muted)]">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[var(--color-bg-primary)]/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex flex-col"
          >
            {/* Top accent bar */}
            <div className="h-[2px] flex-shrink-0 bg-[var(--color-accent-blue)]" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="max-w-4xl mx-auto space-y-10">
                {/* Title */}
                <div>
                  <span className="font-body text-[10px] tracking-widest uppercase text-[var(--color-accent-blue)] block mb-2">
                    {project.category}
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">
                    {project.title}
                  </h2>
                </div>

                {/* Slideshow */}
                <ImageSlideshow images={project.images} title={project.title} />

                {/* Description */}
                <div className="border-l-2 border-[var(--color-accent-blue)] pl-6">
                  <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-accent-purple)]" />
                    About This Project
                  </h3>
                  <p className="font-body text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {project.fullDesc}
                  </p>
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Features */}
                  <div>
                    <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[var(--color-accent-green)]" />
                      Key Features
                    </h3>
                    <ul className="space-y-2.5">
                      {project.features.map((feature, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.06 }}
                          className="font-body text-sm text-[var(--color-text-secondary)] flex items-start gap-2"
                        >
                          <span className="w-1 h-1 mt-1.5 bg-[var(--color-accent-green)] flex-shrink-0" />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges & Impact */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-[var(--color-accent-blue)]" />
                        Challenges
                      </h3>
                      <p className="font-body text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {project.challenges}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[var(--color-accent-purple)]" />
                        Impact
                      </h3>
                      <p className="font-body text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {project.impact}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-4">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04 }}
                        className="font-body text-xs px-4 py-2 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)] transition-colors cursor-default"
                      >
                        {tech}
                      </motion.span>
                    ))}
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
    <section id="projects" ref={ref} className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Projects"
          subtitle="A showcase of my work in AI, ML, and web development"
          sectionNumber="04"
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`font-body text-[10px] tracking-widest uppercase px-4 py-2 transition-all duration-300 ${
                filter === category
                  ? 'bg-[var(--color-accent-blue)] text-[var(--color-text-primary)]'
                  : 'border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {/* Modal */}
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
}
