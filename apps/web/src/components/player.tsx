"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

import { updatePresence } from "@/app/actions/presence";
import { useKeyboardControls } from "@/hooks/use-keyboard-controls";
import { useLibrary } from "@/hooks/use-library";
import { usePlayerEngine } from "@/hooks/use-player-engine";
import { usePlayerPersistence } from "@/hooks/use-player-persistence";
import { useSwipe } from "@/hooks/use-swipe";
import { useStudyTimer } from "@/hooks/use-study-timer";

import { useMutation } from "convex/react";
import type { WordData, LibraryData, VerseContext } from "./player/types";

import { ControlDeck } from "./player/ControlDeck";
import { KeyboardHints } from "./player/KeyboardHints";
import { LoadingState } from "./player/LoadingState";
import { PlayerHeader } from "./player/PlayerHeader";
import { ReaderStage } from "./player/ReaderStage";
import { tokenizeToData } from "./player/utils";
import { QuizModal } from "./quiz-modal";

interface PlayerProps {
  book: string;
}

export default function Player({ book }: PlayerProps) {
  // --- Data & Persistence ---
  const { library, isLoading, availableChapters } = useLibrary(book);
  const { targetWpm, studyMode, adjustSpeed, toggleStudyMode } = usePlayerPersistence();

  // --- Convex Mutations ---
  const logSession = useMutation("userStats:logSession" as any);

  // --- Chapter & Word State ---
  const [chapter, setChapter] = useState(1);
  const [words, setWords] = useState<WordData[]>([]);
  const [showChapters, setShowChapters] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeReaders, setActiveReaders] = useState(0);

  const handleComplete = useCallback(() => {
    // Update Streak & Stats
    const clientDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    // Calculate unique verses
    const uniqueVerses = new Set(words.map(w => w.verse)).size;

    logSession({ clientDate, versesRead: uniqueVerses }).catch((err) => {
        console.error("Failed to log session:", err);
    });
    
    setShowQuizModal(true);
  }, [logSession, words]);

  // --- Presence Logic ---
  useEffect(() => {
    let sessionId = sessionStorage.getItem("verbum-session-id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("verbum-session-id", sessionId);
    }

    const update = async () => {
      if (!sessionId) return;
      const res = await updatePresence(book, chapter.toString(), sessionId);
      if (res.success) {
        setActiveReaders(res.count);
      }
    };

    update();
    const interval = setInterval(update, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [book, chapter]);

  // --- Player Engine ---
  const { wordIndex, playing, isWarmingUp, togglePlay, seekTo, resetToStart } = usePlayerEngine({
    words,
    targetWpm,
    onComplete: handleComplete,
  });

  // --- Study Timer ---
  useStudyTimer(playing);

  // --- Parse Chapter Text into Words ---
  useEffect(() => {
    if (!library || !library[book]) return;
    const chapterData = library[book][chapter.toString()];
    if (!chapterData) return;

    let parsedWords: WordData[] = [];
    if (typeof chapterData === "string") {
      parsedWords = tokenizeToData(chapterData, "1", 0);
    } else {
      const sortedVerses = Object.entries(chapterData).sort(
        (a, b) => parseInt(a[0]) - parseInt(b[0]),
      );
      let currentIndex = 0;
      sortedVerses.forEach(([verseNum, text]) => {
        const newTokens = tokenizeToData(String(text), verseNum, currentIndex);
        parsedWords.push(...newTokens);
        currentIndex += newTokens.length;
      });
    }

    setWords(parsedWords);
  }, [book, chapter, library]);

  // --- Keyboard Controls ---
  useKeyboardControls({
    isLoading,
    playing,
    wordsLength: words.length,
    wordIndex,
    togglePlay,
    seekTo,
    adjustSpeed,
    toggleStudyMode,
    closeChapters: () => setShowChapters(false),
  });

  // --- Context Verses for Study Mode ---
  const contextVerses = useMemo<VerseContext[]>(() => {
    if (!words[wordIndex] || !library) return [];
    const currentVerseStr = words[wordIndex].verse;
    const currentVerseNum = parseInt(currentVerseStr, 10);
    const chData = library[book][chapter.toString()];

    if (!chData || typeof chData === "string") {
      return [{ num: "1", text: String(chData || ""), isCurrent: true }];
    }

    const verses: VerseContext[] = [];
    const range = [-1, 0, 1];

    range.forEach((offset) => {
      const vNum = currentVerseNum + offset;
      const vStr = vNum.toString();
      if (chData[vStr]) {
        verses.push({
          num: vStr,
          text: chData[vStr] as string,
          isCurrent: offset === 0,
        });
      }
    });

    return verses;
  }, [wordIndex, words, library, book, chapter]);

  // --- Event Handlers ---
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!words.length) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newIndex = Math.floor(percentage * words.length);
      seekTo(newIndex);
    },
    [words.length, seekTo],
  );

  const handleSelectChapter = useCallback((ch: number) => {
    setChapter(ch);
    setShowChapters(false);
  }, []);

  const handleNextChapter = useCallback(() => {
    if (chapter < availableChapters.length) {
      setChapter((prev) => prev + 1);
      resetToStart();
    }
    setShowQuizModal(false);
  }, [chapter, availableChapters.length, resetToStart]);

  // --- Swipe Handlers ---
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      // Go to next chapter
      if (chapter < availableChapters.length) {
        setChapter((prev) => prev + 1);
        resetToStart();
      }
    },
    onSwipeRight: () => {
      // Go to previous chapter
      if (chapter > 1) {
        setChapter((prev) => prev - 1);
        resetToStart();
      }
    },
  });

  // --- Loading State ---
  if (isLoading) {
    return <LoadingState />;
  }

  // --- Render ---
  return (
    <div
      className="fixed inset-0 w-full h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-rose-500/30"
      {...swipeHandlers}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,_#09090b_80%)] pointer-events-none z-10" />

      {/* Header with Chapter Selector */}
      <PlayerHeader
        book={book}
        chapter={chapter}
        studyMode={studyMode}
        currentVerse={words[wordIndex]?.verse || null}
        showChapters={showChapters}
        availableChapters={availableChapters}
        playing={playing}
        activeReaders={activeReaders}
        onToggleChapters={() => setShowChapters(!showChapters)}
        onSelectChapter={handleSelectChapter}
        onTogglePlay={togglePlay}
      />

      {/* Main Reading Area */}
      <ReaderStage
        words={words}
        wordIndex={wordIndex}
        studyMode={studyMode}
        playing={playing}
        contextVerses={contextVerses}
        onSeek={handleSeek}
        onRestart={resetToStart}
      />

      {/* Control Deck */}
      <ControlDeck
        targetWpm={targetWpm}
        isWarmingUp={isWarmingUp}
        playing={playing}
        studyMode={studyMode}
        onAdjustSpeed={adjustSpeed}
        onTogglePlay={togglePlay}
        onToggleStudyMode={toggleStudyMode}
      />

      {/* Keyboard Hints */}
      <KeyboardHints />

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        chapterText={words.map((w) => w.text).join(" ")}
        onNextChapter={handleNextChapter}
        hasNextChapter={chapter < availableChapters.length}
      />
    </div>
  );
}
