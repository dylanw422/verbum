import { NextRequest, NextResponse } from "next/server";
import { INTERLINEAR_JSON_URL } from "@/lib/constants";

// Simple in-memory cache
let cachedData: any = null;
let fetchPromise: Promise<any> | null = null;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");

  if (!book || !chapter) {
    return NextResponse.json({ error: "Missing book or chapter" }, { status: 400 });
  }

  try {
    if (!cachedData) {
      if (!fetchPromise) {
        console.log("Fetching interlinear data from blob...");
        fetchPromise = fetch(INTERLINEAR_JSON_URL).then(async (res) => {
           if (!res.ok) throw new Error("Failed to fetch interlinear data from blob");
           return res.json();
        });
      }
      
      try {
        cachedData = await fetchPromise;
      } catch (e) {
        console.error("Error fetching interlinear blob:", e);
        fetchPromise = null; // Reset promise on error
        return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
      }
    }

    const bookKey = book.toLowerCase();
    const bookData = cachedData[bookKey];

    if (!bookData) {
       // Return empty if book not found
       return NextResponse.json([]);
    }

    const targetChapter = parseInt(chapter, 10);
    
    // Filter by chapter
    // ID format: BBCCCVVV (e.g. 01001001)
    const chapterVerses = bookData.filter((v: any) => {
        if (!v.id) return false;
        // Parse the chapter part (digits 2-4, e.g. "001")
        const ch = parseInt(v.id.slice(2, 5), 10);
        return ch === targetChapter;
    });

    return NextResponse.json(chapterVerses);

  } catch (error) {
    console.error("Error serving interlinear data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}