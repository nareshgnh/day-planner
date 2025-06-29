// src/components/AiMotivationalMessage.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
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
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
              <ReactMarkdown
                components={{
                  // Custom components for better styling
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 text-sm leading-6">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-purple-700 dark:text-purple-300">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-indigo-600 dark:text-indigo-400">
                      {children}
                    </em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none space-y-2 ml-0 my-3">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 ml-2 my-3">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm leading-relaxed flex items-start gap-2">
                      <span className="text-purple-500 dark:text-purple-400 mt-1">
                        •
                      </span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-400 dark:border-purple-600 pl-4 py-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-r-lg italic my-3">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded text-sm font-mono text-purple-800 dark:text-purple-200">
                      {children}
                    </code>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold text-purple-700 dark:text-purple-400 mb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium text-purple-600 dark:text-purple-500 mb-1">
                      {children}
                    </h3>
                  ),
                }}
              >
                {message ||
                  "Keep tracking your habits and building a better you! Every small step counts towards your goals. 🎯"}
              </ReactMarkdown>
            </div>

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
