/**
 * @param {string} str "s/match/replace/flag"
 * @returns {Function} (str => str.replace(/match/flag, "replace")
 * @throws {SyntaxError}
 */
export declare function sed(str: string): (str: string) => string;
