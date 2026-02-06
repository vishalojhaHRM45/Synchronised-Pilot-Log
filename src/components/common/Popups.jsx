import React, { useState, useRef, useEffect } from "react";
import {
  X,
  User,
  Plane,
  MapPin,
  Upload,
  FileImage,
  CameraIcon,
  PlaneLanding,
  PlaneTakeoff,
  LandPlot,
} from "lucide-react";
import axios from "axios";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

import Button from "./Button";
import toast from "react-hot-toast";
import { pilotService } from "@/services";
import { formatDateTime, hasPilotChanged } from "@/utils/helper";

const CustomDropdown = ({
  buttonText = "",
  options = [],
  onSelect,
  className = "",
  buttonClassName = "",
  variant = "default",
  leftIcon = null,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  const dropdownRef = useRef(null);

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
  }, [disabled]);

  useEffect(() => {
    // if component becomes disabled while open, close it
    if (disabled && open) setOpen(false);
  }, [disabled, open]);

  return (
    <div className={`w-full relative ${className}`} ref={dropdownRef}>
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setOpen((prev) => !prev);
          }}
          disabled={disabled}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          title={disabled ? "Not editable" : undefined}
          className={`flex items-center w-full p-2 text-sm font-medium rounded-md 
            bg-gray-50 ${disabled ? '' : 'hover:bg-indigo-100'} text-slate-700 
            ${disabled ? '' : 'hover:text-indigo-500'} transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${buttonClassName}`}
        >
          {leftIcon && <div className="mr-2">{leftIcon}</div>}

          <span className="flex-1 text-left truncate">{buttonText}</span>

          <motion.span className="ml-2 shrink-0" variants={iconVariants}>
            <FiChevronDown size={14} />
          </motion.span>
        </button>

        <motion.ul
          initial="closed"
          animate={open ? "open" : "closed"}
          variants={wrapperVariants}
          style={{ originY: "top" }}
          className={`absolute top-[110%] left-0 z-9999 bg-surfaceBase rounded-lg shadow-xl p-2 flex flex-col gap-2 ${variant === "match-filter" ? "w-full" : "w-full"
            }`}
        >
          {options.map((option, index) => (
            <Option
              key={index}
              text={option.label}
              Icon={option.icon || getIcon(option.label, buttonText)}
              setOpen={setOpen}
              onClick={() => handleOptionClick(option)}
              disabled={disabled}
            />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

const Option = ({ text, Icon, setOpen, onClick, disabled = false }) => (
  <motion.li
    variants={itemVariants}
    onClick={() => {
      if (disabled) return;
      setOpen(false);
      onClick();
    }}
    className={`flex items-center w-full p-1 text-sm font-medium rounded-md ${disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-indigo-100 text-slate-700 hover:text-indigo-500 transition-colors cursor-pointer'}`}
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

export default function CustomPopup({
  isOpen,
  onClose,
  title,
  flight,
  RM_UserId,
  onUpdate,
}) {
  if (!isOpen || !flight) return null;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);

  const [fileType, setFileType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rejectReasonOptions, setRejectReasonOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [changeTLLoading, setChangeTLLoading] = useState(false);

  const isPending = flight.Status === "PENDING";
  const isRejected = flight.Status === "REJECT";
  const isApproved = flight.Status === "APPROVE";
  // const isEGCA_APPROVE = flight.Status === "EGCA_APPROVE";
  // const isEGCA_REJECT = flight.Status === "EGCA_REJECT";

  const crewOptions = [
    { value: flight?.PicId, label: flight?.PIC },
    { value: flight?.CopilotId, label: flight?.CoPilot },
  ];

  const getStatusClass = () => {
    if (isApproved) return "bg-notificationBg text-green-800 border-green-300";
    if (isPending) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (isRejected) return "bg-red-100 text-red-800 border-red-300";
    // if (isEGCA_REJECT) return "bg-red-100 text-red-800 border-red-300";
    // if (isEGCA_APPROVE) return "bg-notificationBg text-green-800 border-green-300";
    return "bg-surfaceMuted text-white border-gray-300";
  };
  const statusClasses = getStatusClass();

  const handleAcceptClick = () => setShowAcceptConfirm(true);
  const handleRejectClick = () => setShowRejectModal(true);

  const getSelectedLabel = (selectedValue) => {
    return (
      crewOptions.find((opt) => opt.value === selectedValue)?.label ||
      selectedValue
    );
  };

  const formattedValue = flight.TailNumber ? flight.TailNumber.slice(0, 2) + "-" + flight.TailNumber.slice(2) : "VT-";

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      FlightLegId: flight.FlightLegId,
      FlightKey: flight.FlightKey,
      // RM_UserId: RM_UserId,
      CrewPosition: flight.CrewPosition,
      CrewAction: "",

      FlightDate: flight.FlightDate,
      FlightNumber: flight.FlightNumber,
      TailNumber: formattedValue || "VT-",
      Origin: flight.Origin,

      DistanceNM: flight.DistanceNM,
      Destination: flight.Destination,

      FlightTimeDay: flight.flightTimeDay,
      FlightTimeBoth: flight.flightTimeBoth,
      FlightTimeNight: flight.flightTimeNight,

      Takeoff: flight.TakeOff,
      Touchdown: flight.TouchDown,
      ChocksOff: flight.ChocksOff,
      ChocksOn: flight.ChocksOn,

      PicId: flight.PicId,
      PicName: flight.PIC,
      CopilotId: flight.CopilotId,
      CopilotName: flight.CoPilot,

      ArrivalTime: flight.MM_ArrivalTime,
      DepatureTime: flight.MM_DepatureTime,
      InstrumentTime: flight.InstrumentTime,

      OrginalTakeoffPilotId: flight.TakeOffPilotId,
      OrginalTakeoffPilotName: flight.TakeOffPilot,
      OrginalLandingPilotId: flight.LandingPilotId,
      OrginalLandingPilotName: flight.LandingCoPilot,

      DutyCode: flight.DutyCode,
      ServiceTypecode: flight.ServiceTypecode,
      // SubmittedTakeoffPilotId: flight.TakeOffPilotId,
      // SubmittedTakeoffPilotName: flight.TakeOffPilot,
      // SubmittedLandingPilotId: flight.LandingPilotId,
      // SubmittedLandingPilotName: flight.LandingCoPilot,

      TechLogUrl: "",
      CrewRemarks: "",
      RejectionReason: "",
      RejectionCode: "",
    },

    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          TailNumber: values.TailNumber.replace("-", ""), // VTBXJ
          // SubmittedTakeoffPilotId:
          //   values.OrginalTakeoffPilotId === values.SubmittedTakeoffPilotId
          //     ? values.OrginalTakeoffPilotId
          //     : values.SubmittedTakeoffPilotId,
          // SubmittedTakeoffPilotName:
          //   values.OrginalTakeoffPilotName === values.SubmittedTakeoffPilotName
          //     ? values.OrginalTakeoffPilotName
          //     : values.SubmittedTakeoffPilotName,
          // SubmittedLandingPilotId:
          //   values.OrginalLandingPilotId === values.SubmittedLandingPilotId
          //     ? values.OrginalLandingPilotId
          //     : values.SubmittedLandingPilotId,
          // SubmittedLandingPilotName:
          //   values.OrginalLandingPilotName === values.SubmittedLandingPilotName
          //     ? values.OrginalLandingPilotName
          //     : values.SubmittedLandingPilotName,
        };

        if (values.CrewAction === "REJECT") {
          setLoading(true);
          const res = await pilotService.createSubmitPilotCrewFlight(payload);
          if (res.code === 200 && res.status === "success") {
            onUpdate();
            setShowRejectModal(false);
            onClose();
            toast.success("Rejected Successfully");
          } else {
            alert(res.message);
            setLoading(false);
          }
        } else if (values.CrewAction === "APPROVE") {
          setLoading(true);
          const res = await pilotService.createSubmitPilotCrewFlight(payload);
          if (res.code === 200 && res.status === "success") {
            onUpdate();
            setShowAcceptConfirm(false);
            onClose();
            toast.success("Approved Successfully");
          } else {
            alert(res.message);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchRejectReasons = async () => {
      try {
        const response = await pilotService.getChangeReasonEnum();

        if (response?.ChangeReasonEnum) {
          const formattedOptions = response.ChangeReasonEnum.map((reason) => ({
            value: reason.Id,
            label: reason.ChangeReason,
            changeTextKey: reason.ChangeText?.trim() || "",
          }));
          setRejectReasonOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching rejection reasons:", error);
      }
    };

    if (showRejectModal) {
      fetchRejectReasons();
    }
  }, [showRejectModal]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and PDF files are allowed!");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size should not exceed 10MB!");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}egcaix/uploadTechLog`, formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      if (res.data?.file_url) {
        const previewUrl = `${import.meta.env.VITE_API_BASE_URL}egcaix/getTechLog/${res.data.file_url}`;
        setFileType(file.type);
        setCapturedImage(previewUrl);
        formik.setFieldValue("TechLogUrl", res.data.file_url);
      } else {
        toast.error("Upload succeeded but no file URL returned");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error(err?.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setCapturedImage(null);
    setFileType(null);
    formik.setFieldValue("TechLogUrl", "");
  };

  const disableSubmit =
    (isUploading ||
      !formik.values.RejectionCode ||
      ((formik.values.RejectionCode === 3 || formik.values.RejectionCode === 1) &&
        !formik.values.CrewRemarks?.trim())
      || !hasPilotChanged(formik)
    );

  // Change Takeoff/Landing Formik
  const changeTLFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      FlightKey: flight.FlightKey,
      SubmissionId: flight.SubmissionId || null,
      OrginalTakeoffPilotId: flight.TakeOffPilotId,
      OrginalTakeoffPilotName: flight.TakeOffPilot,
      OrginalLandingPilotId: flight.LandingPilotId,
      OrginalLandingPilotName: flight.LandingCoPilot,

      SubmittedTakeoffPilotId: flight.TakeOffPilotId,
      SubmittedTakeoffPilotName: flight.TakeOffPilot,
      SubmittedLandingPilotId: flight.LandingPilotId,
      SubmittedLandingPilotName: flight.LandingCoPilot,
    },

    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          SubmittedTakeoffPilotId:
            values.OrginalTakeoffPilotId === values.SubmittedTakeoffPilotId
              ? values.OrginalTakeoffPilotId
              : values.SubmittedTakeoffPilotId,
          SubmittedTakeoffPilotName:
            values.OrginalTakeoffPilotName === values.SubmittedTakeoffPilotName
              ? values.OrginalTakeoffPilotName
              : values.SubmittedTakeoffPilotName,
          SubmittedLandingPilotId:
            values.OrginalLandingPilotId === values.SubmittedLandingPilotId
              ? values.OrginalLandingPilotId
              : values.SubmittedLandingPilotId,
          SubmittedLandingPilotName:
            values.OrginalLandingPilotName === values.SubmittedLandingPilotName
              ? values.OrginalLandingPilotName
              : values.SubmittedLandingPilotName,
        };

        setChangeTLLoading(true);
        const response = await pilotService.postTLChangeRequest(payload);
        if (response.code === 200 && response.status === "success") {
          toast.success(response.message);
          onUpdate();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error(error.message);
      } finally {
        setChangeTLLoading(false);
      }
    },
  });

  const handleCrewChange = async (key, option) => {
    if (!option) return;
    const current = changeTLFormik.values || {};
    const newValues = {
      ...current,
      SubmittedTakeoffPilotId: key === "takeoff" ? option.value : current.SubmittedTakeoffPilotId,
      SubmittedTakeoffPilotName: key === "takeoff" ? option.label : current.SubmittedTakeoffPilotName,
      SubmittedLandingPilotId: key === "landing" ? option.value : current.SubmittedLandingPilotId,
      SubmittedLandingPilotName: key === "landing" ? option.label : current.SubmittedLandingPilotName,
    };

    changeTLFormik.setValues(newValues);
    try {
      await changeTLFormik.submitForm();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      {changeTLLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            <p className="text-white font-semibold">Loading...</p>
          </div>
        </div>
      ) : (
        <div
          onClick={handleOverlayClick}
          className="fixed  inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-5 md:p-5 overflow-auto"
        >
          <div className="bg-surfaceBase rounded-2xl shadow-xl max-w-5xl overflow-hidden border border-gray-200">

            <div className=" flex items-center justify-between px-6 py-4 border-b border-gray-400 bg-gray-50">
              <h2 className="text-xl font-semibold text-textSecondary">{title}</h2>

              <div className="flex align-items-center justify-content-center">
                <button
                  onClick={onClose}
                  className="cursor-pointer text-surfaceMuted hover:text-GraySecondaryLight text-2xl font-bold"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="px-6 py-4  overflow-y-auto">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                <InfoBlock
                  label="Departure (UTC)"
                  icon={<PlaneTakeoff size={18} />}
                  value={`${formatDateTime(flight?.MM_DepatureTime)}`}
                />
                <InfoBlock
                  label="Arrival (UTC)"
                  icon={<PlaneLanding size={18} />}
                  value={`${formatDateTime(flight?.MM_ArrivalTime)}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                <InfoBlock
                  icon={<MapPin size={18} />}
                  label="Departure Airport"
                  value={flight.Origin || ""}
                />
                <InfoBlock
                  icon={<MapPin size={18} />}
                  label="Arrival Airport"
                  value={flight.Destination || ""}
                />
              </div>

              <div className=" grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                <InfoBlock
                  icon={<Plane size={18} />}
                  label="Tail Number"
                  value={formattedValue || ""}
                />
                <InfoBlock
                  icon={<Plane size={18} />}
                  label="Flight Number"
                  value={flight.FlightNumber || ""}
                />
              </div>

              <div className=" grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                <InfoBlock
                  icon={<Plane size={18} />}
                  label="Aircraft Type"
                  value={flight.AircraftType || ""}
                />
                <InfoBlock
                  icon={<LandPlot size={18} />}
                  label="Distance NM"
                  value={flight.DistanceNM || ""}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                <InfoBlock
                  icon={<User size={18} />}
                  label="PIC"
                  value={flight.PIC || "-"}
                />
                <InfoBlock
                  icon={<User size={18} />}
                  label="CoPilot"
                  value={flight.CoPilot || "-"}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <CrewDropdown
                  icon={<User size={18} />}
                  label="Takeoff"
                  options={crewOptions}
                  getSelectedLabel={getSelectedLabel}
                  value={changeTLFormik.values.SubmittedTakeoffPilotId}
                  onChange={(val) => handleCrewChange("takeoff", val)}
                  buttonText={getSelectedLabel(changeTLFormik.values.SubmittedTakeoffPilotName)}
                  disabled={flight?.IstakeoffEditable === 0}
                />
                <CrewDropdown
                  icon={<User size={18} />}
                  label="Landing"
                  options={crewOptions}
                  getSelectedLabel={getSelectedLabel}
                  value={changeTLFormik.values.SubmittedLandingPilotId}
                  onChange={(val) => handleCrewChange("landing", val)}
                  buttonText={getSelectedLabel(changeTLFormik.values.SubmittedLandingPilotName)}
                  disabled={flight?.IslandingEditable === 0}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 my-5">
                <ColoredCard
                  color="bg-sky-100"
                  title="✈ OOOI Timing"
                  content={[
                    ["Chocks Off", flight.ChocksOff || "--"],
                    ["Airborne", flight.TakeOff || "--"],
                    ["Chocks On", flight.ChocksOn || "--"],
                    ["Touch Down", flight.TouchDown || "--"],
                  ]}
                />
                <ColoredCard
                  color="bg-amber-50"
                  title="☀ Day/Night"
                  content={[
                    [
                      "Day",
                      (flight.flightTimeDay || "--").replace(/h$/, "H") || "00:00H",
                    ],
                    ["Night", `${flight.flightTimeNight || "--"}` || "00:00H"],
                  ]}
                />
                <ColoredCard
                  color="bg-rose-50"
                  title="⏱ Instrument Time"
                  content={[["Duration", `${flight.InstrumentTime || 0}`]]}
                />
              </div>

              {flight?.StatusString && flight?.StatusString?.length > 0 && (
                <div className={`my-5 p-2 border rounded-lg ${statusClasses}`}>
                  <span className="font-semibold text-[16px]">Status: </span>
                  {flight.StatusString}
                </div>
              )}

              {flight?.RejectionReason && flight?.RejectionReason?.length > 0 && (
                <div className={`my-5 p-2 rounded-lg bg-sky-100`}>
                  <span className="font-semibold text-[16px]">Reason: </span>
                  {flight.RejectionReason}
                </div>
              )}


              {flight?.TechLogURL && flight?.TechLogURL?.length > 0 && (
                <div className="flex items-center gap-2 my-2 pl-1">
                  <span className="text-GraySecondaryLight font-medium leading-none">
                    Uploaded Techlog
                  </span>
                  <button
                    onClick={() => setPreviewImage(flight.TechLogURL)}
                    className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    title="View Techlog"
                  >
                    <FileImage size={18} className="mt-1" />
                  </button>
                </div>
              )}

              {previewImage && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
                  <div className="bg-surfaceBase rounded-lg max-w-4xl max-h-[90vh] w-full overflow-auto relative shadow-2xl">
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-4 right-4 bg-red-100 border-red-300 rounded-full shadow-md p-1 cursor-pointer"
                    >
                      <X size={20} className="text-red-600" />
                    </button>
                    <div className="p-2 flex items-center justify-center min-h-[400px] bg-gray-50">
                      <img
                        loading="lazy"
                        src={`${import.meta.env.VITE_API_BASE_URL}egcaix/getTechLog/${previewImage}`}
                        alt={previewImage}
                        className="max-w-full max-h-[70vh] object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {flight.IsActionable === 1 && (
                <div className="flex flex-col mt-5 sm:flex-row gap-2 sm:gap-4">
                  <Button
                    name="APPROVE"
                    onClick={() => {
                      formik.setFieldValue("CrewAction", "APPROVE");
                      handleAcceptClick();
                    }}
                    className="flex-1 bg-buttonGreen"
                  />

                  <Button
                    name="REJECT"
                    onClick={() => {
                      formik.setFieldValue("CrewAction", "REJECT");
                      handleRejectClick();
                    }}
                    className="flex-1 bg-red-500"
                  />
                </div>
              )}
            </form>
          </div>

          {showAcceptConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
              <div className="bg-surfaceBase rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                <p className="text-GraySecondaryLight mb-6">
                  Do you want to approve this flight entry?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    disabled={loading}
                    onClick={() => setShowAcceptConfirm(false)}
                    className="px-4 py-2 text-GraySecondaryLight border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  <Button
                    loading={loading}
                    name="Yes, Approve"
                    onClick={() => formik.handleSubmit()}
                    className="px-4 py-2 bg-buttonGreen text-surfaceBase rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {showRejectModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
              <div className="bg-surfaceBase rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center p-3 justify-between bg-surfaceBase border-b border-gray-200 shadow-sm">
                  <h3 className="text-[18px] font-semibold">Rejection Details</h3>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      formik.resetForm();
                      setCapturedImage(null);
                    }}
                    className="text-surfaceMuted hover:text-GraySecondaryLight text-2xl font-bold cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="border-b border-gray-300 mb-2" />
                <div className="py-3 px-6 space-y-4">

                  <div className="flex flex-col">
                    <label className="font-medium text-sm mb-2">
                      Select Reason for Rejection:
                    </label>
                    <CustomDropdown
                      variant="match-filter"
                      options={rejectReasonOptions}
                      onSelect={(option) => {
                        formik.setFieldValue("RejectionCode", option.value);
                        formik.setFieldValue("CrewRemarks", "");
                      }}
                      buttonClassName="border border-gray-300 rounded px-2 py-1 text-left justify-start w-full"
                      buttonText={
                        rejectReasonOptions.find(
                          (opt) => opt.value === formik.values.RejectionCode
                        )?.label || "Select Reason"
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-medium text-sm mb-2">
                      Enter Detailed Reason:{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Please explain why you are rejecting this flight (required)..."
                      value={formik.values.CrewRemarks || ""}
                      required={true}
                      onChange={(e) =>
                        formik.setFieldValue("CrewRemarks", e.target.value)
                      }
                      className="border border-gray-300 rounded px-3 py-2 text-sm resize-none h-24 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-textSecondary mb-2">
                      Upload Photo/PDF (Optional):
                    </label>

                    {/* show upload controls only when no preview exists */}
                    {!capturedImage && (
                      <div
                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 transition w-full relative"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("cameraInput").click()
                          }
                          className="absolute top-3 right-3 p-2 primary-bgGradient hover:primary-bgGradient rounded-full shadow cursor-pointer"
                          title="Open Camera"
                        >
                          <CameraIcon size={20} className="text-primary" />
                        </button>

                        <div
                          className="flex flex-col items-center justify-center cursor-pointer"
                          onClick={() => document.getElementById("fileInput").click()}
                        >
                          <div className="text-primary mb-2">
                            <Upload size={32} />
                          </div>
                          <p className="text-sm font-medium text-GraySecondaryLight mb-1">
                            Click to Upload
                          </p>
                          <p className="text-xs text-surfaceMuted text-center">
                            PNG, JPG, PDF up to 10MB each
                          </p>
                        </div>


                        <input
                          type="file"
                          id="fileInput"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleFileUpload(file);
                          }}
                        />

                        <input
                          type="file"
                          id="cameraInput"
                          className="hidden"
                          capture="environment"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                      </div>
                    )}

                    {isUploading && !capturedImage && (
                      <p className="text-sm text-primary mt-2">
                        Uploading... {uploadProgress}%
                      </p>
                    )}

                    {capturedImage && (
                      <div className="relative mt-4">
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute top-7 right-0 bg-surfaceBase border border-red-300 rounded-full shadow-md p-1 hover:bg-red-100 transition cursor-pointer"
                        >
                          <X size={15} className="text-red-600" />
                        </button>

                        <p className="text-sm text-GraySecondaryLight mb-2">
                          Preview:
                        </p>

                        {fileType === "application/pdf" ? (
                          // <iframe
                          //   src={capturedImage}
                          //   title="PDF Preview"
                          //   className="w-full h-60 border rounded-lg"
                          // ></iframe>
                          <embed
                            title="PDF Preview"
                            src={capturedImage}
                            type="application/pdf"
                            className="w-full h-60 border rounded-lg"
                          />
                        ) : (
                          <img
                            src={capturedImage}
                            alt="Captured"
                            className="rounded-lg border border-gray-200 max-h-60 object-contain w-full"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    name="SUBMIT"
                    loading={loading}
                    disabled={disableSubmit}
                    onClick={() => {
                      formik.handleSubmit();
                    }}
                    className="cursor-pointer w-full bg-primary text-surfaceBase font-bold py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function InfoBlock({ icon, label, value }) {
  return (
    <div className="flex items-center p-1 sm:p-2 rounded-lg">
      {icon && <div className="mr-1 sm:mr-2">{icon}</div>}
      <span className="font-medium text-sm sm:text-base">{label}:</span>
      <div className="flex items-center">
        <span className="ml-1 text-GraySecondaryLight text-sm sm:text-base ">
          {value || "--"}
        </span>
      </div>
    </div>
  );
}

function CrewDropdown({
  icon,
  label,
  value,
  options,
  onChange,
  pilotLabel,
  getSelectedLabel,
  disabled,
}) {
  return (
    <>
      {pilotLabel ? (
        <div className="flex flex-col rounded-lg">
          <label className="font-medium text-sm mb-2">{label}:</label>

          <CustomDropdown
            options={options}
            buttonText={getSelectedLabel(value)}
            onSelect={(option) => onChange(option)}
            variant="match-filter"
            className="w-full"
            buttonClassName="border border-gray-300 rounded px-2 py-1 text-left justify-start"
          />
        </div>
      ) : (
        <div className="flex items-center p-1 sm:p-2 rounded-lg">
          {icon && <div className="mr-1 sm:mr-2">{icon}</div>}
          <div className="flex items-center flex-1">
            <span className="font-medium text-sm sm:text-base mr-1 whitespace-nowrap">
              {label}:
            </span>
            <CustomDropdown
              options={options}
              buttonText={getSelectedLabel(value)}
              onSelect={(option) => !disabled && onChange(option)}
              variant="match-filter"
              className="flex-1"
              buttonClassName={`border border-gray-300 rounded px-2 py-1 text-left justify-start ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </>
  );
}

function ColoredCard({ color, title, content }) {
  const isOOOICard = title === "✈ OOOI Timing";

  return (
    <div className={`${color} border border-gray-300 rounded-xl p-3 sm:p-4`}>
      <p className="font-bold mb-2 sm:mb-3 text-textSecondary text-sm sm:text-base flex items-center gap-2">
        {title}
      </p>

      <div
        className={`text-sm ${isOOOICard
          ? "grid grid-cols-2 gap-y-2 sm:gap-y-3"
          : "space-y-1 sm:space-y-2"
          }`}
      >
        {content.map(([label, value], i) => (
          <div key={i} className="flex flex-col">
            <span className="text-GraySecondaryLight flex items-center gap-1">
              {label}
            </span>
            <span className="font-semibold text-textSecondary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


{/* {formik.values.RejectionCode === 2 && (
  <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 sm:gap-4">
    <CrewDropdown
      pilotLabel={true}
      label="Takeoff"
      options={crewOptions}
      getSelectedLabel={getSelectedLabel}
      value={formik.values.SubmittedTakeoffPilotId}
      onChange={(val) => {
        formik.setFieldValue(
          "SubmittedTakeoffPilotName",
          val.label
        );
        formik.setFieldValue(
          "SubmittedTakeoffPilotId",
          val.value
        );
      }}
      buttonText={getSelectedLabel(
        formik.values.SubmittedTakeoffPilotName
      )}
    />
    <CrewDropdown
      pilotLabel={true}
      label="Landing"
      options={crewOptions}
      getSelectedLabel={getSelectedLabel}
      value={formik.values.SubmittedLandingPilotId}
      onChange={(val) => {
        formik.setFieldValue(
          "SubmittedLandingPilotName",
          val.label
        );
        formik.setFieldValue(
          "SubmittedLandingPilotId",
          val.value
        );
      }}
      buttonText={getSelectedLabel(
        formik.values.SubmittedLandingPilotName
      )}
    />
  </div>
)} */}

{/* {flight?.IsActionable === 1 ? (
  <div className="flex flex-col">
    <label className="font-medium text-sm mb-2">
      Enter Detailed Reason:{" "}
      {formik.values.RejectionCode === 3 && (
        <span className="text-red-500">*</span>
      )}
    </label>
    <textarea
      placeholder={
        formik.values.RejectionCode === 3
          ? "Please explain why you are rejecting this flight (required)..."
          : "Optional remarks (if any)..."
      }
      value={formik.values.CrewRemarks || ""}
      required={formik.values.RejectionCode === 3}
      onChange={(e) =>
        formik.setFieldValue("CrewRemarks", e.target.value)
      }
      className="border border-gray-300 rounded px-3 py-2 text-sm resize-none h-24 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
) : (
  <div className="flex flex-col">
    <label className="font-medium text-sm mb-2">
      Enter Detailed Reason:{" "}
      {formik.values.RejectionCode === 3 && (
        <span className="text-red-500">*</span>
      )}
    </label>
    <textarea
      placeholder={
        formik.values.RejectionCode === "other"
          ? "Please explain why you are rejecting this flight (required)..."
          : "Optional remarks (if any)..."
      }
      value={formik.values.CrewRemarks || ""}
      required={formik.values.RejectionCode === 3}
      onChange={(e) =>
        formik.setFieldValue("CrewRemarks", e.target.value)
      }
      className="border border-gray-300 rounded px-3 py-2 text-sm resize-none h-24 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
)} */}