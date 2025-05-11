import React from "react";

const Button = ({
  onClick,
  children,
  type = "button",
  bgColor = "primary",
  className = "text-white",
  disabled = false,
  variant = "",
}) => {
  const backgroundStyle =
    variant !== "outline"
      ? `bg-${bgColor}-500 hover:bg-${bgColor}-600`
      : `border-1 border-${bgColor}-500 hover:border-${bgColor}-600`;

  const baseStyles = `${backgroundStyle} px-4 py-2 rounded transition-colors duration-200 ${
    disabled ? "disabled:opacity-50" : "hover:scale-102 cursor-pointer"
  }`;
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
