// src/components/CelebrationSystem.jsx
import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Star, Zap, Heart } from "lucide-react";
import { useToast } from "./ToastProvider.jsx";

export const CelebrationSystem = ({
  isVisible,
  onComplete,
  celebrationType = "habit",
  habitTitle = "",
  milestoneText = "",
}) => {
  const [particles, setParticles] = useState([]);
  const { addToast } = useToast();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (isVisible && !hasShownToast.current) {
      generateParticles();
      addToast(getCelebrationMessage());
      hasShownToast.current = true;

      if (typeof window !== "undefined" && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (!isVisible) {
      hasShownToast.current = false;
    }
  }, [isVisible, onComplete, addToast]);

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
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
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
