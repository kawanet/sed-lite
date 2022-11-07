/**
 * sed-lite
 *
 * @param {string} def "s/match/replace/flag"
 * @returns {Function} (str => str.replace(/match/flag, "replace")
 * @throws {SyntaxError}
 */

export declare const sed: (def: string) => (str: string) => string;
