import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthenticatedRoutes, UnauthenticatedRoutes } from "./AppRoutes";
import { AuthenticatedRoute } from "./AuthenticatedRoute";
import { Toaster } from "react-hot-toast";
import { AuthenticationProvider } from "./auth/context/AuthenticationContext";

function App() {
  return (
    <AuthenticationProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            className: "bg-gray-800 text-white",
            style: {
              fontSize: "16px",
              padding: "10px 20px",
            },
          }}
        />
        <Routes>
          {UnauthenticatedRoutes.map((route, index) => {
            const { element, ...rest }: any = route;
            return <Route key={index} {...rest} element={element} />;
          })}
          {AuthenticatedRoutes.map((route, index) => {
            const { element, ...rest }: any = route;
            return (
              <Route key={index} element={<AuthenticatedRoute />}>
                <Route {...rest} element={element} />
              </Route>
            );
          })}
        </Routes>
      </BrowserRouter>
    </AuthenticationProvider>
  );
}

export default App;
