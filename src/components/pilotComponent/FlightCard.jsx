import { memo } from "react";
import { Plane, Clock, MapPin } from "lucide-react";
import { calculateFlightTime, getDateParts, parseTime } from "@/utils/helper";

const getStatusClass = (status = "") => {
  const colorMap = {
    approve: "bg-notificationBg text-green-700 border-green-400",
    reject: "bg-red-100 text-red-700 border-red-400",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-400",
  };
  const key = Object.keys(colorMap).find((k) =>
    status?.toLowerCase()?.includes(k)
  );
  return colorMap[key] || "bg-gray-200 text-GraySecondaryLight border-gray-400";
};

const FlightDateBadge = ({ day, monthAbbr, year }) => (
  <div className="hidden md:flex flex-col items-center justify-between bg-primary text-surfaceBase rounded-xl px-3 py-2 text-xs shadow-md min-w-[70px]">
    <span className="font-bold uppercase tracking-widest">{monthAbbr}</span>
    <span className="text-base font-extrabold leading-none">{day}</span>
    <span className="text-[10px]">{year}</span>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`text-[10px] md:text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusClass(
      status
    )}`}
  >
    {status || "N/A"}
  </span>
);

const FlightRoute = ({ depCity, depTime, arrCity, arrTime }) => (
  <div className="flex flex-row items-center flex-1 justify-between md:justify-center gap-4 md:gap-6 text-xs md:text-sm mt-2 md:mt-0">
    <div className="flex flex-col items-center text-center w-[80px] md:w-auto">
      <span className="font-bold flex items-center justify-center gap-1 text-textPrimary">
        <MapPin size={12} className="text-primary" />
        {depCity || "N/A"}
      </span>
      <span className="text-[11px] font-semibold text-surfaceMuted">Departure</span>
      <span className="flex items-center gap-1 text-GraySecondaryLight text-[11px] font-bold">
        <Clock size={11} className="text-primary" /> {depTime || "--"}
      </span>
    </div>

    <div className="flex items-center scale-90 md:scale-100">
      <div className="w-2 h-2 bg-primary rounded-full mr-1" />
      <div className="w-8 h-[2px] primary-bgGradient rounded-full" />
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mx-1">
        <Plane size={12} className="text-surfaceBase" />
      </div>
      <div className="w-8 h-[2px] bg-blue-300 rounded-full" />
      <div className="w-2 h-2 bg-primary rounded-full ml-1" />
    </div>


    <div className="flex flex-col items-center text-center w-[80px] md:w-auto">
      <span className="font-bold flex items-center justify-center gap-1 text-textPrimary">
        <MapPin size={12} className="text-primary" />
        {arrCity || "N/A"}
      </span>
      <span className="text-[11px] font-semibold text-surfaceMuted">Arrival</span>
      <span className="flex items-center gap-1 text-GraySecondaryLight text-[11px] font-bold">
        <Clock size={11} className="text-primary" /> {arrTime || "--"}
      </span>
    </div>
  </div>
);


const AircraftInfo = ({ tailNumber, flightNumber }) => {
  const formattedValue = tailNumber ? tailNumber.slice(0, 2) + "-" + tailNumber.slice(2) : "VT-";
  return (
    <div className="flex flex-row md:flex-col items-center justify-between gap-2 w-full md:w-auto text-[10px] md:text-xs mt-1 md:mt-0">
      <div className="flex justify-between w-[48%] md:w-36 px-2 py-1 rounded-md border bg-gray-50 border-blue-200">
        <span className="text-surfaceMuted font-semibold">Tail Number</span>
        <span className="text-textPrimary font-medium truncate">{formattedValue || "N/A"}</span>
      </div>
      <div className="flex justify-between w-[48%] md:w-36 px-2 py-1 rounded-md border bg-gray-50 border-blue-200">
        <span className="text-surfaceMuted font-semibold">Flight Number</span>
        <span className="text-textPrimary font-medium truncate">{flightNumber || "N/A"}</span>
      </div>
    </div>
  );
}

const FlightCard = memo(({ flight = {}, index, onClick }) => {
  const {
    FlightDate = "",
    Origin = "",
    Destination = "",
    TailNumber = "",
    FlightNumber = "",
    FlightTime = calculateFlightTime(
      flight.MM_DepatureTime,
      flight.MM_ArrivalTime
    ),
    Status = "",
    MM_DepatureTime = "",
    MM_ArrivalTime = "",
  } = flight;

  const { month, day, year } = getDateParts(FlightDate);
  const animationDelay = `${index * 100}ms`;

  return (
    <div
      className="relative w-full rounded-2xl shadow-md bg-surfaceBase py-3 px-3 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-100 gap-3 md:gap-4 cursor-pointer text-xs md:text-sm hover:shadow-lg transition-shadow duration-200"
      style={{ animationDelay }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >

      <FlightDateBadge day={day} monthAbbr={month} year={year} />

      <div className="md:hidden absolute -top-2 left-3 flex items-center gap-1">
        <StatusBadge status={Status} />
      </div>

      <div className="md:hidden text-[11px] font-semibold text-GraySecondaryLight text-center mt-1">
        {`${day} ${month} ${year}`}
      </div>

      <FlightRoute
        depCity={Origin}
        depTime={parseTime(MM_DepatureTime)}
        arrCity={Destination}
        arrTime={parseTime(MM_ArrivalTime)}
      />

      <div className="md:hidden block mx-auto text-[11px] mt-2 font-bold text-GraySecondaryLight">
        ⏱ {FlightTime || "N/A"}
      </div>


      <AircraftInfo tailNumber={TailNumber} flightNumber={FlightNumber} />

      <div className="hidden md:flex flex-col items-center justify-center gap-2 w-auto mt-2 md:mt-0 text-xs">
        <div className="px-2 py-1 rounded-lg font-semibold bg-gray-50 border border-blue-200 text-textPrimary text-center text-sm">
          {FlightTime || "N/A"}
        </div>
        <StatusBadge status={Status} />
      </div>
    </div>
  );
});
export { AircraftInfo };
export default FlightCard;
