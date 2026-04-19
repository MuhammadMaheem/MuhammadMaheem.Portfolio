import { motion } from 'framer-motion';

// Geometric accent marks scattered across the viewport
const accents = [
  { type: 'dot', x: '8%', y: '15%', delay: 0, size: 6 },
  { type: 'corner', x: '92%', y: '12%', delay: 0.3 },
  { type: 'line-h', x: '5%', y: '55%', delay: 0.6, width: 40 },
  { type: 'dot', x: '88%', y: '65%', delay: 0.9, size: 4 },
  { type: 'corner', x: '12%', y: '82%', delay: 1.2 },
  { type: 'line-v', x: '78%', y: '40%', delay: 1.5, height: 30 },
  { type: 'dot', x: '50%', y: '90%', delay: 1.8, size: 3 },
  { type: 'line-h', x: '70%', y: '25%', delay: 2.1, width: 25 },
];

function AccentMark({
  type,
  x,
  y,
  delay,
  size,
  width,
  height,
}: {
  type: string;
  x: string;
  y: string;
  delay: number;
  size?: number;
  width?: number;
  height?: number;
}) {
  if (type === 'dot') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
        transition={{ delay, duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: 'var(--color-accent-purple)',
        }}
      />
    );
  }

  if (type === 'corner') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ delay, duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute"
        style={{ left: x, top: y }}
      >
        <div className="absolute top-0 left-0 w-5 h-[1px] bg-[var(--color-accent-blue)]" />
        <div className="absolute top-0 left-0 h-5 w-[1px] bg-[var(--color-accent-blue)]" />
      </motion.div>
    );
  }

  if (type === 'line-h') {
    return (
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0.15, 0.35, 0.15], scaleX: [1, 1.1, 1] }}
        transition={{ delay, duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute origin-left"
        style={{
          left: x,
          top: y,
          width: width,
          height: 1,
          backgroundColor: 'var(--color-border-strong)',
        }}
      />
    );
  }

  // line-v
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: [0.15, 0.35, 0.15], scaleY: [1, 1.2, 1] }}
      transition={{ delay, duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute origin-top"
      style={{
        left: x,
        top: y,
        width: 1,
        height: height,
        backgroundColor: 'var(--color-border-strong)',
      }}
    />
  );
}

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {accents.map((accent, index) => (
        <AccentMark key={index} {...accent} />
      ))}
    </div>
  );
}
