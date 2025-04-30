import React from "react";

const Button = ({ onClick, children, type = "button", className = "" }) => {
  const baseStyles =
    "px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 hover:scale-102 transition-colors duration-200 cursor-pointer";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
