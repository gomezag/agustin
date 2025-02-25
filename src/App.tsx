import React, { useState, useEffect, useRef } from 'react';
import { Grid } from './components/Grid';
import { BlogBubble } from './components/BlogBubble';
import { PostDialog } from './components/PostDialog';
import { BlogPost } from './types';
import { blogPosts } from './data/blogPosts';
import { Github, Linkedin } from 'lucide-react';

const SAMPLE_POSTS = blogPosts.map((post, index) => ({
  id: index,
  ...post
}));

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [bubblePositions, setBubblePositions] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [draggedBubble, setDraggedBubble] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const velocitiesRef = useRef<{ [key: number]: { vx: number; vy: number } }>({});
  const animationFrameRef = useRef<number>();
  const prevTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      if (draggedBubble) {
        // Move the dragged bubble to follow the cursor
        setBubblePositions(prev => ({
          ...prev,
          [draggedBubble.id]: {
            x: e.clientX - draggedBubble.offsetX,
            y: e.clientY - draggedBubble.offsetY
          }
        }));
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPost(null); // Or any function you want to call on Esc press
      }
    };
    window.addEventListener("keydown", handleKeyDown);    
    
    const handleMouseUp = () => {
      if (draggedBubble) {
        const { id } = draggedBubble;
        velocitiesRef.current[id].vx = 0;
        velocitiesRef.current[id].vy = 0;
      }
      setDraggedBubble(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedBubble, mousePosition]);

  useEffect(() => {
    SAMPLE_POSTS.forEach((post) => {
      if (!velocitiesRef.current[post.id]) {
        velocitiesRef.current[post.id] = { vx: (Math.random() - 0.5), vy: (Math.random() - 0.5) };
      }
      if (!bubblePositions[post.id]) {
        setBubblePositions(prev => ({
          ...prev,
          [post.id]: {
            x: Math.random() * (window.innerWidth - 100) + 50,
            y: Math.random() * (window.innerHeight - 100) + 50
          }
        }));
      }
    });

    const updateBubblePositions = (timestamp: number) => {
      if (!prevTimeRef.current) prevTimeRef.current = timestamp;
      const deltaTime = timestamp - prevTimeRef.current;
      const timeScale = Math.min(deltaTime / 16.667, 2);
      const G = 0.00007; // Gravitational constant (tweak for desired effect)
      const G_cursor = 0.001;
      const softening = 10;
      const cursorRadius = 400;

      prevTimeRef.current = timestamp;

      const newPositions = { ...bubblePositions };

      SAMPLE_POSTS.forEach((post1) => {
        if (draggedBubble && draggedBubble.id === post1.id) return; // Skip updating the dragged bubble
        const velocity1 = velocitiesRef.current[post1.id];

        const pos1 = newPositions[post1.id];
        if (!pos1) return;

        let totalForceX = 0;
        let totalForceY = 0;

        SAMPLE_POSTS.forEach((post2) => {
          if (post1.id === post2.id) return;
          const pos2 = newPositions[post2.id];
          if (!pos2) return;


          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distanceSq = dx * dx + dy * dy + softening; // Softened distance to avoid singularities
          const distance = Math.sqrt(distanceSq);
          const minDistance = (post1.radius + post2.radius) / 2;

          if (distance > 0 && distance < minDistance) {
            // Resolve overlap by pushing bubbles apart
            const overlap = minDistance - distance;
            const pushX = (dx / distance) * (overlap / 2);
            const pushY = (dy / distance) * (overlap / 2);
    
            pos1.x -= pushX;
            pos1.y -= pushY;
            pos2.x += pushX;
            pos2.y += pushY;
    
            // Swap velocities (simplified elastic collision)
            const velocity2 = velocitiesRef.current[post2.id];
            [velocity1.vx, velocity2.vx] = [velocity2.vx, velocity1.vx];
            [velocity1.vy, velocity2.vy] = [velocity2.vy, velocity1.vy];
          }
          let thisForce = (distance) * G;
          totalForceX += (dx / distance) * thisForce;
          totalForceY += (dy / distance) * thisForce;

    
        });

        const mouseDx = mousePosition.x - pos1.x;
        const mouseDy = mousePosition.y - pos1.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

        if (mouseDistance > 0 && mouseDistance < cursorRadius) {
          const mouseForce = (cursorRadius - mouseDistance) * G_cursor;
          totalForceX += (mouseDx / mouseDistance) * mouseForce;
          totalForceY += (mouseDy / mouseDistance) * mouseForce;
        }

        const velocity = velocitiesRef.current[post1.id];
        velocity.vx += totalForceX * timeScale;
        velocity.vy += totalForceY * timeScale;
        velocity.vx *= 0.999;
        velocity.vy *= 0.999;

        let newX = pos1.x + velocity.vx * timeScale;
        let newY = pos1.y + velocity.vy * timeScale;

        const energyLoss = 0.7;
        const bubbleSize = post1.radius;

        if (newX < bubbleSize) {
          newX = bubbleSize;
          velocity.vx = Math.abs(velocity.vx) * energyLoss;
        } else if (newX > window.innerWidth - bubbleSize) {
          newX = window.innerWidth - bubbleSize;
          velocity.vx = -Math.abs(velocity.vx) * energyLoss;
        }
        const headerHeight = document.querySelector('header')?.offsetHeight || 100;

        if (newY < headerHeight + bubbleSize) {
          newY = headerHeight + bubbleSize;
          velocity.vy = Math.abs(velocity.vy) * energyLoss;
        } else if (newY > window.innerHeight - bubbleSize) {
          newY = window.innerHeight - bubbleSize;
          velocity.vy = -Math.abs(velocity.vy) * energyLoss;
        }

        newPositions[post1.id] = { x: newX, y: newY };
      });

      setBubblePositions(newPositions);
      animationFrameRef.current = requestAnimationFrame(updateBubblePositions);
    };

    animationFrameRef.current = requestAnimationFrame(updateBubblePositions);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [bubblePositions, draggedBubble]);

  return (
    <div className="relative min-h-screen overflow-hidden">
        <header className="container mx-auto px-4 py-20 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="py-2 text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
              Agustín Gómez
            </h1>
            <div className="flex gap-4">
              <a href="https://github.com/gomezag" className="text-black hover:text-pink-400 transition-colors">
                <Github size={24} />
              </a>
              <a href="https://www.linkedin.com/in/agustin-gomez-mansilla/" className="text-black hover:text-pink-400 transition-colors">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </header>

      <Grid mousePosition={mousePosition} />

      {SAMPLE_POSTS.map((post) => (
        bubblePositions[post.id] && (
          <BlogBubble
            key={post.id}
            post={post}
            position={bubblePositions[post.id]}
            onClick={() => setSelectedPost(post)}
            onMouseDown={(e) => {
              e.preventDefault();
              setDraggedBubble({
                id: post.id,
                offsetX: e.clientX - bubblePositions[post.id].x,
                offsetY: e.clientY - bubblePositions[post.id].y
              });
            }}
          />
        )
      ))}

      {selectedPost && (
        <PostDialog
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

export default App;