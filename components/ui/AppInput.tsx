import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftAddon?: string;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ className, label, error, leftAddon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col space-y-1 w-full text-left">
        {label && (
          <label className="text-sm font-medium text-slate-700">{label}</label>
        )}
        <div className="relative group">
          {leftAddon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 select-none pointer-events-none font-mono tracking-wider text-xs z-10">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
              leftAddon && "pl-[108px]",
              isPassword && "pr-10",
              error && "border-red-500 focus:ring-red-500",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
AppInput.displayName = "AppInput";
