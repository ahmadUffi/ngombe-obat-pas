import React, { useState } from "react";
import SearchIcon from "./svg/SearchIcon";
import BellIcon from "./svg/BellIcon";

const NavbarTop = ({ onToggleSidebar }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
          <div className="search hidden sm:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="from-control bg-[var(--pink)] flex w-[250px] md:w-[300px] lg:w-[411px] h-[49px] rounded-full items-center gap-2.5">
                <label htmlFor="search" className="ms-2.5">
                  <SearchIcon />
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="Cari Jadwal Minum Obat..."
                  className="w-full bg-transparent outline-none pr-4 text-sm lg:text-base"
                />
              </div>
            </form>
          </div>

          {/* Search icon for mobile */}
          <button
            className="sm:hidden flex items-center justify-center w-[45px] h-[45px] rounded-full bg-[var(--pink)] cursor-pointer hover:bg-opacity-80 transition-all"
            aria-label="Search"
            onClick={handleMobileSearch}
          >
            <SearchIcon />
          </button>

          {/* notification */}
          <button
            className="nontif w-[45px] h-[45px] rounded-full bg-[#CCFBF1] flex justify-center items-center cursor-pointer hover:bg-[#A7F3D0] transition-colors"
            aria-label="Notifications"
          >
            <BellIcon />
          </button>

          {/* profile */}
          <button
            className="profile w-[45px] h-[45px] rounded-full bg-gray-400 flex justify-center items-center cursor-pointer overflow-hidden bg-center bg-cover hover:bg-gray-500 transition-colors"
            aria-label="Profile menu"
          >
            <img
              src=""
              alt="Profile"
              className="w-[45px] h-[45px] rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="text-white text-sm font-medium">U</span>
          </button>
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
