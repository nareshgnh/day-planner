// src/components/CelebrationSystem.jsx
import React, { useEffect, useState } from "react";
import { Sparkles, Trophy, Star, Zap, Heart } from "lucide-react";

export const CelebrationSystem = ({
  isVisible,
  onComplete,
  celebrationType = "habit",
  habitTitle = "",
  milestoneText = "",
}) => {
  const [particles, setParticles] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowModal(true);
      generateParticles();

      // Play celebration sound (if enabled)
      if (typeof window !== "undefined" && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      const timer = setTimeout(() => {
        setShowModal(false);
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const generateParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5,
      size: 8 + Math.random() * 4,
      color: getRandomColor(),
      icon: getRandomIcon(),
    }));
    setParticles(newParticles);
  };

  const getRandomColor = () => {
    const colors = [
      "text-yellow-400",
      "text-green-400",
      "text-blue-400",
      "text-purple-400",
      "text-pink-400",
      "text-red-400",
      "text-orange-400",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomIcon = () => {
    const icons = [Sparkles, Star, Heart, Zap];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const getCelebrationMessage = () => {
    const messages = {
      habit: [
        `🎉 Great job completing "${habitTitle}"!`,
        `✨ "${habitTitle}" done! You're on fire!`,
        `🔥 Awesome! "${habitTitle}" conquered!`,
        `⭐ Way to go! "${habitTitle}" completed!`,
        `🚀 Fantastic! "${habitTitle}" achieved!`,
      ],
      streak: [
        `🔥 Streak milestone! ${milestoneText}`,
        `⚡ You're unstoppable! ${milestoneText}`,
        `🏆 Streak legend! ${milestoneText}`,
        `💪 Consistency champion! ${milestoneText}`,
      ],
      goal: [
        `🎯 Goal achieved! ${milestoneText}`,
        `🏆 Mission accomplished! ${milestoneText}`,
        `⭐ Target reached! ${milestoneText}`,
        `🚀 Goal crushed! ${milestoneText}`,
      ],
    };

    // For habit type, use the habitTitle directly if it already contains a custom message
    if (celebrationType === "habit" && habitTitle && habitTitle.includes("!")) {
      return habitTitle;
    }

    const messageArray = messages[celebrationType] || messages.habit;
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => {
          const Icon = particle.icon;
          return (
            <div
              key={particle.id}
              className="absolute animate-bounce"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            >
              <Icon
                size={particle.size}
                className={`${particle.color} drop-shadow-lg animate-pulse`}
              />
            </div>
          );
        })}
      </div>

      {/* Celebration Modal */}
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full
          transform transition-all duration-300 pointer-events-auto
          ${showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          border-4 border-gradient-to-r from-yellow-400 via-pink-500 to-purple-500
        `}
      >
        <div className="text-center">
          <div className="mb-4">
            <Trophy
              size={48}
              className="mx-auto text-yellow-500 animate-bounce"
            />
          </div>

          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {getCelebrationMessage()}
          </h3>

          <div className="flex justify-center space-x-2 mb-4">
            <Sparkles className="text-yellow-400 animate-pulse" size={20} />
            <Star className="text-yellow-400 animate-pulse" size={20} />
            <Sparkles className="text-yellow-400 animate-pulse" size={20} />
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Keep up the amazing work! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook for easy celebration triggering
export const useCelebration = () => {
  const [celebration, setCelebration] = useState({
    isVisible: false,
    type: "habit",
    habitTitle: "",
    milestoneText: "",
  });

  const celebrate = (type = "habit", habitTitle = "", milestoneText = "") => {
    setCelebration({
      isVisible: true,
      type,
      habitTitle,
      milestoneText,
    });
  };

  const completeCelebration = () => {
    setCelebration((prev) => ({ ...prev, isVisible: false }));
  };

  return {
    celebration,
    celebrate,
    completeCelebration,
  };
};
