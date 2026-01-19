"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
  RefreshCw,
} from "lucide-react";

// --- Configuration ---

const MIN_WPM = 100;
const MAX_WPM = 1200;
const REWIND_ON_PAUSE = 5; // Words to rewind when pausing
const WARMUP_DURATION = 800; // ms to ramp up speed

// --- Dictionaries (Exact Match) ---

const DIVINE_TERMS = new Set([
  "god",
  "gods",
  "jesus",
  "lord",
  "christ",
  "spirit",
  "yahweh",
  "father",
  "holy",
  "almighty",
  "creator",
  "savior",
  "messiah",
  "jehovah",
]);

const NEGATIVE_TERMS = new Set([
  "satan",
  "devil",
  "sin",
  "sins",
  "sinful",
  "evil",
  "death",
  "dead",
  "hell",
  "demon",
  "demons",
  "wicked",
  "wickedness",
  "iniquity",
]);

const CONNECTORS = new Set([
  "therefore",
  "however",
  "but",
  "because",
  "although",
  "nevertheless",
  "furthermore",
  "consequently",
  "thus",
  "hence",
]);

// --- Types ---

type WordData = {
  text: string;
  cleanText: string;
  verse: string;
  id: string;
  orpIndex: number;
  durationFactor: number; // Multiplier for how long this word stays on screen
};

type LibraryData = Record<string, Record<string, string | Record<string, string>>>;

// --- Logic & Tokenization ---

// The "Optimal Recognition Point" is slightly left of center
function getORPIndex(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len === 2) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

// Cognitive Load Calculation
function calculateDurationFactor(word: string): number {
  let factor = 1.0;
  const len = word.length;

  // 1. Length Penalty
  if (len > 7) factor += 0.2;
  if (len > 10) factor += 0.3;

  // 2. Punctuation Penalty (Major pauses)
  if (/[.?!]/.test(word)) factor += 1.5;
  else if (/[,:;]/.test(word)) factor += 0.6;
  else if (/[-–—]/.test(word)) factor += 0.4;

  // 3. Structure
  if (word.includes('"') || word.includes("'")) factor += 0.2;

  return factor;
}

