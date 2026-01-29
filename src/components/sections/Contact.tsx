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
      icon: <Mail className="w-6 h-6" />,
      label: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: 'Phone',
      value: personalInfo.phone,
      href: `tel:${personalInfo.phone.replace(/\s/g, '')}`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: 'Location',
      value: personalInfo.location,
      href: '#',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const socialLinks = [
    {
      icon: <Github className="w-8 h-8" />,
      label: 'GitHub',
      username: '@MuhammadMaheem',
      href: personalInfo.github,
      color: 'hover:border-slate-400'
    },
    {
      icon: <Linkedin className="w-8 h-8" />,
      label: 'LinkedIn',
      username: 'Muhammad Maheem',
      href: personalInfo.linkedin,
      color: 'hover:border-blue-500'
    }
  ];

  return (
    <section id="contact" ref={ref} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="Get In Touch"
          subtitle="Let's discuss your next project or just say hello!"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 h-full">
              <h3 className="text-2xl font-bold text-white mb-6">
                Let's Build Something Amazing Together
              </h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                I'm always excited to work on new projects and collaborate with
                like-minded individuals. Whether you have a project idea, want to discuss
                AI/ML opportunities, or just want to connect — feel free to reach out!
              </p>

              <div className="space-y-4 mb-8">
                {contactLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-colors group"
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${link.color} text-white`}>
                      {link.icon}
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 block">{link.label}</span>
                      <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                        {link.value}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`flex-1 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 ${link.color} transition-colors text-center group`}
                  >
                    <div className="text-slate-400 group-hover:text-white transition-colors mb-2 flex justify-center">
                      {link.icon}
                    </div>
                    <span className="text-sm font-medium text-white block">{link.label}</span>
                    <span className="text-xs text-slate-500">{link.username}</span>
                  </motion.a>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 z-0" />
              
              <div className="relative z-10">
                <div className="text-6xl mb-6 text-cyan-400">
                  <Rocket className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Start a Project?
                </h3>
                <p className="text-slate-400 mb-8">
                  I'm available for freelance work and internship opportunities.
                  Let's create something extraordinary together!
                </p>

                <div className="space-y-4">
                  <motion.a
                    href={`mailto:${personalInfo.email}?subject=Project Inquiry`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 hover:shadow-lg hover:shadow-cyan-500/30"
                  >
                    <Send className="w-5 h-5" />
                    Send an Email
                  </motion.a>
                  
                  <motion.a
                    href={personalInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 text-slate-200 border border-slate-700 font-medium rounded-xl cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 hover:bg-slate-700/50 hover:border-cyan-500/50"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View My GitHub
                  </motion.a>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700/50">
                  <p className="text-sm text-slate-500 text-center">
                    Currently based in {personalInfo.location}
                  </p>
                  <p className="text-sm text-cyan-400 text-center mt-1">
                    Open to remote opportunities worldwide
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
