"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { WordData, LibraryData, VerseContext } from "./player/types";
import { tokenizeToData } from "./player/utils";
import { useLibrary } from "@/hooks/use-library";
import { usePlayerEngine } from "@/hooks/use-player-engine";
import { usePlayerPersistence } from "@/hooks/use-player-persistence";
import { useKeyboardControls } from "@/hooks/use-keyboard-controls";
import { LoadingState } from "./player/LoadingState";
import { PlayerHeader } from "./player/PlayerHeader";
import { ReaderStage } from "./player/ReaderStage";
import { ControlDeck } from "./player/ControlDeck";
import { KeyboardHints } from "./player/KeyboardHints";

interface PlayerProps {
  book: string;
}

export default function Player({ book }: PlayerProps) {
  // --- Data & Persistence ---
  const { library, isLoading, availableChapters } = useLibrary(book);
  const { targetWpm, studyMode, adjustSpeed, toggleStudyMode } = usePlayerPersistence();

  // --- Chapter & Word State ---
  const [chapter, setChapter] = useState(1);
  const [words, setWords] = useState<WordData[]>([]);
  const [showChapters, setShowChapters] = useState(false);

  // --- Player Engine ---
  const { wordIndex, playing, isWarmingUp, togglePlay, seekTo, resetToStart } = usePlayerEngine({
    words,
    targetWpm,
  });

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
        (a, b) => parseInt(a[0]) - parseInt(b[0])
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
    [words.length, seekTo]
  );

  const handleSelectChapter = useCallback((ch: number) => {
    setChapter(ch);
    setShowChapters(false);
  }, []);

  // --- Loading State ---
  if (isLoading) {
    return <LoadingState />;
  }

  // --- Render ---
  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-rose-500/30">
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
    </div>
  );
}
