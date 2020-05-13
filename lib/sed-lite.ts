// sed-lite.ts

type Replacer = (str: string) => string;

/**
 * @param {string} str "s/match/replace/flag"
 * @returns {Function} (str => str.replace(/match/flag, "replace")
 * @throws {SyntaxError}
 */

export function sed(str: string): (str: string) => string {
    let replacer: Replacer;

    if ("string" !== typeof str) str = String(str);

    // leading spaces and comments
    str = str.replace(/^(\s+|;|#[^\r\n]*([\r\n]+|$))*/g, "");

    // empty
    if (!str) return;

    const delim = str[1] || "/";
    const delimRE = delim.replace(/([^\w\/#:])/, "\\$1");
    const fieldRE = "((?:\\\\.|[^\\\\\\\\" + delimRE + "])+)"; // means /\\./ or /[^\\]/
    const matchRE = "^s" + delimRE + fieldRE + delimRE + fieldRE + delimRE + "([^;#\\s]*)";

    str = str.replace(new RegExp(matchRE), (substring: string, $1: string, $2: string, $3: string) => {
        const regexp = new RegExp($1, $3);
        const replace = $2;
        replacer = str => str.replace(regexp, replace);
        return "";
    });

    // invalid line
    if (!replacer) {
        throw new SyntaxError("Invalid: " + str);
    }

    // trailing spaces and comments
    str = str.replace(/^(\s+|#[^\r\n]*([\r\n]+|$))*/g, "");

    // combine next line
    if (str) {
        if (str[0] !== ";") {
            throw new SyntaxError("Add ';' before: " + str);
        }

        const next = sed(str);
        if (next) replacer = JOIN(replacer, next);
    }

    // done
    return replacer;
}

/**
 * @private
 */

function JOIN(A: Replacer, B: Replacer): Replacer {
    return str => B(A(str));
}