"use client";

import { useEffect, useState } from "react";

import { MIN_WPM, MAX_WPM } from "@/components/player/constants";

interface UsePlayerPersistenceReturn {
  targetWpm: number;
  readingMode: boolean;
  setTargetWpm: (wpm: number) => void;
  adjustSpeed: (delta: number) => void;
  toggleReadingMode: () => void;
}

/**
 * Hook for persisting player settings to localStorage.
 * Manages reading speed and mode preferences.
 */
export function usePlayerPersistence(): UsePlayerPersistenceReturn {
  const [targetWpm, setTargetWpmState] = useState(300);
  const [readingMode, setReadingMode] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedSpeed = localStorage.getItem("rsvp-speed");
    if (savedSpeed) {
      const val = parseInt(savedSpeed, 10);
      if (!isNaN(val) && val >= MIN_WPM && val <= MAX_WPM) {
        setTargetWpmState(val);
      }
    }
  }, []);

  const setTargetWpm = (wpm: number) => {
    const clamped = Math.max(MIN_WPM, Math.min(MAX_WPM, wpm));
    setTargetWpmState(clamped);
    localStorage.setItem("rsvp-speed", clamped.toString());
  };

  const adjustSpeed = (delta: number) => {
    setTargetWpmState((prev) => {
      const next = Math.max(MIN_WPM, Math.min(MAX_WPM, prev + delta));
      localStorage.setItem("rsvp-speed", next.toString());
      return next;
    });
  };

  const toggleReadingMode = () => {
    setReadingMode((prev) => !prev);
  };

  return {
    targetWpm,
    readingMode,
    setTargetWpm,
    adjustSpeed,
    toggleReadingMode,
  };
}
