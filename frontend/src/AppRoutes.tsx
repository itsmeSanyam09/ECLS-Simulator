import { Navigate, type RouteObject } from "react-router-dom";
import {
  CREATE_PATTERN_ROUTE,
  CREATE_SESSION_ROUTE,
  HOME_ROUTE,
  LOGIN_ROUTE,
  WATCH_SESSION_ROUTE,
  WAVE_LIST_ROUTE,
} from "./common/constants/Route.constant";
import Trainer from "./wave/trainer/Trainer";
import LoginPage from "./auth/pages/Login";
import NotFound from "./common/pages/404";
import ShowWaves from "./wave/pages/ShowWaves"
import WaveList from "./wave/pages/WaveList";
import Trainee from "./wave/trainee/Trainee";

export const AuthenticatedRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to={HOME_ROUTE} replace={true} />,
  },
  {
    path: "/home",
    element: <>home page coming soon!!</>
  },
  {
    path: WAVE_LIST_ROUTE,
    element: <WaveList />,
  },
  {
    path: CREATE_SESSION_ROUTE + '/:id?',
    element: <Trainer />
  },
  {
    path: CREATE_PATTERN_ROUTE + '/:id?',
    element: <ShowWaves />,
  },
];

export const UnauthenticatedRoutes: RouteObject[] = [
  {
    path: LOGIN_ROUTE,
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
