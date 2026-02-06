import React from "react";

const Button = ({
  name,
  children,
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  className = "",
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={`relative inline-flex items-center justify-center px-4 py-2 rounded font-medium text-surfaceBase transition-all duration-150 
        focus:outline-none border border-transparent ${isDisabled ? "bg-gray-400 cursor-not-allowed opacity-70" : "cursor-pointer hover:opacity-90"} 
      ${className}`}
    >
      <span className={`inline-flex items-center ${loading ? "opacity-0" : ""}`}>
        {name || children}
      </span>

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
        </span>
      )}
    </button>
  );
};

export default React.memo(Button);
