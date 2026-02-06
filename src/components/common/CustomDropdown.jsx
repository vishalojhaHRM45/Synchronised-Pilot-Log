import React, { useEffect } from "react";
import {
  FiChevronDown,
  FiEdit,
  FiPlusSquare,
  FiShare,
  FiTrash,
} from "react-icons/fi";
import { motion } from "framer-motion";

const CustomDropdown = ({
  buttonText = "",
  options = [],
  onSelect,
  className = "",
  buttonClassName = "",
  variant = "default",
  leftIcon = null,
  headerName = "",
  rightIcon,
}) => {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const handleOptionClick = (option) => {
    setOpen(false);
    if (onSelect) onSelect(option);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${headerName ? "relative flex justify-end" : "w-full relative"} ${className}`} ref={dropdownRef}>
      <motion.div animate={open ? "open" : "closed"} className="relative">
        {headerName ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3 pr-5 py-2 text-sm font-medium rounded-md bg-gray-50
            hover:bg-HoverGrayBg text-slate-700 hover:text-hoverText  transition-colors cursor-pointer ${buttonClassName}`}
          >
            {leftIcon && <div className="shrink-0">{leftIcon}</div>}
            <span className="grow text-left whitespace-nowrap">{buttonText}</span>
            <motion.span variants={iconVariants} className="shrink-0 ml-1">
              <FiChevronDown size={14} />
            </motion.span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={`flex items-center justify-between w-full p-2 text-sm font-medium rounded-md bg-gray-50 hover:bg-indigo-100 
              text-slate-700 hover:text-indigo-500 transition-colors cursor-pointer ${buttonClassName}`}
          >
            {leftIcon && <div className="mr-2">{leftIcon}</div>}
            <span className={`${rightIcon ? 'grow text-left whitespace-nowrap' : ""}`}>{buttonText}</span>
            <motion.span variants={iconVariants}>
              <FiChevronDown size={14} />
            </motion.span>
          </button>
        )}

        <motion.ul
          initial="closed"
          animate={open ? "open" : "closed"}
          variants={wrapperVariants}
          style={{ originY: "top" }}
          className={`absolute top-[110%] left-0 z-9999 bg-surfaceBase rounded-lg shadow-xl p-2 flex flex-col gap-2 ${variant === "match-filter" ? "w-32" : "w-full"}`}
        >
          {options.map((option, index) => (
            <Option
              key={index}
              text={option.label}
              Icon={option.icon || getIcon(option.label, buttonText)}
              setOpen={setOpen}
              onClick={() => handleOptionClick(option)}
            />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

const Option = ({ text, Icon, setOpen, onClick }) => (
  <motion.li
    variants={itemVariants}
    onClick={() => {
      setOpen(false);
      onClick();
    }}
    className="flex items-center w-full p-2 text-sm font-medium rounded-md hover:bg-indigo-100 text-slate-700 hover:text-indigo-500 transition-colors cursor-pointer"
  >
    {Icon && (
      <motion.span variants={actionIconVariants} className="mr-2 shrink-0">
        <Icon size={16} />
      </motion.span>
    )}
    <span>{text}</span>
  </motion.li>
);

const getIcon = (label, buttonText) => {
  if (buttonText === "Actions") {
    switch (label) {
      case "Edit":
        return FiEdit;
      case "Duplicate":
        return FiPlusSquare;
      case "Share":
        return FiShare;
      case "Remove":
        return FiTrash;
      default:
        return FiEdit;
    }
  }
  return null;
};

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.1 },
  },
  closed: {
    scaleY: 0,
    transition: { when: "afterChildren", staggerChildren: 0.1 },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -10 },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
};

export default CustomDropdown;