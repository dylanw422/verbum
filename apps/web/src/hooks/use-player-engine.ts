"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { WordData } from "@/components/player/types";
import { REWIND_ON_PAUSE, WARMUP_DURATION } from "@/components/player/constants";

interface UsePlayerEngineOptions {
  words: WordData[];
  targetWpm: number;
  onComplete?: () => void;
}

interface UsePlayerEngineReturn {
  wordIndex: number;
  playing: boolean;
  isWarmingUp: boolean;
  togglePlay: () => void;
  seekTo: (index: number) => void;
  resetToStart: () => void;
}

/**
 * Hook that manages the RSVP playback engine using requestAnimationFrame.
 * Handles word timing, warmup speed ramping, and playback state.
 */
export function usePlayerEngine(options: UsePlayerEngineOptions): UsePlayerEngineReturn {
  const { words, targetWpm } = options;
  const [wordIndex, setWordIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);

  // Refs for animation frame loop
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const wpmRef = useRef(targetWpm);
  const indexRef = useRef(0);
  const wordsRef = useRef<WordData[]>([]);
  const warmupStartRef = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => {
    wpmRef.current = targetWpm;
  }, [targetWpm]);

  useEffect(() => {
    wordsRef.current = words;
    indexRef.current = 0;
    setWordIndex(0);
    setPlaying(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, [words]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    let currentSpeed = wpmRef.current;
    if (warmupStartRef.current > 0) {
      const elapsedWarmup = time - warmupStartRef.current;
      if (elapsedWarmup < WARMUP_DURATION) {
        const progress = elapsedWarmup / WARMUP_DURATION;
        currentSpeed = wpmRef.current * (0.5 + 0.5 * progress);
      } else {
        warmupStartRef.current = 0;
        setIsWarmingUp(false);
      }
    }

    const currentWord = wordsRef.current[indexRef.current];
    if (!currentWord) {
      setPlaying(false);
      return;
    }

    const baseMsPerWord = 60000 / currentSpeed;
    const targetDuration = baseMsPerWord * currentWord.durationFactor;

    accumulatorRef.current += deltaTime;

    if (accumulatorRef.current >= targetDuration) {
      const nextIndex = indexRef.current + 1;
      if (nextIndex >= wordsRef.current.length) {
        setPlaying(false);
        setWordIndex(wordsRef.current.length - 1);
        if (options.onComplete) {
          options.onComplete();
        }
        return;
      }
      indexRef.current = nextIndex;
      setWordIndex(nextIndex);
      accumulatorRef.current = 0;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      cancelAnimationFrame(requestRef.current);
      const newIndex = Math.max(0, indexRef.current - REWIND_ON_PAUSE);
      indexRef.current = newIndex;
      setWordIndex(newIndex);
    } else {
      if (indexRef.current >= wordsRef.current.length - 1) {
        indexRef.current = 0;
        setWordIndex(0);
      }
      setPlaying(true);
      setIsWarmingUp(true);
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
      warmupStartRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [playing, animate]);

  const seekTo = useCallback((index: number) => {
    if (playing) {
      setPlaying(false);
      cancelAnimationFrame(requestRef.current);
    }
    indexRef.current = index;
    setWordIndex(index);
  }, [playing]);

  const resetToStart = useCallback(() => {
    indexRef.current = 0;
    setWordIndex(0);
  }, []);

  return {
    wordIndex,
    playing,
    isWarmingUp,
    togglePlay,
    seekTo,
    resetToStart,
  };
}
