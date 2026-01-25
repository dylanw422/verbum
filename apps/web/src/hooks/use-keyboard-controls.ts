"use client";

import { useEffect } from "react";

interface UseKeyboardControlsOptions {
  isLoading: boolean;
  playing: boolean;
  wordsLength: number;
  wordIndex: number;
  togglePlay: () => void;
  seekTo: (index: number) => void;
  adjustSpeed: (delta: number) => void;
  toggleStudyMode: () => void;
  closeChapters: () => void;
}

/**
 * Hook for handling keyboard shortcuts in the player.
 * Space: play/pause, Arrows: seek/speed, S: study mode, Escape: close chapters
 */
export function useKeyboardControls({
  isLoading,
  playing,
  wordsLength,
  wordIndex,
  togglePlay,
  seekTo,
  adjustSpeed,
  toggleStudyMode,
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
      if (e.code === "KeyS") {
        e.preventDefault();
        toggleStudyMode();
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
    togglePlay,
    seekTo,
    adjustSpeed,
    toggleStudyMode,
    closeChapters,
  ]);
}
