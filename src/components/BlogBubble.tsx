import { BlogPost } from '../types';
import "./GravitySlider.css";

interface BlogBubbleProps {
  post: BlogPost;
  position: { x: number; y: number };
  onClick: (e: any) => void;
  onMouseDown: (e: any) => void;
  onTouchStart: (e: any) => void;
}

export function BlogBubble({ post, position, onClick, onMouseDown, onTouchStart }: BlogBubbleProps) {
  return (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className="bubble absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105 overflow-hidden"
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
        className="bubble absolute inset-0 w-full h-full object-cover rounded-full"
      />
    </button>
  );
}
