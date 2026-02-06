import { useState, useEffect, useRef } from "react";
import { FiChevronDown} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const CustomSearchableDropdown = ({
  options = [],
  value = null, 
  onSelect,
  placeholder = "Select",
  className = "",
}) => {

  const [searchTerm, setSearchTerm] = useState(
    value?.label?.toString() || ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value?.label) {
      setSearchTerm(value.label.toString());
    } else if (value === null || value === "") {
      setSearchTerm("");
    }
  }, [value]);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) => {
        const label = (option?.label ?? "").toString().toLowerCase();
        const search = (searchTerm ?? "").toString().toLowerCase();
        return label.includes(search);
      })
    );
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (value?.label) {
          setSearchTerm(value.label.toString());
        } else {
          setSearchTerm("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleSelect = (option) => {
    if (option) {
      setSearchTerm(option.label);
    } else {
      setSearchTerm("");
    }
    setIsOpen(false);
    onSelect && onSelect(option);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setFilteredOptions(options);
      } else {
        if (value?.label) {
          setSearchTerm(value.label.toString());
        }
      }
      return next;
    });
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    if (!isOpen) {
      toggleOpen();
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <motion.div animate={isOpen ? "open" : "closed"} className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          className="w-full h-9 border border-gray-300 rounded-md px-3 pr-8 bg-surfaceBase text-textPrimary text-[11px] font-medium placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        />
        {value && (
          <span
            className="absolute right-8 top-1/2 -translate-y-1/2 text-GraySecondaryLight cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(null);
            }}
          >
            <X size={14} />
          </span>
        )}
        <motion.span
          variants={iconVariants}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-GraySecondaryLight pointer-events-none"
        >
          <FiChevronDown size={14} />
        </motion.span>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial="closed"
              animate="open"
              exit="closed"
              variants={wrapperVariants}
              style={{ originY: "top" }}
              className="absolute z-50 w-full mt-1 bg-surfaceBase border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto text-sm origin-top"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <motion.li
                    key={`${option.value}-${index}`}
                    variants={itemVariants}
                    onClick={() => handleSelect(option)}
                    className="px-3 py-2 hover:bg-purple-100 cursor-pointer text-GraySecondaryLight"
                  >
                    {option.label}
                  </motion.li>
                ))
              ) : (
                <motion.li
                  className="px-3 py-2 text-surfaceMuted"
                  variants={itemVariants}
                >
                  No options
                </motion.li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.05 },
  },
  closed: {
    scaleY: 0,
    transition: { when: "afterChildren" },
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

export default CustomSearchableDropdown;