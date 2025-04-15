import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./store/authStore";

// Layout imports
import AppLayout from "./components/layout/AppLayout";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard and market pages
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";

// Guards for protected routes
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

// Guards for public-only routes (redirect if already logged in)
const PublicRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : element;
};

function App() {
  const { fetchCurrentUser } = useAuthStore();

  // Check if user is authenticated on app load
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route
          path="/register"
          element={<PublicRoute element={<Register />} />}
        />

        {/* Protected routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route
            path="dashboard"
            element={<PrivateRoute element={<Dashboard />} />}
          />
          <Route
            path="market"
            element={<PrivateRoute element={<Market />} />}
          />
          <Route
            path="favorites"
            element={<PrivateRoute element={<Favorites />} />}
          />
          <Route path="admin" element={<PrivateRoute element={<Admin />} />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
