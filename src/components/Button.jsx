const Button = ({
  onClick,
  children,
  type = "button",
  bgColor = "primary",
  className = "text-white",
  disabled = false,
  variant = "",
}) => {
  const bgMap = {
    primary: "bg-primary-500 hover:bg-primary-600",
    "accent-gold": "bg-accent-gold-500 hover:bg-accent-gold-600",
    gray: "bg-gray-500 hover:bg-gray-600",
  };

  const outlineMap = {
    primary:
      "border border-primary-500 hover:border-primary-600 text-primary-400",
    "accent-gold":
      "border border-accent-gold-500 hover:border-accent-gold-600 text-accent-gold-400",
    gray: "border border-gray-500 hover:border-gray-600 text-gray-400",
  };

  const backgroundStyle =
    variant !== "outline" ? bgMap[bgColor] : outlineMap[bgColor];

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
