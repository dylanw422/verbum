import { NextRequest, NextResponse } from "next/server";
import { BOOKS, CROSS_REFERENCES_URL, BIBLE_JSON_URL } from "@/lib/constants";

type CrossReference = {
  reference: string;
  votes: number;
  text?: string;
};

const normalizeBookKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const BOOK_ALIASES = (() => {
  const map = new Map<string, string>();

  BOOKS.forEach((book) => {
    map.set(normalizeBookKey(book), book);
  });

  const aliases: Record<string, string> = {
    gen: "Genesis",
    exod: "Exodus",
    lev: "Leviticus",
    num: "Numbers",
    deut: "Deuteronomy",
    josh: "Joshua",
    judg: "Judges",
    ruth: "Ruth",
    "1sam": "1 Samuel",
    "2sam": "2 Samuel",
    "1kgs": "1 Kings",
    "2kgs": "2 Kings",
    "1kings": "1 Kings",
    "2kings": "2 Kings",
    "1chr": "1 Chronicles",
    "2chr": "2 Chronicles",
    ezra: "Ezra",
    neh: "Nehemiah",
    esth: "Esther",
    job: "Job",
    ps: "Psalms",
    psa: "Psalms",
    psalm: "Psalms",
    psalms: "Psalms",
    prov: "Proverbs",
    eccl: "Ecclesiastes",
    song: "Song of Solomon",
    isa: "Isaiah",
    jer: "Jeremiah",
    lam: "Lamentations",
    ezek: "Ezekiel",
    dan: "Daniel",
    hos: "Hosea",
    joel: "Joel",
    amos: "Amos",
    obad: "Obadiah",
    jonah: "Jonah",
    mic: "Micah",
    nah: "Nahum",
    hab: "Habakkuk",
    zeph: "Zephaniah",
    hag: "Haggai",
    zech: "Zechariah",
    mal: "Malachi",
    matt: "Matthew",
    mark: "Mark",
    luke: "Luke",
    john: "John",
    acts: "Acts",
    rom: "Romans",
    "1cor": "1 Corinthians",
    "2cor": "2 Corinthians",
    gal: "Galatians",
    eph: "Ephesians",
    phil: "Philippians",
    col: "Colossians",
    "1thess": "1 Thessalonians",
    "2thess": "2 Thessalonians",
    "1tim": "1 Timothy",
    "2tim": "2 Timothy",
    titus: "Titus",
    phlm: "Philemon",
    heb: "Hebrews",
    jas: "James",
    james: "James",
    "1pet": "1 Peter",
    "2pet": "2 Peter",
    "1john": "1 John",
    "2john": "2 John",
    "3john": "3 John",
    jude: "Jude",
    rev: "Revelation",
  };

  Object.entries(aliases).forEach(([key, value]) => {
    map.set(normalizeBookKey(key), value);
  });

  return map;
})();

const resolveBookName = (raw: string) => {
  const key = normalizeBookKey(raw);
  return BOOK_ALIASES.get(key) ?? null;
};

const parseRefParts = (
  raw: string,
  fallback?: { book: string; chapter: number },
) => {
  const parts = raw.split(".");
  if (parts.length === 3) {
    const book = resolveBookName(parts[0]);
    if (!book) return null;
    const chapter = Number.parseInt(parts[1], 10);
    const verse = Number.parseInt(parts[2], 10);
    if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return null;
    return { book, chapter, verse };
  }

  if (fallback && parts.length === 2) {
    const chapter = Number.parseInt(parts[0], 10);
    const verse = Number.parseInt(parts[1], 10);
    if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return null;
    return { book: fallback.book, chapter, verse };
  }

  if (fallback && parts.length === 1) {
    const verse = Number.parseInt(parts[0], 10);
    if (!Number.isFinite(verse)) return null;
    return { book: fallback.book, chapter: fallback.chapter, verse };
  }

  return null;
};

