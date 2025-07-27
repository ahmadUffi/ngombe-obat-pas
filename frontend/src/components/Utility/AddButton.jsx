import React from "react";
import PlusIcon from "./svg/PlusIcon";

const AddButton = ({ clickHandler }) => {
  return (
    <div
      className="addButton w-[75px] h-[75px] rounded-xl bg-gray-300 fixed right-10 bottom-10 cursor-pointer flex justify-center items-center"
      onClick={clickHandler}
    >
      <PlusIcon />
    </div>
  );
};

export default AddButton;
