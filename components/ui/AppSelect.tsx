import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string; type?: string }[];
  placeholder?: string;
}

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    // Group options by their type, if they have one
    const groupedOptions = options.reduce(
      (acc, option) => {
        const type = option.type || "none";
        if (!acc[type]) acc[type] = [];
        acc[type].push(option);
        return acc;
      },
      {} as Record<string, typeof options>,
    );

    const hasGroups = Object.keys(groupedOptions).length > 1;

    // Helper to format the group name for UI readability
    const formatGroupName = (type: string) => {
      switch (type) {
        case "public":
          return "Public Sector Banks";
        case "private":
          return "Private Sector Banks";
        case "small_finance":
          return "Small Finance Banks";
        case "fintech":
          return "Fintech / Neo Banks";
        default:
          return "Other";
      }
    };

    return (
      <div className="flex flex-col space-y-1 w-full">
        {label && (
          <label className="text-sm font-medium text-slate-700">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "flex h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
              error && "border-red-500 focus:ring-red-500",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {hasGroups
              ? Object.entries(groupedOptions).map(([type, grpOptions]) => (
                  <optgroup
                    key={type}
                    label={formatGroupName(type)}
                    className="font-semibold text-slate-900"
                  >
                    {grpOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="font-normal text-slate-700"
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))
              : options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="text-slate-700"
                  >
                    {option.label}
                  </option>
                ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
        </div>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  },
);
AppSelect.displayName = "AppSelect";
