import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useNavigationProgress() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 300); 

    return () => clearTimeout(timeout);
  }, [location]);

  return loading;
}