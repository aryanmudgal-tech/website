// Splits our own stylesheet into rules, each with the at-rule preludes around it. Not a general CSS parser:
// it needs balanced braces and no braces inside strings, which global.css satisfies.
export function rules(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  const stack = [];
  let buffer = "";
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === "{") {
      const prelude = buffer.trim();
      buffer = "";
      if (prelude.startsWith("@") && !/^@(?:font-face|page)\b/.test(prelude)) {
        stack.push(prelude);
        continue;
      }
      let depth = 1;
      let j = i + 1;
      for (; j < source.length && depth; j++) {
        if (source[j] === "{") depth++;
        else if (source[j] === "}") depth--;
      }
      out.push({ selector: prelude, body: source.slice(i + 1, j - 1), context: [...stack] });
      i = j - 1;
    } else if (char === "}") {
      stack.pop();
      buffer = "";
    } else if (char === ";") {
      buffer = "";
    } else {
      buffer += char;
    }
  }
  return out;
}

export function declarations(rule) {
  return rule.body.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const colon = part.indexOf(":");
    return [part.slice(0, colon).trim(), part.slice(colon + 1).trim()];
  });
}
