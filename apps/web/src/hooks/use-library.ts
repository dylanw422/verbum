"use client";

import { useEffect, useState, useMemo } from "react";
import type { LibraryData } from "@/components/player/types";
import { LIBRARY_URL } from "@/components/player/constants";

// --- Global Cache ---
let globalLibraryCache: LibraryData | null = null;
let globalFetchPromise: Promise<LibraryData> | null = null;

/**
 * Hook for fetching and caching the Bible library data.
 * Uses a global cache to avoid refetching across component mounts.
 */
export function useLibrary(book: string) {
  const [library, setLibrary] = useState<LibraryData | null>(globalLibraryCache);
  const [isLoading, setIsLoading] = useState(!globalLibraryCache);

  useEffect(() => {
    if (globalLibraryCache) {
      setLibrary(globalLibraryCache);
      setIsLoading(false);
      return;
    }

    async function fetchLibrary() {
      try {
        if (!globalFetchPromise) {
          globalFetchPromise = fetch(LIBRARY_URL).then(async (res) => {
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

  return { library, isLoading, availableChapters };
}
