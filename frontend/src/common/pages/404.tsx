import { useNavigate } from "react-router-dom";
import { HOME_ROUTE } from "../constants/Route.constant";
import { PrimaryButton } from "../design/Button.design";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            Page not found
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 w-4/12 ml-auto mr-auto gap-x-6">
            <button
              onClick={() => navigate(HOME_ROUTE)}
              className={PrimaryButton}
            >
              Go back home
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
