// src/components/StreakMilestoneModal.jsx
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Trophy, Flame, Sparkles, Target } from "lucide-react";

const StreakMilestoneModal = ({
  isOpen,
  onClose,
  milestone,
  habitTitle,
  currentStreak,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-close after celebration
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getMilestoneInfo = (milestone) => {
    const milestoneData = {
      7: {
        title: "Week Warrior!",
        message: "You've built a solid foundation!",
        icon: Flame,
        color: "from-orange-400 to-red-500",
        emoji: "🔥",
      },
      14: {
        title: "Two Week Champion!",
        message: "You're building real momentum!",
        icon: Target,
        color: "from-blue-400 to-purple-500",
        emoji: "🎯",
      },
      30: {
        title: "Monthly Master!",
        message: "This is becoming a real habit!",
        icon: Trophy,
        color: "from-yellow-400 to-orange-500",
        emoji: "🏆",
      },
      50: {
        title: "Halfway Hero!",
        message: "You're unstoppable now!",
        icon: Sparkles,
        color: "from-green-400 to-blue-500",
        emoji: "✨",
      },
      100: {
        title: "Century Superstar!",
        message: "100 days of dedication!",
        icon: Trophy,
        color: "from-purple-500 to-pink-500",
        emoji: "🌟",
      },
      365: {
        title: "Yearly Legend!",
        message: "A full year of commitment!",
        icon: Trophy,
        color: "from-gradient-to-r from-purple-600 to-pink-600",
        emoji: "👑",
      },
    };

    return milestoneData[milestone] || milestoneData[7];
  };

  if (!isOpen || !milestone) return null;

  const info = getMilestoneInfo(milestone);
  const Icon = info.icon;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent className="max-w-md mx-auto text-center relative overflow-hidden">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-bounce absolute top-4 left-4 text-2xl">
              🎉
            </div>
            <div
              className="animate-bounce absolute top-6 right-6 text-2xl"
              style={{ animationDelay: "0.2s" }}
            >
              ✨
            </div>
            <div
              className="animate-bounce absolute top-12 left-1/2 text-2xl"
              style={{ animationDelay: "0.4s" }}
            >
              🎊
            </div>
            <div
              className="animate-bounce absolute bottom-12 left-8 text-2xl"
              style={{ animationDelay: "0.6s" }}
            >
              ⭐
            </div>
            <div
              className="animate-bounce absolute bottom-8 right-8 text-2xl"
              style={{ animationDelay: "0.8s" }}
            >
              🔥
            </div>
          </div>
        )}

        <div className="pt-6 pb-4">
          {/* Large milestone badge */}
          <div
            className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-r ${info.color} flex items-center justify-center mb-4 shadow-lg`}
          >
            <Icon className="h-12 w-12 text-white" />
          </div>

          {/* Milestone info */}
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {info.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {info.message}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <strong>"{habitTitle}"</strong> - {currentStreak} days strong!
            </div>
          </div>

          {/* Achievement details */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 mb-6">
            <div className="text-4xl mb-2">{info.emoji}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              You've reached the <strong>{milestone}-day milestone</strong>!
              <br />
              Keep going to reach even greater heights!
            </div>
          </div>

          {/* Next milestone preview */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {milestone < 365 && (
              <>
                Next milestone:{" "}
                {milestone < 7
                  ? 7
                  : milestone < 14
                  ? 14
                  : milestone < 30
                  ? 30
                  : milestone < 50
                  ? 50
                  : milestone < 100
                  ? 100
                  : 365}{" "}
                days
              </>
            )}
          </div>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8"
          >
            Keep Going! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakMilestoneModal;
