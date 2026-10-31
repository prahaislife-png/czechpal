/**
 * Parses the beginning of a JSON document that is still being written, e.g. `{"a":"Hel`.
 *
 * Everything complete so far is returned as normal values. Only the very last token can be
 * unfinished: an unfinished string is returned as written so far and its location reported in
 * `openPath`; an unfinished number or literal is left out (a half-written amount is wrong, not early).
 */
export function parsePartialJson(text: string): { value: unknown; openPath: (string | number)[] | null } {
  let i = 0;
  let openPath: (string | number)[] | null = null;
  const END = Symbol('end');

  const ws = () => {
    while (i < text.length && ' \t\n\r'.includes(text[i])) i++;
  };

  function str(path: (string | number)[]): string | typeof END {
    i++; // opening quote
    let out = '';
    while (i < text.length) {
      const ch = text[i];
      if (ch === '"') {
        i++;
        return out;
      }
      if (ch === '\\') {
        if (i + 1 >= text.length) break;
        const esc = text[i + 1];
        if (esc === 'u') {
          if (i + 6 > text.length) break;
          out += String.fromCharCode(parseInt(text.slice(i + 2, i + 6), 16));
          i += 6;
        } else {
          out += ({ n: '\n', t: '\t', r: '\r', b: '\b', f: '\f' } as Record<string, string>)[esc] ?? esc;
          i += 2;
        }
        continue;
      }
      out += ch;
      i++;
    }
    openPath = path;
    i = text.length;
    return out;
  }

  function value(path: (string | number)[]): unknown | typeof END {
    ws();
    if (i >= text.length) return END;
    const ch = text[i];
    if (ch === '{') return object(path);
    if (ch === '[') return array(path);
    if (ch === '"') return str(path);
    const m = /^(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(text.slice(i));
    // A token that touches the end of the text may still be growing.
    if (!m || i + m[0].length >= text.length) {
      i = text.length;
      return END;
    }
    i += m[0].length;
    return JSON.parse(m[0]);
  }

  function object(path: (string | number)[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    i++;
    while (true) {
      ws();
      if (i >= text.length) return out;
      if (text[i] === '}') {
        i++;
        return out;
      }
      if (text[i] === ',') {
        i++;
        continue;
      }
      if (text[i] !== '"') {
        i = text.length;
        return out;
      }
      const key = str([]);
      if (openPath !== null) {
        // The key itself is unfinished: nothing to show for it yet.
        openPath = null;
        return out;
      }
      ws();
      if (text[i] !== ':') {
        i = text.length;
        return out;
      }
      i++;
      const v = value([...path, key as string]);
      if (v === END) return out;
      out[key as string] = v;
    }
  }

  function array(path: (string | number)[]): unknown[] {
    const out: unknown[] = [];
    i++;
    while (true) {
      ws();
      if (i >= text.length) return out;
      if (text[i] === ']') {
        i++;
        return out;
      }
      if (text[i] === ',') {
        i++;
        continue;
      }
      const v = value([...path, out.length]);
      if (v === END) return out;
      out.push(v);
    }
  }

  const v = value([]);
  return { value: v === END ? undefined : v, openPath };
}
