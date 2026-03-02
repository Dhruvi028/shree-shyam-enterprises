import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export const AppCard = forwardRef<HTMLDivElement, AppCardProps>(
  ({ className, title, description, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-slate-200 bg-card text-card-foreground shadow-sm bg-white p-6",
          className,
        )}
        {...props}
      >
        {(title || icon) && (
          <div className="flex items-center gap-2 mb-1">
            {icon && <div className="text-primary">{icon}</div>}
            {title && <h3 className="font-semibold text-lg">{title}</h3>}
          </div>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
        )}
        {children}
      </div>
    );
  },
);
AppCard.displayName = "AppCard";
