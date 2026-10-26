// HTML helpers for the build tests. No dependency; written for our own built HTML.
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
export function textOf(html) {
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => ENTITIES[e] ?? (e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : m))
    .replace(/\s+/g, " ").trim();
}
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
/** Outer HTML of every element whose opening tag passes test(tag, name). */
export function elements(html, test) {
  const out = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
  const open = [];
  let m;
  while ((m = re.exec(html))) {
    const [tag, closing, rawName, , selfClose] = m;
    const name = rawName.toLowerCase();
    if (closing) {
      for (let i = open.length - 1; i >= 0; i--) if (open[i].name === name) { const [start] = open.splice(i, 1); if (start.keep) out.push(html.slice(start.at, re.lastIndex)); open.length = i; break; }
    } else if (VOID.has(name) || selfClose) {
      if (test(tag, name)) out.push(tag);
    } else {
      open.push({ name, at: m.index, keep: test(tag, name) });
    }
  }
  return out;
}
