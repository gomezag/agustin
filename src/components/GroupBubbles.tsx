import { useState, useEffect } from "react";

interface BlogPost {
  id: number;
  title: string;
  imageUrl: string;
  radius: number;
}

interface BlogBubbleProps {
  post: BlogPost;
  position: { x: number; y: number };
  onClick: () => void;
}

export function BlogBubble({ post, position, onClick }: BlogBubbleProps) {
  return (
    <button
      onClick={onClick}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: post.radius,
        height: post.radius,
      }}
    >
      <img
        src={post.imageUrl}
        alt={post.title}
        className="absolute inset-0 w-full h-full object-cover rounded-full"
      />
    </button>
  );
}

interface GroupBubbleProps {
  position: { x: number; y: number };
  childrenPosts: BlogPost[];
}

export function GroupBubble({ position, childrenPosts }: GroupBubbleProps) {
  const [isGrouped, setIsGrouped] = useState(false);
  const [childPositions, setChildPositions] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (isGrouped) {
      // Arrange children in a circle around the GroupBubble
      const radius = 50; // Radius of orbiting circle
      const angleStep = (2 * Math.PI) / childrenPosts.length;

      setChildPositions(
        childrenPosts.map((_, index) => ({
          x: position.x + radius * Math.cos(index * angleStep),
          y: position.y + radius * Math.sin(index * angleStep),
        }))
      );
    } else {
      // Release children to random positions
      setChildPositions(
        childrenPosts.map(() => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }))
      );
    }
  }, [isGrouped, childrenPosts, position]);

  return (
    <>
      <button
        onClick={() => setIsGrouped((prev) => !prev)}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg bg-gray-800 text-white font-bold flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
        style={{
          left: position.x,
          top: position.y,
          width: 80,
          height: 80,
        }}
      >
        Group
      </button>

      {childrenPosts.map((post, index) => (
        <BlogBubble
          key={post.id}
          post={post}
          position={childPositions[index] || { x: 0, y: 0 }}
          onClick={() => console.log(`Clicked: ${post.title}`)}
        />
      ))}
    </>
  );
}
