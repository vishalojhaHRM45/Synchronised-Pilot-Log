import { motion } from "framer-motion";
const FlipButton = ({
  isFlipped,
  onClick,
  frontText,
  backText,
  frontStyle,
  backStyle,
}) => {
  return (
    <motion.div className="relative w-full h-9" style={{ perspective: 1000 }}>
      <motion.div
        className="absolute inset-0 rounded-md shadow-md flex items-center justify-center"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.button
          className={`cursor-pointer w-full h-9 rounded-md font-semibold text-[13px] ${frontStyle}`}
          style={{ backfaceVisibility: "hidden" }}
          onClick={onClick}
        >
          {frontText}
        </motion.button>

        <motion.div
          className={`absolute inset-0 w-full h-9 rounded-md font-semibold flex items-center justify-center ${backStyle}`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {backText}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FlipButton; 