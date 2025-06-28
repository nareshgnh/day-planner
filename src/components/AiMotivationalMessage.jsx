// src/components/AiMotivationalMessage.jsx
import React from "react";
import { Loader2, Sparkles, Heart } from "lucide-react";
import { Card, CardContent } from "../ui/Card";

export const AiMotivationalMessage = ({ message, isLoading }) => {
  return (
    <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 border-purple-200 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-purple-500" />
            ) : (
              <Sparkles size={20} className="text-purple-500 animate-pulse" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">
                Daily Insight
              </h3>
              <Heart size={14} className="text-red-400" />
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-3 bg-purple-200 dark:bg-purple-700 rounded animate-pulse"></div>
                <div className="h-3 bg-purple-200 dark:bg-purple-700 rounded w-3/4 animate-pulse"></div>
              </div>
            ) : (
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                {message ||
                  "Keep tracking your habits and building a better you!"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
