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

  const [compactViewEnabled, setCompactViewEnabled] = useState(() => readBool("ui.compact", isSmallScreen));
  const [rewardsVisible, setRewardsVisible] = useState(() => readBool("ui.showRewards", false));
  const [insightVisible, setInsightVisible] = useState(() => readBool("ui.showInsight", true));

  useEffect(() => {
    try {
      localStorage.setItem("ui.compact", String(compactViewEnabled));
    } catch (error) {
      // Silently ignore
    }
  }, [compactViewEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("ui.showRewards", String(rewardsVisible));
    } catch (error) {
      // Silently ignore
    }
  }, [rewardsVisible]);

  useEffect(() => {
    try {
      localStorage.setItem("ui.showInsight", String(insightVisible));
    } catch (error) {
      // Silently ignore
    }
  }, [insightVisible]);

  return {
    compact: compactViewEnabled,
    setCompact: setCompactViewEnabled,
    showRewards: rewardsVisible,
    setShowRewards: setRewardsVisible,
    showInsight: insightVisible,
    setShowInsight: setInsightVisible,
  };
};
