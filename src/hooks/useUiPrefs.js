// src/hooks/useUiPrefs.js
import { useEffect, useState } from "react";

const readBool = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    if (v === null) return fallback;
    return v === "true";
  } catch {
    return fallback;
  }
};

export const useUiPrefs = () => {
  const isSmallScreen = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  const [compact, setCompact] = useState(() => readBool("ui.compact", isSmallScreen));
  const [showRewards, setShowRewards] = useState(() => readBool("ui.showRewards", false));
  const [showInsight, setShowInsight] = useState(() => readBool("ui.showInsight", true));

  useEffect(() => {
    localStorage.setItem("ui.compact", String(compact));
  }, [compact]);
  useEffect(() => {
    localStorage.setItem("ui.showRewards", String(showRewards));
  }, [showRewards]);
  useEffect(() => {
    localStorage.setItem("ui.showInsight", String(showInsight));
  }, [showInsight]);

  return {
    compact,
    setCompact,
    showRewards,
    setShowRewards,
    showInsight,
    setShowInsight,
  };
};

