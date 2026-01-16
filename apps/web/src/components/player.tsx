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
} from "lucide-react";
import { WEB } from "@/public/WEB";

// --- Advanced ORP Logic ---

function getORPIndex(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

function tokenize(text: string) {
  return text.match(/\S+/g) || [];
}

// --- Components ---

interface PlayerProps {
  book: keyof typeof WEB;
  chapters?: number[];
}

export default function Player({ book, chapters }: PlayerProps) {
  const [chapter, setChapter] = useState(chapters ? chapters[0] : 1);
  const [wordIndex, setWordIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);

  // Speed State
  const [targetWpm, setTargetWpm] = useState(250);
  const [currentWpm, setCurrentWpm] = useState(250);

  // Ref to track speed without triggering re-renders in the RSVP loop
  const currentWpmRef = useRef(250);

  // Visibility State for Chapter Grid
  const [showChapters, setShowChapters] = useState(false);

  // Load words
  useEffect(() => {
    const bookData = WEB[book];
    if (!bookData) return;

    const chapterData = bookData[chapter.toString() as keyof typeof bookData];
    const text =
      typeof chapterData === "object"
        ? Object.values(chapterData).join(" ")
        : String(chapterData || "");

    setWords(tokenize(text));
    setWordIndex(0);
    setPlaying(false);

    // Reset speeds on chapter change
    setCurrentWpm(targetWpm);
    currentWpmRef.current = targetWpm;
  }, [book, chapter]);

  // --- 1. Soft Start Logic ---
  // Reset speed to 200 (or target) when play begins
  useEffect(() => {
    if (playing) {
      const startSpeed = Math.min(200, targetWpm);
      setCurrentWpm(startSpeed);
      currentWpmRef.current = startSpeed;
    }
  }, [playing]);

  // --- 2. Acceleration Loop ---
  // Smoothly ramp currentWpm up to targetWpm
  useEffect(() => {
    if (!playing) return;

    if (currentWpm !== targetWpm) {
      const rampTimer = setInterval(() => {
        setCurrentWpm((prev) => {
          let next = prev;
          if (prev < targetWpm) {
            next = Math.min(targetWpm, prev + 5); // Accelerate (+5 per 100ms)
          } else if (prev > targetWpm) {
            next = Math.max(targetWpm, prev - 10); // Decelerate faster
          }
          currentWpmRef.current = next; // Sync ref
          return next;
        });
      }, 100);

      return () => clearInterval(rampTimer);
    }
  }, [playing, currentWpm, targetWpm]);

  // --- 3. Dynamic RSVP Engine (Fixed) ---
  useEffect(() => {
    if (!playing || words.length === 0) return;

    if (showChapters) setShowChapters(false);

    const currentWord = words[wordIndex];

    // VITAL: Read from ref to get latest speed without restarting the effect
    const wpm = currentWpmRef.current;

    const baseDelay = 60000 / wpm;
    let delay = baseDelay;

    // Punctuation Detection
    if (currentWord) {
      if (/[.!?;]+["')]*$/.test(currentWord)) {
        delay = baseDelay * 3.0; // Strong pause
      } else if (/[,:]+["')]*$/.test(currentWord)) {
        delay = baseDelay * 1.5; // Weak pause
      }
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
  }, [playing, wordIndex, words]); // REMOVED currentWpm from dependencies to prevent "starvation"

  const togglePlay = () => setPlaying(!playing);

  // --- Speed Controls (Updates Target) ---
  const adjustSpeed = (amount: number) => {
    setTargetWpm((prev) => {
      const next = prev + amount;
      return Math.max(100, Math.min(1000, next));
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if (e.code === "Escape") setShowChapters(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playing, words]);

  const progress = useMemo(() => {
    if (words.length === 0) return 0;
    return (wordIndex / words.length) * 100;
  }, [wordIndex, words]);

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center overflow-hidden overscroll-none font-sans selection:bg-rose-500/30">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none mix-blend-overlay" />

      {/* --- Header Area --- */}
      <div className="absolute top-0 left-0 right-0 z-40 flex flex-col items-center p-6 md:p-8 pointer-events-none">
        {/* Top Bar */}
        <div className="w-full max-w-5xl flex justify-between items-start pointer-events-auto">
          {/* Left Side: Back Button + Title Block */}
          <div className="flex items-start gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Back Button */}
            <Link
              href="/"
              className="mt-1 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-rose-500 hover:bg-zinc-800 transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            {/* Title Block */}
            <div className="flex flex-col gap-1">
              <h1 className="text-[10px] font-bold tracking-[0.25em] text-zinc-600 uppercase">
                Current Reading
              </h1>
              <div className="flex items-center gap-3 text-zinc-200">
                <div className="p-1.5 bg-zinc-900 rounded-md border border-zinc-800">
                  <BookOpen className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium tracking-tight text-sm leading-none">{book}</span>
                  <span className="text-xs text-zinc-500 mt-0.5">Chapter {chapter}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Toggle Button */}
          {chapters && (
            <button
              onClick={() => {
                if (!showChapters) setPlaying(false);
                setShowChapters(!showChapters);
              }}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 mt-1
                ${
                  showChapters
                    ? "bg-zinc-100 text-zinc-950 border-zinc-100 shadow-md shadow-zinc-500/10"
                    : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800"
                }
              `}
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

        {/* Collapsible Chapter Grid */}
        {chapters && (
          <div
            className={`
              w-full max-w-5xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
              grid
              ${
                showChapters ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
              }
            `}
          >
            <div className="overflow-hidden min-h-0">
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-xl p-3 shadow-2xl max-h-[30vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-zinc-500">
                <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
                  {chapters.map((ch) => (
                    <button
                      key={ch}
                      onClick={() => {
                        setChapter(ch);
                        setShowChapters(false);
                      }}
                      className={`
                        w-full h-8 flex items-center justify-center rounded-lg text-[11px] font-medium transition-all duration-200
                        ${
                          ch === chapter
                            ? "bg-zinc-100 text-zinc-950 shadow-lg shadow-zinc-950/20 font-bold scale-105"
                            : "text-zinc-500 bg-zinc-800/30 hover:bg-zinc-700 hover:text-zinc-200"
                        }
                      `}
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

      {/* Main Reader Stage */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl h-64 md:h-96 px-4">
        {/* Optical Guides */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 md:h-20 w-px bg-rose-500/10 mx-auto" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-[1.5rem] md:-translate-y-[2rem] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-30" />
        <div className="absolute inset-x-0 top-1/2 translate-y-[1.5rem] md:translate-y-[2rem] h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-30" />

        {/* The Word */}
        <div className="relative h-24 md:h-32 w-full flex items-center justify-center mb-8">
          {words[wordIndex] ? (
            <RSVPWordDisplay word={words[wordIndex]} />
          ) : (
            <span className="text-zinc-700 text-sm md:text-lg font-mono tracking-widest uppercase text-center animate-pulse">
              End of Chapter
            </span>
          )}
        </div>

        {/* Minimal Progress Bar */}
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

      {/* Control Deck */}
      <div className="absolute bottom-8 md:bottom-12 z-30 w-full flex justify-center px-4">
        <div className="flex items-center gap-3 px-3 py-3 md:px-4 bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 rounded-full shadow-2xl shadow-black/50">
          {/* Cruise Control Interface */}
          <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
            <button
              onClick={() => adjustSpeed(-25)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:scale-95 transition-all"
              aria-label="Decrease Speed"
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
                  // Tiny acceleration indicator
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-ping" />
                )}
              </span>
            </div>

            <button
              onClick={() => adjustSpeed(25)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:scale-95 transition-all"
              aria-label="Increase Speed"
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
        </div>
      </div>
    </div>
  );
}

// --- The Optical Engine ---

const RSVPWordDisplay = ({ word }: { word: string }) => {
  const cleanWord = word.replace(/[^a-zA-Z0-9\u00C0-\u00FF]/g, "");
  const hasLetters = cleanWord.length > 0;

  let left, center, right;

  if (hasLetters) {
    const orpIndexClean = getORPIndex(cleanWord);
    let currentCleanIndex = 0;
    let pivotIndex = 0;

    for (let i = 0; i < word.length; i++) {
      if (/[a-zA-Z0-9\u00C0-\u00FF]/.test(word[i])) {
        if (currentCleanIndex === orpIndexClean) {
          pivotIndex = i;
          break;
        }
        currentCleanIndex++;
      }
    }

    left = word.slice(0, pivotIndex);
    center = word[pivotIndex];
    right = word.slice(pivotIndex + 1);
  } else {
    const pivotIndex = Math.floor(word.length / 2);
    left = word.slice(0, pivotIndex);
    center = word[pivotIndex];
    right = word.slice(pivotIndex + 1);
  }

  return (
    <div className="flex items-baseline font-mono text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none select-none">
      <span className="flex justify-end w-[40vw] text-zinc-500 font-normal opacity-40">{left}</span>

      <span className="flex justify-center w-[1.5ch] text-rose-500 font-bold relative z-10 transform scale-110">
        {center}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-rose-500/20 blur-xl rounded-full -z-10" />
      </span>

      <span className="flex justify-start w-[40vw] text-zinc-100 font-medium">{right}</span>
    </div>
  );
};
