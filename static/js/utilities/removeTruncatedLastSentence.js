export default function removeTruncatedLastSentence(str) {
    // Remove truncated last sentence

    if (str.endsWith("....") || str.endsWith(". ...")) {
        str = str.replace("....", "."); // Remove ellipsis
        return str;
    } else if (str.endsWith(".&hellip;") || str.endsWith(". &hellip;")) {
        str = str.replace(".&hellip;", "."); // Remove ellipsis
        return str;
    } else if (str.endsWith(".…") || str.endsWith(". …")) {
        str = str.replace(".…", "."); // Remove ellipsis
        return str;
    }

    let sentences = str.split(". ");
    let lastSentence = sentences[sentences.length - 1];
    if (
        (lastSentence.trim().endsWith("...") ||
        lastSentence.trim().endsWith("…") ||
        lastSentence.trim().endsWith("&hellip;")) &&
        lastSentence.trim().length < 0.25 * str.length
    ) {
        sentences.pop();
    }
    let new_str = sentences.join(". ").trim();
    if (!(new_str.endsWith(".") || new_str.endsWith("?") || new_str.endsWith("!") || new_str.endsWith(":") || new_str.endsWith(";"))) {
        new_str += ".";
    }
    if (new_str && new_str.length > 64) {
        return new_str;
    } else {
        return str;
    }
}
