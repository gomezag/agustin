import { useEffect, useRef } from 'react';
import { Point, BubblePositions, Vector } from '../types';
import { gravForce, mCursor, mBall, mGrid, clipVelocity } from '../utils/physics';
import '../index.css';

interface GridProps {
  mousePosition: { x: number; y: number };
  G: number;
  bubblePositions: BubblePositions;
  isDarkMode: boolean
}

export function Grid({ mousePosition, G, bubblePositions, isDarkMode }: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const frameRef = useRef<number>();
  const prevTimeRef = useRef<number>(0);
  
  const spacing = 40; // Increased spacing for better visibility
  const gravityRadius = 300;
  const maxDisplacement = 100; // Reduced for more subtle effect
  const damping = 0.1; // Increased for smoother movement
  const stiffness = 0.4; // Increased for faster recovery
  const minDistance = 1;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
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
      const extra = 0.5;
      const width = window.innerWidth*(1+extra);
      const height = window.innerHeight*(1+extra);
      
      for (let x = -Math.round(window.innerWidth*(extra/2)); x <= width; x += spacing) {
        for (let y = -Math.round(window.innerWidth*(extra/2)); y <= height; y += spacing) {
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

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const updatePoints = (deltaTime: number) => {
      const timeScale = Math.min(deltaTime / 16.667, 2);

      pointsRef.current.forEach(point => {
        const dx = mousePosition.x - point.x;
        const dy = mousePosition.y - point.y;
        const distance = {
          m: Math.sqrt(dx * dx + dy * dy),
          a: Math.atan2(dy, dx)
        }
        let totalForceX = 0;
        let totalForceY = 0;
        // Calculate Mouse Grav
        let force: Vector = {m: 0, a: distance.a}
        force.m = gravForce(G, distance, mCursor, mGrid).m*maxDisplacement;
        totalForceX += Math.cos(force.a)*force.m
        totalForceY += Math.sin(force.a)*force.m
        Object.entries(bubblePositions).forEach(([key, bubble]) => {
            const dx = bubble.x - point.x;
            const dy = bubble.y - point.y;
            const distance = {
              m: Math.sqrt(dx * dx + dy * dy),
              a: Math.atan2(dy, dx)
            }
            const force = gravForce(G, distance, mBall, mGrid);
            totalForceX += Math.cos(force.a) * force.m * maxDisplacement;
            totalForceY += Math.sin(force.a) * force.m * maxDisplacement;
        })  

        point.velocityX += totalForceX * timeScale*0.1;
        point.velocityY += totalForceY * timeScale*0.1;
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
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.beginPath();
      pointsRef.current.forEach(point => {
        const dx = mousePosition.x - point.x;
        const dy = mousePosition.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const pointSize = distance < gravityRadius 
          ? 3 - (0.4 * (gravityRadius - distance) / gravityRadius)
          : 3;

        ctx.moveTo(point.x + pointSize, point.y);
        ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
      });

      ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(118, 104, 104, 0.4)' ;
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
  }, [mousePosition, bubblePositions]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ touchAction: 'none', backgroundColor: 'transparent' }}
    />
  );
}