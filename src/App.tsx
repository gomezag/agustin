import { useState, useEffect, useRef } from 'react';
import { Grid } from './components/Grid';
import { BlogBubble } from './components/BlogBubble';
import { PostDialog } from './components/PostDialog';
import { BlogPost } from './types';
import { blogPosts } from './data/blogPosts';
import { Github, Linkedin, Mail } from 'lucide-react';

const POSTS = blogPosts.map((post, index) => ({
  id: index,
  ...post
}));

const MIN_VELOCITY = 0.000001;

function getForce(G: number, dist: number) {
  return G/(dist^2);
};

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
    POSTS.forEach((post) => {
      if (!bubblePositions[post.id]) {
        setBubblePositions(prev => ({
          ...prev,
          [post.id]: {
            x: Math.random() * (window.innerWidth - 100) + 50,
            y: Math.random() * (window.innerHeight - 100) + 50
          }
        }));
      }

      if (!velocitiesRef.current[post.id] && bubblePositions[post.id]) {
        velocitiesRef.current[post.id] = { 
          vx: (((window.innerHeight/2)-bubblePositions[post.id].y)/100), 
          vy: (((window.innerWidth/2)-bubblePositions[post.id].x)/100)
        };
      }
    });

    const updateBubblePositions = (timestamp: number) => {
      if (!prevTimeRef.current) prevTimeRef.current = timestamp;
      const deltaTime = timestamp - prevTimeRef.current;
      const timeScale = Math.min(deltaTime / 16.667, 2);
      const G = 10;
      const G_cursor = 30;
      const softening = 10;
      const cursorRadius = 400;

      prevTimeRef.current = timestamp;

      const newPositions = { ...bubblePositions };

      POSTS.forEach((post1) => {
        const velocity1 = velocitiesRef.current[post1.id];
        const pos1 = newPositions[post1.id];
        if (!pos1) return;

        // Handle dragging.
        if (draggedBubble && draggedBubble.id === post1.id){
          velocity1.vx = (-pos1.x+mousePosition.x)/deltaTime;
          velocity1.vy = (-pos1.y+mousePosition.y)/deltaTime;
          pos1.x = mousePosition.x;
          pos1.y = mousePosition.y;
          return; 
        }

        let totalForceX = 0;
        let totalForceY = 0;

        //Calculate pull and bounce with other balls
        POSTS.forEach((post2) => {
          if (post1.id === post2.id) return;
          const pos2 = newPositions[post2.id];
          if (!pos2) return;


          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distanceSq = dx * dx + dy * dy + softening; 
          const distance = Math.sqrt(distanceSq);
          const minDistance = (post1.radius + post2.radius) / 2;

          // Resolve overlap
          if (distance > 0 && distance < minDistance) {
            const overlap = minDistance - distance;
            const pushX = (dx / distance) * (overlap / 2);
            const pushY = (dy / distance) * (overlap / 2);
    
            pos1.x -= pushX;
            pos1.y -= pushY;
            pos2.x += pushX;
            pos2.y += pushY;
    
            const velocity2 = velocitiesRef.current[post2.id];
            [velocity1.vx, velocity2.vx] = [velocity2.vx, velocity1.vx];
            [velocity1.vy, velocity2.vy] = [velocity2.vy, velocity1.vy];
          }

          // Gravitational pull between objects
          let thisForce = getForce(G, distance);
          totalForceX += (dx / distance) * thisForce;
          totalForceY += (dy / distance) * thisForce;
    
        });

        // Add mouse cursor gravitational pull
        const mouseDx = mousePosition.x - pos1.x;
        const mouseDy = mousePosition.y - pos1.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy+softening);

        const mouseForce =  getForce(G_cursor, mouseDistance);
        totalForceX += (mouseDx / mouseDistance) * mouseForce;
        totalForceY += (mouseDy / mouseDistance) * mouseForce;

        // update velocities according to dv = F dt
        const velocity = velocitiesRef.current[post1.id];
        velocity.vx += totalForceX * timeScale;
        velocity.vy += totalForceY * timeScale;
        if(Math.abs(velocity.vx) < MIN_VELOCITY) {
          velocity.vx=0;
        }
        if(Math.abs(velocity.vy) < MIN_VELOCITY) {
          velocity.vy=0;
        }
        // tentative positions
        let newX = pos1.x + velocity.vx * timeScale;
        let newY = pos1.y + velocity.vy * timeScale;

        // Check constraints
        const energyLoss = 0.7;
        const bubbleSize = post1.radius;
        if (newX < bubbleSize) {
          newX = bubbleSize;
          //lose velocity on bounce
          velocity.vx = Math.abs(velocity.vx) * energyLoss;
        } else if (newX > window.innerWidth - bubbleSize) {
          newX = window.innerWidth - bubbleSize;
          // lose velocity on bounce
          velocity.vx = -Math.abs(velocity.vx) * energyLoss;
        }
        // Same for Y coord
        const headerHeight = document.querySelector('header')?.offsetHeight || 100;
        if (newY < headerHeight + bubbleSize) {
          newY = headerHeight + bubbleSize;
          velocity.vy = Math.abs(velocity.vy) * energyLoss;
        } else if (newY > window.innerHeight - bubbleSize) {
          newY = window.innerHeight - bubbleSize;
          velocity.vy = -Math.abs(velocity.vy) * energyLoss;
        }
        // update position
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
            <div className="flex gap-4">
              <a href="https://github.com/gomezag" className="text-black hover:text-pink-400 transition-colors">
                <Github size={24} />
              </a>
              <a href="https://www.linkedin.com/in/agustin-gomez-mansilla/" className="text-black hover:text-pink-400 transition-colors">
                <Linkedin size={24} />
              </a>
              <a href="mailto:agustin.gomez.mansilla@gmail.com" className="text-black hover:text-pink-400 transition-colors">
                <Mail size={24} />
              </a>
            </div>
          </div>
        </header>

      <Grid mousePosition={mousePosition} />

      {POSTS.map((post) => (
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