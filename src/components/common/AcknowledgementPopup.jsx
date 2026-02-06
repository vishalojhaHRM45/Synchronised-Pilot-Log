import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const AcknowledgementPopup = ({ onAcknowledge }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-surfaceBase max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden"
      >

        <div className="bgGradient-Button p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-surfaceBase" />
            <h2 className="text-2xl font-bold text-surfaceBase">Acknowledgement</h2>
          </div>
        </div>


        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-sm text-GraySecondaryLight leading-relaxed">
              <span className="font-semibold text-blue-900">
                Important Notice:
              </span>{" "}
              Please read the following acknowledgement carefully before
              proceeding.
            </p>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
            <p className="text-sm text-GraySecondaryLight leading-relaxed text-justify">
              I hereby acknowledge that the information displayed in the{" "}
              <span className="font-semibold">Synchronised Pilot Log (SPL)</span>, which
              automates crew flight log entries and uploads them to the EGCA
              portal, is accurate and genuine to the best of my knowledge.
            </p>

            <p className="text-sm text-GraySecondaryLight leading-relaxed text-justify">
              I take full responsibility for verifying and validating the
              entries I accept, approve, or reject within the application.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-xs text-yellow-800 font-medium">
                ⚠️ By acknowledging this statement, you agree to comply with all
                regulatory requirements and take full responsibility for the
                accuracy of flight log data.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-4 border-t">
            <input
              type="checkbox"
              id="acknowledge-checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="acknowledge-checkbox"
              className="text-sm text-GraySecondaryLight cursor-pointer select-none"
            >
              I have read and understood the above statement. I acknowledge my
              responsibility for the accuracy and validation of all flight log
              entries.
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onAcknowledge}
              disabled={!isChecked}
              className={`cursor-pointer px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isChecked
                  ? "bgGradient-Button hover:bg-primary text-surfaceBase shadow-md hover:shadow-lg transform hover:scale-105"
                  : "bg-gray-300 text-surfaceMuted cursor-not-allowed"
                }`}
            >
              I Acknowledge & Continue
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-textPrimary">
              Timestamp:{" "}
              {new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AcknowledgementPopup;
