import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfigurePage from './pages/ConfigurePage';
import VisualizePage from './pages/VisualizePage';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen message="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Auth pages get the top navbar; protected pages own their own header+sidebar
function PublicLayout() {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen message="Authenticating..." />;
  if (user) return <Navigate to="/configure" replace />;
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public auth pages */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected app pages — each owns its own header */}
          <Route element={<ProtectedRoute />}>
            <Route path="/configure" element={<ConfigurePage />} />
            <Route path="/visualize/:id" element={<VisualizePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
