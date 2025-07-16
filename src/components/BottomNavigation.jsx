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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 lg:hidden">
      <div className="flex items-center justify-around py-2 px-1 safe-area-padding-bottom">
        {navItems.map(({ to, icon: Icon, label, isActive }) => (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Icon
              size={20}
              className={`mb-1 ${
                isActive ? "scale-110" : ""
              } transition-transform duration-200`}
            />
            <span
              className={`text-xs font-medium truncate ${
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
