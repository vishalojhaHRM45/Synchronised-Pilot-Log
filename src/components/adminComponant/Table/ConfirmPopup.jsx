import { useEffect, useState, useRef } from "react";
import Button from "@/components/common/Button";
import CustomDropdown from "@/components/common/CustomDropdown";
import * as Yup from "yup";
import { FileImage, X, RotateCw, Download, Minus, Plus } from "lucide-react";
import { useFormik } from "formik";
import { parseTimings } from "@/utils/helper";
import { adminService } from "@/services";

const ConfirmPopup = ({ title, onCancel, onConfirm, selectedData }) => {
  const submitData = selectedData?.entries[1];

  const [remarksValue, setRemarksValue] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Image manipulation states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const acarsData = parseTimings(submitData?.Acars);
  const mmData = parseTimings(submitData?.MM);
  const cmData = parseTimings(submitData?.CM);
  const logData = parseTimings(submitData?.Log);

  const CrewDropdown = ({ label, value, options, onChange, getSelectedLabel, rightIcon }) => {
    return (
      <div className="flex flex-col">
        <label className="block mb-1 text-sm font-medium text-textSecondary">
          {label}:
        </label>
        <CustomDropdown
          options={options}
          className="w-full"
          rightIcon={rightIcon}
          buttonText={getSelectedLabel(value)}
          onSelect={(option) => onChange(option)}
          buttonClassName="border border-gray-300 rounded px-2 py-2 text-left justify-start"
        />
      </div>
    );
  };

  const TableTimePicker = ({ value, onChange, disabled = false }) => {
    const [localValue, setLocalValue] = useState(value || "");
    const inputRef = useRef(null);

    useEffect(() => {
      setLocalValue(value || "");
    }, [value]);

    const validateAndFormat = (v) => {
      if (!v) return "";
      if (!/^[0-9:]*$/.test(v)) return "";
      if (/^\d{1,2}$/.test(v)) {
        let hh = parseInt(v, 10);
        if (hh > 24) return "";
        return v;
      }
      if (/^\d{1,2}:$/.test(v)) {
        let hh = parseInt(v.split(":")[0], 10);
        if (hh > 24) return "";
        return v;
      }
      if (/^\d{1,2}:\d{0,2}$/.test(v)) {
        let [hh, mm] = v.split(":");
        hh = parseInt(hh || "0", 10);
        mm = mm ? parseInt(mm, 10) : null;
        if (hh > 24) return "";
        if (mm !== null && mm > 59) return "";
        return v;
      }
      return "";
    };

    const handleTyping = (e) => {
      let raw = e.target.value;
      if (/^\d{2}$/.test(raw)) {
        raw = raw + ":";
        setLocalValue(raw);
        setTimeout(() => {
          inputRef.current?.setSelectionRange(3, 3);
        }, 0);
        return;
      }
      const formatted = validateAndFormat(raw);
      setLocalValue(formatted);
    };

    const handleBlur = () => {
      if (!localValue) {
        onChange("");
        return;
      }
      let final = localValue;
      if (/^\d{1,2}:$/.test(localValue)) final = localValue + "00";
      if (/^\d{1,2}$/.test(localValue)) final = localValue.padStart(2, "0") + ":00";

      if (!/^\d{2}:\d{2}$/.test(final)) {
        setLocalValue(final);
        return;
      }

      let [hRaw, mRaw] = final.split(":");
      let h = parseInt(hRaw, 10);
      let m = parseInt(mRaw, 10);

      if (isNaN(h) || h > 23 || isNaN(m) || m > 59) {
        setLocalValue(localValue);
        return;
      }
      const formatted = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      setLocalValue(formatted);
      onChange(formatted);
    };

    if (disabled) {
      return <div className="text-sm text-gray-500 text-center py-2">{value || "-"}</div>;
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleTyping}
        onBlur={handleBlur}
        placeholder="HH:MM"
        maxLength={5}
        className="w-full px-2 py-1 text-center border rounded border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
      />
    );
  };

  const crewOptions = [
    { value: submitData?.picId, label: submitData?.picName },
    { value: submitData?.copilotId, label: submitData?.copilotName },
  ];

  const getSelectedLabel = (selectedValue) => {
    return crewOptions.find((opt) => opt?.value === selectedValue)?.label || selectedValue;
  };

  const formattedValue = submitData?.tailNumber ? submitData?.tailNumber.slice(0, 2) + "-" + submitData?.tailNumber.slice(2) : "VT-";

  const formik = useFormik({
    validateOnMount: true,
    enableReinitialize: true,
    initialValues: {
      AdminRemarks: "",
      AdminAction: "",
      SubmissionId: submitData?.submissionId || selectedData?.submissionId,
      // AdminTailNumber: submitData?.tailNumber,
      AdminTailNumber: formattedValue || "VT-",

      AdminChocksOff: logData?.chocksOff, // Out
      AdminTakeoff: logData?.airborne, // Off
      AdminTouchdown: logData?.touchdown, // On
      AdminChocksOn: logData?.chocksOn, // In

      AdminTakeoffPilotId: submitData?.takeoffPilotId,
      AdminTakeoffPilotName: submitData?.takeoffPilotName,
      AdminLandingPilotId: submitData?.landingPilotId,
      AdminLandingPilotName: submitData?.landingPilotName,
    },

    validationSchema: Yup.object({
      AdminRemarks: Yup.string()
        .trim()
        .required("Remarks is required")
        .max(200, "Maximum 200 characters allowed.")
        .matches(/^[a-zA-Z0-9 .,!?:-]*$/, "Only letters, numbers, spaces and . , ! ? : - are allowed."),
      AdminTailNumber: Yup.string()
        .matches(/^VT-[A-Z]{3}$/, "Format must be VT-XXX.")
        .length(6, "Tail Number must be exactly 6 letters.")
        .required("Tail Number is required"),
    }),

    onSubmit: (values) => {
      const buildAdminPayload = (values, submitData) => {
        return {
          ...values,
          AdminTailNumber: values.AdminTailNumber.replace("-", ""), // VTBXJ
          AdminTakeoffPilotId: submitData.takeoffPilotId === values.AdminTakeoffPilotId
            ? submitData.takeoffPilotId
            : values.AdminTakeoffPilotId,
          AdminTakeoffPilotName: submitData.takeoffPilotName === values.AdminTakeoffPilotName
            ? submitData.takeoffPilotName
            : values.AdminTakeoffPilotName,
          AdminLandingPilotId: submitData.landingPilotId === values.AdminLandingPilotId
            ? submitData.landingPilotId
            : values.AdminLandingPilotId,
          AdminLandingPilotName: submitData.landingPilotName === values.AdminLandingPilotName
            ? submitData.landingPilotName
            : values.AdminLandingPilotName,
        };
      };
      onConfirm(buildAdminPayload(values, submitData));
      // onCancel()
    },
  });

  useEffect(() => {
    setRemarksValue(formik.values.AdminRemarks || "");
  }, [formik.values.AdminRemarks]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  // Image manipulation functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    if (!previewUrl) return;

    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = previewFile || 'techlog_image';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };

  const handleMouseDown = (e) => {
    if (previewType !== 'image' || zoomLevel <= 1) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || previewType !== 'image' || zoomLevel <= 1) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Calculate boundaries based on zoom level
    const maxX = Math.max(0, (imageDimensions.width * zoomLevel - (containerRef.current?.clientWidth || 0)) / 2);
    const maxY = Math.max(0, (imageDimensions.height * zoomLevel - (containerRef.current?.clientHeight || 0)) / 2);

    setPosition({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset image manipulation states when preview closes
  useEffect(() => {
    if (!previewFile) {
      setZoomLevel(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [previewFile]);

  const hasValidTechLogURL = Boolean(submitData?.TechLogURL);

  return (
    <div onClick={handleOverlayClick} className="fixed inset-0 z-999 flex items-center justify-center backdrop-blur-sm bg-black/30 p-5">
      <div className="bg-surfaceBase rounded-lg shadow-xl max-w-5xl w-full overflow-y-auto max-h-[97vh] border border-gray-200">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-400 bg-gray-50">
          <h2 className="text-xl font-semibold text-textSecondary">{title}</h2>
          <button onClick={onCancel} className="cursor-pointer text-surfaceMuted hover:text-hoverText text-2xl font-bold">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="px-6 py-4">
          {/* Flight Date and Flight Number */}
          <div className="grid md:grid-cols-4 sm:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-textSecondary">Flight Date:</label>
              <input
                disabled
                type="text"
                value={submitData?.flightDate}
                className="w-full px-4 py-2 bg-gray-100 border rounded text-sm border-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-textSecondary">Flight Number:</label>
              <input
                disabled
                type="text"
                value={submitData?.flightNumber}
                className="w-full px-4 py-2 bg-gray-100 border rounded text-sm border-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-textSecondary">Sector:</label>
              <input
                disabled
                type="text"
                value={`${submitData?.origin} - ${submitData?.destination}`}
                className="w-full px-4 py-2 bg-gray-100 border rounded text-sm border-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-textSecondary">Tail Number:</label>
              <input
                type="text"
                maxLength={6}
                placeholder="VT-BXJ"
                name="AdminTailNumber"
                onBlur={formik.handleBlur}
                value={formik.values.AdminTailNumber}
                // onChange={(e) => {
                //   let value = e.target.value.toUpperCase();
                //   if (/^[A-Z]*$/.test(value)) formik.setFieldValue("AdminTailNumber", value);
                // }}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase();
                  if (!value.startsWith("VT-")) {
                    value = "VT-";
                  }
                  let suffix = value.slice(3);
                  suffix = suffix.replace(/[^A-Z]/g, "").slice(0, 3);
                  formik.setFieldValue("AdminTailNumber", `VT-${suffix}`);
                }}

                className={`w-full px-4 py-2 text-textPrimary bg-surfaceBase border rounded text-sm ${formik.touched.AdminTailNumber && formik.errors.AdminTailNumber
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:outline-none focus:border-blue-500"
                  }`}
              />
              {formik.touched.AdminTailNumber && formik.errors.AdminTailNumber && (
                <p className="text-red-600 text-xs mt-1">{formik.errors.AdminTailNumber}</p>
              )}
            </div>
          </div>

          {/* Flight Type, Tail Number and P1 P2 Exercise Type */}
          <div className="grid md:grid-cols-3 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-textSecondary">Flight Type:</label>
              <input
                disabled
                type="text"
                value={submitData?.FlightType || "-"}
                className="w-full px-4 py-2 bg-gray-100 border rounded text-sm border-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-textSecondary">P1 Exercise Type:</label>
              <input
                disabled
                type="text"
                value={submitData?.PICExerciseTypeId || "-"}
                className="w-full px-4 py-2 bg-gray-100 border rounded text-sm border-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-textSecondary">P2 Exercise Type:</label>
              <input
                disabled
                type="text"
                value={submitData?.CopilotExerciseTypeId || "-"}
                className="w-full px-4 py-2 bg-gray-100 border rounded text-sm border-gray-300 cursor-not-allowed"
              />
            </div>
          </div>

          {/* --- NEW TABLE STRUCTURE --- */}
          <div className="mb-6 border rounded-lg overflow-hidden border-gray-300">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-0 bg-gray-100 border-b border-gray-300 text-sm font-semibold text-gray-700 text-center">
              <div className="p-2 border-r border-gray-300">Timings</div>
              <div className="p-2 border-r border-gray-300">Chocks Off</div>
              <div className="p-2 border-r border-gray-300">Airborne</div>
              <div className="p-2 border-r border-gray-300">Touchdown</div>
              <div className="p-2">Chocks On</div>
            </div>

            {/* Row: ACARS (Read Only) */}
            <div className="grid grid-cols-5 gap-0 border-b border-gray-200 text-sm text-center bg-green-50/30">
              <div className="p-2 font-medium text-gray-600 border-r border-gray-200 flex items-center justify-center">ACARS</div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={acarsData.chocksOff}
                  disabled
                />
              </div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={acarsData.airborne}
                  disabled
                />
              </div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={acarsData.touchdown}
                  disabled
                />
              </div>
              <div className="p-2">
                <TableTimePicker
                  value={acarsData.chocksOn}
                  disabled
                />
              </div>
            </div>

            {/* Row: MM (Read Only) */}
            <div className="grid grid-cols-5 gap-0 border-b border-gray-200 text-sm text-center bg-green-50/30">
              <div className="p-2 font-medium text-gray-600 border-r border-gray-200 flex items-center justify-center">MM</div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={mmData.chocksOff}
                  disabled
                />
              </div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={mmData.airborne}
                  disabled
                />
              </div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={mmData.touchdown}
                  disabled
                />
              </div>
              <div className="p-2">
                <TableTimePicker
                  value={mmData.chocksOn}
                  disabled
                />
              </div>
            </div>

            {/* Row: CM (Read Only) */}
            <div className="grid grid-cols-5 gap-0 border-b border-gray-200 text-sm text-center bg-green-50/30">
              <div className="p-2 font-medium text-gray-600 border-r border-gray-200 flex items-center justify-center">CM</div>
              <div className="p-2 border-r border-gray-200"><TableTimePicker value={cmData.chocksOff} disabled /></div>
              <div className="p-2 border-r border-gray-200"><TableTimePicker value={cmData.airborne} disabled /></div>
              <div className="p-2 border-r border-gray-200"><TableTimePicker value={cmData.touchdown} disabled /></div>
              <div className="p-2"><TableTimePicker value={cmData.chocksOn} disabled /></div>
            </div>

            {/* Row: Log (Editable) */}
            <div className="grid grid-cols-5 gap-0 text-sm text-center bg-white">
              <div className="p-2 font-bold text-gray-800 border-r border-gray-200 flex items-center justify-center">Log</div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={formik.values.AdminChocksOff}
                  onChange={(val) => formik.setFieldValue("AdminChocksOff", val)}
                />
              </div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={formik.values.AdminTakeoff}
                  onChange={(val) => formik.setFieldValue("AdminTakeoff", val)}
                />
              </div>
              <div className="p-2 border-r border-gray-200">
                <TableTimePicker
                  value={formik.values.AdminTouchdown}
                  onChange={(val) => formik.setFieldValue("AdminTouchdown", val)}
                />
              </div>
              <div className="p-2">
                <TableTimePicker
                  value={formik.values.AdminChocksOn}
                  onChange={(val) => formik.setFieldValue("AdminChocksOn", val)}
                />
              </div>
            </div>
          </div>

          {/* Pilots Dropdowns */}
          <div className="grid md:grid-cols-2 sm:grid-cols-2 gap-6 mb-5">
            <CrewDropdown
              rightIcon={true}
              options={crewOptions}
              label="Takeoff"
              getSelectedLabel={getSelectedLabel}
              value={formik.values.AdminTakeoffPilotId}
              onChange={(val) => {
                formik.setFieldValue("AdminTakeoffPilotName", val.label);
                formik.setFieldValue("AdminTakeoffPilotId", val.value);
              }}
            />
            <CrewDropdown
              rightIcon={true}
              options={crewOptions}
              label="Landing"
              getSelectedLabel={getSelectedLabel}
              value={formik.values.AdminLandingPilotId}
              onChange={(val) => {
                formik.setFieldValue("AdminLandingPilotName", val.label);
                formik.setFieldValue("AdminLandingPilotId", val.value);
              }}
            />
          </div>

          {submitData?.P1Remarks && submitData?.P1Remarks?.length > 0 && (
            <div className="mb-5">
              <label className="block mb-1 text-sm font-medium text-textSecondary">P1 Remark:</label>
              <input
                disabled
                type="text"
                value={submitData?.P1Remarks}
                className="w-full px-4 py-2 bg-gray-100 border rounded text-sm border-gray-300 cursor-not-allowed"
              />
            </div>
          )}

          {submitData?.P2Remarks && submitData?.P2Remarks?.length > 0 && (
            <div className="mb-5">
              <label className="block mb-1 text-sm font-medium text-textSecondary">P2 Remark:</label>
              <input
                disabled
                type="text"
                value={submitData?.P2Remarks}
                className="w-full px-4 py-2 bg-gray-100 border rounded text-sm border-gray-300 cursor-not-allowed"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mb-5">
            <label className="block text-sm font-medium text-textSecondary">Uploaded File:</label>
            <button
              type="button"
              disabled={!hasValidTechLogURL}
              onClick={async () => {
                const fileName = submitData?.TechLogURL;
                if (!fileName) return;
                try {
                  setIsLoadingPreview(true);
                  const blobUrl = await adminService.getTechLogFileUrl(fileName);
                  setPreviewUrl(blobUrl);
                  setPreviewFile(fileName);
                  const lower = (fileName || "").toLowerCase();
                  setPreviewType(/\.pdf($|\?)/i.test(lower) ? "pdf" : "image");
                } catch (err) {
                  console.error("Failed to upload File:", err);
                } finally {
                  setIsLoadingPreview(false);
                }
              }}
              className={`${hasValidTechLogURL
                ? "text-indigo-600 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
                }`}
              title={hasValidTechLogURL ? "View Techlog" : "No Tech Log Available"}
            >
              <FileImage
                size={18}
                className={`${hasValidTechLogURL ? "text-primary" : "text-GraySecondaryLight"}`}
              />
            </button>
          </div>

          {previewFile && (
            <div
              onClick={() => {
                try {
                  if (previewUrl && typeof previewUrl === "string" && previewUrl.startsWith("blob:"))
                    URL.revokeObjectURL(previewUrl);
                } catch (e) {
                  console.error("Error revoking object URL:", e);
                }
                setPreviewFile(null);
                setPreviewUrl(null);
                setPreviewType(null);
              }}
              className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div onClick={(e) => e.stopPropagation()} className="bg-surfaceBase rounded-lg max-w-4xl max-h-[90vh] w-full overflow-auto relative shadow-2xl">
                <div className="p-4 border-b border-gray-200 top-0 bg-surfaceBase z-10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-textSecondary mb-0">File Preview :</h3>

                  {/* Preview Controls */}
                  <div className="flex items-center gap-2">
                    {previewType === 'image' && (
                      <>
                        <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                          <button
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 0.25}
                            className="cursor-pointer p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                            title="Zoom Out"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-sm font-medium min-w-[60px] text-center">
                            {Math.round(zoomLevel * 100)}%
                          </span>
                          <button
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 5}
                            className="cursor-pointer p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                            title="Zoom In"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={handleZoomReset}
                            className="cursor-pointer p-1 hover:bg-gray-200 rounded ml-2 text-xs"
                            title="Reset Zoom"
                          >
                            Reset
                          </button>
                        </div>

                        <button
                          onClick={handleRotate}
                          className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                          title="Rotate 90°"
                        >
                          <RotateCw size={18} />
                        </button>

                        <button
                          onClick={handleDownload}
                          className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        try {
                          if (previewUrl && typeof previewUrl === "string" && previewUrl.startsWith("blob:"))
                            URL.revokeObjectURL(previewUrl);
                        } catch (e) {
                          console.error("Error revoking object URL:", e);
                        }
                        setPreviewFile(null);
                        setPreviewUrl(null);
                        setPreviewType(null);
                      }}
                      className="bg-red-100 border-red-300 rounded-full shadow-md p-2 cursor-pointer hover:bg-red-200"
                      aria-label="Close preview"
                    >
                      <X size={20} className="text-red-600" />
                    </button>
                  </div>
                </div>

                <div
                  ref={containerRef}
                  className={`p-2 flex items-center justify-center min-h-[400px] bg-gray-50 ${previewType === 'image' && zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                    }`}
                  onMouseDown={handleMouseDown}
                >
                  {isLoadingPreview ? (
                    <div className="text-center text-surfaceMuted">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Loading...
                    </div>
                  ) : (
                    previewType === "pdf" ? (
                      <div className="w-full h-[70vh]">
                        <embed src={previewUrl} type="application/pdf" width="100%" height="100%" />
                      </div>
                    ) : (
                      <div className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
                        <img
                          ref={imageRef}
                          src={previewUrl}
                          alt={previewFile}
                          className="max-w-full max-h-full object-contain transition-transform duration-200"
                          style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                            cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default'
                          }}
                          onLoad={handleImageLoad}
                          onError={(e) => {
                            console.error('Image failed to load');
                            e.target.style.display = 'none';
                          }}
                        />

                        {/* Zoom level indicator */}
                        {zoomLevel !== 1 && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                            {Math.round(zoomLevel * 100)}%
                          </div>
                        )}

                        {/* Instructions for dragging */}
                        {zoomLevel > 1 && (
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                            Click and drag to pan
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-textSecondary">Remarks: <span className="text-red-600">*</span></label>
            <textarea
              rows={4}
              name="AdminRemarks"
              value={remarksValue}
              onBlur={formik.handleBlur}
              placeholder="Enter Remarks"
              onChange={(e) => {
                const val = e.target.value;
                setRemarksValue(val);
                clearTimeout(window._remarksTimer);
                window._remarksTimer = setTimeout(() => {
                  formik.setFieldValue("AdminRemarks", val);
                }, 150);
              }}
              className={`w-full px-4 py-3 text-textPrimary bg-surfaceBase border rounded text-sm placeholder:text-surfaceMuted 
                focus:outline-none focus:ring-1 ${formik.touched.AdminRemarks && formik.errors.AdminRemarks
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
                }`}
            />
            {formik.touched.AdminRemarks && formik.errors.AdminRemarks && (
              <p className="text-red-600 text-xs mt-1">{formik.errors.AdminRemarks}</p>
            )}
            <p className="text-right text-xs text-surfaceMuted">
              {formik.values.AdminRemarks?.length}/200 characters
            </p>
          </div>

          <div className="flex flex-col mt-5 sm:flex-row gap-2 sm:gap-4">
            <Button
              onClick={() => formik.handleSubmit()}
              name="SUBMIT"
              type="button"
              className="flex-1 bg-buttonGreen"
              disabled={!formik.isValid}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmPopup;