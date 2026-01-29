import { motion } from 'framer-motion';

const elements = [
  { icon: '🤖', x: '10%', y: '20%', delay: 0 },
  { icon: '🧠', x: '85%', y: '15%', delay: 0.5 },
  { icon: '💻', x: '5%', y: '60%', delay: 1 },
  { icon: '⚡', x: '90%', y: '70%', delay: 1.5 },
  { icon: '🔮', x: '15%', y: '85%', delay: 2 },
  { icon: '📊', x: '80%', y: '45%', delay: 2.5 }
];

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {elements.map((el, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
            y: [0, -20, 0]
          }}
          transition={{
            delay: el.delay,
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute text-2xl md:text-3xl opacity-30"
          style={{ left: el.x, top: el.y }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
}
