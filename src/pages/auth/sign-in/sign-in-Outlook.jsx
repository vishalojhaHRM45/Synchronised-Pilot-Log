import { useEffect, useState } from "react";

import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { authService } from "@/services";
import { CrewMachBanner, IPadBg } from "@/assets";
import { subscribeToPushNotifications } from "@/utils/notificationHelper";

const SignInOutlook = () => {
  const navigate = useNavigate();

  const { isAuthenticated, isLoading, role } = useSelector((state) => state.auth);

  const [bgImage, setBgImage] = useState(CrewMachBanner);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setBgImage(IPadBg);
      } else {
        setBgImage(CrewMachBanner);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleAuthentication = async () => {
      if (isAuthenticated && role) {
        try {
          await subscribeToPushNotifications();

          const path = role === "admin" ? "/admin/dashboard" : "/pilot/dashboard";
          navigate(path, { replace: true });
          toast.success("🎉 Login Successfully");
        } catch (error) {
          console.error("Error during post-authentication:", error);
        }
      }
    };

    handleAuthentication();
  }, [isAuthenticated, role, navigate]);

  const handleSignIn = () => {
    window.location.href = authService.getLoginUrl();
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        filter: "brightness(1.2)",
        transition: "background-image 0.5s ease-in-out",
      }}
    >

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surfaceBase rounded-lg p-6 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-GraySecondaryLight font-medium">
              Verifying user...
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md text-center space-y-6 mt-[40vh] md:mt-[50vh]">
        <div className="hidden lg:block fixed right-20 top-1/2 -translate-y-1/2">

          <div className="rounded-2xl shadow-xl p-8 space-y-6 bg-black/50 backdrop-blur-sm w-[400px]">
            <h2 className="text-2xl font-semibold text-surfaceBase text-center">
              Synchronised Pilot Log (SPL)
            </h2>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className={`cursor-pointer w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary text-surfaceBase font-semibold py-3 px-6 rounded-lg shadow-lg transition text-base ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Mail className="w-5 h-5 animate-spin" /> Signing in...
                </span>
              ) : (
                <>
                  <Mail className="w-5 h-5" />Sign in with SSO
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:hidden flex justify-center mb-10">
          <div className="rounded-2xl shadow-xl p-8 space-y-6 bg-black/50 backdrop-blur-sm w-[80%] max-w-sm">
            <h2 className="text-xl md:text-2xl font-semibold text-surfaceMuted text-center">
              Synchronised Pilot Log (SPL)
            </h2>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bgGradient-Button hover:bg-primary text-surfaceBase font-semibold py-3 px-6 rounded-lg 
                shadow-lg transition text-sm md:text-base ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Mail className="w-5 h-5 animate-spin" /> Signing in...
                </span>
              ) : (
                <>
                  <Mail className="w-5 h-5" />Sign in with SSO
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInOutlook;


// const handleAcknowledge = async () => {
//   setShowAck(false);
//   setLoading(true);

//   try {
//     const user = verifiedData.user;

//     const EgcaId = user.EgcaId;
//     const userName = user.name;
//     const userEmail = user.email;
//     const UserRole = user.UserRole;
//     const RM_UserId = user.RM_UserId;

//     dispatch(
//       setAuth({
//         RM_UserId,
//         EgcaId: EgcaId,
//         name: userName,
//         email: userEmail,
//         isAuthenticated: true,
//         role: UserRole.toLowerCase(),
//       })
//     );

//     await subscribeToPushNotifications();

//     const roleLower = UserRole.toLowerCase();
//     const path = roleLower === "admin" ? "/admin/dashboard" : "/pilot/dashboard";
//     navigate(path, { replace: true });
//     toast.success("🎉 Login Successfully");
//   } catch (error) {
//     toast.error(`Error: ${error.message}`);
//     console.error("❌ Error during acknowledgement:", error);
//   } finally {
//     setLoading(false);
//   }
// };


// useEffect(() => {
//   const checkAuthAndVerify = async () => {
//     setLoading(true);
//     try {
//       const verifyData = await authService.verifyUser();

//       if (verifyData?.data?.authenticated === true) {
//         const user = verifyData?.data?.user;

//         const EgcaId = user.EgcaId;
//         const userName = user.name;
//         const userEmail = user.email;
//         const UserRole = user.UserRole;
//         const RM_UserId = user.RM_UserId;

//         dispatch(
//           setAuth({
//             RM_UserId,
//             EgcaId: EgcaId,
//             name: userName,
//             email: userEmail,
//             isAuthenticated: true,
//             role: UserRole?.toLowerCase(),
//           })
//         );

//         await subscribeToPushNotifications();

//         const roleLower = UserRole?.toLowerCase();
//         const path = roleLower === "admin" ? "/admin/dashboard" : "/pilot/dashboard";
//         navigate(path, { replace: true });
//         toast.success("🎉 Login Successfully");
//       } else {
//         console.log("❌ User not authenticated:", verifyData);
//         toast.error("Authentication failed. Please login again.");
//       }

//     } catch (error) {
//       console.error("❌ Error verifying user:", error);

//       if (error.status !== 401) {
//         toast.error(error.message || "Error verifying user. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   checkAuthAndVerify();
// }, []);
