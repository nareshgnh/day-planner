// src/components/HabitAssistantCard.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/Card"; // Adjust path
import { Button } from "../ui/Button"; // Adjust path
import { Brain, Plus } from "lucide-react";

export const HabitAssistantCard = ({
  aiSuggestion,
  isLoadingSuggestion,
  openModalForNewHabit,
}) => {
  return (
    <Card className="bg-white/90 dark:bg-gray-950/90 flex-shrink-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain size={20} className="text-blue-500" />
          Habit Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg flex items-start gap-2 shadow-sm border border-blue-200 dark:border-blue-800 min-h-[4rem]">
        <Brain
          size={20}
          className={`flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5 ${
            isLoadingSuggestion ? "animate-pulse" : ""
          }`}
        />
        {/* Apply prose styling to wrapper div */}
        <div className="italic whitespace-pre-line text-xs sm:text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1">
          <ReactMarkdown>
            {isLoadingSuggestion ? "Getting suggestion..." : aiSuggestion}
          </ReactMarkdown>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={openModalForNewHabit}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
        >
          <Plus size={18} className="mr-2" /> Add New Habit
        </Button>
      </CardFooter>
    </Card>
  );
};
