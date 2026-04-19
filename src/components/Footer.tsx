import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import { personalInfo } from '@/data/portfolio';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-8 px-6 border-t border-[var(--color-border-subtle)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs text-[var(--color-text-muted)] tracking-wider"
          >
            © {currentYear} {personalInfo.name}
          </motion.div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
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
                whileHover={{ y: -2 }}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-4 text-center font-body text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase"
        >
          Built with React, TypeScript, Tailwind CSS & Framer Motion
        </motion.div>
      </div>
    </footer>
  );
}
