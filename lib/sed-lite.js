"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sed = void 0;
function sed(str) {
    let replacer;
    if ("string" !== typeof str)
        str = String(str);
    str = str.replace(/^(\s+|;|#[^\r\n]*([\r\n]+|$))*/g, "");
    if (!str)
        return;
    const delim = str[1] || "/";
    const delimRE = delim.replace(/([^\w\/#:])/, "\\$1");
    const fieldRE = "((?:\\\\.|[^\\\\\\\\" + delimRE + "])*)";
    const matchRE = "^s" + delimRE + fieldRE + delimRE + fieldRE + delimRE + "([^;#\\s]*)";
    str = str.replace(new RegExp(matchRE), (substring, $1, $2, $3) => {
        const regexp = new RegExp($1, $3);
        const replace = unescape($2);
        replacer = str => str.replace(regexp, replace);
        return "";
    });
    if (!replacer) {
        throw new SyntaxError("Invalid: " + str);
    }
    str = str.replace(/^(\s+|#[^\r\n]*([\r\n]+|$))*/g, "");
    if (str) {
        if (str[0] !== ";") {
            throw new SyntaxError("Add ';' before: " + str);
        }
        const next = sed(str);
        if (next)
            replacer = JOIN(replacer, next);
    }
    return replacer;
}
exports.sed = sed;
function JOIN(A, B) {
    return str => B(A(str));
}
const esc = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v" };
function unescape(str) {
    return str.replace(/\\(x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|.)/g, (match, $1) => {
        if (match.length > 2)
            return String.fromCharCode(parseInt(match.substr(2), 16));
        return esc[$1] || $1;
    });
}
