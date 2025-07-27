import React from "react";
import ReactDOM from "react-dom";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const styles = {
    overlay: "fixed inset-0 flex items-center justify-center z-[90]",
  };
  return ReactDOM.createPortal(
    <div
      className={styles.overlay}
      style={{ backgroundColor: "rgba(0,0,0,.7)" }}
    >
      {/* <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"> */}
      <button className="absolute top-4 right-4 z-[100] " onClick={onClose}>
        <div className="w-[30px] h-[30px] rounded-full bg-white font-bold flex items-center justify-center cursor-pointer">
          X
        </div>
      </button>
      {children}
    </div>,
    // </div>
    document.getElementById("modal")
  );
};

export default Modal;
