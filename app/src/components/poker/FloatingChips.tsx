import React, { useEffect, useRef } from 'react';

interface Chip {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  suit: string;
}

const FloatingChips: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chipsRef = useRef<Chip[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize chips
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'];
    const suits = ['♠', '♥', '♣', '♦'];
    
    const createChip = (): Chip => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 50,
      size: Math.random() * 30 + 20,
      speedY: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.15 + 0.05,
      suit: suits[Math.floor(Math.random() * suits.length)],
    });

    // Create initial chips
    for (let i = 0; i < 15; i++) {
      const chip = createChip();
      chip.y = Math.random() * canvas.height;
      chipsRef.current.push(chip);
    }

    const drawChip = (chip: Chip) => {
      ctx.save();
      ctx.translate(chip.x, chip.y);
      ctx.rotate((chip.rotation * Math.PI) / 180);
      ctx.globalAlpha = chip.opacity;

      // Draw outer circle
      ctx.beginPath();
      ctx.arc(0, 0, chip.size, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      ctx.strokeStyle = chip.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw inner dashed circle
      ctx.beginPath();
      ctx.arc(0, 0, chip.size * 0.75, 0, Math.PI * 2);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = chip.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw suit symbol
      ctx.fillStyle = chip.color;
      ctx.font = `${chip.size * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(chip.suit, 0, 0);

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      chipsRef.current.forEach((chip) => {
        // Update position
        chip.y -= chip.speedY;
        chip.x += chip.speedX;
        chip.rotation += chip.rotationSpeed;

        // Reset chip if it goes off screen
        if (chip.y < -chip.size * 2) {
          chip.y = canvas.height + chip.size;
          chip.x = Math.random() * canvas.width;
        }

        // Wrap around horizontally
        if (chip.x < -chip.size) chip.x = canvas.width + chip.size;
        if (chip.x > canvas.width + chip.size) chip.x = -chip.size;

        drawChip(chip);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default FloatingChips;
