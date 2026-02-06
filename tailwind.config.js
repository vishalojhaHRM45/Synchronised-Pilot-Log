import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",

      screens: {
        sm: "640px", 
        md: "768px",
        tab: "820px", 
        lg: "1024px", 
        xl: "1280px",
        "2xl": "1400px", 
      },
    },

    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif", "Poppins", "Roboto"],
        heading: ["Montserrat", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "flight-path": {
          "0%": { left: "0%" },
          "100%": { left: "100%" },
        },
        "flight-path-reverse": {
          "0%": { right: "0%" },
          "100%": { right: "100%" },
        },
        "plane-bounce": {
          "0%, 100%": { transform: "translateY(-50%) translateX(0)" },
          "50%": { transform: "translateY(-60%) translateX(2px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
        "pulse-medium": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".6" },
        },
        "pulse-fast": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "25%": { transform: "translateY(-10px) translateX(5px)" },
          "50%": { transform: "translateY(5px) translateX(-5px)" },
          "75%": { transform: "translateY(-5px) translateX(10px)" },
        },
        fly: {
          "0%": {
            transform: "translateX(0) translateY(0) rotate(0deg)",
            opacity: "0",
          },
          "10%, 90%": { opacity: "1" },
          "100%": {
            transform: "translateX(-100vw) translateY(-20px) rotate(-10deg)",
            opacity: "0",
          },
        },
        flip: {
      
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "flight-path": "flight-path 3s infinite linear",
        "flight-path-reverse": "flight-path-reverse 3s infinite linear",
        "plane-bounce": "plane-bounce 1s infinite ease-in-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "pulse-medium": "pulse-medium 2s ease-in-out infinite",
        "pulse-fast": "pulse-fast 1s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        fly: "fly 6s linear infinite",
        flip: "flip 1s ease-in-out", 
      },
    },
  },
  plugins: [],
};
