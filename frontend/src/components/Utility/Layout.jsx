import React from "react";
import NavbarTop from "./NavbarTop";
import NavbarLeft from "./NavbarLeft";
import Breadcrumb from "./Breadcrumb";
import useSidebar from "../../hooks/useSidebar";

const Layout = ({ children, className = "" }) => {
  const sidebar = useSidebar();

  return (
    <>
      <NavbarTop onToggleSidebar={sidebar.toggle} />
      <NavbarLeft isOpen={sidebar.isOpen} onClose={sidebar.close} />
      <main
        className={`pt-[100px] px-4 lg:px-0 lg:pl-[173px] transition-all duration-300 min-h-screen ${className}`}
      >
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
