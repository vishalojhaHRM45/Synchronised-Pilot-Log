import React from "react";
import { motion } from "framer-motion";
import { AdobeExpress, CloudBg } from "@/assets";

function Banner() {
  return (
    <div className="w-full z-[-1] flex flex-col items-center justify-center pb-6 px-2 BG-Banner mb-4 animate-fade-in overflow-hidden">
      <div className="relative w-full  sm:h-20 md:h-24 overflow-visible">
        <motion.img
          src={CloudBg}
          alt="Cloud1"
          className="absolute w-20 sm:w-28 md:w-36 top-2 left-4 z-0 opacity-70  animate-float"
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <motion.img
          src={CloudBg}
          alt="Cloud2"
          className="absolute w-16 sm:w-24 md:w-28 top-4 right-6 z-0 opacity-60  animate-float"
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.img
          src={CloudBg}
          alt="Cloud3"
          className="absolute w-14 sm:w-20 md:w-24 top-10 left-1/2 transform -translate-x-1/2 z-0 opacity-50  animate-float"
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        />
        <motion.img
          src={CloudBg}
          alt="Cloud4"
          className="absolute w-18 sm:w-24 md:w-28 bottom-2 right-1/3 z-0 opacity-65  animate-float"
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.img
          src={AdobeExpress}
          alt="Plane"
          className="absolute w-28 h-24 sm:w-40 sm:h-32 z-5"
          initial={{ x: "-30vw" }}
          animate={{ x: "100vw" }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 9,
              ease: "linear",
            },
          }}
        />
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-surfaceBase mb-1 drop-shadow-lg text-center">
        Synchronised Pilot Log (SPL)
      </h1>
      <p className="text-base text-surfaceBase/90 mb-14 text-center">
        Your Flight Records. On Autopilot
      </p>
    </div>
  );
}
export default Banner;