const formatReference = (raw: string) => {
  const [startRaw, endRaw] = raw.split("-");
  const start = parseRefParts(startRaw);
  if (!start) return null;

  if (!endRaw) {
    return `${start.book} ${start.chapter}:${start.verse}`;
  }

  const end = parseRefParts(endRaw, { book: start.book, chapter: start.chapter });
  if (!end) {
    return `${start.book} ${start.chapter}:${start.verse}`;
  }

  if (start.book === end.book) {
    if (start.chapter === end.chapter) {
      return `${start.book} ${start.chapter}:${start.verse}-${end.verse}`;
    }
    return `${start.book} ${start.chapter}:${start.verse}-${end.chapter}:${end.verse}`;
  }

  return `${start.book} ${start.chapter}:${start.verse}-${end.book} ${end.chapter}:${end.verse}`;
};

const normalizeUserReference = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes(".") && !trimmed.includes(":")) {
    const parsed = parseRefParts(trimmed);
    if (!parsed) return null;
    return `${parsed.book} ${parsed.chapter}:${parsed.verse}`;
  }

  const match = trimmed.match(/^(.+?)\s+(\d+):(\d+)/);
  if (!match) return null;
  const [, bookRaw, chapterRaw, verseRaw] = match;
  const book = resolveBookName(bookRaw);
  if (!book) return null;
  const chapter = Number.parseInt(chapterRaw, 10);
  const verse = Number.parseInt(verseRaw, 10);
  if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return null;
  return `${book} ${chapter}:${verse}`;
};

const parseReferencePart = (
  raw: string,
  fallback?: { book: string; chapter: number },
) => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withBook = trimmed.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (withBook) {
    const [, bookRaw, chapterRaw, verseRaw] = withBook;
    const book = resolveBookName(bookRaw);
    if (!book) return null;
    const chapter = Number.parseInt(chapterRaw, 10);
    const verse = Number.parseInt(verseRaw, 10);
    if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return null;
    return { book, chapter, verse };
  }

  const chapterVerse = trimmed.match(/^(\d+):(\d+)$/);
  if (fallback && chapterVerse) {
    const [, chapterRaw, verseRaw] = chapterVerse;
    const chapter = Number.parseInt(chapterRaw, 10);
    const verse = Number.parseInt(verseRaw, 10);
    if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return null;
    return { book: fallback.book, chapter, verse };
  }

  const verseOnly = trimmed.match(/^(\d+)$/);
  if (fallback && verseOnly) {
    const verse = Number.parseInt(verseOnly[1]!, 10);
    if (!Number.isFinite(verse)) return null;
    return { book: fallback.book, chapter: fallback.chapter, verse };
  }

  return null;
};

const parseReferenceRange = (reference: string) => {
  const [startRaw, endRaw] = reference.split("-");
  const start = parseReferencePart(startRaw);
  if (!start) return null;

  if (!endRaw) {
    return { start, end: null };
  }

  const end = parseReferencePart(endRaw, { book: start.book, chapter: start.chapter });
  if (!end) {
    return { start, end: null };
  }

  return { start, end };
};

type BibleData = Record<string, Record<string, Record<string, string>>>;
let bibleData: BibleData | null = null;
let biblePromise: Promise<BibleData> | null = null;

