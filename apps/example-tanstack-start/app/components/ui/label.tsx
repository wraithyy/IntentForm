import { Root as LabelRoot } from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils.js";

type LabelProps = ComponentPropsWithoutRef<typeof LabelRoot>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <LabelRoot
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}
