import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import MainLayout from './layouts/MainLayout';
import useAuthStore from './store/authStore';

const AppContent = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  // Define public routes that should never have the dashboard layout
  const isPublicRoute = 
    location.pathname === '/' || 
    location.pathname === '/login' ||
    location.pathname === '/superadmin/login' ||
    location.pathname.match(/^\/school\/[^/]+\/?$/) ||
    location.pathname.match(/^\/school\/[^/]+\/login\/?$/);

  return (isAuthenticated && !isPublicRoute) ? (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  ) : (
    <AppRoutes />
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
