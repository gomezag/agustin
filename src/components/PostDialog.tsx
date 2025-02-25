import React from 'react';
import { BlogPost } from '../types';

interface PostDialogProps {
  post: BlogPost;
  onClose: () => void;
}

export function PostDialog({ post, onClose }: PostDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full"
        >
        </button>
        {/* Blog Post Image */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}
        <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
        <p className="text-gray-600 mb-6">{post.excerpt}</p>
        {/* Links Section */}
        {post.links && post.links.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Related Links</h3>
            <ul className="list-disc list-inside text-blue-600">
              {post.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
