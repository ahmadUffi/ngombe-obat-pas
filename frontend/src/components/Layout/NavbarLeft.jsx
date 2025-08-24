import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CalendarIcon from "../Icons/CalendarIcon";
import NoteIcon from "../Icons/NoteIcon";
import ControlIcon from "../Icons/ControlIcon";
import HistoryIcon from "../Icons/HistoryIcon";
import { logo } from "../../assets";
import { is } from "date-fns/locale";

const NavbarLeft = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // style css
  const getNavItemStyles = (path) => {
    const baseStyles =
      "icon flex flex-col gap-2 items-center justify-center cursor-pointer rounded-lg p-3 transition-all duration-200 group w-full";

    if (isActive(path)) {
      return `${baseStyles} bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105`;
    }

    return `${baseStyles} hover:bg-gray-100`;
  };

  const getTextStyles = (path) => {
    if (isActive(path)) {
      return "text-sm font-semibold text-white";
    }

    return "text-sm font-medium text-gray-700 group-hover:text-gray-900";
  };

  const getIconStyles = (path) => {
    if (isActive(path)) {
      return "w-6 h-6 text-white";
    }

    return "w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors";
  };

  const handleNavClick = (path) => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
    // Navigate to the specified path
    navigate(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`navbar fixed z-50 h-screen w-[173px] lg:w-[173px] bg-[var(--white)] shadow-lg flex flex-col items-center p-5 transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    overflow-y-auto`}
        aria-label="Main navigation"
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-md transition-colors"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="icon mt-8 lg:mt-0">
          <img
            src={logo}
            alt="Logo Ngompas"
            width={100}
            height={100}
            className="drop-shadow-sm "
          />
        </div>

        {/* Navigation Menu (scroll only this part) */}
        <div
          className="action mt-10 w-full flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <ul className="flex flex-col gap-6 items-center justify-center">
            {/* Dashboard */}
            <li className="w-full">
              <button
                onClick={() => handleNavClick("/dashboard")}
                className={getNavItemStyles("/dashboard")}
                aria-label="Go to Dashboard"
              >
                <svg
                  className={getIconStyles("/dashboard")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0a2 2 0 012-2h.01M3 7a2 2 0 012-2h.01M13 16H7v-4h6v4z"
                  />
                </svg>
                <span className={getTextStyles("/dashboard")}>Dashboard</span>
              </button>
            </li>

            {/* Jadwal */}
            <li className="w-full">
              <button
                onClick={() => handleNavClick("/jadwal")}
                className={getNavItemStyles("/jadwal")}
                aria-label="Go to Schedule"
              >
                <div className={isActive("/jadwal") ? "text-white" : ""}>
                  <CalendarIcon isActive={isActive} />
                </div>
                <span className={getTextStyles("/jadwal")}>Jadwal</span>
              </button>
            </li>

            {/* Kontrol */}
            <li className="w-full">
              <button
                onClick={() => handleNavClick("/control")}
                className={getNavItemStyles("/control")}
                aria-label="Go to Control"
              >
                <div className={isActive("/control") ? "text-white" : ""}>
                  <ControlIcon isActive={isActive} />
                </div>
                <span className={getTextStyles("/control")}>Kontrol</span>
              </button>
            </li>

            {/* Catatan */}
            <li className="w-full">
              <button
                onClick={() => handleNavClick("/note")}
                className={getNavItemStyles("/note")}
                aria-label="Go to Notes"
              >
                <div className={isActive("/note") ? "text-white" : ""}>
                  <NoteIcon isActive={isActive} />
                </div>
                <span className={getTextStyles("/note")}>Catatan</span>
              </button>
            </li>

            {/* Riwayat */}
            <li className="w-full">
              <button
                onClick={() => handleNavClick("/history")}
                className={getNavItemStyles("/history")}
                aria-label="Go to History"
              >
                <div className={isActive("/history") ? "text-white" : ""}>
                  <HistoryIcon isActive={isActive} />
                </div>
                <span className={getTextStyles("/history")}>Riwayat</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default NavbarLeft;
