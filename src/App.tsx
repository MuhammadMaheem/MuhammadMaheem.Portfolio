import { ParticleGrid } from '@/components/ParticleGrid';
import { FloatingElements } from '@/components/FloatingElements';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { Education } from '@/components/sections/Education';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/Footer';
import { Stats } from '@/components/Stats';
import { ScrollToTop } from '@/components/ScrollToTop';

export function App() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <ParticleGrid />
      <FloatingElements />
      
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-950/50 to-slate-950 pointer-events-none" style={{ zIndex: 1 }} />
      
      {/* Content */}
      <div className="relative" style={{ zIndex: 2 }}>
        <Navbar />
        <main>
          <Hero />
          <About />
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
