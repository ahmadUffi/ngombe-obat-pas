import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../Icons/SearchIcon";
import BellIcon from "../Icons/BellIcon";
import { AuthContext } from "../../hooks/useAuth";
import { maskot } from "../../assets";

const NavbarTop = ({ onToggleSidebar }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [profileImageKey, setProfileImageKey] = useState(Date.now());
  const { logout, user } = useContext(AuthContext);
  console.log("User in NavbarTop:", user);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Reset the profile image error and update image key when user changes
  useEffect(() => {
    console.log("NavbarTop detected user change:", user);
    setProfileImageError(false);
    setProfileImageKey(Date.now());
  }, [user]);

  // Get profile image URL from user context or use mascot as default
  const getProfileImageSrc = () => {
    if (profileImageError || !user?.img_profile) {
      console.log("Using default profile image (maskot)");
      return maskot;
    }
    console.log("Using user profile image:", user.img_profile);
    return user.img_profile;
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMobileSearch = () => {
    setShowMobileSearch(true);
  };

  const closeMobileSearch = () => {
    setShowMobileSearch(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    console.log("Searching for:", searchTerm);
    // Add your search logic here
    closeMobileSearch();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <>
      <header className="navbar w-full h-[100px] bg-[var(--white)] shadow-md flex items-center justify-between lg:justify-end p-5 gap-3 lg:gap-5 fixed z-40">
        {/* Hamburger menu for mobile */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-3 lg:gap-5">
          {/* search */}

          {/* profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="profile w-[45px] h-[45px] rounded-full bg-gray-400 flex justify-center items-center cursor-pointer overflow-hidden bg-center bg-cover hover:bg-gray-500 transition-colors"
              aria-label="Profile menu"
            >
              <img
                src={getProfileImageSrc()}
                alt="Profile"
                className="w-[45px] h-[45px] rounded-full object-cover"
                // Force image reload when user updates
                key={`profile-${profileImageKey}`}
                onError={(e) => {
                  setProfileImageError(true);
                }}
              />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Selamat datang</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.username || user?.name || user?.email || "User"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0a2 2 0 012-2h.01M3 7a2 2 0 012-2h.01"
                    />
                  </svg>
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Edit Profile
                </button>

                <button
                  onClick={() => {
                    navigate("/change-password");
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Ubah Password
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 mt-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Pencarian
                </h3>
                <button
                  onClick={closeMobileSearch}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Close search"
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
              </div>

              <form onSubmit={handleSearchSubmit}>
                <div className="flex items-center gap-2 bg-[var(--pink)] rounded-full p-3">
                  <SearchIcon />
                  <input
                    type="text"
                    name="search"
                    placeholder="Cari Jadwal Minum Obat..."
                    className="flex-1 bg-transparent outline-none text-gray-700"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Cari
                  </button>
                  <button
                    type="button"
                    onClick={closeMobileSearch}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarTop;
