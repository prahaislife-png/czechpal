/**
 * The few Node APIs the unit tests use, typed here so the app doesn't need @types/node (whose
 * globals would clash with React Native's). Tests run with `npm test` (node --test with tsx).
 */
declare module 'node:test' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert/strict' {
  interface Assert {
    (value: unknown, message?: string): asserts value;
    ok(value: unknown, message?: string): asserts value;
    equal<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    deepEqual<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
  }
  const assert: Assert;
  export default assert;
}

declare module 'node:fs' {
  export function readFileSync(path: URL | string, encoding: 'utf8'): string;
  export function existsSync(path: URL | string): boolean;
}
