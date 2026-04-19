// Replaced particle grid with a subtle animated gradient orb system
// that creates atmosphere without overwhelming the content.
import { motion } from 'framer-motion';

const orbs = [
  {
    size: 500,
    color: 'rgba(97, 175, 239, 0.08)',
    initial: { x: '10%', y: '20%' },
    animate: { x: ['10%', '25%', '5%', '10%'], y: ['20%', '35%', '10%', '20%'] },
    duration: 25,
  },
  {
    size: 400,
    color: 'rgba(189, 147, 249, 0.06)',
    initial: { x: '70%', y: '60%' },
    animate: { x: ['70%', '55%', '80%', '70%'], y: ['60%', '45%', '75%', '60%'] },
    duration: 30,
  },
  {
    size: 350,
    color: 'rgba(80, 250, 123, 0.04)',
    initial: { x: '40%', y: '80%' },
    animate: { x: ['40%', '60%', '30%', '40%'], y: ['80%', '65%', '85%', '80%'] },
    duration: 35,
  },
];

export function ParticleGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          initial={orb.initial}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
