/**
 * Root Redirect Component
 * Handles redirection from root URL based on authentication status
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RootRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');

    if (token && role) {
      // User is authenticated, redirect to their dashboard
      if (role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else if (role === 'admin' || role === 'staff') {
        navigate('/admin-home', { replace: true });
      } else {
        // Unknown role, redirect to login
        navigate('/login', { replace: true });
      }
    } else {
      // Not authenticated, redirect to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7faf7] via-[#f4f7f2] to-[#e2eee3]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">Redirecting...</p>
      </div>
    </div>
  );
};

export default RootRedirect;
