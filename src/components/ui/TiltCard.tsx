import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/utils/cn';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glareEnabled?: boolean;
}

export function TiltCard({ children, className, glareEnabled = true }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -6;
    const rotateYValue = ((x - centerX) / centerX) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateXValue}deg) rotateY(${rotateYValue}deg)`);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    setGlarePosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s ease-out',
        willChange: 'transform',
        cursor: 'pointer',
      }}
      className={cn('relative', className)}
    >
      {children}
      {glareEnabled && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.08 : 0,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, var(--color-accent-purple) 0%, transparent 60%)`,
          }}
        />
      )}
    </div>
  );
}