const loadBibleData = async () => {
  if (bibleData) return bibleData;
  if (!biblePromise) {
    biblePromise = fetch(BIBLE_JSON_URL).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch Bible JSON (${res.status})`);
      }
      return res.json();
    });
  }
  bibleData = await biblePromise;
  return bibleData;
};

const lookupVerseText = (
  data: BibleData,
  location: { book: string; chapter: number; verse: number },
) => {
  const chapter = data[location.book]?.[String(location.chapter)];
  if (!chapter) return null;
  const text = chapter[String(location.verse)];
  return text ?? null;
};

const buildReferenceText = (
  data: BibleData,
  reference: string,
) => {
  const parsed = parseReferenceRange(reference);
  if (!parsed) return null;

  const startText = lookupVerseText(data, parsed.start);
  if (!parsed.end) return startText;

  const endText = lookupVerseText(data, parsed.end);
  if (!startText && !endText) return null;

  if (
    parsed.start.book === parsed.end.book &&
    parsed.start.chapter === parsed.end.chapter
  ) {
    const verses: string[] = [];
    const chapter = data[parsed.start.book]?.[String(parsed.start.chapter)];
    if (!chapter) return startText ?? endText ?? null;

    for (let v = parsed.start.verse; v <= parsed.end.verse; v += 1) {
      const text = chapter[String(v)];
      if (text) verses.push(text);
    }
    if (verses.length > 0) return verses.join(" ");
  }

  if (startText && endText && startText !== endText) {
    return `${startText} ... ${endText}`;
  }

  return startText ?? endText ?? null;
};

let crossReferenceIndex: Map<string, CrossReference[]> | null = null;
let crossReferencePromise: Promise<Map<string, CrossReference[]>> | null = null;

const loadCrossReferences = async () => {
  if (crossReferenceIndex) return crossReferenceIndex;

  if (!crossReferencePromise) {
    crossReferencePromise = (async () => {
      const res = await fetch(CROSS_REFERENCES_URL);
      if (!res.ok) {
        throw new Error(`Failed to fetch cross references (${res.status})`);
      }

      const map = new Map<string, CrossReference[]>();
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Cross reference stream unavailable");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let lineCount = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          lineCount += 1;
          if (!line || line.startsWith("#") || line.startsWith("From Verse")) {
            continue;
          }

          const [fromRaw, toRaw, votesRaw] = line.split("\t");
          if (!fromRaw || !toRaw) continue;

          const from = parseRefParts(fromRaw);
          if (!from) continue;

          const reference = formatReference(toRaw);
          if (!reference) continue;

          const votes = Number.parseInt(votesRaw ?? "0", 10);
          const entry = {
            reference,
            votes: Number.isFinite(votes) ? votes : 0,
          };

          const key = `${from.book} ${from.chapter}:${from.verse}`;
          const existing = map.get(key);
          if (existing) {
            existing.push(entry);
          } else {
            map.set(key, [entry]);
          }
        }
      }

      if (buffer) {
        const line = buffer.trim();
        if (line && !line.startsWith("#") && !line.startsWith("From Verse")) {
          const [fromRaw, toRaw, votesRaw] = line.split("\t");
          if (fromRaw && toRaw) {
            const from = parseRefParts(fromRaw);
            const reference = formatReference(toRaw);
            if (from && reference) {
              const votes = Number.parseInt(votesRaw ?? "0", 10);
              const entry = {
                reference,
                votes: Number.isFinite(votes) ? votes : 0,
              };
              const key = `${from.book} ${from.chapter}:${from.verse}`;
              const existing = map.get(key);
              if (existing) {
                existing.push(entry);
              } else {
                map.set(key, [entry]);
              }
            }
          }
        }
      }

      for (const entries of map.values()) {
        entries.sort((a, b) => b.votes - a.votes);
      }

      if (lineCount === 0) {
        throw new Error("Cross reference file was empty");
      }

      return map;
    })();
  }

  crossReferenceIndex = await crossReferencePromise;
  return crossReferenceIndex;
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawVerse = searchParams.get("verse")?.trim() ?? "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : null;

  if (!rawVerse) {
    return NextResponse.json({ error: "Missing verse parameter" }, { status: 400 });
  }

  const normalizedKey = normalizeUserReference(rawVerse);
  if (!normalizedKey) {
    return NextResponse.json(
      { error: "Unable to parse verse. Use format like 'John 3:16'." },
      { status: 400 },
    );
  }

  try {
    const index = await loadCrossReferences();
    const bible = await loadBibleData();
    const references = index.get(normalizedKey) ?? [];
    const verseText = buildReferenceText(bible, normalizedKey);
    const capped = Number.isFinite(limit)
      ? references.slice(0, Math.max(0, limit!))
      : references;

    const withText = capped.map((ref) => ({
      ...ref,
      text: buildReferenceText(bible, ref.reference),
    }));

    return NextResponse.json({
      verse: normalizedKey,
      verseText,
      count: references.length,
      references: withText,
    });
  } catch (error) {
    console.error("Cross reference error:", error);
    return NextResponse.json({ error: "Failed to load cross references" }, { status: 500 });
  }
}
