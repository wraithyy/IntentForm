import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-gray-900 text-white hover:bg-gray-800",
        variant === "outline" &&
          "border border-gray-300 bg-transparent hover:bg-gray-100",
        className
      )}
      {...props}
    />
  );
}
