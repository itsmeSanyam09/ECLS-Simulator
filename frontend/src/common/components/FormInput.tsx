import type { FieldError } from "react-hook-form";
import { FormLabel } from "./FormLabel";

type FormInputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  register: any;
  className?: string;
  props?: any;
};
const FormInput = ({
  label,
  name,
  type = "text",
  placeholder = "Enter value",
  error,
  register,
  className = "",
  props = {},
}: FormInputProps) => {
  return (
    <>
      <FormLabel label={label} className="text-sm font-medium text-[#333333]" />
      <input
        placeholder={placeholder}
        {...props}
        type={type}
        {...register(name)}
        className={
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" +
          className
        }
      />
      <div className="h-2">
        {error && <span className="text-red-400 text-sm">{error.message}</span>}
      </div>
    </>
  );
};

export default FormInput;
