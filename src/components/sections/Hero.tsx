import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ChevronDown } from 'lucide-react';
import { personalInfo } from '@/data/portfolio';
import { Button } from '@/components/ui/Button';
import { AnimatedText } from '@/components/AnimatedText';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center px-6 overflow-hidden">
      {/* Vertical accent line */}
      <div className="absolute left-6 md:left-12 top-0 bottom-0 w-[1px] bg-[var(--color-border-subtle)]" />
      {/* Horizontal accent line */}
      <div className="absolute left-0 right-0 top-1/3 h-[1px] bg-[var(--color-border-subtle)] opacity-50" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl pt-32 pb-20"
      >
        {/* Section label */}
        <motion.div
          variants={item}
          className="font-body text-[10px] tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-8 flex items-center gap-3"
        >
          <span className="w-8 h-[1px] bg-[var(--color-accent-blue)]" />
          AI Developer & ML Engineer
        </motion.div>

        {/* Name — oversized Syne */}
        <h1 className="font-display font-800 text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] leading-[0.9] tracking-tighter text-[var(--color-text-primary)] mb-8">
          <span className="block">{personalInfo.name.split(' ')[0]}</span>
          <span
            className="block"
            style={{
              background:
                'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {personalInfo.name.split(' ')[1]}
          </span>
        </h1>

        {/* Tagline */}
        <motion.div
          variants={item}
          className="font-body text-base md:text-lg text-[var(--color-text-secondary)] max-w-xl leading-relaxed mb-12 min-h-[2rem]"
        >
          <AnimatedText
            texts={[
              'AI Engineer specializing in RAG systems and LLM evaluation pipelines',
              'Building production-ready AI SaaS with FastAPI, Next.js, and ChromaDB',
              'Shipping full-stack systems from Figma specs to production',
              'Focused on grounded retrieval, quality gates, and reliable AI UX',
            ]}
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={item} className="flex flex-wrap gap-4 mb-14">
          <Button variant="primary" size="md" onClick={() => scrollToSection('projects')}>
            View My Work
          </Button>
          <Button variant="secondary" size="md" onClick={() => scrollToSection('contact')}>
            Get In Touch
          </Button>
        </motion.div>

        {/* Social Links — minimal horizontal row */}
        <motion.div variants={item} className="flex items-center gap-5">
          {[
            { href: personalInfo.github, icon: Github, label: 'GitHub' },
            { href: personalInfo.linkedin, icon: Linkedin, label: 'LinkedIn' },
            { href: `mailto:${personalInfo.email}`, icon: Mail, label: 'Email' },
          ].map(({ href, icon: Icon, label }) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              whileHover={{ y: -3 }}
              className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors flex items-center gap-2"
              aria-label={label}
            >
              <Icon className="w-4 h-4" />
              {label}
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollToSection('about')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 0.5 },
          y: { duration: 2.5, repeat: Infinity },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-body text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors flex flex-col items-center gap-2"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-5 h-5" />
      </motion.button>
    </section>
  );
}
