import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';


// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BlogDetail from './pages/blog/BlogDetail';
import CreateBlog from './pages/blog/CreateBlog';
import EditBlog from './pages/blog/EditBlog';
import Profile from './pages/user/Profile';
import EditProfile from './pages/user/EditProfile';
import Search from './pages/Search';
import Trending from './pages/Trending';
import Dashboard from './pages/Dashboard';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuth());
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dispatch, theme]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/user/:username" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trending" element={<Trending />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-blog" element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          } />
          <Route path="/edit-blog/:id" element={
            <ProtectedRoute>
              <EditBlog />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                404 - Page Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                The page you're looking for doesn't exist.
              </p>
              <a 
                href="/" 
                className="btn-primary"
              >
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;