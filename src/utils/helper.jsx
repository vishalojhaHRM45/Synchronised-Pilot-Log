import moment from "moment";
import { useEffect, useState } from "react";
import DeviceDetector from "device-detector-js";

export default function useDeviceInfoPro(enableGPS = false) {
  const [info, setInfo] = useState({
    os: null,
    device: null,
    isPWA: false,
    screen: null,
    loading: true,
    browser: null,
  });

  useEffect(() => {
    async function fetchInfo() {
      const deviceDetector = new DeviceDetector();
      const ua = navigator.userAgent;
      const parsed = deviceDetector.parse(ua);


      const deviceType =
        parsed.device?.type?.charAt(0).toUpperCase() +
        parsed.device?.type?.slice(1) || "Unknown";
      const os = parsed.os?.name || "Unknown";
      const browser = parsed.client?.name || "Unknown";


      const screenInfo = {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio,
      };

      const isPWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setInfo({
        os,
        isPWA,
        browser,
        loading: false,
        device: deviceType,
        screen: screenInfo,
      });
    }

    fetchInfo();
  }, [enableGPS]);

  return info;
}

export const getTruncatedName = (fullName) => {
  if (!fullName) return fullName;
  const parts = fullName.trim().split(' ');
  if (parts.length < 2) return fullName;
  const firstName = parts[0];
  const surname = parts.slice(1).join(' ');
  const maxSurnameLen = 20;
  const truncatedSurname = surname.length > maxSurnameLen ? surname.slice(0, maxSurnameLen) + '...' : surname;
  return `${firstName} ${truncatedSurname}`;
};


export const calculateFlightTime = (depStr, arrStr) => {
  const dep = new Date(depStr);
  const arr = new Date(arrStr);
  const diffMs = arr - dep;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}H`;
};


export const parseTime = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};


export const formatDateISO = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export const getDateParts = (dateStr) => {
  const d = moment(dateStr);
  return {
    month: d.format("MMM"),
    day: d.format("DD"),
    year: d.format("YYYY"),
  };
};

export const formatDateTime = (date, format = "MMM DD, YYYY HH:mm") => {
  return moment(date).format(format);
};

// Parses timing strings in the format "out|off|on|in"
export const parseTimings = (timingStr) => {
  if (!timingStr || timingStr === "-")
    return { chocksOff: "-", airborne: "-", touchdown: "-", chocksOn: "-" };
  const parts = timingStr.split("|").map(t => t.trim());
  return {
    chocksOff: parts[0] ?? "-", // Index 0 = Out (Chocks Off)
    airborne: parts[1] ?? "-", // Index 1 = Off (Airborne)
    touchdown: parts[2] ?? "-", // Index 2 = On (Touchdown)
    chocksOn: parts[3] ?? "-"  // Index 3 = In (Chocks On)
  };
};

export const createQueryString = (params, removeEmpty = true) => {
  const filtered = Object.entries(params)
    .filter(([, value]) => {
      if (!removeEmpty) return true;
      return value !== undefined && value !== null && value !== '';
    })
    .map(([key, value]) => [key, value]);
  return new URLSearchParams(filtered).toString();
};


export const hasPilotChanged = (formik) => {
  if (formik.values.RejectionCode !== 2) return true;

  return (
    formik.values.SubmittedTakeoffPilotId !== formik.initialValues.SubmittedTakeoffPilotId ||
    formik.values.SubmittedLandingPilotId !== formik.initialValues.SubmittedLandingPilotId
  );
};
