import { PARSER } from "../constants";
import axios from "axios";
import { Cache } from "aws-amplify";
// import cleanHtml from "../components/Response/ReaderInteractionButtons/ReaderView/cleanHtml";

export const getReader = async (result) => {
    if (
        result &&
        result.link &&
        !result.link.includes("wolframalpha.com") &&
        !result.link.startsWith("/") &&
        ((result.type &&
            (result.type === "article" ||
                result.type === "wiki" ||
                result.type === "website" ||
                result.type === "navigation" ||
                result.type === "none")) ||
            !result.type)
    ) {
        try {
            const readerResponse = await Cache.getItem(
                `reader-${result.link}`,
                {
                    callback: async () => {
                        let timeout =
                            result.link.includes("wikipedia") ||
                            result.link.includes("washingtonpost.com") ||
                            result.link.includes(".pdf")
                                ? 20000 // was 25000 to 32000
                                : 10000; // was 8 to 25000
                        const readerResponse = await axios.get(
                            PARSER + result.link,
                            {
                                timeout: timeout,
                            }
                        );

                        if (readerResponse.data) {
                            return readerResponse;
                        } else {
                            return null;
                        }
                    },
                }
            );
            if (readerResponse.data) {
                if (readerResponse.data.error) {
                    return { error: readerResponse.data.message ? readerResponse.data.message : "Server error" };
                }
                Cache.setItem(`reader-${result.link}`, readerResponse);
                return readerResponse.data;
            } else {
                Cache.removeItem(`reader-${result.link}`);
                return null;
            }
        } catch (error) {
            return { error: error };
        }
    } else {
        return { error: "Not loaded - invalid link" };
    }
};
