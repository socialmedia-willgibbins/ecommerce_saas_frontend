import React from "react";
import { Link } from "react-router";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-600">
      <h1 className="text-7xl font-extrabold text-white drop-shadow-lg mb-4">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-200 mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-white text-violet-700 font-bold rounded-full shadow-lg hover:bg-violet-700 hover:text-white transition-colors duration-200"
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
