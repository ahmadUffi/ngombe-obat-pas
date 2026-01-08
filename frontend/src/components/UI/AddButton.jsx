import React from "react";
import PlusIcon from "../Icons/PlusIcon";

const AddButton = ({ clickHandler }) => {
  return (
    <button
      className="addButton w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 fixed right-6 bottom-6 cursor-pointer flex justify-center items-center shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-110 z-50 border-2 border-white"
      onClick={clickHandler}
    >
      <PlusIcon className="text-white w-6 h-6" />
    </button>
  );
};

export default AddButton;
