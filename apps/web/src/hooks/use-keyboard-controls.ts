"use client";

import { useEffect } from "react";

interface UseKeyboardControlsOptions {
  isLoading: boolean;
  playing: boolean;
  wordsLength: number;
  wordIndex: number;
  readingMode: boolean;
  togglePlay: () => void;
  seekTo: (index: number) => void;
  adjustSpeed: (delta: number) => void;
  toggleReadingMode: () => void;
  closeChapters: () => void;
}

/**
 * Hook for handling keyboard shortcuts in the player.
 * Space: play/pause, Arrows: seek/speed, R: reading mode, Escape: close chapters
 */
export function useKeyboardControls({
  isLoading,
  playing,
  wordsLength,
  wordIndex,
  readingMode,
  togglePlay,
  seekTo,
  adjustSpeed,
  toggleReadingMode,
  closeChapters,
}: UseKeyboardControlsOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") {
        const next = Math.min(wordsLength - 1, wordIndex + 10);
        seekTo(next);
      }
      if (e.code === "ArrowLeft") {
        const prev = Math.max(0, wordIndex - 10);
        seekTo(prev);
      }
      if (e.code === "ArrowUp") {
        e.preventDefault();
        adjustSpeed(25);
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        adjustSpeed(-25);
      }
      if (e.code === "KeyR") {
        e.preventDefault();
        toggleReadingMode();
      }
      if (e.code === "Escape") {
        closeChapters();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isLoading,
    playing,
    wordsLength,
    wordIndex,
    readingMode,
    togglePlay,
    seekTo,
    adjustSpeed,
    toggleReadingMode,
    closeChapters,
  ]);
}
