import { useEffect, useRef } from 'react';
import { Point } from '../types';

interface GridProps {
  mousePosition: { x: number; y: number };
}

export function Grid({ mousePosition }: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const frameRef = useRef<number>();
  const prevTimeRef = useRef<number>(0);
  
  const spacing = 30; // Increased spacing for better visibility
  const gravityRadius = 200;
  const maxDisplacement = 30; // Reduced for more subtle effect
  const damping = 0.95; // Increased for smoother movement
  const stiffness = 0.50; // Increased for faster recovery
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initializePoints();
    };

    const initializePoints = () => {
      const points: Point[] = [];
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      for (let x = 0; x <= width; x += spacing) {
        for (let y = 0; y <= height; y += spacing) {
          points.push({
            x,
            y,
            originalX: x,
            originalY: y,
            velocityX: 0,
            velocityY: 0
          });
        }
      }
      pointsRef.current = points;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const updatePoints = (deltaTime: number) => {
      const timeScale = Math.min(deltaTime / 16.667, 2);

      pointsRef.current.forEach(point => {
        const dx = mousePosition.x - point.x;
        const dy = mousePosition.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate repulsion force (inverse of attraction)
        if (distance < gravityRadius) {
          const force = (gravityRadius - distance) / gravityRadius;
          const angle = Math.atan2(dy, dx);
          const repulsionX = Math.cos(angle) * force * maxDisplacement;
          const repulsionY = Math.sin(angle) * force * maxDisplacement;
          
          point.velocityX -= repulsionX * timeScale * 0.1;
          point.velocityY -= repulsionY * timeScale * 0.1;
        }

        // Spring force back to original position
        const springX = (point.originalX - point.x) * stiffness;
        const springY = (point.originalY - point.y) * stiffness;

        point.velocityX += springX * timeScale;
        point.velocityY += springY * timeScale;

        // Apply damping
        point.velocityX *= damping;
        point.velocityY *= damping;

        // Update position
        point.x += point.velocityX * timeScale;
        point.y += point.velocityY * timeScale;
      });
    };

    const render = () => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.beginPath();
      pointsRef.current.forEach(point => {
        const dx = mousePosition.x - point.x;
        const dy = mousePosition.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const pointSize = distance < gravityRadius 
          ? 2 + (2 * (gravityRadius - distance) / gravityRadius)
          : 2;

        ctx.moveTo(point.x + pointSize, point.y);
        ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
      });

      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.fill();
    };

    const animate = (timestamp: number) => {
      if (!prevTimeRef.current) prevTimeRef.current = timestamp;
      const deltaTime = timestamp - prevTimeRef.current;
      prevTimeRef.current = timestamp;

      updatePoints(deltaTime);
      render();

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [mousePosition]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ touchAction: 'none' }}
    />
  );
}