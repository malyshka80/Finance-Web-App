// ============================================================
// src/Components/ProtectedRoute.jsx
// Redirects unauthenticated users to /login automatically.
// ============================================================

import { Navigate } from 'react-router-dom';
import { useAuth }  from '../Context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Still verifying token on mount — show nothing (or a spinner)
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background)',
        color: 'var(--c-text-3)',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
      }}>
        Chargement...
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ============================================================
// How to use ProtectedRoute in your App.jsx / router:
// ============================================================
//
// import ProtectedRoute from './Components/ProtectedRoute';
//
// <Routes>
//   <Route path="/"        element={<Opening />} />
//   <Route path="/login"   element={<LoginPage />} />
//   <Route path="/register" element={<RegisterPage />} />
//
//   <Route path="/app" element={
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   } />
// </Routes>