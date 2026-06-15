/**
 * sed-lite — compile a `sed`-style substitution definition into a
 * JavaScript replacer function.
 *
 * The returned function takes a string and returns a new string with the
 * substitution applied (i.e. `str => str.replace(regexp, replacement)`).
 *
 * @param def Substitution definition in the form `"s/match/replace/flags"`.
 *            Multiple substitutions can be chained with `;` and lines
 *            beginning with `#` are treated as comments.
 * @returns A function that applies the parsed substitution(s) to its input.
 * @throws SyntaxError if `def` is not a valid `sed` expression.
 *
 * @example
 *   const fn = sed("s/foo/FOO/g");
 *   fn("foo bar foo"); // "FOO bar FOO"
 */

export {} // external module indicator

export declare const sed: (def: string) => (((str: string) => string) | undefined)
