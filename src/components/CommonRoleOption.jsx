import React from "react";

const CommonRoleOption = ({ roleName, roleDescription }) => {
  return (
    <button className="bg-black rounded p-4 border-1 border-gray-600 cursor-pointer hover:border-primary-700 hover:bg-primary-900">
      <p className="text-lg font-semibold">{roleName}</p>
      <p className="text-sm text-gray-300">{roleDescription}</p>
    </button>
  );
};

export default CommonRoleOption;
