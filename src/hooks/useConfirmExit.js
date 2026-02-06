import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function useConfirmExit() {
  const location = useLocation();

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/") {
        const confirmExit = window.confirm("Are you sure you want to exit the app?");
        if (!confirmExit) {
          window.history.pushState(null, "", window.location.href); 
        }
      }
    };

    const handleBeforeUnload = (event) => {
      if (window.location.pathname === "/") {
        event.preventDefault();
        event.returnValue = ""; 
      }
    };


    if (window.location.pathname === "/") {
      window.history.pushState(null, "", window.location.href);
    }

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [location]);
}

export default useConfirmExit;