import React from 'react';
import { BlogPost } from '../types';

interface BlogBubbleProps {
  post: BlogPost;
  position: { x: number; y: number };
  onClick: () => void;
  onMouseDown: (e: any) => void;
}

export function BlogBubble({ post, position, onClick, onMouseDown }: BlogBubbleProps) {
  return (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
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
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
        <h3 className="text-white font-semibold text-xs w-24 text-center line-clamp-2">
          {post.title}
        </h3>
      </div>
    </button>
  );
}
