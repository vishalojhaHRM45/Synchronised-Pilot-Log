import React, { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import {
  FileText,
  FolderSearch,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { FaImage } from "react-icons/fa";
import { adminService } from "@/services";
import ConfirmPopup from "./ConfirmPopup";
import toast from "react-hot-toast";

const NoDataDisplay = () => (
  <div className="flex flex-col items-center justify-center h-[530px] text-gray-500 bg-amber-50/50 rounded-xl shadow-inner">
    <FolderSearch className="h-20 w-20 text-gray-400 mb-6" />
    <h2 className="text-3xl font-bold text-gray-700">No Data Available</h2>
    <p className="text-lg mt-2 text-gray-600">Try adjusting your filters</p>
  </div>
);

const PaginationControls = ({ currentPage, hasNextPage, refetchAdminData, currentLastDays }) => (
  <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200">
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          currentPage > 1 && refetchAdminData(currentLastDays, currentPage - 1)
        }
        disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${currentPage === 1
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-primary text-white hover:bg-primary"
          }`}
      >
        ← Previous
      </button>

      <div className="px-3 py-1.5 bg-gray-50 rounded text-xs font-medium">
        Page <span className=" font-bold">{currentPage}</span>
      </div>

      <button
        onClick={() =>
          hasNextPage && refetchAdminData(currentLastDays, currentPage + 1)
        }
        disabled={!hasNextPage}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${!hasNextPage
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-primary text-white hover:bg-primary"
          }`}
      >
        Next →
      </button>
    </div>
  </div>
);

const ImageViewer = ({
  previewUrl,
  zoom,
  setZoom,
  rotation,
  position,
  setPosition,
  isDragging,
  imageRef,
  onMouseDown,
}) => {

  const handleDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onDoubleClick={handleDoubleClick}
    >
      <img
        ref={imageRef}
        src={previewUrl}
        alt="Tech Log Preview"
        className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-150 select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
        }}
        draggable={false}
        onMouseDown={onMouseDown}
      />
    </div>
  );
};

