import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { blogPosts } from "../data/blogPosts";
import { useMouseTracking } from "../hooks/useMouseTracking";
import "../index.css";
import { BlogPost, BubblePositions } from "../types";
import { useDarkMode } from "./DarkModeContext";
import { Grid } from "./Grid";
import Navbar from "./Navbar";
import { PostDialog } from "./PostDialog";

const POSTS: BlogPost[] = blogPosts
  .map((post, index) => ({ id: index, ...post }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function ListView() {
  const { isDarkMode } = useDarkMode();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const G = 60;
  const bubblePositions: BubblePositions = {};
  const { mousePosition } = useMouseTracking();

  const toggleExpand = (id: number) => {
    setExpanded(prev => (prev === id ? null : id));
  };

  return (
    <div className={`relative min-h-screen overflow-hidden bg-opacity-0`}>
        <Navbar />
      <div className={`grid-background ${isDarkMode ? "dark-mode" : "light-mode"}`}> </div>
      <Grid mousePosition={mousePosition} G={G} bubblePositions={bubblePositions} isDarkMode={isDarkMode} />
        <div className="w-full max-w-2xl space-y-6 mx-auto flex flex-col items-center">
          {POSTS.map((post) => (
            <div
              key={post.id}
              className={`relative rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6 transition hover:scale-[1.01] ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}
              onClick={() => toggleExpand(post.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex flex-col items-center md:items-start md:flex-row gap-6 w-full">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0 mb-4 md:mb-0"
                />
                <div className="flex-1 flex flex-col justify-between w-full">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                    <p className="text-gray-400 text-sm mb-2">{post.date}</p>
                    <p className={`mb-2 ${expanded === post.id ? '' : 'line-clamp-2'}`}>{post.excerpt}</p>
                    {expanded === post.id && post.links && post.links.length > 0 && (
                      <div className="mt-2">
                        <strong>Links:</strong>
                        <ul className="list-disc list-inside">
                          {post.links.map((link, i) => (
                            <li key={i}>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                                {link.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-pink-100 transition z-10 bg-transparent"
                style={{ background: 'none', boxShadow: 'none' }}
                aria-label={expanded === post.id ? "Collapse" : "Expand"}
                tabIndex={-1}
                onClick={e => { e.stopPropagation(); toggleExpand(post.id); }}
              >
                {expanded === post.id ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
              </button>
            </div>
          ))}
        </div>
          {selectedPost && <PostDialog post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
}
