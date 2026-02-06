import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import { RotateCw } from "lucide-react";

const TableHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center mt-2 mb-5 md:px-3">
      <h1 className="md:text-2xl text-md font-bold">Log Summary</h1>
      <div className="flex gap-3">
        <Button
          name={
            <div className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              <span>Refresh</span>
            </div>
          }
          onClick={() => window.location.reload()}
          className="Reload-Btn text-surfaceBase px-4 py-2 rounded hover:bg-surfaceMuted transition-colors"
        />
        <Button
          name={"Archive"}
          onClick={() => navigate("/verifier-history")}
          className="toggle-on text-surfaceBase px-4 py-2 rounded hover:bg-surfaceMuted transition-colors"
        />
      </div>
    </header>
  );
};
export default TableHeader;