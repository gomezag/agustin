import { BlogPost } from '../types';
import { motion, AnimatePresence } from "framer-motion";

interface PostDialogProps {
  post: BlogPost;
  onClose: () => void;
}

export function PostDialog({ post, onClose }: PostDialogProps) {
  return (
          <motion.div
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-lg max-w-2xl w-full p-6 relative shadow-lg"
              >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
        >
          ✕
        </button>

        {/* Blog Post Image */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}

        {/* Tags Section - Improved Positioning */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Blog Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">{post.title}</h2>

        {/* Blog Excerpt */}
        <p className="text-gray-600 text-center mb-6">{post.excerpt}</p>

        {/* Links Section */}
        {post.links && post.links.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Related Links</h3>
            <ul className="list-disc list-inside text-blue-600 space-y-1">
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
      </motion.div>
    </motion.div>
  );
}
