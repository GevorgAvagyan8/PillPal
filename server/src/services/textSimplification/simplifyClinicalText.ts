import {
  BOILERPLATE_LINES,
  CROSS_REFERENCE_PATTERNS,
  GLOSSARY,
  INLINE_ALL_CAPS_HEADER,
  LEADING_TITLE_CASE_RUN,
  TOP_LEVEL_ALL_CAPS_HEADER,
} from "./medicalGlossary";

// Real FDA subsection headers ("5.1 Fetal Toxicity") are always followed by
// a capitalized header word. Without that lookahead this also false-matches
// clinical measurements like "eGFR ... 1.73 m2" (the "1.73" looks identical
// to a section number), which silently corrupted real label text — confirmed
// live against Metformin's label, which uses eGFR figures throughout.
const DECIMAL_SUBSECTION_START = /\d+\.\d+\s+(?=[A-Z])/g;
// Non-global sibling for a stateless "does this start with one?" check —
// .test() on a /g regex mutates lastIndex and corrupts later calls.
const STARTS_WITH_DECIMAL_HEADER = /^\d+\.\d+\s+(?=[A-Z])/;
const SENTENCE_SPLIT = /(?<=[a-z0-9)])\.\s+(?=[A-Z])/;
const MIN_SENTENCE_LENGTH = 25;

function stripBoilerplate(text: string): string {
  // FDA source text sometimes carries soft-hyphen characters (U+00AD) left
  // over from PDF-to-text conversion — invisible in some renderers, a stray
  // hyphen in others. Confirmed live in Metformin's label ("metformin­
  // associated").
  let cleaned = text.replace(/­/g, "");
  for (const pattern of CROSS_REFERENCE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  for (const pattern of BOILERPLATE_LINES) {
    cleaned = cleaned.replace(pattern, "");
  }
  cleaned = cleaned.replace(INLINE_ALL_CAPS_HEADER, "");
  cleaned = cleaned.replace(TOP_LEVEL_ALL_CAPS_HEADER, "");
  // Removing cross-references/headers above can strand a lone "." where the
  // removed text used to be (e.g. "...possible [see (5.1)] . Drugs..." ->
  // "...possible  . Drugs...") — collapse those before sentence-splitting,
  // or the stray period breaks the sentence boundary regex.
  cleaned = cleaned.replace(/\s+\./g, ".").replace(/\.{2,}/g, ".");
  return cleaned.replace(/\s+/g, " ").trim();
}

// FDA label sections open with a dense, colon-separated "highlights" list
// (no real sentence punctuation) before the full decimal-numbered
// subsections (e.g. "5.1 Fetal Toxicity ..."). We drop the highlights
// preamble and pull one plain-English sentence per subsection instead.
function splitIntoSubsections(text: string): string[] {
  const headerStarts = [...text.matchAll(DECIMAL_SUBSECTION_START)];
  if (headerStarts.length === 0) {
    return [text];
  }

  const subsections: string[] = [];
  for (let i = 0; i < headerStarts.length; i++) {
    const start = headerStarts[i].index ?? 0;
    const end = i + 1 < headerStarts.length ? headerStarts[i + 1].index ?? text.length : text.length;
    subsections.push(text.slice(start, end));
  }
  return subsections;
}

// Strips "5.1 Fetal Toxicity " so the subsection starts at its real
// sentence. Title-Case header words can't be distinguished from a
// capitalized sentence-starter by case alone, so when we know the drug's
// name (it opens a large share of these sentences) we cut right before its
// first appearance; otherwise we fall back to stripping a capped run of
// leading Title-Case/connector words.
function stripSubsectionHeader(subsection: string, drugName: string | null): string {
  const withoutNumber = subsection.replace(DECIMAL_SUBSECTION_START, "");

  if (drugName) {
    const idx = withoutNumber.toLowerCase().indexOf(drugName.toLowerCase());
    if (idx >= 0 && idx <= 80) {
      return withoutNumber.slice(idx);
    }
  }

  return withoutNumber.replace(LEADING_TITLE_CASE_RUN, "");
}

function applyGlossary(sentence: string): string {
  let result = sentence;
  for (const [pattern, replacement] of GLOSSARY) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function cleanSentence(raw: string): string | null {
  let sentence = raw.trim();
  if (sentence.length < MIN_SENTENCE_LENGTH) {
    return null;
  }
  sentence = applyGlossary(sentence);
  if (!/[.!?]$/.test(sentence)) {
    sentence += ".";
  }
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

export function simplifyClinicalText(rawText: string, maxBullets = 5, drugName: string | null = null): string[] {
  const cleaned = stripBoilerplate(rawText);
  const subsections = splitIntoSubsections(cleaned);

  const bullets: string[] = [];
  const seen = new Set<string>();
  // When there are few subsections (or just one un-numbered blob, like
  // Contraindications), allow proportionally more sentences from it instead
  // of always capping at one — otherwise a single-subsection field would
  // only ever surface its very first sentence.
  const perSubsectionCap = Math.max(1, Math.ceil(maxBullets / subsections.length));

  for (const rawSubsection of subsections) {
    // Only strip/anchor on a decimal header when the subsection actually
    // starts with one — otherwise (a single un-numbered blob, e.g.
    // Contraindications or the boxed warning) there's no header to remove,
    // and anchoring on the drug name's first appearance would wrongly
    // truncate real sentence content that happens to precede it.
    const subsection = STARTS_WITH_DECIMAL_HEADER.test(rawSubsection)
      ? stripSubsectionHeader(rawSubsection, drugName)
      : rawSubsection;
    const sentences = subsection.split(SENTENCE_SPLIT);

    let taken = 0;
    for (const rawSentence of sentences) {
      if (taken >= perSubsectionCap) break;
      const sentence = cleanSentence(rawSentence);
      if (!sentence) continue;

      const key = sentence.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      bullets.push(sentence);
      taken++;
    }
    if (bullets.length >= maxBullets) break;
  }

  return bullets.slice(0, maxBullets);
}
