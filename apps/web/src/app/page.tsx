"use client";
import BookSelect from "@/components/book-select";

// JSON BIBLES
// https://github.com/arron-taylor/bible-versions/blob/main/versions/en/WORLD%20ENGLISH%20BIBLE.json

export default function Home() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-2">
      <BookSelect />
    </div>
  );
}
