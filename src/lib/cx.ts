/**
 * cx — join class names, dropping any falsy parts.
 *
 * CSS-module class access is typed `string | undefined` under
 * `noUncheckedIndexedAccess`, and conditional classes are naturally
 * `string | false | undefined`. This helper accepts all of those and returns a
 * single space-separated string, so components never interpolate a possibly-
 * `undefined` value into a template literal.
 */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
