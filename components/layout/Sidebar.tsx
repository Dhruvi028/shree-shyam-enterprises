"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { signOut } from "firebase/auth";

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shadow-2xl">
      <div className="flex h-20 items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <h1 className="text-xl font-extrabold text-white tracking-tight flex flex-col leading-tight">
          <span>Shree Shyam</span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-0.5">
            Enterprises
          </span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-8">
        <div className="mb-4 px-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Main Menu
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-xl p-3 text-sm font-semibold transition-all duration-300 overflow-hidden",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-full" />
              )}
              <item.icon
                className={cn(
                  "mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  isActive
                    ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    : "text-slate-500",
                )}
              />
              {item.label}
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950/50 border border-slate-800/50 px-4 py-3 text-xs font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:rotate-12" />
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
