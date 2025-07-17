import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  LoginRequestModel,
  LoginResponseModel,
} from "../models/LoginModel";
import {
  getIdentity,
  removeIdentity,
  setIdentity,
} from "../utils/LocalStorage.util";
import { loginService } from "../service/APIService";

type ProviderProps = {
  children?: ReactNode;
};

// Add loading to context type
type IAuthContext = {
  loginAction: (loginParams: LoginRequestModel) => Promise<void>;
  logoutAction: () => Promise<void>;
  isUserAuthenticated: boolean;
  isVerifyingUser: boolean;
};

const initialValue = {
  loginAction: async () => {},
  logoutAction: async () => {},
  isUserAuthenticated: false,
  isVerifyingUser: true,
};

const AuthenticationContext = createContext<IAuthContext>(initialValue);

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};

export const AuthenticationProvider = ({ children }: ProviderProps) => {
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);
  const [isVerifyingUser, setIsVerifyingUser] = useState<boolean>(true);

  useEffect(() => {
    const user = getIdentity();
    setIsUserAuthenticated(Boolean(user));
    setIsVerifyingUser(false);
  }, []);

  const loginAction = async (loginParams: LoginRequestModel) => {
    const loginResponse: LoginResponseModel = await loginService(loginParams);
    setIdentity({
      username: loginResponse.username,
      accessToken: loginResponse.token,
    });
    setIsUserAuthenticated(true);
  };

  const logoutAction = async () => {
    removeIdentity();
    setIsUserAuthenticated(false);
  };

  const providerValue = useMemo(
    () => ({
      loginAction: loginAction,
      logoutAction: logoutAction,
      isUserAuthenticated: isUserAuthenticated,
      isVerifyingUser: isVerifyingUser,
    }),
    [loginAction, logoutAction, isUserAuthenticated, isVerifyingUser]
  );

  return (
    <AuthenticationContext.Provider value={providerValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};
