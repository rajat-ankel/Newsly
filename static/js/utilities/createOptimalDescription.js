import textDiscriminator from "./textDiscriminator";
import removeTruncatedLastSentence from "./removeTruncatedLastSentence";
import { extractContent } from "../components/Response/utilitiesResponse";

const createOptimalDescription = (result, comparisonDescription = "") => {
    // Set the default description to the result description
    let description = "";
    let resultDescription =
        result.answer &&
        !(
            result.answer.trim().endsWith("...") ||
            result.answer.trim().endsWith("…") ||
            result.answer.trim().endsWith("&hellip;") ||
            result.answer.trim().endsWith(" \\")
        ) &&
        (result.answer.trim().endsWith(".") ||
            result.answer.trim().endsWith("?") ||
            result.answer.trim().endsWith("!") ||
            result.answer.trim().endsWith(":") ||
            result.answer.trim().endsWith(";"))
            ? extractContent(result.answer, true).trim()
            : result.description &&
              result.description !==
                  "We would like to show you a description here but the site won’t allow us."
            ? result.description
            : result.desc &&
              result.desc !==
                  "We would like to show you a description here but the site won’t allow us."
            ? result.desc
            : result.answer &&
              result.answer !== "Video gallery" &&
              result.answer !== "Image gallery" &&
              result.answer.trim() !== result.title.trim()
            ? extractContent(result.answer, true).trim()
            : result.title
            ? result.title
            : null;

    if (
        (result.link.includes("wolframalpha.com") ||
            result.link.includes("wikipedia")) &&
        result.results_type && (result.results_type === "Entity" ||
            result.results_type === "Instant Answer")
    ) {
        description = result.description
            ? result.description
            : result.answer
            ? result.answer
            : result.desc;
    } else if (comparisonDescription) {
        const newDescription = textDiscriminator(
            resultDescription,
            comparisonDescription,
            result
        );
        description = removeTruncatedLastSentence(newDescription);
    } else {
        description = removeTruncatedLastSentence(resultDescription);
    }

    return description;
};

export default createOptimalDescription;