const PreviewModal = ({
  previewUrl,
  previewType,
  previewSubmissionId,
  isLoadingPreview,
  closePreview,
  zoom,
  setZoom,
  rotation,
  setRotation,
  lastTouchDistance,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (zoom === 1 && previewType === "image") {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom, previewType]);

  const handleMouseDown = (e) => {
    if (previewType !== "image" || zoom <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (previewType !== "image" || !isDragging || zoom <= 1) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      if (imageRef.current && containerRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const maxX = Math.max(
          0,
          (imgRect.width * zoom - containerRect.width) / 2
        );
        const maxY = Math.max(
          0,
          (imgRect.height * zoom - containerRect.height) / 2
        );

        const boundedX = Math.max(-maxX, Math.min(maxX, newX));
        const boundedY = Math.max(-maxY, Math.min(maxY, newY));

        setPosition({ x: boundedX, y: boundedY });
      }

      e.preventDefault();
    },
    [isDragging, zoom, dragStart, previewType]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setZoom((z) => Math.max(0.5, Math.min(6, z + delta)));
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const [t1, t2] = e.touches;
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (lastTouchDistance.current) {
        const change = dist - lastTouchDistance.current;
        setZoom((z) => Math.max(0.5, Math.min(6, z + change * 0.005)));
      }
      lastTouchDistance.current = dist;
    } else if (e.touches.length === 1 && zoom > 1 && previewType === "image") {
      e.preventDefault();
      const touch = e.touches[0];
      setPosition((prev) => ({
        x: prev.x + (touch.clientX - dragStart.x) * 0.5,
        y: prev.y + (touch.clientY - dragStart.y) * 0.5,
      }));
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
    setIsDragging(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tech-log-${previewSubmissionId}.${previewType === "pdf" ? "pdf" : "jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDoubleClick = () => {
    if (previewType === "pdf") {
      if (zoom > 1) {
        setZoom(z => Math.max(0.5, z - 0.25));
      } else {
        setZoom(z => Math.min(6, z + 0.25));
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    if (previewType === "image") {
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[100] p-4"
      onClick={closePreview}
      onKeyDown={(e) => e.key === "Escape" && closePreview()}
      tabIndex={-1}
      autoFocus
    >
      <div
        className="bg-white rounded-xl w-full max-w-[85vw] max-h-[95vh] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[60%]">
            File Preview — Submission ID: {previewSubmissionId}
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {previewType?.toUpperCase()}
            </span>
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-4">

              {previewType === "image" &&
                <>
                  < button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="cursor-pointer p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Rotate 90° clockwise"
                  >
                    <RotateCw size={20} />
                  </button>

                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    className="cursor-pointer p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={20} />
                  </button>

                  <span className="text-sm font-medium w-16 text-center">
                    {Math.round(zoom * 100)}%
                  </span>

                  <button
                    onClick={() => setZoom((z) => Math.min(6, z + 0.25))}
                    className="cursor-pointer p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={20} />
                  </button>

                  <button
                    onClick={resetView}
                    className="cursor-pointer px-4 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                  >
                    Reset
                  </button>
                </>
              }

              <button
                onClick={handleDownload}
                className="ml-4 cursor-pointer px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition flex items-center gap-1.5"
              >
                <Download size={16} />
                Download
              </button>
            </div>

            <button
              onClick={closePreview}
              className="cursor-pointer p-2.5 rounded-full hover:bg-red-50 text-red-600 transition-colors"
            >
              <X size={26} />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 bg-white flex items-center justify-center overflow-hidden relative touch-none"
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchStart={(e) => {
            if (e.touches.length === 1 && previewType === "image") {
              const touch = e.touches[0];
              setDragStart({ x: touch.clientX, y: touch.clientY });
            }
          }}
          onDoubleClick={handleDoubleClick}
        >
          {isLoadingPreview ? (
            <div className="flex flex-col items-center text-gray-500">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-500 mb-4"></div>
              Loading...
            </div>
          ) : previewType === "pdf" ? (
            <div className="w-full h-full">
              {previewUrl ? (
                <PDFViewer
                  previewUrl={previewUrl}
                  zoom={zoom}
                  rotation={rotation}
                  onDownload={handleDownload}
                  onZoomIn={() => setZoom(z => Math.min(6, z + 0.25))}
                  onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.25))}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <FileText className="h-20 w-20 mb-4" />
                  <p>PDF not available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full">
              {previewUrl ? (
                <ImageViewer
                  previewUrl={previewUrl}
                  zoom={zoom}
                  setZoom={setZoom}
                  rotation={rotation}
                  position={position}
                  setPosition={setPosition}
                  isDragging={isDragging}
                  imageRef={imageRef}
                  onMouseDown={handleMouseDown}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <FaImage className="h-20 w-20 mb-4" />
                  <p>Image not available</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 text-xs text-gray-600 bg-gray-50 border-t text-center">
          {previewType === "image" ? (
            zoom > 1 ? (
              <>Drag to pan • Double-click to reset zoom • Ctrl + Mouse Wheel to zoom</>
            ) : (
              <>
                Double-click to zoom in • Ctrl + Mouse Wheel to zoom • Pinch to zoom on touch
              </>
            )
          ) : (
            // <>Double-click to toggle zoom • Use controls above to zoom, rotate, and navigate the PDF • Download available</>
            <>If the PDF does not open, <a href={previewUrl} target="_blank" rel="noreferrer"
              className="text-primary underline">open in new tab</a></>
          )}
        </div>
      </div>
    </div >
  );
};

const TableComponent = ({
  data,
  onApprove,
  showPilotData,
  setSelectedGroups,
  selectedGroups = [],
  refetchAdminData,
  currentLastDays = 0,
  currentPage = 1,
}) => {
  const tableContainerRef = useRef(null);
  const loadingSubmissionsRef = useRef(new Set());
  const scrollableContainerRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewSubmissionId, setPreviewSubmissionId] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const lastTouchDistance = useRef(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [showApprovePopup, setShowApprovePopup] = useState(false);

  const getFileType = useCallback((fileName) => {
    if (!fileName) return null;
    const lower = fileName.toLowerCase();

    if (lower.endsWith('.pdf') || lower.includes('.pdf')) {
      return "pdf";
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'];
    const isImage = imageExtensions.some(ext => lower.includes(ext));
    if (isImage) {
      return "image";
    }

    return null;
  }, []);

  const handleRowDoubleClick = useCallback((row) => {
    setSelectedSubmissionId(row.original);
    setShowApprovePopup(true);
  }, []);

  const confirmApprove = async (values) => {
    setShowApprovePopup(false);
    try {
      await onApprove(values);
    } catch (error) {
      console.error("Approval API Error:", error);
      toast.error("Something went wrong while approving.");
    }
  };

  const closePreview = useCallback(() => {
    if (previewUrl?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {
        console.error("Error revoking object URL:", e);
      }
    }

    setPreviewUrl(null);
    setPreviewSubmissionId(null);
    setPreviewType(null);
    setZoom(1);
    setRotation(0);
    lastTouchDistance.current = null;
  }, [previewUrl]);

  const openPreview = useCallback(
    async (submissionId, fileName) => {
      if (!submissionId || !fileName) {
        toast.error("File not available");
        return;
      }

      if (loadingSubmissionsRef.current.has(submissionId)) return;

      if (previewUrl) closePreview();

      loadingSubmissionsRef.current.add(submissionId);
      setIsLoadingPreview(true);

      try {
        const fileType = getFileType(fileName);
        const response = await adminService.getTechLogFileUrl(fileName);

        if (!response) {
          throw new Error("No response from getTechLogFileUrl");
        }

        let blobUrl;
        if (response instanceof Blob) {
          blobUrl = URL.createObjectURL(response);
        } else if (typeof response === 'string') {
          blobUrl = response;
        } else if (response.data) {
          if (response.data instanceof Blob) {
            blobUrl = URL.createObjectURL(response.data);
          } else if (typeof response.data === 'string') {
            blobUrl = response.data;
          }
        }

        if (!blobUrl) {
          throw new Error("Could not create preview URL");
        }

        setPreviewUrl(blobUrl);
        setPreviewSubmissionId(submissionId);
        setPreviewType(fileType || "image");

      } catch (error) {
        console.error("Failed to load tech log file:", error);
        toast.error("Failed to load tech log file");
        setPreviewUrl(null);
        setPreviewType(null);
      } finally {
        setIsLoadingPreview(false);
        loadingSubmissionsRef.current.delete(submissionId);
      }
    },
    [previewUrl, closePreview, getFileType]
  );

  useEffect(() => {
    if (previewUrl) {
      setZoom(1);
      setRotation(0);
    }
  }, [previewUrl]);

  const isGroupSelected = useCallback(
    (groupKey) => selectedGroups?.includes(groupKey),
    [selectedGroups]
  );

  const handleGroupCheckboxChange = useCallback(
    (groupKey) => {
      setSelectedGroups((prev) => (prev[0] === groupKey ? [] : [groupKey]));
    },
    [setSelectedGroups]
  );

  const filteredDataForTable = useMemo(() => {
    const actualData = data?.AdminFlights || data || [];
    return Array.isArray(actualData) ? actualData : [];
  }, [data]);

  const flatData = useMemo(() => {
    if (!filteredDataForTable?.length) return [];

    return filteredDataForTable.flatMap((log, logIndex) => {
      const entries = log.entries || [log];
      return entries
        .filter((_, entryIndex) => showPilotData || entryIndex === 1)
        .map((entry, entryIndex) => ({
          ...log,
          ...entry,
          SNO: entry?.SNO,
          rowId: `${logIndex}-${entryIndex}`,
          _logIndex: logIndex,
          _entryIndex: entryIndex,
          _submissionId: log.submissionId,
          _rowSpan: entryIndex === 0 ? (showPilotData ? entries.length : 1) : 0,
          _indicatorColor: log.indicatorColor || "white",
          backgroundColor: entry.backgroundColor || "white",
        }));
    });
  }, [filteredDataForTable, showPilotData]);

  const pageSize = flatData?.length || 0;
  const hasNextPage = pageSize >= 50;

  const meta = useMemo(
    () => ({
      isGroupSelected,
      handleGroupCheckboxChange,
      openPreview,
      loadingSubmissionsRef,
      getFileType,
    }),
    [isGroupSelected, handleGroupCheckboxChange, openPreview, getFileType]
  );

  const getCenterCell = ({ row, getValue }) => {
    if (row.original._entryIndex !== 0) return null;

    const value = getValue() || "";
    return (
      <td
        rowSpan={row.original._rowSpan}
        className="border border-gray-200 px-2 text-xs text-center"
      >
        {value || "-"}
      </td>
    );
  };

  const centerColumns = [
    {
      accessorKey: "SNO",
      header: "S.No",
      size: 50,
      cell: getCenterCell,
    },
    {
      accessorKey: "P1Reason",
      header: "P1 - Rejection Reason",
      size: 130,
      cell: getCenterCell,
    },
    {
      accessorKey: "P2Reason",
      header: "P2 - Rejection Reason",
      size: 130,
      cell: getCenterCell,
    },
    {
      accessorKey: "flightDate",
      header: "Flight Date",
      size: 100,
      cell: getCenterCell,
    },
    {
      accessorKey: "flightNumber",
      header: "Flight Number",
      size: 80,
      cell: getCenterCell,
    },
    {
      id: "sector",
      header: "Sector",
      size: 100,
      cell: ({ row }) => {
        if (row.original._entryIndex !== 0) return null;
        const { origin = "", destination = "" } = row.original;
        const sector = origin || destination ? `${origin}-${destination}` : "-";
        return (
          <td
            rowSpan={row.original._rowSpan}
            className="border border-gray-200 text-center"
          >
            {sector}
          </td>
        );
      },
    },
    {
      id: "tailNumber",
      header: "Tail Number",
      size: 80,
      cell: ({ row }) => {
        if (row.original._entryIndex !== 0) return null;
        const { tailNumber = "" } = row.original;
        const formatedTailNumber = tailNumber ? `${tailNumber.slice(0, 2)}-${tailNumber.slice(2)}` : "VT-";
        return (
          <td
            rowSpan={row.original._rowSpan}
            className="border border-gray-200 text-center"
          >
            {formatedTailNumber}
          </td>
        );
      },
    },
    {
      accessorKey: "DepatureTime",
      header: "Scheduled Departure",
      size: 120,
      cell: getCenterCell,
    },
    {
      accessorKey: "ArrivalTime",
      header: "Scheduled Arrival",
      size: 120,
      cell: getCenterCell,
    },
    {
      id: "pic",
      header: "PIC",
      size: 100,
      cell: ({ row }) => {
        if (row.original._entryIndex !== 0) return null;
        return (
          <td
            rowSpan={row.original._rowSpan}
            className="border border-gray-200 text-center font-medium"
          >
            {row.original.picName || "-"}{" "}
            <span className="text-gray-500">({row.original.picId || "-"})</span>
          </td>
        );
      },
    },
    {
      id: "copilot",
      header: "Co-Pilot",
      size: 100,
      cell: ({ row }) => {
        if (row.original._entryIndex !== 0) return null;
        return (
          <td
            rowSpan={row.original._rowSpan}
            className="border border-gray-200 px-2 py-1 text-center font-medium"
          >
            {row.original.copilotName || "-"}{" "}
            <span className="text-gray-500">
              ({row.original.copilotId || "-"})
            </span>
          </td>
        );
      },
    },
    {
      accessorKey: "P1Remarks",
      header: "P1 Remarks",
      size: 120,
      cell: getCenterCell,
    },
    {
      accessorKey: "P2Remarks",
      header: "P2 Remarks",
      size: 120,
      cell: getCenterCell,
    },
    {
      accessorKey: "TechLogURL",
      header: "File",
      size: 70,
      cell: ({ row, table }) => {
        if (row.original._entryIndex !== 0) return null;
        const { submissionId, TechLogURL } = row.original;
        const hasValidUrl = Boolean(TechLogURL);
        const isLoading = loadingSubmissionsRef.current.has(submissionId);

        const fileType = table.options.meta.getFileType(TechLogURL);
        const Icon = fileType === "pdf" ? FaFilePdf : FaImage;
        const iconColor = fileType === "pdf" ? "text-red-600" : "text-blue-600";
        const hoverColor = fileType === "pdf" ? "hover:bg-red-50" : "hover:bg-blue-50";
        const title = hasValidUrl
          ? `Preview ${fileType === "pdf" ? 'PDF' : 'Image'}`
          : "No Tech Log Available";

        const pdfURL = `${import.meta.env.VITE_API_BASE_URL}egcaix/getTechLog/${TechLogURL}`;
        return (
          <td
            rowSpan={row.original._rowSpan}
            className="border border-gray-200 px-1 py-1 text-center align-middle"
          >
            <button
              // onClick={() =>
              //   hasValidUrl &&
              //   table.options.meta.openPreview(submissionId, TechLogURL)
              // }
              onClick={() => {
                if (!hasValidUrl || isLoading) return;

                if (fileType === "pdf") {
                  window.open(pdfURL, "_blank", "noopener,noreferrer");
                } else {
                  table.options.meta.openPreview(submissionId, TechLogURL);
                }
              }}
              disabled={!hasValidUrl || isLoading}
              className={`p-1.5 rounded transition-colors ${hoverColor} ${hasValidUrl && !isLoading
                ? "cursor-pointer hover:scale-110"
                : "opacity-50 cursor-not-allowed"
                }`}
              title={title}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-400" />
              ) : (
                <Icon className={`h-5 w-5 ${iconColor}`} />
              )}
            </button>
          </td>
        );
      },
    },
  ];

  const table = useReactTable({
    meta,
    data: flatData,
    columns: centerColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderCellsWithKeys = (cells) =>
    cells
      .map((cell, idx) => {
        const rendered = cell.column.columnDef.cell({
          cell,
          getValue: () => cell.getValue(),
          row: cell.row,
          column: cell.column,
          table,
        });
        return rendered ? (
          <React.Fragment
            key={cell.column.id || cell.column.accessorKey || idx}
          >
            {rendered}
          </React.Fragment>
        ) : null;
      })
      .filter(Boolean);

  if (!flatData?.length) {
    return <NoDataDisplay />;
  }

  return (
    <>
      <div className="w-full flex flex-col bg-white shadow-sm">
        <div ref={tableContainerRef} className="flex w-full relative">
          <div
            ref={scrollableContainerRef}
            className="grow relative overflow-auto max-h-140"
          >
            <table className="min-w-full border-collapse border-spacing-0 text-xs">
              <thead className="sticky top-0 z-10 primary-bgGradient ">
                <tr>
                  {centerColumns.map((col) => (
                    <th
                      key={col.id || col.accessorKey}
                      className="border border-gray-400 px-2 py-2 text-xs font-semibold text-center whitespace-nowrap"
                      style={{
                        minWidth: col.size * 0.9,
                        maxWidth: col.size + 20,
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <tr
                      key={row.id}
                      onDoubleClick={() => handleRowDoubleClick(row)}
                      className={`h-8 border-b border-gray-400 transition-colors 
                        ${row.original._entryIndex === 0 ? "cursor-pointer hover:bg-gray-50" : ""
                        }`}
                    >
                      {renderCellsWithKeys(
                        row.getVisibleCells().slice(0, centerColumns.length)
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <PaginationControls
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          refetchAdminData={refetchAdminData}
          currentLastDays={currentLastDays}
        />
      </div>

      {previewUrl && (
        <PreviewModal
          previewUrl={previewUrl}
          previewType={previewType}
          previewSubmissionId={previewSubmissionId}
          isLoadingPreview={isLoadingPreview}
          closePreview={closePreview}
          zoom={zoom}
          setZoom={setZoom}
          rotation={rotation}
          setRotation={setRotation}
          lastTouchDistance={lastTouchDistance}
        />
      )}

      {showApprovePopup && (
        <ConfirmPopup
          title="Flight Log Review"
          onConfirm={confirmApprove}
          selectedData={selectedSubmissionId}
          onCancel={() => {
            setShowApprovePopup(false);
            setSelectedSubmissionId(null);
          }}
        />
      )}
    </>
  );
};

export default TableComponent;