import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoadmapDetail from './pages/RoadmapDetail';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Discussions from './pages/Discussions';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import theme from './theme';
import AdminDashboard from './pages/AdminDashboard';

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <Home />
          )
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            {user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />}
          </PrivateRoute>
        }
      />
      <Route
        path="/roadmap/:id"
        element={
          <PrivateRoute>
            <RoadmapDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
      <Route
        path="/discussions"
        element={
          <PrivateRoute>
            <Discussions />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <AuthProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
