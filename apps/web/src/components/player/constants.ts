// --- Speed Configuration ---
export const MIN_WPM = 100;
export const MAX_WPM = 1000;
export const REWIND_ON_PAUSE = 5; // Words to rewind when pausing
export const WARMUP_DURATION = 800; // ms to ramp up speed

// --- Study Mode Dictionaries (Exact Match) ---

export const DIVINE_TERMS = new Set([
  "god",
  "gods",
  "jesus",
  "lord",
  "christ",
  "spirit",
  "yahweh",
  "father",
  "holy",
  "almighty",
  "creator",
  "savior",
  "messiah",
  "jehovah",
]);

export const NEGATIVE_TERMS = new Set([
  "satan",
  "devil",
  "sin",
  "sins",
  "sinful",
  "evil",
  "death",
  "dead",
  "hell",
  "demon",
  "demons",
  "wicked",
  "wickedness",
  "iniquity",
]);

export const CONNECTORS = new Set([
  "therefore",
  "however",
  "but",
  "because",
  "although",
  "nevertheless",
  "furthermore",
  "consequently",
  "thus",
  "hence",
]);

// --- Library Data URL ---
export const LIBRARY_URL = "https://grnkacu5pyiersbw.public.blob.vercel-storage.com/BSB.json";
