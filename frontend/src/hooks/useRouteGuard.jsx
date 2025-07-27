import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../hooks/useAuth";
import { routes } from "../routes";

/**
 * Custom hook for route guards and navigation management
 */
export const useRouteGuard = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [routeLoading, setRouteLoading] = useState(true);

  // Find current route configuration
  const currentRoute = routes.find((route) => route.path === location.pathname);

  useEffect(() => {
    // Wait for auth loading to complete
    if (loading) {
      setRouteLoading(true);
      return;
    }

    const authenticated = isAuthenticated();

    // Handle route protection
    if (currentRoute?.isProtected && !authenticated) {
      navigate("/login", { replace: true });
      return;
    }

    // Redirect authenticated users away from auth pages
    if (!currentRoute?.isProtected && authenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setRouteLoading(false);
  }, [loading, isAuthenticated, currentRoute, navigate]);

  return {
    routeLoading: routeLoading || loading,
    currentRoute,
    isAuthenticated: isAuthenticated(),
  };
};

/**
 * Custom hook for navigation helpers
 */
export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithState = (path, state = {}) => {
    navigate(path, { state: { from: location.pathname, ...state } });
  };

  const goBack = () => {
    window.history.length > 1 ? navigate(-1) : navigate("/dashboard");
  };

  const isCurrentRoute = (path) => {
    return location.pathname === path;
  };

  const getRouteTitle = () => {
    const route = routes.find((r) => r.path === location.pathname);
    return route?.title || "SmedBox";
  };

  return {
    navigate: navigateWithState,
    goBack,
    isCurrentRoute,
    getRouteTitle,
    currentPath: location.pathname,
  };
};
