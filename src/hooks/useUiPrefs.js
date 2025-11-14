// src/hooks/useUiPrefs.js
import { useEffect, useState } from "react";

const readBool = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    if (v === null) return fallback;
    return v === "true";
  } catch (error) {
    return fallback;
  }
};

export const useUiPrefs = () => {
  // Safe check for window and matchMedia
  let isSmallScreen = false;
  try {
    if (typeof window !== "undefined" && window.matchMedia) {
      isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
    }
  } catch (error) {
    // Silently fall back to false
  }

  const [isCompactMode, setIsCompactMode] = useState(() => readBool("ui.compact", isSmallScreen));
  const [showRewards, setShowRewards] = useState(() => readBool("ui.showRewards", false));
  const [showInsight, setShowInsight] = useState(() => readBool("ui.showInsight", true));

  useEffect(() => {
    try {
      localStorage.setItem("ui.compact", String(isCompactMode));
    } catch (error) {
      // Silently ignore
    }
  }, [isCompactMode]);

  useEffect(() => {
    try {
      localStorage.setItem("ui.showRewards", String(showRewards));
    } catch (error) {
      // Silently ignore
    }
  }, [showRewards]);

  useEffect(() => {
    try {
      localStorage.setItem("ui.showInsight", String(showInsight));
    } catch (error) {
      // Silently ignore
    }
  }, [showInsight]);

  return {
    compact: isCompactMode,
    setCompact: setIsCompactMode,
    showRewards,
    setShowRewards,
    showInsight,
    setShowInsight,
  };
};

