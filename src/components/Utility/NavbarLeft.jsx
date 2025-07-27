import React from "react";
import { useNavigate } from "react-router-dom";
import CalendarIcon from "./svg/CalendarIcon";
import NoteIcon from "./svg/NoteIcon";
import ControlIcon from "./svg/ControlIcon";
import { logo } from "../../assets";

const NavbarLeft = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // style css
  const styles = {
    icon: "icon flex flex-col gap-2 items-center justify-center cursor-pointer hover:bg-gray-100 rounded-lg p-3 transition-all duration-200 group",
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`navbar fixed z-50 min-h-full bg-[var(--white)] shadow-lg flex flex-col items-center p-5 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-[173px] lg:w-[173px]
        `}
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
            alt="Logo Smedbox"
            width={100}
            height={100}
            className="drop-shadow-sm"
          />
        </div>

        {/* Navigation Menu */}
        <div className="action mt-10 w-full">
          <ul className="flex flex-col gap-6 items-center justify-center">
            {/* Jadwal */}
            <li className="w-full">
              <button
                onClick={() => handleNavClick("/jadwal")}
                className={`${styles.icon} w-full`}
                aria-label="Go to Schedule"
              >
                <CalendarIcon />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Jadwal
                </span>
              </button>
            </li>

            {/* Kontrol */}
            <li className="w-full">
              <button
                onClick={() => handleNavClick("/control")}
                className={`${styles.icon} w-full`}
                aria-label="Go to Control"
              >
                <ControlIcon />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Kontrol
                </span>
              </button>
            </li>

            {/* Catatan */}
            <li className="w-full">
              <button
                onClick={() => handleNavClick("/note")}
                className={`${styles.icon} w-full`}
                aria-label="Go to Notes"
              >
                <NoteIcon />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Catatan
                </span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default NavbarLeft;
