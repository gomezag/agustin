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

const MIN_VELOCITY = 1;
const MAX_VELOCITY = 100;
const MIN_DISTANCE = 80; // Avoid singularities

const M_ball = 5;
const M_cursor = 10;

interface Position {
  x: number
  y: number
}

function getForce(G_eff: number, pos1: Position, pos2: Position, m1: number, m2: number) {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  let dist2 = (dx * dx + dy * dy);
  let dir = 1
  if(dist2 < MIN_DISTANCE*MIN_DISTANCE){
    dist2 = MIN_DISTANCE*MIN_DISTANCE;
  }
  return {m: dir*m1*m2*G_eff/(dist2), a: Math.atan2(dy, dx)};
};

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [bubblePositions, setBubblePositions] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [draggedBubble, setDraggedBubble] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [ G, setG ] = useState< number >(150);
  const velocitiesRef = useRef<{ [key: number]: { vx: number; vy: number } }>({});
  const animationFrameRef = useRef<number>();
  const prevTimeRef = useRef<number>(0);

  useEffect(() => {
  const handleMove = (e: MouseEvent | TouchEvent) => {
    const clientX = (e as MouseEvent).clientX ?? (e as TouchEvent).touches?.[0]?.clientX;
    const clientY = (e as MouseEvent).clientY ?? (e as TouchEvent).touches?.[0]?.clientY;
    if (clientX !== undefined && clientY !== undefined) {
      setMousePosition({ x: clientX, y: clientY });
    setMousePosition({ x: clientX, y: clientY });

      if (draggedBubble) {
        // Move the dragged bubble to follow the cursor
        setBubblePositions(prev => ({
          ...prev,
          [draggedBubble.id]: {
            x: clientX - draggedBubble.offsetX,
            y: clientY - draggedBubble.offsetY
          }
        }));
      }
    }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPost(null); // Or any function you want to call on Esc press
      }
    };
    window.addEventListener("keydown", handleKeyDown);    
    
    const handleEnd = () => {
      setDraggedBubble(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [draggedBubble]);

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
          const distanceSq = dx * dx + dy * dy + MIN_DISTANCE; 
          const distance = Math.sqrt(distanceSq);
          const minDistance = (post1.radius + post2.radius) / 2;
          const angle = Math.atan2(dy, dx)
          // Resolve overlap
          if (distance > 0 && distance < minDistance) {
            const overlap = minDistance - distance;
            const pushX = (dx/distance) * (overlap / 2);
            const pushY = (dy/distance) * (overlap / 2);
    
            pos1.x -= pushX;
            pos1.y -= pushY;
            pos2.x += pushX;
            pos2.y += pushY;
    
            const velocity2 = velocitiesRef.current[post2.id];
            [velocity1.vx, velocity2.vx] = [velocity2.vx, velocity1.vx];
            [velocity1.vy, velocity2.vy] = [velocity2.vy, velocity1.vy];
          }

          // Gravitational pull between objects
          let thisForce = getForce(G, pos2, pos1, M_ball, M_ball);

          totalForceX -= Math.cos(thisForce.a) * thisForce.m;
          totalForceY -= Math.sin(thisForce.a) * thisForce.m;
        });

        // Gravitational pull between cursor
        let thisForce = getForce(G, mousePosition, pos1, M_cursor, M_ball);

        totalForceX -= Math.cos(thisForce.a) * thisForce.m;
        totalForceY -= Math.sin(thisForce.a) * thisForce.m;

        // update velocities according to dv = F dt
        const velocity = velocitiesRef.current[post1.id];
        velocity.vx += totalForceX * timeScale;
        velocity.vy += totalForceY * timeScale;

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

        // Stop things if they going too fast
        if(Math.abs(velocity.vx) > MAX_VELOCITY) {
          velocity.vx=MAX_VELOCITY;
        }
        if(Math.abs(velocity.vy) > MAX_VELOCITY) {
          velocity.vy=MAX_VELOCITY;
        }


        // Stop things if they going too slow
        if(Math.abs(velocity.vx) < MIN_VELOCITY) {
          velocity.vx=0;
        }
        if(Math.abs(velocity.vy) < MIN_VELOCITY) {
          velocity.vy=0;
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
          <label className="block text-black font-semibold">Gravity (G): {G}</label>
          <input
            type="range"
            min="50"
            max="700"
            step="10"
            value={G}
            onChange={(e) => setG(Number(e.target.value))}
            className="w-full mt-2 appearance-none focus:outline-none hover:text-pink-400 transition-colors"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
              background: "transparent", // Hide the rail
            }}
          />
          <style>{`
              input[type="range"]::-webkit-slider-runnable-track {
                background: transparent;
              }

              input[type="range"]::-moz-range-track {
                background: transparent;
              }

              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background:rgb(139, 137, 138); /* Pink */
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.3s ease, transform 0.2s;
              }

              input[type="range"]::-webkit-slider-thumb:active {
                background:rgb(255, 20, 212); /* Darker pink when selected */
                transform: scale(1.2);
              }

              input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: rgb(164, 155, 162);
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.3s ease, transform 0.2s;
              }

              input[type="range"]::-moz-range-thumb:active {
                background: rgb(255, 20, 212);
                transform: scale(1.2);
              }
            `}</style>
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
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              setDraggedBubble({
                id: post.id,
                offsetX: touch.clientX - bubblePositions[post.id].x,
                offsetY: touch.clientY - bubblePositions[post.id].y,
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