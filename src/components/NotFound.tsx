import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-6xl font-bold text-pink-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">Page Not Found</h2>
      <p className="mb-6 text-gray-500 dark:text-gray-300">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="px-6 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 transition">Go Home</Link>
    </div>
  );
}
