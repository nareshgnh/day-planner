// src/hooks/useUiPrefs.js
import { useEffect, useState } from "react";

const readBool = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    console.log(`[useUiPrefs] readBool(${k}):`, v, '-> fallback:', fallback);
    if (v === null) return fallback;
    return v === "true";
  } catch (error) {
    console.error(`[useUiPrefs] readBool(${k}) error:`, error);
    return fallback;
  }
};

export const useUiPrefs = () => {
  console.log('[useUiPrefs] Hook called');

  // Safe check for window and matchMedia
  let isSmallScreen = false;
  try {
    if (typeof window !== "undefined" && window.matchMedia) {
      isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
      console.log('[useUiPrefs] isSmallScreen:', isSmallScreen);
    }
  } catch (error) {
    console.error('[useUiPrefs] Error checking screen size:', error);
  }

  const [isCompactMode, setIsCompactMode] = useState(() => {
    const value = readBool("ui.compact", isSmallScreen);
    console.log('[useUiPrefs] Initial isCompactMode state:', value);
    return value;
  });
  const [showRewards, setShowRewards] = useState(() => {
    const value = readBool("ui.showRewards", false);
    console.log('[useUiPrefs] Initial showRewards state:', value);
    return value;
  });
  const [showInsight, setShowInsight] = useState(() => {
    const value = readBool("ui.showInsight", true);
    console.log('[useUiPrefs] Initial showInsight state:', value);
    return value;
  });

  useEffect(() => {
    try {
      localStorage.setItem("ui.compact", String(isCompactMode));
      console.log('[useUiPrefs] Saved ui.compact:', isCompactMode);
    } catch (error) {
      console.error('[useUiPrefs] Error saving ui.compact:', error);
    }
  }, [isCompactMode]);

  useEffect(() => {
    try {
      localStorage.setItem("ui.showRewards", String(showRewards));
      console.log('[useUiPrefs] Saved ui.showRewards:', showRewards);
    } catch (error) {
      console.error('[useUiPrefs] Error saving ui.showRewards:', error);
    }
  }, [showRewards]);

  useEffect(() => {
    try {
      localStorage.setItem("ui.showInsight", String(showInsight));
      console.log('[useUiPrefs] Saved ui.showInsight:', showInsight);
    } catch (error) {
      console.error('[useUiPrefs] Error saving ui.showInsight:', error);
    }
  }, [showInsight]);

  const result = {
    compact: isCompactMode,
    setCompact: setIsCompactMode,
    showRewards,
    setShowRewards,
    showInsight,
    setShowInsight,
  };

  console.log('[useUiPrefs] Returning:', result);
  return result;
};

