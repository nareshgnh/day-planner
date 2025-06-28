// src/components/AiMotivationalMessage.jsx
import React from "react";
import { Loader2, Sparkles, Heart, Brain, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";

export const AiMotivationalMessage = ({ message, isLoading }) => {
  return (
    <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 border-2 border-purple-200 dark:border-purple-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] transform">
      <CardHeader className="pb-3 pt-6 px-6 bg-gradient-to-r from-purple-100/50 to-indigo-100/50 dark:from-purple-900/50 dark:to-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-200/50 dark:bg-purple-800/50">
            {isLoading ? (
              <Loader2
                size={20}
                className="animate-spin text-purple-600 dark:text-purple-400"
              />
            ) : (
              <Brain
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
              💡 Daily Insight
            </h3>
            <Sparkles size={16} className="text-yellow-500 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-700 dark:to-indigo-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-700 dark:to-indigo-700 rounded w-4/5 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-700 dark:to-indigo-700 rounded w-3/5 animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              {message ||
                "Keep tracking your habits and building a better you! Every small step counts towards your goals. 🎯"}
            </p>

            {/* Motivational footer */}
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-purple-200/50 dark:border-purple-700/50">
              <Zap size={16} className="text-yellow-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                You've got this!
              </span>
              <Heart size={16} className="text-red-400 animate-pulse" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
