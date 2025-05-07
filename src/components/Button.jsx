import React from "react";

const Button = ({
  onClick,
  children,
  type = "button",
  bgColor = "primary",
  className = "text-white",
}) => {
  const baseStyles = `bg-${bgColor}-500 px-4 py-2 rounded hover:bg-${bgColor}-600 hover:scale-102 transition-colors duration-200 cursor-pointer`;
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
