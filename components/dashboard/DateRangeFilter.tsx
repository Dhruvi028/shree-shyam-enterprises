"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface Props {
  onRangeChange: (range: DateRange) => void;
  initialRange?: DateRange;
}

export function DateRangeFilter({ onRangeChange, initialRange }: Props) {
  const [startDate, setStartDate] = useState(
    initialRange?.startDate || format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(
    initialRange?.endDate || format(endOfMonth(new Date()), "yyyy-MM-dd"),
  );

  useEffect(() => {
    onRangeChange({ startDate, endDate });
  }, [startDate, endDate, onRangeChange]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          Period
        </label>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-8 pr-2 py-1.5 bg-transparent border-none text-xs focus:outline-none w-32"
            />
          </div>
          <div className="text-slate-300">|</div>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-8 pr-2 py-1.5 bg-transparent border-none text-xs focus:outline-none w-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
