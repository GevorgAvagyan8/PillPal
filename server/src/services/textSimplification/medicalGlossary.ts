// Longer/more specific phrases first — replacement is applied in array order,
// so "acute renal failure" must be matched before the bare "renal failure".
export const GLOSSARY: [RegExp, string][] = [
  [/\bacute renal failure\b/gi, "sudden kidney failure"],
  [/\brenal impairment\b/gi, "kidney problems"],
  [/\brenal failure\b/gi, "kidney failure"],
  [/\brenal function\b/gi, "kidney function"],
  [/\brenal insufficiency\b/gi, "reduced kidney function"],
  [/\brenal artery stenosis\b/gi, "narrowing of the kidney arteries"],
  [/\brenal dialysis\b/gi, "kidney dialysis"],
  [/\bimpaired renal function\b/gi, "reduced kidney function"],

  [/\bhyperkalemia\b/gi, "high potassium in the blood"],
  [/\bhypokalemia\b/gi, "low potassium in the blood"],
  [/\bhyponatremia\b/gi, "low sodium in the blood"],
  [/\bsymptomatic hypotension\b/gi, "noticeable low blood pressure (dizziness, fainting)"],
  [/\bhypotension\b/gi, "low blood pressure"],
  [/\bhypertension\b/gi, "high blood pressure"],
  [/\bantihypertensive\b/gi, "blood-pressure-lowering"],
  [/\boliguria\b/gi, "reduced urine output"],
  [/\bazotemia\b/gi, "waste buildup in the blood from reduced kidney function"],

  [/\bangioedema\b/gi, "sudden swelling (of the face, lips, tongue, or throat)"],
  [/\banaphylactoid reactions?\b/gi, "severe allergic reactions"],
  [/\banaphylaxis\b/gi, "severe allergic reaction"],
  [/\bhypersensitivity\b/gi, "allergic reaction"],

  [/\bhepatic failure\b/gi, "liver failure"],
  [/\bhepatic necrosis\b/gi, "liver tissue death"],
  [/\bhepatotoxicity\b/gi, "liver damage"],
  [/\bcholestatic jaundice\b/gi, "yellowing of the skin/eyes from bile flow problems"],
  [/\bjaundice\b/gi, "yellowing of the skin or eyes"],
  [/\bhepatic enzymes?\b/gi, "liver enzyme levels"],

  [/\bfetal toxicity\b/gi, "harm to an unborn baby"],
  [/\boligohydramnios\b/gi, "low amniotic fluid"],
  [/\bfetal lung hypoplasia\b/gi, "underdeveloped lungs in the unborn baby"],
  [/\bneonatal\b/gi, "newborn"],
  [/\banuria\b/gi, "inability to produce urine"],

  [/\bconcomitant administration\b/gi, "taking them together"],
  [/\bconcomitantly\b/gi, "at the same time"],
  // Adjective use ("concomitant mTOR inhibitor therapy") needs a plain
  // adjective, not the verb-phrase used for "concomitant administration".
  [/\bconcomitant\b/gi, "additional"],
  [/\bcoadministration\b/gi, "taking them together"],
  [/\bco-administration\b/gi, "taking them together"],
  [/\bco-administer\b/gi, "give"],
  // "is/are/was contraindicated" reads correctly with a plain adjective
  // replacement; "should not be used" would double up on the existing verb.
  [/\bcontraindicated\b/gi, "not recommended"],
  [/\bdiscontinue(d)?\b/gi, "stop taking"],
  [/\befficacy\b/gi, "effectiveness"],
  [/\battenuated\b/gi, "reduced"],
  [/\bmonitored periodically\b/gi, "checked regularly"],
  [/\bmonitored\b/gi, "checked"],
  [/\bmonitoring\b/gi, "checking"],
  [/\bmonitor\b/gi, "check"],
  [/\bperiodically\b/gi, "regularly"],
  [/\belevated\b/gi, "higher than normal"],
  [/\bdecreased\b/gi, "lower than normal"],
  [/\bexacerbate(d|s)?\b/gi, "make worse"],
  [/\badministered\b/gi, "given"],
  [/\badministering\b/gi, "giving"],
  [/\badminister\b/gi, "give"],
  [/\bcompromised\b/gi, "weakened"],
  [/\bhemodynamically unstable\b/gi, "with unstable blood pressure/circulation"],
  [/\bvolume depletion\b/gi, "dehydration"],
  [/\bvolume-depleted\b/gi, "dehydrated"],
  [/\bsevere volume and\/or salt depletion\b/gi, "severe dehydration or salt loss"],
];

// Cross-references like "[see Warnings and Precautions (5.1)]",
// "(5.2)", "( 7.7 , 7.8 )", "[see Drug Interactions (7.7, 7.8) ]".
// Deliberately does NOT swallow a trailing "." — that period usually
// belongs to the enclosing sentence, not the citation, and eating it
// silently merges two sentences into one with no boundary left at all.
export const CROSS_REFERENCE_PATTERNS = [
  /\[?\s*see\s+[^.[\]]*?\(\s*\d+(\.\d+)?(\s*,\s*\d+(\.\d+)?)*\s*\)\s*\]?/gi,
  /\(\s*\d+(\.\d+)?(\s*,\s*\d+(\.\d+)?)*\s*\)/g,
];

// Reliable because the header text itself is fully upper-case, unlike the
// Title-Case decimal subsection headers ("5.1 Fetal Toxicity ...") which
// can't be distinguished from a sentence-initial capitalized word by case
// alone — those are handled separately with a drug-name anchor.
export const TOP_LEVEL_ALL_CAPS_HEADER = /^\d+\s+[A-Z][A-Z\s()/,-]{2,60}?(?=\s+[A-Z][a-z]|\s*$)/;
export const INLINE_ALL_CAPS_HEADER = /\bWARNING:\s+[A-Z][A-Z\s()/,-]{2,40}?(?=\s+[A-Z][a-z])/g;
export const BOILERPLATE_LINES = [
  /See full prescribing information for complete boxed warning\.?/gi,
  /\bBOXED WARNING\b/gi,
  // Standard FDA SPL interaction-table cell labels — recur across many drug
  // labels' "Table N: Clinically Significant Drug Interactions" sections,
  // not specific to any one drug, but meaningless once flattened to text.
  /\b(Clinical Impact|Intervention|Examples?):\s*/gi,
  /\bTable \d+:\s*/gi,
];

// Decimal subsection headers ("5.1 Fetal Toxicity", "7.3 Non-Steroidal
// Anti-Inflammatory Agents ..."). Word-capped since these are always short
// (1-4 words) noun phrases in FDA labels.
export const DECIMAL_HEADER_PREFIX = /^\d+\.\d+\s+/;
export const LEADING_TITLE_CASE_RUN = /^((?:[A-Z][\w()/,-]*|and|of|including|selective)\s+){1,6}(?=[A-Z][a-z])/;
