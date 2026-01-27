// WordData represents a single token in the RSVP reader
export type WordData = {
  text: string;
  cleanText: string;
  verse: string;
  id: string;
  orpIndex: number;
  durationFactor: number;
};

// LibraryData is the structure of the Bible JSON
export type LibraryData = Record<string, Record<string, string | Record<string, string>>>;

// Props for the main Player component
export interface PlayerProps {
  book: string;
}
