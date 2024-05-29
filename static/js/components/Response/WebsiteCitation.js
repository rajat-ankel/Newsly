import React from "react";
import { FAVICON_PROXY } from "../../constants";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";
import CitationButton from "./CitationButton";

export default function WebsiteCitation(props) {
    const { result, responseType, citation, verbose, visit } = props;

    let targetLink = result.link;
    let targetTitle = result.title;
    let targetType = responseType ? responseType : "Citation Source";

    // console.log("citationResults", result);

    if (responseType === "official_website") {
        // Extract Official Website
        let officialWebsite = "";
        let officialWebsiteTitle = "";
        let topMatchWebsite = "";
        let topMatchWebsiteTitle = "";

        result.profiles &&
            result.profiles.every((profile) => {
                if (profile.type === "official_website") {
                    // console.log(profile);
                    officialWebsite = profile.link ? profile.link : null;
                    officialWebsiteTitle = profile.title
                        ? profile.title
                        : result.title + " - Official Website";
                    return false;
                } else {
                    return true;
                }
            });

        // Special handling for HN
        if (result.link === "https://en.wikipedia.org/wiki/Hacker_News") {
            officialWebsite = "https://news.ycombinator.com";
            officialWebsiteTitle = "Hacker News Official Website";
        } else if (result.link.startsWith("https://news.ycombinator.com")) {
            result.description =
                "Hacker News is a social news website focusing on computer science and entrepreneurship.";
        }

        // Check for corporate websites
        // Check the top 3 child items for a website matching the Entity Title - with Inc. removed for companies
        if (
            !officialWebsite &&
            (result.title.includes("Inc.") ||
                result.description.toLowerCase().includes("website") ||
                result.description.toLowerCase().includes("company") ||
                result.description.includes("Inc.")) &&
            (result.link || result.results.length > 0)
        ) {
            let titleStripped =
                result.title &&
                result.title.toLowerCase().replace(" inc.", "").trim();
            // Remove parens from wiki titles
            let regExp = /\(([^)]+)\)/;
            if (titleStripped.includes("(")) {
                let match = regExp.exec(titleStripped);
                if (match) {
                    titleStripped = titleStripped
                        .replace(match[0], "")
                        .trim()
                        .replace(/\s/g, "");
                } else {
                    titleStripped = titleStripped.replace(/\s/g, "");
                }
            }

            // Loop through the 3 child results
            for (let resultSite of result.results.slice(0, 3)) {
                if (
                    resultSite.title.toLowerCase().trim() === titleStripped ||
                    (resultSite.title
                        .toLowerCase()
                        .trim()
                        .includes(titleStripped) &&
                        resultSite.title
                            .toLowerCase()
                            .trim()
                            .includes("official")) ||
                    getDomainNameAndSubdomain(resultSite.link)?.domain.split(
                        "."
                    )[0] === titleStripped
                ) {
                    topMatchWebsite = resultSite.link;
                    topMatchWebsiteTitle = resultSite.title;
                    break;
                }
            }
        }

        if (officialWebsite) {
            targetLink = officialWebsite;
            targetType = "Official Website";
            targetTitle = officialWebsiteTitle;
        } else if (topMatchWebsite) {
            targetLink = topMatchWebsite;
            targetType = "Top Match";
            targetTitle = topMatchWebsiteTitle;
        } else {
            targetLink = null;
        }
    }

    const sourceFaviconUrl = targetLink
        ? `${FAVICON_PROXY}/${
              getDomainNameAndSubdomain(targetLink)?.domain
          }.ico`
        : "";

    const sourceSubDomain = targetLink
        ? getDomainNameAndSubdomain(targetLink)?.sub?.replace("www", "")
        : null;
    const sourceString = targetLink
        ? `${sourceSubDomain ? `${sourceSubDomain}.` : ""}${
              getDomainNameAndSubdomain(targetLink)?.domain
          }`
        : "";

    if (targetLink) {
        return (
            <CitationButton
                image={sourceFaviconUrl}
                link={targetLink}
                title={citation ? citation : targetTitle}
                type={targetType}
                sourceString={verbose === true && visit === true ? "Visit " + sourceString : verbose === true ? "View on " + sourceString : sourceString}
            />
        );
    }
    return null;
}


