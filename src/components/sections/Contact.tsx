import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, Send, ExternalLink, Rocket } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { personalInfo } from '@/data/portfolio';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function Contact() {
  const [ref, isInView] = useInView<HTMLElement>();

  const contactLinks = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Phone',
      value: personalInfo.phone,
      href: `tel:${personalInfo.phone.replace(/\s/g, '')}`,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Location',
      value: personalInfo.location,
      href: '#',
    },
  ];

  return (
    <section id="contact" ref={ref} className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Contact"
          subtitle="Let's discuss your next project or just say hello"
          sectionNumber="06"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-8 h-full">
              <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-3">
                Let&apos;s Build Something Together
              </h3>
              <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed mb-8">
                I&apos;m always excited to work on new projects and collaborate with like-minded
                individuals. Whether you have a project idea, want to discuss AI/ML opportunities,
                or just want to connect — feel free to reach out.
              </p>

              {/* Contact links */}
              <div className="space-y-3 mb-8">
                {contactLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -15 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -15 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 p-4 border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-blue)] transition-colors duration-300 group"
                  >
                    <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-blue)] transition-colors">
                      {link.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] block mb-0.5">
                        {link.label}
                      </span>
                      <span className="font-body text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] transition-colors break-all sm:break-normal">
                        {link.value}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Social cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: <Github className="w-5 h-5" />,
                    label: 'GitHub',
                    username: '@MuhammadMaheem',
                    href: personalInfo.github,
                  },
                  {
                    icon: <Linkedin className="w-5 h-5" />,
                    label: 'LinkedIn',
                    username: 'Muhammad Maheem',
                    href: personalInfo.linkedin,
                  },
                ].map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.5 + index * 0.08 }}
                    whileHover={{ y: -3, borderColor: 'var(--color-accent-blue)' }}
                    className="p-4 border border-[var(--color-border-subtle)] text-center transition-colors duration-300"
                  >
                    <div className="flex justify-center text-[var(--color-text-muted)] mb-2">
                      {link.icon}
                    </div>
                    <span className="font-body text-xs text-[var(--color-text-primary)] block">
                      {link.label}
                    </span>
                    <span className="font-body text-[10px] text-[var(--color-text-muted)]">
                      {link.username}
                    </span>
                  </motion.a>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-full"
          >
            <div className="p-8 h-full border border-[var(--color-border-subtle)] relative overflow-hidden">
              {/* Background accent */}
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-accent-blue) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />

              <div className="relative">
                <div className="text-[var(--color-accent-blue)] mb-6">
                  <Rocket className="w-12 h-12" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-3">
                  Ready to Start a Project?
                </h3>
                <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed mb-8">
                  I&apos;m available for freelance work and internship opportunities. Let&apos;s
                  create something extraordinary together.
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3 mb-8">
                  <a
                    href={`mailto:${personalInfo.email}?subject=Project%20Inquiry`}
                    className="group flex items-center justify-center gap-3 px-8 py-4 font-body text-sm tracking-widest uppercase bg-[var(--color-accent-blue)] text-[var(--color-text-primary)] hover:bg-[#4a9bd9] transition-colors"
                  >
                    <Send className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    Send an Email
                  </a>
                  <a
                    href={personalInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-3 px-8 py-4 font-body text-sm tracking-widest uppercase border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    View My GitHub
                  </a>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-[var(--color-border-subtle)]">
                  <p className="font-body text-xs text-[var(--color-text-muted)] text-center">
                    Currently based in {personalInfo.location}
                  </p>
                  <p className="font-body text-xs text-[var(--color-accent-blue)] text-center mt-1">
                    Open to remote opportunities worldwide
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
