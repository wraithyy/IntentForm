import {
  Indicator as CheckboxIndicator,
  Root as CheckboxRoot,
} from "@radix-ui/react-checkbox";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils.js";

type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxRoot>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxRoot
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-gray-900 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white",
        className
      )}
      {...props}
    >
      <CheckboxIndicator className="flex items-center justify-center">
        <svg
          aria-hidden="true"
          className="h-3 w-3"
          fill="currentColor"
          viewBox="0 0 12 12"
        >
          <path d="M10.28 2.28L4.5 8.06 1.72 5.28a1 1 0 00-1.44 1.44l3.5 3.5a1 1 0 001.44 0l6.5-6.5a1 1 0 00-1.44-1.44z" />
        </svg>
      </CheckboxIndicator>
    </CheckboxRoot>
  );
}
