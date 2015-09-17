export default {
    /**
     * Find all the matches for a regex in the specified string.
     * @param {RegExp} regex
     * @param {String} text
     * @returns {String[]}
     */
    getAllMatches(regex, text) {
        if (!regex.global) {
            throw new Error("Regex must have global flag set");
        }
        var match;
        var out = [];
        while ((match = regex.exec(text)) !== null) {
            out.push(match[1]);
        }
        return out;
    }
};
