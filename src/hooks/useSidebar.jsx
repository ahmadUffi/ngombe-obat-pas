import { useState, useEffect } from "react";

const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const close = () => {
    setIsOpen(false);
  };

  const open = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    toggle,
    close,
    open,
  };
};

export default useSidebar;
