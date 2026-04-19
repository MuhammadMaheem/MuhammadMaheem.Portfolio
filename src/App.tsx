import { ParticleGrid } from '@/components/ParticleGrid';
import { FloatingElements } from '@/components/FloatingElements';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { Education } from '@/components/sections/Education';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/Footer';
import { Stats } from '@/components/Stats';
import { ScrollToTop } from '@/components/ScrollToTop';

export function App() {
  return (
    <div
      className="relative min-h-screen text-[var(--color-text-primary)] overflow-x-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* Animated Background */}
      <ParticleGrid />
      <FloatingElements />

      {/* Content */}
      <div className="relative" style={{ zIndex: 2 }}>
        <Navbar />
        <main>
          <Hero />
          <About />
          <Experience />
          <Stats />
          <Skills />
          <Projects />
          <Education />
          <Contact />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}
