import {
    isChallenge,
    isDividedText,
    extractTitle,
    isHTML,
    containsDate,
} from "../utils";
import { getScores } from "./getGrade";
import predictSentence from "./predictSentence";

export default function textDiscriminator(resultText, parserText, result) {
    // Cleans up the title or description of a card and chooses the better version of the text to display

    var punctuation = [
        "!",
        '"',
        "#",
        "$",
        "%",
        "&",
        "'",
        "(",
        ")",
        "*",
        "+",
        ",",
        "-",
        ".",
        "/",
        ":",
        ";",
        "<",
        "=",
        ">",
        "?",
        "@",
        "[",
        "]",
        "^",
        "_",
        "`",
        "{",
        "|",
        "}",
        "~",
        "¶",
    ];

    const sentencePunctuation = [".", "!", "?", ",", ":", ";"];

    const junkStartStrings = [
        "View Discussion Improve",
        "View Discussion",
        "W3Schools offers free online tutorials",
        "NOTE:",
        "[UPDATE",
        "Advertisement",
    ];

    // Captions and publishing flotsam
    const captionSources = [
        "Getty Images",
        "Getty Images/iStockphoto",
        "Getty",
        "iStockphoto",
        "iStock",
        "Download Article",
        "Part 1",
        "Part 2",
        "Advertisement",
        "More.",
        "[...]",
        "Continue Reading",
        "Continue reading",
        "Source: ",
        "/Shutterstock",
        "Shutterstock",
        "By ",
        "Published: ",
        "Read More...",
        "cookies ",
        "Cookie Policy",
        "Cookies ",
        "Image courtesy "
    ];

    // Start with hard rules - if either text is empty or single word, return the other

    if (!resultText) {
        return parserText;
    }
    if (!parserText) {
        return resultText;
    }

    // prefer text with spaces
    if (resultText.includes(" ") && !parserText.includes(" ")) {
        return resultText;
    }
    if (parserText.includes(" ") && !resultText.includes(" ")) {
        return parserText;
    }
    // If the parserText isChallenge phrase use the result text
    if (isChallenge(parserText) && !isChallenge(resultText)) {
        return resultText;
    }
    if (isChallenge(resultText) && !isChallenge(parserText)) {
        return parserText;
    }

    // prefer text without html
    if (resultText.startsWith("<") || parserText.startsWith("<")) {
        if (isHTML(resultText) && !isHTML(parserText)) {
            return parserText;
        }
        if (isHTML(parserText) && !isHTML(resultText)) {
            return resultText;
        }
    }

    // prefer text that doesn't start with junkStartStrings
    for (let junk of junkStartStrings) {
        if (resultText.startsWith(junk) && !parserText.startsWith(junk)) {
            return parserText;
        }
        if (parserText.startsWith(junk) && !resultText.startsWith(junk)) {
            return resultText;
        }
    }

    
    // Fix up missing spaces at the start of a sentence in the texts and orphaned slashes
    parserText = parserText.replace(/([.!?])([A-Z])/g, "$1 $2");
    resultText = resultText.replace(/([.!?])([A-Z])/g, "$1 $2");

    if (parserText.endsWith(" \\.")) {
        parserText = parserText.replace(" \\.", ".");
    } else if (parserText.endsWith(" \\")) {
        // truncate the parserText to before the slash and trim
        parserText = parserText
            .substring(0, parserText.lastIndexOf(" \\"))
            .trim();
    }

    if (resultText.endsWith(" \\.")) {
        resultText = parserText.replace(" \\.", ".");
    } else if (resultText.endsWith(" \\")) {
        // truncate the resultText to before the slash and trim
        resultText = resultText
            .substring(0, resultText.lastIndexOf(" \\"))
            .trim();
    }

    // Score both texts
    let resultScore = 0;
    let parserScore = 0;

    // If the parserText is a subset of the resultText, score the resultText higher
    if (resultText.includes(parserText)) {
        resultScore += 10;
    }

    // If the result text is a subset of the parser text, score the parser text higher
    if (parserText.includes(resultText)) {
        parserScore += 10;
    }

    // prefer text that doesn't include captionSources
    for (let caption of captionSources) {
        if (resultText.includes(caption) && !parserText.includes(caption)) {
            parserScore += 40;
        }
        if (parserText.includes(caption) && !resultText.includes(caption)) {
            resultScore += 40;
        }
    }

    const basicSentence = /(?:^|\n| )(?:[^.!?]|[.!?][^ *_~\n])+[.!?]/gi;
    // prefer text that matches the basic sentence regex
    if (basicSentence.test(resultText) && !basicSentence.test(parserText)) {
        resultScore += 15;
    }
    if (basicSentence.test(parserText) && !basicSentence.test(resultText)) {
        parserScore += 15;
    }

    // prefer text without ellipsis or marker
    if (
        (resultText.endsWith("...") ||
            resultText.endsWith("&hellip;") ||
            resultText.endsWith("¶") ||
            resultText.includes("[…] More") ||
            resultText.endsWith("…")) &&
        !(
            parserText.endsWith("...") ||
            parserText.endsWith("&hellip;") ||
            parserText.endsWith("¶") ||
            parserText.includes("[…] More") ||
            parserText.endsWith("…")
        )
    ) {
        parserScore += 50;
    }
    if (
        (parserText.endsWith("...") ||
            parserText.endsWith("&hellip;") ||
            parserText.endsWith("¶") ||
            parserText.includes("[…] More") ||
            parserText.endsWith("…")) &&
        !(
            resultText.endsWith("...") ||
            resultText.endsWith("&hellip;") ||
            resultText.endsWith("¶") ||
            resultText.includes("[…] More") ||
            resultText.endsWith("…")
        )
    ) {
        resultScore += 50;
    }

    // prefer text that doesn't have a majority of capitalized words
    if (resultText.split(" ").length > 1 && parserText.split(" ").length > 1) {
        let resultTextCapitals = 0;
        let parserTextCapitals = 0;
        let resultTextLength = resultText.split(" ").length;
        let parserTextLength = parserText.split(" ").length;
        for (let word of resultText.split(" ")) {
            if (word === word.toUpperCase()) {
                resultTextCapitals++;
            }
        }
        for (let word of parserText.split(" ")) {
            if (word === word.toUpperCase()) {
                parserTextCapitals++;
            }
        }
        if (
            resultTextCapitals / resultTextLength > 0.5 &&
            parserTextCapitals / parserTextLength < 0.5
        ) {
            parserScore += 50;
        }
        if (
            parserTextCapitals / parserTextLength > 0.5 &&
            resultTextCapitals / resultTextLength < 0.5
        ) {
            resultScore += 50;
        }
    }

    // prefer text that doesn't start with a lowercase letter
    if (
        resultText[0] === resultText[0].toLowerCase() &&
        parserText[0] === parserText[0].toUpperCase()
    ) {
        parserScore += 60;
    }
    if (
        parserText[0] === parserText[0].toLowerCase() &&
        resultText[0] === resultText[0].toUpperCase()
    ) {
        resultScore += 60;
    }

    // prefer text that has some but not too much sentence punctuation
    if (resultText.split(" ").length > 1 && parserText.split(" ").length > 1) {
        let resultTextPunctuation = 0;
        let parserTextPunctuation = 0;
        for (let word of resultText.split(" ")) {
            for (let char of word) {
                if (sentencePunctuation.includes(char)) {
                    resultTextPunctuation++;
                }
            }
        }
        for (let word of parserText.split(" ")) {
            for (let char of word) {
                if (sentencePunctuation.includes(char)) {
                    parserTextPunctuation++;
                }
            }
        }
        if (
            resultTextPunctuation < 5 &&
            resultTextPunctuation > parserTextPunctuation
        ) {
            resultScore += 10;
        }
        if (
            parserTextPunctuation < 5 &&
            parserTextPunctuation > resultTextPunctuation
        ) {
            parserScore += 10;
        }
    }

    // prefer text without pipes or dividers
    if (isDividedText(resultText) && !isDividedText(parserText)) {
        parserScore += 16;
    }
    if (isDividedText(parserText) && !isDividedText(resultText)) {
        resultScore += 16;
    }

    //prefer text that does not contain high repetition of the same words
    const resultTextWords = resultText.split(" ");
    const parserTextWords = parserText.split(" ");
    const resultTextWordCount = resultTextWords.length;
    const parserTextWordCount = parserTextWords.length;
    const resultTextWordCountUnique = new Set(resultTextWords).size;
    const parserTextWordCountUnique = new Set(parserTextWords).size;
    const resultTextWordCountUniqueRatio =
        resultTextWordCountUnique / resultTextWordCount;
    const parserTextWordCountUniqueRatio =
        parserTextWordCountUnique / parserTextWordCount;
    if (resultTextWordCountUniqueRatio > 0.5) {
        resultScore += 40;
    }
    if (parserTextWordCountUniqueRatio > 0.5) {
        parserScore += 40;
    }

    // prefer text without By or Published or other common publication information phrases
    if (
        (resultText.includes("By ") ||
            resultText.includes("Published ") ||
            resultText.includes("¶")) &&
        !(
            parserText.includes("By ") ||
            parserText.includes("Published ") ||
            parserText.includes("¶")
        )
    ) {
        parserScore += 20;
    }
    if (
        (parserText.includes("By ") ||
            parserText.includes("Published ") ||
            parserText.includes("¶")) &&
        !(
            resultText.includes("By ") ||
            resultText.includes("Published ") ||
            resultText.includes("¶")
        )
    ) {
        resultScore += 20;
    }

    // prefer text that doesn't also contain the result title
    if (
        resultText.includes(result.title) &&
        !parserText.includes(result.title)
    ) {
        parserScore += 30;
    }
    if (
        parserText.includes(result.title) &&
        !resultText.includes(result.title)
    ) {
        resultScore += 30;
    }

    // prefer text with less punctuation as a percentage of the text if the difference is significant
    const resultPunctuationCount = resultText
        .split("")
        .filter((char) => punctuation.includes(char)).length;
    const parserPunctuationCount = parserText
        .split("")
        .filter((char) => punctuation.includes(char)).length;
    const resultPunctuationPercentage =
        resultPunctuationCount / resultText.length;
    const parserPunctuationPercentage =
        parserPunctuationCount / parserText.length;
    if (resultPunctuationPercentage < parserPunctuationPercentage * 0.6) {
        resultScore += 10;
    }
    if (parserPunctuationPercentage < resultPunctuationPercentage * 0.6) {
        parserScore += 10;
    }

    // prefer text that has more words that are contained in the title from the path
    if (result && result.link && result.link.startsWith("http")) {
        const titleFromPath = extractTitle(result.link);
        const resultTextWords = resultText.toLowerCase().split(" ");
        const parserTextWords = parserText.toLowerCase().split(" ");
        const titleFromPathWords = titleFromPath.split(" ");
        const resultTextWordsInTitle = resultTextWords.filter((word) =>
            titleFromPathWords.includes(word)
        );
        const parserTextWordsInTitle = parserTextWords.filter((word) =>
            titleFromPathWords.includes(word)
        );
        if (resultTextWordsInTitle.length > parserTextWordsInTitle.length) {
            resultScore += 10;
        } else if (
            parserTextWordsInTitle.length > resultTextWordsInTitle.length
        ) {
            parserScore += 10;
        }
    }

    // Score each text based on how much of the other text it contains
    const resultMatchScore = parserText
        .split(" ")
        .filter((word) => resultText.includes(word)).length;
    resultScore += resultMatchScore;
    const parserMatchScore = resultText
        .split(" ")
        .filter((word) => parserText.includes(word)).length;
    parserScore += parserMatchScore;

    // prefer text with more characters
    if (resultText.length > parserText.length) {
        // resultScore += 10; // was 18 divider
        resultScore += (resultText.length - parserText.length) / 10;
    }
    if (parserText.length > resultText.length) {
        // parserScore += 10;
        parserScore += (parserText.length - resultText.length) / 10;
    }

    // Penalize short text under 51 characters
    if (resultText.length < 51) {
        resultScore -= 70 - resultText.length;
    }
    if (parserText.length < 51) {
        parserScore -= 70 - parserText.length;
    }

    // Prefer text with a reading grade between 6 and 12
    const resultTextScores = getScores(resultText);
    const parserTextScores = getScores(parserText);
    //console.log(messageScores);
    const resultReadingGrade =
        resultTextScores && resultTextScores["medianGrade"]
            ? resultTextScores["medianGrade"]
            : 0;
    const parserReadingGrade =
        parserTextScores && parserTextScores["medianGrade"]
            ? parserTextScores["medianGrade"]
            : 0;
    if (resultReadingGrade > 6 && resultReadingGrade < 12) {
        resultScore += 20;
    }
    if (parserReadingGrade > 6 && parserReadingGrade < 12) {
        parserScore += 20;
    }

    // strongly prefer text that is a sentence based on predictSentence
    if (predictSentence(resultText)) {
        resultScore += 20;
    }
    if (predictSentence(parserText)) {
        parserScore += 20;
    }

    // Prefer text that doesn't contain a date string based on the containsDate function
    if (!containsDate(resultText)) {
        resultScore += 50;
    }
    if (!containsDate(parserText)) {
        parserScore += 50;
    }

    // Prefer text that does not contain http://, https:// in the text content
    if (
        !resultText.includes("http://") &&
        !resultText.includes("https://") &&
        (parserText.includes("http://") ||
        parserText.includes("https://"))
    ) {
        resultScore += 50;
    }
    if (
        !parserText.includes("http://") &&
        !parserText.includes("https://") &&
        (resultText.includes("http://") ||
        resultText.includes("https://"))
    ) {
        parserScore += 50;
    }
    
    // resultScore += resultText.length/10;
    // parserScore += parserText.length/10;

    // check which has the highest score
    // console.log("\n\nurl", result.link);
    // console.log("resultText", resultText);
    // console.log("resultScore", resultScore);
    // console.log("parserText", parserText);
    // console.log("parserScore", parserScore);

    // If both result and parser have a negative score, check for result answer and if it is not the same as the result title, return the result answer
    if (resultScore < 0 && parserScore < 0) {
        if (result.answer && result.answer !== result.title) {
            return result.answer;
        }
    }

    if (resultScore > parserScore) {
        return resultText;
    }

    return parserText;
}
