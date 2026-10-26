// Rendering helpers with no imports, so the Node 24 tests can load them (spec 7.2). They split text; they never change it.

export type Run = { text: string; num: boolean };

/** Splits a sentence into runs, marking each numeral (30,000; 450+; 3) so it can be set at weight 600. */
export function numeralRuns(text: string): Run[] {
  const runs: Run[] = [];
  let last = 0;
  for (const match of text.matchAll(/\d[\d,]*\+?/g)) {
    const at = match.index ?? 0;
    if (at > last) runs.push({ text: text.slice(last, at), num: false });
    runs.push({ text: match[0], num: true });
    last = at + match[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), num: false });
  return runs;
}

/** The Research detail as two paragraphs: sentences 1 and 2, then the rest. */
export function researchParagraphs(detail: string): [string, string] {
  const sentences = detail.split(/(?<=\.) (?=[A-Z])/);
  return [sentences.slice(0, 2).join(" "), sentences.slice(2).join(" ")];
}
