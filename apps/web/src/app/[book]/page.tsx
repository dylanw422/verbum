import Player from "@/components/player";

export default async function Book({ params }: { params: Promise<{ book: string }> }) {
  const { book } = await params;

  // 1. Format the URL slug into the Book Title (e.g. "1-john" -> "1 John")
  const smallWords = ["of", "the", "and", "in", "on", "for", "a", "an"];
  const formattedBook = book
    .toLowerCase()
    .replace(/-/g, " ")
    .split(" ")
    .map((word, index) => {
      if (index === 0 || !smallWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");

  // 2. Fetch the library server-side to generate the chapter list
  // Next.js automatically caches this fetch request.
  let chapters: number[] = [];

  try {
    const response = await fetch(
      "https://grnkacu5pyiersbw.public.blob.vercel-storage.com/WEB.json",
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (response.ok) {
      const library = await response.json();
      const bookData = library[formattedBook];

      if (bookData) {
        chapters = Object.keys(bookData)
          .map((ch) => parseInt(ch, 10))
          .sort((a, b) => a - b);
      }
    }
  } catch (error) {
    console.error("Failed to load chapters:", error);
  }

  return (
    <div>
      {/* 3. Pass the formatted string directly (Player now accepts string) */}
      <Player book={formattedBook} chapters={chapters} />
    </div>
  );
}
