import { useEffect, useState } from "react";
import { OT_BOOKS, HEBREW_JSON_URL, GREEK_JSON_URL } from "@/lib/constants";

export interface StrongsEntry {
  lemma: string;
  translit: string;
  pron: string;
  derivation: string;
  strongs_def: string;
  kjv_def: string;
  xlit?: string; // Hebrew specific
}

export type StrongsDictionary = Record<string, StrongsEntry>;

// --- Global Cache ---
let hebrewCache: StrongsDictionary | null = null;
let greekCache: StrongsDictionary | null = null;
let hebrewPromise: Promise<StrongsDictionary> | null = null;
let greekPromise: Promise<StrongsDictionary> | null = null;

export function useOriginalLanguage(book: string) {
  const isOT = OT_BOOKS.includes(book);
  const [dictionary, setDictionary] = useState<StrongsDictionary | null>(
    isOT ? hebrewCache : greekCache
  );
  const [isLoading, setIsLoading] = useState(!dictionary);

  useEffect(() => {
    // If we have data in cache, set it and return
    if (isOT && hebrewCache) {
      setDictionary(hebrewCache);
      setIsLoading(false);
      return;
    }
    if (!isOT && greekCache) {
      setDictionary(greekCache);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    async function fetchData() {
      try {
        const url = isOT ? HEBREW_JSON_URL : GREEK_JSON_URL;
        let promise = isOT ? hebrewPromise : greekPromise;

        if (!promise) {
          promise = fetch(url).then(async (res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${isOT ? "Hebrew" : "Greek"} dictionary`);
            return res.json();
          });
          
          if (isOT) hebrewPromise = promise;
          else greekPromise = promise;
        }

        const data = await promise;
        
        if (isOT) hebrewCache = data;
        else greekCache = data;

        setDictionary(data);
      } catch (error) {
        console.error("Error loading dictionary:", error);
        // Reset promise on error so we can retry
        if (isOT) hebrewPromise = null;
        else greekPromise = null;
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [book, isOT]);

  return { dictionary, isLoading, isOT };
}
