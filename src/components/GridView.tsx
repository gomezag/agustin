import { AnimatePresence } from "framer-motion";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { blogPosts } from "../data/blogPosts";
import { useBubblePositions } from "../hooks/useBubblePositions";
import { useMouseTracking } from "../hooks/useMouseTracking";
import '../index.css';
import { BlogPost } from "../types";
import { BlogBubble } from "./BlogBubble";
import { ConfigMenu } from "./ConfigMenu";
import { useDarkMode } from "./DarkModeContext";
import { Grid } from "./Grid";
import Navbar from "./Navbar";
import { PostDialog } from "./PostDialog";

const POSTS = blogPosts.map((post, index) =>
  ({ id: index,
    ...post })
);

function GridView() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>();
  const [isAnimating, setIsAnimating] = useState(true);
  const [G, setG] = useState(30);
  const [RNuclear, setRNuclear] = useState(0);
  const [cNuclear, setCNuclear] = useState(0);
  const [kCoulomb, setKCoulomb] = useState(0);
  const { isDarkMode } = useDarkMode();

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
      <Navbar>
        <button onClick={() => setIsAnimating(!isAnimating)} className={`z-50 hover:text-pink-400 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
          {isAnimating ? <PauseCircle size={45} /> : <PlayCircle size={45} />}
        </button>
        <ConfigMenu G={G} setG={setG}
                    k={kCoulomb} setK={setKCoulomb}
                    c={cNuclear} setC={setCNuclear}
                    R={RNuclear} setR={setRNuclear}
                    size={45} isDarkMode={isDarkMode}/>
      </Navbar>
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

export default GridView;
