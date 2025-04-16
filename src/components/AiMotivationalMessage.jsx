// src/components/AiMotivationalMessage.jsx
import React from 'react';
import { Loader2 } from 'lucide-react'; // Optional: for loading spinner

export const AiMotivationalMessage = ({ message, isLoading }) => {
  return (
    // *** Corrected Spacing: Reduced padding, removed margin ***
    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/50 dark:via-purple-900/50 dark:to-pink-900/50 shadow-sm border border-gray-200 dark:border-gray-700/50">
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading daily insight...</span>
        </div>
      ) : (
        <p className="text-center text-sm md:text-base text-gray-800 dark:text-gray-200 italic">
          {message || "Keep tracking your habits!"} {/* Fallback message */}
        </p>
      )}
    </div>
  );
};
