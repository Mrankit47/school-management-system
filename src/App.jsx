import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import MainLayout from './layouts/MainLayout';
import useAuthStore from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      {isAuthenticated ? (
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      ) : (
        <AppRoutes />
      )}
    </Router>
  );
}

export default App;
