"use client";

import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export function Header() {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shadow-sm">
      <div className="flex flex-1 items-center justify-between md:justify-end">
        {/* Mobile Logo Logo */}
        <div className="md:hidden font-bold text-slate-900 tracking-tight">
          Shree Shyam
        </div>

        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 hidden md:block capitalize">
              {profile?.displayName}
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex justify-center items-center text-primary">
              <User className="w-4 h-4" />
            </div>
            {profile?.role === "admin" && (
              <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
