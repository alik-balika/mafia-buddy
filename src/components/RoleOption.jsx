import React from "react";

const RoleOption = ({ roleName, roleDescription, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-black rounded p-4 border-1 border-gray-600 cursor-pointer hover:border-primary-700 hover:bg-primary-900 active:scale-95 transition-transform duration-100"
    >
      <p className="text-lg font-semibold">{roleName}</p>
      <p className="text-sm text-gray-300">{roleDescription}</p>
    </button>
  );
};

export default RoleOption;
