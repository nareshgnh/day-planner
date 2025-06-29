// src/components/CalendarLegend.jsx
import React from "react";

export const CalendarLegend = ({ className = "" }) => {
  const legendItems = [
    {
      color:
        "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
      textColor: "text-green-800 dark:text-green-200",
      label: "All habits completed",
      description: "Perfect day!",
    },
    {
      color:
        "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
      textColor: "text-yellow-800 dark:text-yellow-200",
      label: "Partially completed",
      description: "Some habits done",
    },
    {
      color: "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700",
      textColor: "text-red-800 dark:text-red-200",
      label: "All habits missed",
      description: "No habits completed",
    },
    {
      color:
        "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600",
      textColor: "text-gray-600 dark:text-gray-400",
      label: "Pending or no habits",
      description: "Future date or no habits scheduled",
    },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Calendar Legend
      </h3>
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded border ${item.color} flex-shrink-0`}
            />
            <div className="min-w-0 flex-1">
              <div className={`text-xs font-medium ${item.textColor}`}>
                {item.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Special indicators */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Special Indicators
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-blue-500 flex-shrink-0" />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Today's date
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-indigo-500 flex-shrink-0" />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Selected date
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
