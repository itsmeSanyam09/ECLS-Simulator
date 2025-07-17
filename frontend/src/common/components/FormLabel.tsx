type LabelProps = {
  label: string;
  className?: string;
};

const labelVariants =
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

export const FormLabel: React.FC<LabelProps> = ({
  label,
  className,
}: LabelProps) => {
  return <label className={labelVariants + className}>{label}</label>;
};
