"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, Briefcase, Activity, BarChart2,
  Settings, Building2, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", icon: BarChart2, label: "ダッシュボード" },
  { href: "/customers", icon: Users, label: "顧客管理" },
  { href: "/deals", icon: Briefcase, label: "商談管理" },
  { href: "/activities", icon: Activity, label: "活動履歴" },
  { href: "/reports", icon: BarChart2, label: "レポート" },
  { href: "/settings", icon: Settings, label: "設定" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
          <Building2 size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">CRM System</p>
          <p className="text-gray-400 text-xs">Sales Management</p>
        </div>
      </div>
      <nav className="px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-56 bg-gray-900 flex-col shrink-0 h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-gray-900 flex flex-col h-full">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}