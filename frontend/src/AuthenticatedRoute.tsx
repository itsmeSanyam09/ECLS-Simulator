import { Navigate, useLocation } from "react-router-dom";
import { LOGIN_ROUTE } from "./common/constants/Route.constant";
import { useAuthentication } from "./auth/context/AuthenticationContext";
import { useEffect } from "react";
import { getIdentity } from "./auth/utils/LocalStorage.util";
import { jwtDecode } from "jwt-decode";
import AppLayout from "./common/dashboard/layout/AppLayout";

export const AuthenticatedRoute = () => {
  const { isUserAuthenticated, logoutAction, isVerifyingUser } =
    useAuthentication();
  const location = useLocation();
  const user = getIdentity();
  useEffect(() => {
    if (!isVerifyingUser && user?.accessToken) {
      const decoded = jwtDecode(user?.accessToken || "");
      //@ts-ignore
      if (decoded.username !== user?.username) {
        logoutAction();
      }
    }
  }, [isVerifyingUser]);

  if (isVerifyingUser) {
    //TODO :render a spinner
    return null;
  }

  return (
    <>
      {!isUserAuthenticated && (
        <Navigate to={LOGIN_ROUTE} replace={true} state={{ from: location }} />
      )}
      {isUserAuthenticated && <AppLayout />}
    </>
  );
};
