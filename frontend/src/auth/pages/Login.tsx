import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { type LoginRequestModel } from "../models/LoginModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginValidationSchema } from "../schema/Validation.schema";
import FormInput from "../../common/components/FormInput";
import { PrimaryButton } from "../../common/design/Button.design";
import { PrimaryInput } from "../../common/design/Input.design";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { HOME_ROUTE } from "../../common/constants/Route.constant";
import { useAuthentication } from "../context/AuthenticationContext";
import ecgIcon from "/ecg-icon.png";
const LoginPage = () => {
  const { loginAction, isUserAuthenticated } = useAuthentication();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequestModel>({
    resolver: zodResolver(loginValidationSchema),
  });

  const handleLoginRequest = async (data: LoginRequestModel) => {
    try {
      setIsLoading(true);
      await loginAction(data);
      toast.success("Login successful!");
      navigate(HOME_ROUTE);
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUserAuthenticated) {
      navigate(HOME_ROUTE);
    }
  }, [isUserAuthenticated]);

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 mt-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Simman Simulator"
            src={ecgIcon}
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            onSubmit={handleSubmit(handleLoginRequest)}
            className="space-y-6"
          >
            <div>
              <FormInput
                label="Username"
                type="text"
                name="username"
                placeholder="Enter username"
                register={register}
                error={errors.username}
                className={PrimaryInput}
              />
            </div>

            <div className="w-full relative">
              <FormInput
                label="Password"
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                name="password"
                register={register}
                error={errors.password}
                className={PrimaryInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div>
              <button
                disabled={isLoading}
                type="submit"
                className={`${PrimaryButton} ${
                  isLoading ? "brightness-80" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
