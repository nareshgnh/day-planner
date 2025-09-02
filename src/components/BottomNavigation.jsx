// src/components/BottomNavigation.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  LineChart,
  Settings,
  Flame,
} from "lucide-react";

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      isActive: location.pathname === "/",
    },
    {
      to: "/manage",
      icon: ListChecks,
      label: "Habits",
      isActive: location.pathname === "/manage",
    },
    {
      to: "/analytics",
      icon: LineChart,
      label: "Analytics",
      isActive: location.pathname === "/analytics",
    },
    {
      to: "/streaks",
      icon: Flame,
      label: "Streaks",
      isActive: location.pathname === "/streaks",
    },
    {
      to: "/settings",
      icon: Settings,
      label: "Settings",
      isActive: location.pathname === "/settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[color-mix(in_oKlab,var(--color-surface)_92%,transparent)] backdrop-blur-lg border-t border-[var(--color-border)] lg:hidden">
      <div className="flex items-center justify-around py-2 px-1 safe-area-padding-bottom">
        {navItems.map(({ to, icon: Icon, label, isActive }) => (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-[var(--radius-sm)] transition-all duration-200 min-w-0 flex-1 ${
              isActive
                ? "text-[var(--color-primary)] bg-[color-mix(in_oKlab,var(--color-primary)_12%,transparent)]"
                : "text-[var(--color-text)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)]"
            }`}
          >
            <Icon
              size={20}
              className={`mb-1 ${
                isActive ? "scale-110" : ""
              } transition-transform duration-200`}
            />
            <span
              className={`text-xs font-medium tracking-wide truncate ${
                isActive ? "font-semibold" : ""
              }`}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export { BottomNavigation };
