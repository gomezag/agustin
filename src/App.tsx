import { useState, useEffect } from "react";
import { Grid } from "./components/Grid";
import { BlogBubble } from "./components/BlogBubble";
import { PostDialog } from "./components/PostDialog";
import { blogPosts } from "./data/blogPosts";
import { Github, Linkedin, Mail, PauseCircle, PlayCircle, Moon, Sun } from "lucide-react";
import { ConfigMenu } from "./components/ConfigMenu";
import { useMouseTracking } from "./hooks/useMouseTracking";
import { useBubblePositions } from "./hooks/useBubblePositions";
import { BlogPost } from "./types";
import { AnimatePresence } from "framer-motion";
import './index.css';

const POSTS = blogPosts.map((post, index) => 
  ({ id: index,
    ...post })
);

function App() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>();
  const [isAnimating, setIsAnimating] = useState(true);
  const [G, setG] = useState(150);
  const [RNuclear, setRNuclear] = useState(50);
  const [cNuclear, setCNuclear] = useState(10);
  const [kCoulomb, setKCoulomb] = useState(40);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { mousePosition } = useMouseTracking();
  const { bubblePositions, setDraggedBubble, isDraggingRef } = useBubblePositions(POSTS, isAnimating, G, kCoulomb, cNuclear, RNuclear);

  useEffect(() => {
    const handleReleased = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPost) {
          setSelectedPost(null);
          setDraggedBubble(null);
          isDraggingRef.current = false;
        } else {
          setDraggedBubble(null);
          isDraggingRef.current = false;
        }
      } else if (e.key === " ") {
        e.preventDefault();
        setIsAnimating((prev) => !prev);
      }
    };
  
    window.addEventListener("keydown", handleReleased);
  
    return () => {
      window.removeEventListener("keydown", handleReleased);
    };
  }, [selectedPost, setDraggedBubble]);

  return (
    <div className={`relative min-h-screen overflow-hidden bg-opacity-0`}>
      <header className={`container mx-auto px-4 py-20 ${isDarkMode ? "text-white" : "text-black"}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <a href="https://github.com/gomezag" className={`z-50  hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
              <Github size={35} />
            </a>
            <a href="https://www.linkedin.com/in/agustin-gomez-mansilla/" className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
              <Linkedin size={35} />
            </a>
            <a href="mailto:agustin.gomez.mansilla@gmail.com" className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
              <Mail size={35} />
            </a>
            <div className="ml-auto flex items-center gap-4" id="right-buttons">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}
              >
                {isDarkMode ? ( <Moon size={45} /> ) : ( <Sun size={45} /> )} 
              </button>
              <button onClick={() => setIsAnimating(!isAnimating)} className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
                {isAnimating ? <PauseCircle size={45} /> : <PlayCircle size={45} />}
              </button>
                <ConfigMenu G={G} setG={setG} 
                            k={kCoulomb} setK={setKCoulomb}
                            c={cNuclear} setC={setCNuclear}
                            R={RNuclear} setR={setRNuclear}
                            size={45} isDarkMode={isDarkMode}/>
              </div>
          </div>
        </div>
      </header>
      <div className={`grid-background ${isDarkMode ? "dark-mode" : "light-mode"}`}> </div>
        <Grid mousePosition={mousePosition} G={G} bubblePositions={bubblePositions} isDarkMode={isDarkMode} />
      {bubblePositions && POSTS.map(
        (post: BlogPost) =>
          bubblePositions[post.id] && (
            <BlogBubble
              key={post.id}
              post={post}
              position={bubblePositions[post.id]}
              onClick={() => {
                  setSelectedPost(post);
                  setDraggedBubble(null);
                  isDraggingRef.current = false;
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                setDraggedBubble({
                  id: post.id,
                  offsetX: e.clientX - bubblePositions[post.id].x,
                  offsetY: e.clientY - bubblePositions[post.id].y,
                });
                isDraggingRef.current = true; // Mark dragging as active
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                setDraggedBubble({
                  id: post.id,
                  offsetX: touch.clientX - bubblePositions[post.id].x,
                  offsetY: touch.clientY - bubblePositions[post.id].y,
                });
                isDraggingRef.current = true; // Mark dragging as active
              }}
            />
          )
      )}
      <AnimatePresence>
      {selectedPost && <PostDialog post={selectedPost} onClose={() => setSelectedPost(null)} />}
        </AnimatePresence>
    </div>
  );
}

export default App;