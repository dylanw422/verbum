import Player from "@/components/player";

export default async function Book({ params }: { params: Promise<{ book: string }> }) {
  const { book } = await params;

  // Format book name (e.g. "1-john" -> "1 John")
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

  // Pass only the book name.
  // The Player component (Client Side) will fetch the data instantly and show the loading screen.
  return (
    <div>
      <Player book={formattedBook} />
    </div>
  );
}
