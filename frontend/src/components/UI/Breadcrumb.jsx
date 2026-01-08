import React from "react";
import { useLocation, Link } from "react-router-dom";
import { routes } from "../../routes";

const Breadcrumb = () => {
  const location = useLocation();

  // Find current route
  const currentRoute = routes.find((route) => route.path === location.pathname);

  // Don't show breadcrumb for login and register pages
  if (!currentRoute || !currentRoute.isProtected) {
    return null;
  }

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
  ];

  // Add current page if it's not dashboard
  if (location.pathname !== "/dashboard") {
    breadcrumbItems.push({
      label: currentRoute.title,
      path: currentRoute.path,
      icon: currentRoute.icon,
    });
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 mt-0.5 ml-0.5">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}

          {index === breadcrumbItems.length - 1 ? (
            // Current page - not clickable
            <span className="flex items-center space-x-1 text-gray-900 font-medium">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </span>
          ) : (
            // Previous pages - clickable
            <Link
              to={item.path}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
