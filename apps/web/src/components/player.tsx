"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

import { updatePresence } from "@/app/actions/presence";
import { useKeyboardControls } from "@/hooks/use-keyboard-controls";
import { useLibrary } from "@/hooks/use-library";
import { usePlayerEngine } from "@/hooks/use-player-engine";
import { usePlayerPersistence } from "@/hooks/use-player-persistence";
import { useSwipe } from "@/hooks/use-swipe";
import { useStudyTimer } from "@/hooks/use-study-timer";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { WordData, LibraryData } from "./player/types";

import { ControlDeck } from "./player/ControlDeck";
import { KeyboardHints } from "./player/KeyboardHints";
import { LoadingState } from "./player/LoadingState";
import { PlayerHeader } from "./player/PlayerHeader";
import { ReaderStage } from "./player/ReaderStage";
import { tokenizeToData } from "./player/utils";
import { QuizModal } from "./quiz-modal";
import { StudyCoreModal } from "@/components/study-core-modal";
import { ShareModal } from "@/components/share-modal";

interface PlayerProps {
  book: string;
  initialChapter?: number;
}

export default function Player({ book, initialChapter = 1 }: PlayerProps) {
  // --- Data & Persistence ---
  const { library, isLoading, availableChapters } = useLibrary(book);
  const { targetWpm, readingMode, adjustSpeed, toggleReadingMode } = usePlayerPersistence();

  // --- Convex Mutations & Queries ---
  const logSession = useMutation("userStats:logSession" as any);
  const checkProgress = useMutation("protocols:checkAndMarkProgress" as any);
  const createHighlight = useMutation("highlights:create" as any);
  const removeHighlight = useMutation("highlights:remove" as any);
  const logSharedVerse = useMutation("sharedVerses:create" as any);
  const { data: session } = authClient.useSession();

  // --- Chapter & Word State ---
  const [chapter, setChapter] = useState(initialChapter);
  const [words, setWords] = useState<WordData[]>([]);
  const [showChapters, setShowChapters] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ text: string; reference: string }>({ text: "", reference: "" });
  const [studyModalInitialSearch, setStudyModalInitialSearch] = useState<string | undefined>(undefined);
  const [activeReaders, setActiveReaders] = useState(0);

  const savedHighlights = useQuery("highlights:list" as any, { book, chapter }) || [];

  const handleComplete = useCallback(() => {
    // Update Streak & Stats
    const clientDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    // Calculate unique verses
    const uniqueVerses = new Set(words.map(w => w.verse)).size;

    if (session) {
        logSession({ clientDate, versesRead: uniqueVerses }).catch((err) => {
            console.error("Failed to log session:", err);
        });

        // Check Protocols
        checkProgress({ book, chapter }).then(() => {
            // Silent success
        }).catch((err) => {
            console.error("Failed to update protocol progress:", err);
        });
    }
    
    setShowQuizModal(true);
  }, [logSession, checkProgress, words, book, chapter, session]);

  // --- Reader Actions (Selection Menu) ---
  const handleReaderAction = useCallback((action: string, data: any) => {
    if (action === "concordance") {
      setStudyModalInitialSearch(data); // data is the selected text
      setShowStudyModal(true);
    } else if (action === "highlight") {
        if (!session) {
            toast.info("Sign in to save highlights");
            return;
        }
        // data: { verse, indices, text }
        createHighlight({
            book,
            chapter,
            verse: data.verse,
            indices: data.indices,
            text: data.text,
            color: "rose"
        }).catch(() => toast.error("Failed to save highlight"));
    } else if (action === "remove_highlight") {
        // data: { id }
        removeHighlight({ id: data.id }).catch(() => toast.error("Failed to remove highlight"));
    } else if (action === "share") {
        // data: { text, reference } - Wait, ReaderStage passes raw context usually.
        // Let's assume ReaderStage passes the formatted reference or we format it here?
        // ReaderStage passes `selectedContext` which has { text, verse, indices }
        
        // We need to reconstruct the reference if not passed.
        // But `ReaderStage` handles logic usually. 
        // Let's update ReaderStage to pass formatted data for Share, OR do it here.
        // Doing it here requires access to `words` array to find verse numbers from indices if raw data passed.
        
        // Actually, let's look at `ReaderStage.tsx` call to `onAction`.
        // It passes `selectedContext`. 
        
        const indices = data.indices;
        if (!indices || !indices.length) return;

        let reference = data.referenceOverride as string | undefined;
        if (!reference) {
            const startIdx = indices[0];
            const endIdx = indices[indices.length - 1];
            const startVerse = words[startIdx]?.verse;
            const endVerse = words[endIdx]?.verse;
            
            const displayBook = book.charAt(0).toUpperCase() + book.slice(1);
            reference = `${displayBook} ${chapter}:${startVerse}`;
            if (startVerse && endVerse && startVerse !== endVerse) {
                reference += `-${endVerse}`;
            }
        }

        setShareData({
            text: data.text,
            reference: reference
        });
        setShowShareModal(true);

        if (session) {
            logSharedVerse({ reference, text: data.text }).catch(() => {
                toast.error("Failed to record shared verse");
            });
        }
    }
  }, [book, chapter, createHighlight, logSharedVerse, removeHighlight, session, words]);

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

  const handleToggleReadingMode = useCallback(() => {
    if (playing) {
      togglePlay();
    }
    toggleReadingMode();
  }, [playing, togglePlay, toggleReadingMode]);

  // --- Keyboard Controls ---
  useKeyboardControls({
    isLoading,
    playing,
    wordsLength: words.length,
    wordIndex,
    togglePlay,
    seekTo,
    adjustSpeed,
    toggleReadingMode: handleToggleReadingMode,
    readingMode,
    closeChapters: () => setShowChapters(false),
  });

  // --- Chapter Data for Reading Mode ---
  const chapterData = useMemo(() => {
    if (!library || !library[book]) return null;
    return library[book][chapter.toString()];
  }, [library, book, chapter]);

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
        readingMode={readingMode}
        currentVerse={words[wordIndex]?.verse || null}
        showChapters={showChapters}
        availableChapters={availableChapters}
        playing={playing}
        activeReaders={activeReaders}
        onToggleChapters={() => setShowChapters(!showChapters)}
        onSelectChapter={handleSelectChapter}
        onTogglePlay={togglePlay}
        onToggleStudyTools={() => {
            if (playing) togglePlay();
            setShowStudyModal(true);
        }}
      />

      {/* Main Reading Area */}
      <ReaderStage
        words={words}
        wordIndex={wordIndex}
        readingMode={readingMode}
        playing={playing}
        chapterData={chapterData}
        book={book}
        chapter={chapter}
        onSeek={handleSeek}
        onRestart={resetToStart}
        onWordClick={seekTo}
        onAction={handleReaderAction}
        savedHighlights={savedHighlights}
      />

      {/* Control Deck */}
      <ControlDeck
        targetWpm={targetWpm}
        isWarmingUp={isWarmingUp}
        playing={playing}
        readingMode={readingMode}
        onAdjustSpeed={adjustSpeed}
        onTogglePlay={togglePlay}
        onToggleReadingMode={handleToggleReadingMode}
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

      <StudyCoreModal 
        isOpen={showStudyModal}
        onClose={() => {
            setShowStudyModal(false);
            setStudyModalInitialSearch(undefined);
        }}
        book={book}
        chapter={chapter}
        initialSearchTerm={studyModalInitialSearch}
      />

      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        text={shareData.text}
        reference={shareData.reference}
      />
    </div>
  );
}
