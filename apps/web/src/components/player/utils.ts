import type { WordData } from "./types";

/**
 * Calculates the Optimal Recognition Point (ORP) index for a word.
 * This is where the eye naturally focuses for fastest recognition.
 */
export function getORPIndex(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len === 2) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

/**
 * Calculates how long a word should be displayed relative to the base rate.
 * Longer words and punctuation get more time.
 */
export function calculateDurationFactor(word: string): number {
  let factor = 1.0;
  const len = word.length;
  if (len > 7) factor += 0.2;
  if (len > 10) factor += 0.3;
  if (/[.?!]/.test(word)) factor += 1.5;
  else if (/[,:;]/.test(word)) factor += 0.6;
  else if (/[-–—]/.test(word)) factor += 0.4;
  if (word.includes('"') || word.includes("'")) factor += 0.2;
  return factor;
}

/**
 * Tokenizes text into WordData array for RSVP display.
 */
export function tokenizeToData(text: string, verse: string, startIndex: number): WordData[] {
  const processed = text
    .replace(/—/g, " — ")
    .replace(/--/g, " — ")
    .replace(/-/g, "- ")
    .replace(/[\n\r]+/g, " ");

  const tokens = processed.match(/\S+/g) || [];

  return tokens.map((token, i) => {
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