function tokenizeToData(text: string, verse: string, startIndex: number): WordData[] {
  // Normalize dashes and spaces
  const processed = text
    .replace(/—/g, " — ")
    .replace(/--/g, " — ")
    .replace(/-/g, "- ")
    .replace(/[\n\r]+/g, " ");

  const tokens = processed.match(/\S+/g) || [];

  return tokens.map((token, i) => {
    // Strip punctuation for the "center" logic, but keep it for display
    const cleanText = token.replace(/[^a-zA-Z0-9\u00C0-\u00FF]/g, "");

    return {
      text: token,
      cleanText,
      verse,
      id: `${verse}-${startIndex + i}`,
      orpIndex: getORPIndex(cleanText || token),
      durationFactor: calculateDurationFactor(token),
    };
  });
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

  // Reader State
  const [chapter, setChapter] = useState(1);
  const [words, setWords] = useState<WordData[]>([]);
  const [wordIndex, setWordIndex] = useState(0);

  // Engine State
  const [playing, setPlaying] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);

  // UX State
  const [studyMode, setStudyMode] = useState(false);
  const [targetWpm, setTargetWpm] = useState(300);
  const [showChapters, setShowChapters] = useState(false);

  // Refs for High-Performance Loop
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const wpmRef = useRef(targetWpm);
  const indexRef = useRef(0);
  const wordsRef = useRef<WordData[]>([]);
  const warmupStartRef = useRef<number>(0);

  // --- Persistence ---
  useEffect(() => {
    const savedSpeed = localStorage.getItem("rsvp-speed");
    if (savedSpeed) {
      const val = parseInt(savedSpeed, 10);
      if (!isNaN(val) && val >= MIN_WPM && val <= MAX_WPM) {
        setTargetWpm(val);
        wpmRef.current = val;
      }
    }
    const savedMode = localStorage.getItem("rsvp-study-mode");
    if (savedMode === "true") setStudyMode(true);
  }, []);

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
            "https://grnkacu5pyiersbw.public.blob.vercel-storage.com/BSB.json",
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

  // --- Parsing & Initialization ---
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
    wordsRef.current = parsedWords;
    setWordIndex(0);
    indexRef.current = 0;
    setPlaying(false);

    // Reset engine
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, [book, chapter, library]);

  // --- The Engine (RequestAnimationFrame) ---

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // 1. Calculate Current Speed (Handle Warmup)
    let currentSpeed = wpmRef.current;
    if (warmupStartRef.current > 0) {
      const elapsedWarmup = time - warmupStartRef.current;
      if (elapsedWarmup < WARMUP_DURATION) {
        // Linear ramp from 50% speed to 100% speed
        const progress = elapsedWarmup / WARMUP_DURATION;
        currentSpeed = wpmRef.current * (0.5 + 0.5 * progress);
      } else {
        warmupStartRef.current = 0; // Warmup done
        setIsWarmingUp(false);
      }
    }

    // 2. Determine Duration of Current Word
    const currentWord = wordsRef.current[indexRef.current];
    if (!currentWord) {
      setPlaying(false);
      return;
    }

    const baseMsPerWord = 60000 / currentSpeed;
    const targetDuration = baseMsPerWord * currentWord.durationFactor;

    // 3. Accumulate Time
    accumulatorRef.current += deltaTime;

    // 4. Trigger Next Word
    if (accumulatorRef.current >= targetDuration) {
      const nextIndex = indexRef.current + 1;

      if (nextIndex >= wordsRef.current.length) {
        setPlaying(false);
        setWordIndex(wordsRef.current.length - 1); // Clamp to end
        return;
      }

      indexRef.current = nextIndex;
      setWordIndex(nextIndex); // Sync React State
      accumulatorRef.current = 0;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      // PAUSE LOGIC
      setPlaying(false);
      cancelAnimationFrame(requestRef.current);

      // Micro-Rewind: Go back a few words to regain context
      const newIndex = Math.max(0, indexRef.current - REWIND_ON_PAUSE);
      indexRef.current = newIndex;
      setWordIndex(newIndex);
    } else {
      // PLAY LOGIC
      if (indexRef.current >= words.length - 1) {
        // Restart if at end
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
  }, [playing, words.length, animate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Update refs when state changes
  useEffect(() => {
    wpmRef.current = targetWpm;
  }, [targetWpm]);

  // --- Event Handlers ---

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!words.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newIndex = Math.floor(percentage * words.length);

    // Stop playing if scrubbing
    if (playing) togglePlay();

    indexRef.current = newIndex;
    setWordIndex(newIndex);
  };

  const adjustSpeed = (delta: number) => {
    setTargetWpm((prev) => {
      const next = Math.max(MIN_WPM, Math.min(MAX_WPM, prev + delta));
      localStorage.setItem("rsvp-speed", next.toString());
      return next;
    });
  };

  const toggleStudyMode = () => {
    const newMode = !studyMode;
    setStudyMode(newMode);
    localStorage.setItem("rsvp-study-mode", String(newMode));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") {
        const next = Math.min(words.length - 1, indexRef.current + 10);
        indexRef.current = next;
        setWordIndex(next);
      }
      if (e.code === "ArrowLeft") {
        const prev = Math.max(0, indexRef.current - 10);
        indexRef.current = prev;
        setWordIndex(prev);
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
      if (e.code === "Escape") setShowChapters(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playing, words, isLoading, studyMode, togglePlay]);

  // --- Context Logic (Memoized) ---
  const contextVerses = useMemo(() => {
    if (!words[wordIndex] || !library) return [];
    const currentVerseStr = words[wordIndex].verse;
    const currentVerseNum = parseInt(currentVerseStr, 10);
    const chData = library[book][chapter.toString()];

    if (!chData || typeof chData === "string") {
      return [{ num: "1", text: String(chData || ""), isCurrent: true }];
    }

    const verses: any[] = [];
    const range = [-1, 0, 1]; // Prev, Current, Next

    range.forEach((offset) => {
      const vNum = currentVerseNum + offset;
      const vStr = vNum.toString();
      if (chData[vStr]) {
        verses.push({
          num: vStr,
          text: chData[vStr],
          isCurrent: offset === 0,
        });
      }
    });

    return verses;
  }, [wordIndex, words, library, book, chapter]);

  const progress = words.length ? (wordIndex / words.length) * 100 : 0;

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
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,_#09090b_80%)] pointer-events-none z-10" />

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
                Reading Mode
                {studyMode && (
                  <span className="inline-flex items-center gap-1 text-rose-500 animate-pulse">
                    <GraduationCap className="w-3 h-3" /> STUDY
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-3 text-zinc-200">
                <div className="p-1.5 bg-zinc-900 rounded-md border border-zinc-800">
                  <BookOpen className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium tracking-tight text-sm leading-none">{book}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-zinc-500">Chapter {chapter}</span>
                    {studyMode && words[wordIndex] && (
                      <>
                        <span className="text-xs text-zinc-600">·</span>
                        <span className="text-xs text-rose-500 font-mono font-bold">
                          v.{words[wordIndex].verse}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {availableChapters.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  if (!showChapters) {
                    if (playing) togglePlay();
                  }
                  setShowChapters(!showChapters);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 mt-1 ${
                  showChapters
                    ? "bg-zinc-100 text-zinc-950 border-zinc-100 shadow-md"
                    : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                <span>CH {chapter}</span>
                {showChapters ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Chapter Grid */}
        <div
          className={`w-full max-w-5xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] grid ${
            showChapters ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl p-4 shadow-2xl max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
              <div className="grid grid-cols-5 md:grid-cols-12 gap-2">
                {availableChapters.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => {
                      setChapter(ch);
                      setShowChapters(false);
                    }}
                    className={`h-9 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 ${
                      ch === chapter
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-900/20 font-bold"
                        : "text-zinc-400 bg-zinc-800/50 hover:bg-zinc-700 hover:text-zinc-100"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Reader Stage --- */}
      <div className="relative z-30 flex flex-col items-center justify-center w-full max-w-5xl h-64 md:h-96 px-4">
        {/* Context Overlay (Paused State) */}
        {studyMode && !playing && contextVerses.length > 0 && (
          <div className="absolute -top-32 md:-top-24 inset-x-0 flex flex-col items-center animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 pointer-events-none z-50">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-5 rounded-xl max-w-2xl text-center shadow-2xl shadow-black/80 pointer-events-auto max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 ring-1 ring-white/10">
              {contextVerses.map((v) => (
                <div
                  key={v.num}
                  className={`mb-4 last:mb-0 transition-opacity ${
                    v.isCurrent ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center gap-2 mb-1 ${v.isCurrent ? "text-rose-500" : "text-zinc-500"}`}
                  >
                    {v.isCurrent && <Quote className="w-3 h-3 fill-current" />}
                    <span className="text-[10px] font-mono tracking-widest uppercase">
                      Verse {v.num}
                    </span>
                  </div>
                  <p
                    className={`text-lg font-serif italic leading-relaxed ${v.isCurrent ? "text-zinc-200" : "text-zinc-400"}`}
                  >
                    "{v.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optical Guides (Fixed) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 md:h-20 w-px bg-rose-500/20 mx-auto z-0" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-[2.5rem] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-50" />
        <div className="absolute inset-x-0 top-1/2 translate-y-[2.5rem] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-50" />

        {/* RSVP Display */}
        <div
          className={`relative h-40 w-full flex items-center justify-center mb-8 transition-all duration-500 ${
            studyMode && !playing ? "opacity-10 blur-sm scale-95" : "opacity-100 scale-100"
          }`}
        >
          {words[wordIndex] ? (
            <RSVPWordDisplay wordData={words[wordIndex]} studyMode={studyMode} />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-zinc-700 animate-spin-slow" />
              <span className="text-zinc-600 font-mono text-sm tracking-widest uppercase">
                End of Chapter
              </span>
              <button
                onClick={() => {
                  setWordIndex(0);
                  indexRef.current = 0;
                }}
                className="text-xs text-rose-500 hover:underline"
              >
                Restart
              </button>
            </div>
          )}
        </div>

        {/* Interactive Progress Bar */}
        <div className="w-full max-w-sm md:max-w-md flex flex-col items-center gap-3 relative group">
          <div
            className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden cursor-pointer hover:h-2.5 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between w-full text-[10px] font-mono text-zinc-600 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
            <span>
              {wordIndex + 1} / {words.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* --- Control Deck --- */}
      <div className="absolute bottom-8 md:bottom-12 z-40 w-full flex justify-center px-4">
        <div className="flex items-center gap-4 px-5 py-4 bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/60 rounded-full shadow-2xl shadow-black">
          {/* Speed Controls */}
          <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
            <button
              onClick={() => adjustSpeed(-50)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-20 flex flex-col items-center justify-center -space-y-0.5 relative">
              <div
                className={`flex items-center gap-1.5 ${isWarmingUp ? "text-amber-400" : "text-rose-500"}`}
              >
                <Zap className={`w-3 h-3 fill-current ${isWarmingUp ? "animate-pulse" : ""}`} />
                <span className="text-lg font-bold font-mono tracking-tight tabular-nums">
                  {targetWpm}
                </span>
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                WPM
              </span>
            </div>
            <button
              onClick={() => adjustSpeed(50)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-8 bg-zinc-800/50" />

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className={`flex items-center justify-center w-16 h-16 md:w-14 md:h-14 rounded-full transition-all duration-300 shadow-lg ${
              playing
                ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 scale-100"
                : "bg-rose-600 text-white hover:bg-rose-500 hover:scale-105 shadow-rose-900/20"
            }`}
          >
            {playing ? (
              <Pause className="w-6 h-6 md:w-6 md:h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 md:w-6 md:h-6 fill-current ml-1" />
            )}
          </button>

          <div className="w-px h-8 bg-zinc-800/50" />

          {/* Study Mode Toggle */}
          <button
            onClick={toggleStudyMode}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 border ${
              studyMode
                ? "bg-zinc-800 text-rose-500 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border-transparent"
            }`}
            title="Toggle Study Mode (S)"
          >
            <GraduationCap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Shortcuts Help */}
      <div className="absolute bottom-6 right-6 z-30 hidden lg:flex flex-col items-end gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1 flex items-center gap-1.5">
          <Keyboard className="w-3 h-3" /> Controls
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-[10px] font-mono text-zinc-400">
          <ShortcutKey label="Play/Pause" k="Space" />
          <ShortcutKey label="Speed" k="↑ / ↓" />
          <ShortcutKey label="Seek" k="← / →" />
          <ShortcutKey label="Study Mode" k="S" />
        </div>
      </div>
    </div>
  );
}

function ShortcutKey({ label, k }: { label: string; k: string }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-zinc-600 tracking-tight">{label}</span>
      <span className="min-w-[20px] h-5 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded px-1.5 shadow-sm text-zinc-300 whitespace-nowrap">
        {k}
      </span>
    </div>
  );
}

// --- OPTICAL ENGINE COMPONENT ---

const RSVPWordDisplay = ({ wordData, studyMode }: { wordData: WordData; studyMode: boolean }) => {
  const { text, cleanText, orpIndex } = wordData;

  // VISUAL PROCESSING
  // We want to pivot the word perfectly on its ORP (Optimal Recognition Point)
  // The center letter should always be at the exact center of the container

  let leftPart, centerChar, rightPart;

  if (cleanText.length === 0) {
    // Handle symbol-only tokens (rare but possible)
    const mid = Math.floor(text.length / 2);
    leftPart = text.slice(0, mid);
    centerChar = text[mid];
    rightPart = text.slice(mid + 1);
  } else {
    // Find the index of the ORP character in the *original* text
    // This accounts for punctuation at the start of the word (e.g., "quote)
    let cleanCount = 0;
    let splitIndex = 0;

    for (let i = 0; i < text.length; i++) {
      if (/[a-zA-Z0-9\u00C0-\u00FF]/.test(text[i])) {
        if (cleanCount === orpIndex) {
          splitIndex = i;
          break;
        }
        cleanCount++;
      }
    }

    leftPart = text.slice(0, splitIndex);
    centerChar = text[splitIndex];
    rightPart = text.slice(splitIndex + 1);
  }

  // --- STYLING ---
  let textColor = "text-zinc-100";
  let centerColor = "text-rose-500";
  let glowEffect = "";

  if (studyMode) {
    const lower = cleanText.toLowerCase();

    if (DIVINE_TERMS.has(lower)) {
      centerColor = "text-amber-400";
      glowEffect = "drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]";
    } else if (NEGATIVE_TERMS.has(lower)) {
      centerColor = "text-red-600";
    } else if (CONNECTORS.has(lower)) {
      centerColor = "text-blue-400";
    }
  }

  // Adaptive Sizing based on word length
  const totalLength = text.length;
  const sizeClass =
    totalLength > 12
      ? "text-4xl md:text-6xl"
      : totalLength > 8
        ? "text-5xl md:text-7xl"
        : "text-6xl md:text-8xl";

  return (
    <div
      className={`flex items-center justify-center ${sizeClass} font-mono tracking-tight leading-none select-none w-full relative h-full`}
    >
      {/* Left Side - Right Aligned */}
      <div className="flex-1 text-right text-zinc-600 font-normal opacity-60">{leftPart}</div>

      {/* ORP Center - Fixed Width to prevent jitter */}
      <div
        className={`flex justify-center w-[1.1ch] ${centerColor} font-bold relative z-10 ${glowEffect}`}
      >
        {centerChar}

        {/* Optical Anchor Line - FIXED HEIGHT and CENTERED */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px bg-current opacity-20 -z-10 h-32 md:h-40" />
      </div>

      {/* Right Side - Left Aligned */}
      <div className={`flex-1 text-left ${textColor} font-medium`}>{rightPart}</div>
    </div>
  );
};
