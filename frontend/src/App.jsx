import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

import Login from './pages/Login';
import Landing from './pages/Landing';
import SuperAdmin from './pages/SuperAdmin';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';

// Role-based route guard
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1c1917' }}>
      <div className="text-amber-400 text-xl font-mono animate-pulse">Loading...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
};

// Redirect after login based on role
const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const routes = {
    superadmin: '/superadmin',
    owner: '/dashboard',
    waiter: '/waiter',
    kitchen: '/kitchen',
    delivery: '/delivery',
  };

  return <Navigate to={routes[user.role] || '/login'} replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Role redirect */}
      <Route path="/home" element={<RoleRedirect />} />

      {/* Protected  */}
      <Route path="/menu" element={<ProtectedRoute roles={['owner']}><MenuManagement /></ProtectedRoute>} />
      { <Route path="/dashboard" element={<ProtectedRoute roles={['owner']}><Dashboard /></ProtectedRoute>} /> }
      {/* <Route path="/waiter" element={<ProtectedRoute roles={['waiter']}><WaiterView /></ProtectedRoute>} /> */}
      {/* <Route path="/kitchen" element={<ProtectedRoute roles={['kitchen']}><KitchenDisplay /></ProtectedRoute>} /> */}
      {/* <Route path="/delivery" element={<ProtectedRoute roles={['delivery']}><DeliveryView /></ProtectedRoute>} /> */}
      {/* <Route path="/superadmin" element={<ProtectedRoute roles={['superadmin']}><SuperAdmin /></ProtectedRoute>} /> */}
      <Route path="/superadmin" element={<ProtectedRoute roles={['superadmin']}><SuperAdmin /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}