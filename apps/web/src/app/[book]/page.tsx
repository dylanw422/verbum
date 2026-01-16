import Player from "@/components/player";
import { Dev } from "@/components/ui/dev";
import { WEB } from "@/public/WEB";

export default async function Book({ params }: { params: Promise<{ book: string }> }) {
  const { book } = await params;
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

  const bookJson = WEB[formattedBook as keyof typeof WEB];
  const chapters = Object.keys(bookJson)
    .map((ch) => parseInt(ch)) // convert keys from string to number
    .sort((a, b) => a - b);

  return (
    <div>
      <Player book={formattedBook as keyof typeof WEB} chapters={chapters} />
    </div>
  );
}
