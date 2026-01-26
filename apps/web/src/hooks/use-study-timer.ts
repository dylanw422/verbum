import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";

const FLUSH_INTERVAL_MS = 30000; // Flush to backend every 30 seconds

export function useStudyTimer(playing: boolean) {
  const logStudyTime = useMutation("userStats:logStudyTime" as any);
  
  // Accumulated seconds since last flush
  const pendingSecondsRef = useRef(0);
  // Timestamp of the last tick to calculate delta
  const lastTickRef = useRef<number | null>(null);

  // Sync ref with playing state for the interval
  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
    if (playing) {
      lastTickRef.current = Date.now();
    } else {
      lastTickRef.current = null;
    }
  }, [playing]);

  // Main timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (!playingRef.current) return;

      const now = Date.now();
      if (lastTickRef.current) {
        const deltaMs = now - lastTickRef.current;
        // Convert to seconds
        const deltaSeconds = deltaMs / 1000;
        pendingSecondsRef.current += deltaSeconds;
      }
      lastTickRef.current = now;
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Flush to backend
  const flush = async () => {
    if (pendingSecondsRef.current < 1) return;

    const secondsToLog = Math.floor(pendingSecondsRef.current);
    if (secondsToLog > 0) {
      // Optimistically reduce the pending amount
      pendingSecondsRef.current -= secondsToLog;
      
      try {
        await logStudyTime({ duration: secondsToLog });
      } catch (error) {
        // Restore if failed (simple retry mechanism)
        pendingSecondsRef.current += secondsToLog;
        console.error("Failed to log study time:", error);
      }
    }
  };

  // Periodic flush
  useEffect(() => {
    const flushInterval = setInterval(flush, FLUSH_INTERVAL_MS);
    return () => {
        clearInterval(flushInterval);
        flush(); // Flush on unmount
    };
  }, []);

  // Flush on visibility change (user tabs away)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        flush();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
}
