"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Minus,
  Plus,
  Zap,
  Keyboard,
  Loader2,
  GraduationCap,
  Quote,
} from "lucide-react";

// --- Types ---

type WordData = {
  text: string;
  verse: string;
  id: string; // Unique ID for React Keys
};

type LibraryData = Record<string, Record<string, string | Record<string, string>>>;

// --- Logic ---

function getORPIndex(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

// Tokenizer now handles verse association
function tokenizeToData(text: string, verse: string, startIndex: number): WordData[] {
  const processed = text.replace(/—/g, " — ").replace(/--/g, " — ").replace(/-/g, "- ");

  const tokens = processed.match(/\S+/g) || [];

  return tokens.map((token, i) => ({
    text: token,
    verse: verse,
    id: `${verse}-${startIndex + i}`,
  }));
}

// --- Global Cache ---
let globalLibraryCache: LibraryData | null = null;
let globalFetchPromise: Promise<LibraryData> | null = null;

// --- Components ---

interface PlayerProps {
  book: string;
}

export default function Player({ book }: PlayerProps) {
  // --- State ---
  const [library, setLibrary] = useState<LibraryData | null>(globalLibraryCache);
  const [isLoading, setIsLoading] = useState(!globalLibraryCache);

  // Player State
  const [chapter, setChapter] = useState(1);
  const [wordIndex, setWordIndex] = useState(0);
  const [words, setWords] = useState<WordData[]>([]);
  const [playing, setPlaying] = useState(false);
  const [studyMode, setStudyMode] = useState(false);

  // Speed State
  const [targetWpm, setTargetWpm] = useState(250);
  const [currentWpm, setCurrentWpm] = useState(250);
  const currentWpmRef = useRef(250);
  const [showChapters, setShowChapters] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    const savedSpeed = localStorage.getItem("rsvp-speed");
    if (savedSpeed) {
      const val = parseInt(savedSpeed, 10);
      if (!isNaN(val) && val >= 100 && val <= 1000) {
        setTargetWpm(val);
        setCurrentWpm(val);
        currentWpmRef.current = val;
      }
    }
    const savedMode = localStorage.getItem("rsvp-study-mode");
    if (savedMode === "true") setStudyMode(true);
  }, []);

  const toggleStudyMode = () => {
    const newMode = !studyMode;
    setStudyMode(newMode);
    localStorage.setItem("rsvp-study-mode", String(newMode));
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (globalLibraryCache) {
      setLibrary(globalLibraryCache);
      setIsLoading(false);
      return;
    }
    async function fetchLibrary() {
      try {
        if (!globalFetchPromise) {
          globalFetchPromise = fetch(
            "https://grnkacu5pyiersbw.public.blob.vercel-storage.com/BSB.json"
          ).then(async (res) => {
            if (!res.ok) throw new Error("Failed to fetch library");
            return res.json();
          });
        }
        const data = await globalFetchPromise;
        globalLibraryCache = data;
        setLibrary(data);
      } catch (error) {
        console.error("Error loading book data:", error);
        globalFetchPromise = null;
      } finally {
        setIsLoading(false);
      }
    }
    fetchLibrary();
  }, []);

  const availableChapters = useMemo(() => {
    if (!library || !library[book]) return [];
    return Object.keys(library[book])
      .map((ch) => parseInt(ch, 10))
      .sort((a, b) => a - b);
  }, [library, book]);

  // --- Content Loading & Parsing ---
  useEffect(() => {
    if (!library || !library[book]) return;
    const chapterData = library[book][chapter.toString()];
    if (!chapterData) return;

    let parsedWords: WordData[] = [];

    // Handle both string (single verse/chapter) and object (verse map) formats
    if (typeof chapterData === "string") {
      parsedWords = tokenizeToData(chapterData, "1", 0);
    } else {
      // Sort verses numerically to ensure order
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
    setWordIndex(0);
    setPlaying(false);
  }, [book, chapter, library]);

  // --- Engine Logic ---
  useEffect(() => {
    if (playing) {
      const startSpeed = Math.min(200, targetWpm);
      setCurrentWpm(startSpeed);
      currentWpmRef.current = startSpeed;
    }
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    if (currentWpm !== targetWpm) {
      const rampTimer = setInterval(() => {
        setCurrentWpm((prev) => {
          let next = prev;
          if (prev < targetWpm) next = Math.min(targetWpm, prev + 5);
          else if (prev > targetWpm) next = Math.max(targetWpm, prev - 10);
          currentWpmRef.current = next;
          return next;
        });
      }, 100);
      return () => clearInterval(rampTimer);
    }
  }, [playing, currentWpm, targetWpm]);

  useEffect(() => {
    if (!playing || words.length === 0) return;
    if (showChapters) setShowChapters(false);

    const currentWordData = words[wordIndex];
    if (!currentWordData) return;

    const currentText = currentWordData.text;
    const wpm = currentWpmRef.current;
    const baseDelay = 60000 / wpm;
    let delay = baseDelay;

    // Punctuation Delays
    if (/[.!?;]+["')]*$/.test(currentText)) {
      delay = baseDelay * 2.5;
    } else if (/[,:;]+["')]*$/.test(currentText)) {
      delay = baseDelay * 1.5;
    }

    const timer = setTimeout(() => {
      setWordIndex((prev) => {
        if (prev >= words.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [playing, wordIndex, words]);

  const togglePlay = () => setPlaying(!playing);

  const adjustSpeed = (amount: number) => {
    setTargetWpm((prev) => {
      const next = Math.max(100, Math.min(1000, prev + amount));
      localStorage.setItem("rsvp-speed", next.toString());
      return next;
    });
  };

  // --- Helpers for Context Overlay (Previous/Current/Next Verse) ---
  const contextVerses = useMemo(() => {
    if (!words[wordIndex] || !library) return [];

    const currentVerseStr = words[wordIndex].verse;
    const currentVerseNum = parseInt(currentVerseStr, 10);
    const chData = library[book][chapter.toString()];

    // Fallback if data structure is unexpected
    if (!chData || typeof chData === "string") {
      return [{ num: "1", text: String(chData || ""), isCurrent: true }];
    }

    const verses = [];

    // Previous Verse
    const prevNum = currentVerseNum - 1;
    if (chData[prevNum.toString()]) {
      verses.push({
        num: prevNum.toString(),
        text: chData[prevNum.toString()],
        isCurrent: false,
      });
    }

    // Current Verse
    if (chData[currentVerseStr]) {
      verses.push({
        num: currentVerseStr,
        text: chData[currentVerseStr],
        isCurrent: true,
      });
    }

    // Next Verse
    const nextNum = currentVerseNum + 1;
    if (chData[nextNum.toString()]) {
      verses.push({
        num: nextNum.toString(),
        text: chData[nextNum.toString()],
        isCurrent: false,
      });
    }

    return verses;
  }, [wordIndex, words, library, book, chapter]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") setWordIndex((p) => Math.min(words.length - 1, p + 10));
      if (e.code === "ArrowLeft") setWordIndex((p) => Math.max(0, p - 10));
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
        setWordIndex(0);
      }
      if (e.code === "KeyS") {
        e.preventDefault();
        toggleStudyMode();
      }
      if (e.code === "Escape") setShowChapters(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playing, words, isLoading, studyMode]);

  const progress = useMemo(() => {
    if (words.length === 0) return 0;
    return (wordIndex / words.length) * 100;
  }, [wordIndex, words]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin z-20" />
        <span className="mt-4 text-xs font-mono tracking-widest text-zinc-500 uppercase z-20">
          Loading Library...
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-rose-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none mix-blend-overlay" />

      {/* --- Header Area --- */}
      <div className="absolute top-0 left-0 right-0 z-40 flex flex-col items-center p-6 md:p-8 pointer-events-none">
        <div className="w-full max-w-5xl flex justify-between items-start pointer-events-auto">
          <div className="flex items-start gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <Link
              href="/"
              className="mt-1 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-rose-500 hover:bg-zinc-800 transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div className="flex flex-col gap-1">
              <h1 className="text-[10px] font-bold tracking-[0.25em] text-zinc-600 uppercase flex items-center gap-2">
                Current Reading
                {studyMode && <span className="text-rose-500 animate-pulse">• STUDY MODE</span>}
              </h1>
              <div className="flex items-center gap-3 text-zinc-200">
                <div className="p-1.5 bg-zinc-900 rounded-md border border-zinc-800">
                  <BookOpen className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium tracking-tight text-sm leading-none">{book}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-zinc-500">Chapter {chapter}</span>
                    {/* STUDY MODE: Verse Indicator */}
                    {studyMode && words[wordIndex] && (
                      <>
                        <span className="text-xs text-zinc-600">:</span>
                        <span className="text-xs text-rose-500 font-mono font-bold">
                          Verse {words[wordIndex].verse}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {availableChapters.length > 0 && (
            <button
              onClick={() => {
                if (!showChapters) setPlaying(false);
                setShowChapters(!showChapters);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 mt-1 ${
                showChapters
                  ? "bg-zinc-100 text-zinc-950 border-zinc-100 shadow-md shadow-zinc-500/10"
                  : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
            >
              <span>Chapters</span>
              {showChapters ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Chapter Grid */}
        {availableChapters.length > 0 && (
          <div
            className={`w-full max-w-5xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] grid ${
              showChapters ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
            }`}
          >
            <div className="overflow-hidden min-h-0">
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-xl p-3 shadow-2xl max-h-[30vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-500">
                <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
                  {availableChapters.map((ch) => (
                    <button
                      key={ch}
                      onClick={() => {
                        setChapter(ch);
                        setShowChapters(false);
                      }}
                      className={`w-full h-8 flex items-center justify-center rounded-lg text-[11px] font-medium transition-all duration-200 ${
                        ch === chapter
                          ? "bg-zinc-100 text-zinc-950 shadow-lg shadow-zinc-950/20 font-bold scale-105"
                          : "text-zinc-500 bg-zinc-800/30 hover:bg-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Main Reader Stage --- */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl h-64 md:h-96 px-4">
        {/* STUDY MODE: Context Overlay (Only on Pause) */}
        {studyMode && !playing && contextVerses.length > 0 && (
          <div className="absolute -top-32 md:-top-24 inset-x-0 flex flex-col items-center animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 pointer-events-none z-50">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-5 rounded-xl max-w-2xl text-center shadow-2xl shadow-black/50 pointer-events-auto max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
              {contextVerses.map((v) => (
                <div
                  key={v.num}
                  className={`mb-4 last:mb-0 transition-opacity ${
                    v.isCurrent ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center gap-2 mb-1 ${
                      v.isCurrent ? "text-rose-500" : "text-zinc-500"
                    }`}
                  >
                    {v.isCurrent && <Quote className="w-3 h-3 fill-current" />}
                    <span className="text-[10px] font-mono tracking-widest uppercase">
                      Verse {v.num}
                    </span>
                  </div>
                  <p
                    className={`text-lg md:text-xl leading-relaxed font-serif italic selection:bg-rose-500/30 ${
                      v.isCurrent ? "text-zinc-200" : "text-zinc-400"
                    }`}
                  >
                    "{v.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optical Guides */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 md:h-20 w-px bg-rose-500/10 mx-auto" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-[1.5rem] md:-translate-y-[2rem] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-30" />
        <div className="absolute inset-x-0 top-1/2 translate-y-[1.5rem] md:translate-y-[2rem] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-30" />

        <div
          className={`relative h-24 md:h-32 w-full flex items-center justify-center mb-8 transition-opacity duration-500 ${
            studyMode && !playing ? "opacity-10 blur-sm" : "opacity-100"
          }`}
        >
          {words[wordIndex] ? (
            <RSVPWordDisplay
              key={words[wordIndex].id} // Unique ID includes verse index to prevent artifacting
              word={words[wordIndex].text}
              studyMode={studyMode}
            />
          ) : (
            <span className="text-zinc-700 text-sm md:text-lg font-mono tracking-widest uppercase text-center animate-pulse">
              End of Chapter
            </span>
          )}
        </div>

        <div className="w-full max-w-xs md:max-w-sm flex flex-col items-center gap-3">
          <div className="w-full h-0.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between w-full text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
            <span>
              {wordIndex} / {words.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* --- Control Deck --- */}
      <div className="absolute bottom-8 md:bottom-12 z-30 w-full flex justify-center px-4">
        <div className="flex items-center gap-3 px-3 py-3 md:px-4 bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 rounded-full shadow-2xl shadow-black/50">
          {/* Speed Controls */}
          <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
            <button
              onClick={() => adjustSpeed(-25)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-24 flex flex-col items-center justify-center space-y-0.5 relative group">
              <div
                className={`flex items-center gap-1.5 transition-colors ${
                  currentWpm < targetWpm && playing ? "text-zinc-400" : "text-rose-500"
                }`}
              >
                <Zap
                  className={`w-3 h-3 fill-current ${
                    currentWpm < targetWpm && playing ? "animate-pulse" : ""
                  }`}
                />
                <span className="text-lg font-bold font-mono tracking-tight leading-none tabular-nums">
                  {targetWpm}
                </span>
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
                WPM
                {playing && currentWpm < targetWpm && (
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-ping" />
                )}
              </span>
            </div>
            <button
              onClick={() => adjustSpeed(25)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-8 bg-zinc-800/50 mx-1" />

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-14 h-14 md:w-12 md:h-12 rounded-full bg-zinc-100 text-zinc-950 hover:bg-rose-500 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-zinc-950/20"
          >
            {playing ? (
              <Pause className="w-6 h-6 md:w-5 md:h-5 fill-current" />
            ) : (
              <Play className="w-6 h-6 md:w-5 md:h-5 fill-current ml-1" />
            )}
          </button>

          <div className="w-px h-8 bg-zinc-800/50 mx-1" />

          {/* Study Mode Toggle */}
          <button
            onClick={toggleStudyMode}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 border ${
              studyMode
                ? "bg-zinc-800 text-rose-500 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 border-transparent"
            }`}
            aria-label="Toggle Study Mode"
          >
            <GraduationCap className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-30 hidden md:flex flex-col items-end gap-2 opacity-100 hover:opacity-100 transition-opacity duration-300">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1 flex items-center gap-1.5">
          <Keyboard className="w-3 h-3" /> Shortcuts
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center justify-end gap-2">
            <span className="text-zinc-600 tracking-tight">Toggle Study Mode</span>
            <div className="flex gap-1">
              <span className="min-w-[20px] h-5 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded px-1 shadow-sm text-zinc-300">
                S
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-zinc-600 tracking-tight">Play / Pause</span>
            <div className="flex gap-1">
              <span className="min-w-[20px] h-5 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded px-1 shadow-sm text-zinc-300">
                Space
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- OPTICAL ENGINE COMPONENT ---

const RSVPWordDisplay = ({ word, studyMode }: { word: string; studyMode: boolean }) => {
  // 1. VISUAL CLEANING (Visuals Only)
  const displayWord = word.replace(/[:;!()\[\]{}]/g, "");

  const LETTER_REGEX = /[a-zA-Z0-9\u00C0-\u00FF]/;
  const GLOBAL_LETTER_REGEX = /[^a-zA-Z0-9\u00C0-\u00FF]/g;

  // 2. STUDY MODE: SYNTAX HIGHLIGHTING
  let centerColor = "text-rose-500"; // Default

  if (studyMode) {
    const lower = displayWord.toLowerCase();
    // Divine
    if (
      ["god", "jesus", "lord", "christ", "spirit", "yahweh", "father"].some((k) =>
        lower.includes(k)
      )
    ) {
      centerColor = "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]";
    }
    // Negative
    else if (["satan", "devil", "sin", "evil", "death", "hell"].some((k) => lower.includes(k))) {
      centerColor = "text-red-500";
    }
    // Connectors
    else if (["therefore", "however", "but", "because"].includes(lower)) {
      centerColor = "text-blue-400 decoration-blue-500/30 underline underline-offset-4";
    }
  }

  // 3. DYNAMIC FONT SIZING
  const len = displayWord.length;
  const textSize =
    len > 15
      ? "text-2xl sm:text-3xl md:text-5xl"
      : len > 10
      ? "text-3xl sm:text-4xl md:text-6xl"
      : "text-4xl sm:text-5xl md:text-7xl";

  const cleanWordForORP = displayWord.replace(GLOBAL_LETTER_REGEX, "");
  const hasLetters = cleanWordForORP.length > 0;

  let left, center, right;

  if (hasLetters) {
    const orpIndexClean = getORPIndex(cleanWordForORP);
    let currentCleanIndex = 0;
    let pivotIndex = 0;

    for (let i = 0; i < displayWord.length; i++) {
      if (LETTER_REGEX.test(displayWord[i])) {
        if (currentCleanIndex === orpIndexClean) {
          pivotIndex = i;
          break;
        }
        currentCleanIndex++;
      }
    }
    left = displayWord.slice(0, pivotIndex);
    center = displayWord[pivotIndex];
    right = displayWord.slice(pivotIndex + 1);
  } else {
    const pivotIndex = Math.floor(displayWord.length / 2);
    left = displayWord.slice(0, pivotIndex);
    center = displayWord[pivotIndex];
    right = displayWord.slice(pivotIndex + 1);
  }

  return (
    <div
      className={`flex items-baseline ${textSize} font-mono tracking-tight leading-none select-none transition-all duration-100 ease-out`}
    >
      <span className="flex justify-end w-[45vw] text-zinc-500 font-normal opacity-40">{left}</span>
      <span
        className={`flex justify-center w-[1.5ch] ${centerColor} font-bold relative z-10 transform scale-110`}
      >
        {center}
        <span
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 blur-xl rounded-full -z-10 opacity-20 ${
            studyMode && centerColor.includes("amber") ? "bg-amber-500" : "bg-rose-500"
          }`}
        />
      </span>
      <span className="flex justify-start w-[45vw] text-zinc-100 font-medium">{right}</span>
    </div>
  );
};
