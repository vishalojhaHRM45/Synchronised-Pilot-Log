// import { useEffect, useState } from "react";
// import { setAuth } from "@/app/features/authSlice";
// import { authService } from "@/services";
// import { Navigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const dispatch = useDispatch();
//   const { isAuthenticated, role } = useSelector((state) => state.auth);
//   const [loading, setLoading] = useState(!isAuthenticated);
//   const [authChecked, setAuthChecked] = useState(false);

//   useEffect(() => {
//     const verifyAuth = async () => {
//       if (isAuthenticated) {
//         setAuthChecked(true);
//         setLoading(false);
//         return;
//       }

//       try {
//         const verifyData = await authService.verifyUser();
//         if (verifyData?.data?.authenticated === true) {
//           const user = verifyData?.data?.user;

//           dispatch(setAuth({
//             name: user.name,
//             email: user.email,
//             EgcaId: user.EgcaId,
//             isAuthenticated: true,
//             RM_UserId: user.RM_UserId,
//             role: user.UserRole.toLowerCase(),
//           }));

//           setAuthChecked(true);
//         } else {
//           setAuthChecked(true);
//         }
//       } catch (error) {
//         console.error("Auth verification failed:", error);
//         setAuthChecked(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyAuth();
//   }, [isAuthenticated, dispatch]);

//   if (loading || !authChecked) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-surfaceBase">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
//           <p className="text-GraySecondaryLight font-medium text-lg">
//             Initializing Application...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(role)) {
//     const redirectPath = role === "admin" ? "/admin/dashboard" : "/pilot/dashboard";
//     return <Navigate to={redirectPath} replace />;
//   }

//   return children;
// };

// export default PrivateRoute;



import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return isAuthenticated ? children : <Navigate to="/" replace />;
};
export default PrivateRoute;
