import { NextRequest, NextResponse } from "next/server";
import { BIBLE_JSON_URL, INTERLINEAR_JSON_URL, OT_BOOKS, NT_BOOKS, BOOKS } from "@/lib/constants";

// Cache for English Bible Index
let bsbIndex: Array<{ b: string; c: number; v: number; t: string; isOT: boolean }> | null = null;
let bsbPromise: Promise<any> | null = null;

// Cache for Interlinear (Strongs) Data
let interlinearData: any = null;
let interlinearPromise: Promise<any> | null = null;

// Helper to normalize book names from Interlinear keys (i_kings) to Standard (1 Kings)
function mapInterlinearKeyToStandard(key: string): string {
  // Simple reverse mapping or lookup
  // This is a bit hacky, but efficient enough for 66 books
  // We can also rely on the order if we iterate standard BOOKS and map to snake_case
  // But interlinear keys are: "genesis", "exodus", "i_samuel"
  
  const lowerKey = key.toLowerCase();
  if (lowerKey.startsWith("i_")) return lowerKey.replace("i_", "1 ").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  if (lowerKey.startsWith("ii_")) return lowerKey.replace("ii_", "2 ").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  if (lowerKey.startsWith("iii_")) return lowerKey.replace("iii_", "3 ").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  
  // Standardize capitalization
  const standard = lowerKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  
  // Manual fixups for discrepancies if any (e.g. Song Of Solomon vs Song of Solomon)
  if (standard === "Song Of Solomon") return "Song of Solomon";
  return standard;
}

// Ensure "1 Samuel", "1 Kings" format matches standard BOOKS array
// The above logic produces "1 Samuel".

async function loadBSBIndex() {
  if (bsbIndex) return bsbIndex;
  
  if (!bsbPromise) {
    console.log("Fetching BSB.json...");
    bsbPromise = fetch(BIBLE_JSON_URL).then(res => res.json());
  }

  const data = await bsbPromise;
  const index: typeof bsbIndex = [];
  const otSet = new Set(OT_BOOKS);

  for (const [book, chapters] of Object.entries(data)) {
    const isOT = otSet.has(book);
    // @ts-ignore
    for (const [chapter, content] of Object.entries(chapters)) {
      if (typeof content === "object") {
        for (const [verse, text] of Object.entries(content)) {
          index.push({
            b: book,
            c: parseInt(chapter),
            v: parseInt(verse),
            t: (text as string),
            isOT
          });
        }
      }
    }
  }

  bsbIndex = index;
  return index;
}

async function loadInterlinearData() {
  if (interlinearData) return interlinearData;
  if (!interlinearPromise) {
    console.log("Fetching interlinear.json...");
    interlinearPromise = fetch(INTERLINEAR_JSON_URL).then(res => res.json());
  }
  interlinearData = await interlinearPromise;
  return interlinearData;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawQuery = searchParams.get("q")?.trim() || "";
  const scope = searchParams.get("scope") || "all";

  if (rawQuery.length < 2) {
    return NextResponse.json({ count: 0, results: [], distribution: {} });
  }

  const isStrongsSearch = /^[hg]\d+$/i.test(rawQuery);

  try {
    let allMatches: Array<{ b: string; c: number; v: number; t: string; isOT: boolean }> = [];

    if (isStrongsSearch) {
      // --- Strong's Search ---
      const strongsData = await loadInterlinearData();
      const targetNumber = rawQuery.toLowerCase(); // e.g. "h1234"
      const otSet = new Set(OT_BOOKS);

      // Iterate over all books in interlinear data
      for (const [key, bookData] of Object.entries(strongsData)) {
        const bookName = mapInterlinearKeyToStandard(key);
        const isOT = otSet.has(bookName);

        // Scope check
        if (scope === "ot" && !isOT) continue;
        if (scope === "nt" && isOT) continue;

        // Iterate verses
        // @ts-ignore
        for (const verseData of bookData) {
          // verseData: { id: "01001001", verse: [{ word: "...", number: "h7225" }, ...] }
          const hasMatch = (verseData.verse as any[]).some(w => w.number === targetNumber);
          
          if (hasMatch) {
             const ch = parseInt(verseData.id.slice(2, 5), 10);
             const vNum = parseInt(verseData.id.slice(5), 10);
             
             // Construct English text representation (concatenating words)
             // This is a rough reconstruction for display
             const text = (verseData.verse as any[]).map(w => w.text).join(" ");

             allMatches.push({
               b: bookName,
               c: ch,
               v: vNum,
               t: text,
               isOT
             });
          }
        }
      }

    } else {
      // --- English Text Search ---
      const index = await loadBSBIndex();
      const lowerQuery = rawQuery.toLowerCase();
      
      // Basic exact phrase matching (if quotes used) or simple includes
      // For now, implementing simple case-insensitive includes for MVP
      // US-002: Advanced logic can be added here (AND/OR regex)
      
      allMatches = index!.filter(item => {
        if (scope === "ot" && !item.isOT) return false;
        if (scope === "nt" && item.isOT) return false;
        return item.t.toLowerCase().includes(lowerQuery);
      });
    }

    // --- Aggregation & Pagination ---
    
    // Calculate Distribution
    const distribution: Record<string, number> = {};
    // Initialize all books with 0 to ensure chart order
    BOOKS.forEach(b => distribution[b] = 0);
    
    allMatches.forEach(m => {
      if (distribution[m.b] !== undefined) {
        distribution[m.b]++;
      } else {
          // Fallback for naming mismatches
          distribution[m.b] = 1; 
      }
    });

    // Pagination
    const limitedResults = allMatches.slice(0, 100);

    return NextResponse.json({
      count: allMatches.length,
      results: limitedResults,
      distribution
    });

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}