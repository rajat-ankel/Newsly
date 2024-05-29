// import tldExtract from "tld-extract";
import { isValidURL } from "../utils";

import { isNav, isSearch, isMobileDevice } from "../utils";
import { NAV_COMMANDS } from "../constants";
import getDomainNameAndSubdomain from "./getDomainNameAndSubdomain";

// Simple list of objects with type

export const suggestionsList = (props) => {
    const { currentSearchResult, intentName, query, allowLocation } = props;

    let suggestionsList = [];

    // Bang command
    if (query.startsWith("!")) {
        suggestionsList = [];
    }

    // Enabled GPS option for location searches
    if (
        (intentName === "FoodPlaceSearchIntent" ||
            intentName === "BusinessSearchIntent" ||
            intentName === "WeatherIntent" ||
            intentName === "TimeIntent" ||
            currentSearchResult.results_type === "Places" ||
            currentSearchResult.results_type === "TimeZone" ||
            currentSearchResult.results_type === "Weather") &&
        !allowLocation &&
        isMobileDevice() &&
        navigator.geolocation
    ) {
        suggestionsList.push({
            title: `Enable GPS`,
            link: "",
            command: `Location settings`,
            color: "blue",
            type: "location",
        });
    }

    // Handle special cases
    if (
        intentName === "LWAssistantIntent" ||
        intentName === "LWFictionalAIIntent" ||
        intentName === "LWDifferentIntent" ||
        intentName === "ChatIntent" ||
        intentName === "LWLLMIntent" ||
        currentSearchResult.results_type === "Redirect Search"
    ) {
        suggestionsList.push({
            title: `Web search for '${query}'`,
            link: "",
            command: `~e ${query}`,
            color: "",
            type: "raw",
        });
    } else if (
        intentName.startsWith("LW") ||
        intentName === "AdditionalHelpIntents" ||
        intentName === "CorporateIntent" ||
        intentName === "TipsIntent" ||
        currentSearchResult.results_type === "Navigate" ||
        (isNav(query) &&
            !isSearch(query) &&
            !NAV_COMMANDS.some((term) =>
                currentSearchResult.link.toLowerCase().includes(term.trim())
            ))
    ) {
        suggestionsList.push({
            title: `About '${
                currentSearchResult.title.length <= 50
                    ? currentSearchResult.title
                    : currentSearchResult.source
            }'`,
            link: "",
            command: `~d ${
                currentSearchResult.title.length <= 50
                    ? currentSearchResult.title
                    : currentSearchResult.source
            }`,
            color: "",
            type: "entity",
        });
        suggestionsList.push({
            title: `Web search for '${query}'`,
            link: "",
            command: `~e ${query}`,
            color: "",
            type: "raw",
        });
    } else if (
        currentSearchResult.results_type === "Category" ||
        currentSearchResult.results_type === "Disambiguation"
    ) {
        suggestionsList.push({
            title: `Web search for '${query}'`,
            link: "",
            command: `~e ${query}`,
            color: "blue",
            type: "raw",
        });

        currentSearchResult.related_topics.forEach((topic) => {
            let suggestion = {
                title: topic,
                link: "",
                command: `~d ${topic}`,
                color: "",
                type: "disambiguate",
            };
            suggestionsList.push(suggestion);
        });
    } else if (
        currentSearchResult.results_type === "Prompt" &&
        isValidURL(currentSearchResult.link)
    ) {
        suggestionsList.push({
            title: `Open on '${
                getDomainNameAndSubdomain(currentSearchResult.link).domain
            }'`,
            link: currentSearchResult.redirect,
            command: "",
            color: "",
            type: "prompt",
        });
        suggestionsList.push({
            title: currentSearchResult.title,
            link: currentSearchResult.link,
            command: "",
            color: "",
            type: "link",
        });
        suggestionsList.push({
            title: `Web search for '${query}'`,
            link: "",
            command: `~e ${query}`,
            color: "",
            type: "raw",
        });
    }

    // Add any related searches
    if (
        currentSearchResult.related_searches &&
        currentSearchResult.related_searches.length > 0
    ) {
        currentSearchResult.related_searches.slice(0, 7).forEach((related) => {
            let suggestion = {
                title: related,
                link: "",
                command: related,
                color: "",
                type: "related",
            };
            suggestionsList.push(suggestion);
        });
    }

    // If this is a navigable website, add a go command tip to the front
    // TODO: lookup web database for known sites and search
    const regex = /^(?:https?:\/\/)/;
    let isGoWebsite = false;
    let goPhrase = query?.toLowerCase();
    currentSearchResult.profiles &&
        currentSearchResult.profiles.every((profile) => {
            if (
                profile.type === "official_website" &&
                isValidURL(profile.link)
            ) {
                isGoWebsite = true;
                const { domain, sub, tld } =
                    profile.link &&
                    getDomainNameAndSubdomain(profile.link.replace("www.", ""));

                // const sourceSubDomain = getDomainNameAndSubdomain(profile.link)?.sub?.replace(
                //     "www",
                //     ""
                // );
                goPhrase = `${sub ? `${sub} ` : ""}${domain
                    .replace(`.${tld}`, "")
                    .replace(".", "")}`;
                return false;
            } else {
                return true;
            }
        });
    if (
        !isGoWebsite &&
        currentSearchResult.link &&
        isValidURL(currentSearchResult.link)
    ) {
        const { domain, sub, tld } =
            currentSearchResult.link &&
            getDomainNameAndSubdomain(
                currentSearchResult.link.replace("www.", "")
            );

        isGoWebsite =
            currentSearchResult.link?.split(regex)[1].split("/")[1] === "";
        // const sourceSubDomain = tldExtract(
        //     currentSearchResult.link
        // )?.sub?.replace("www", "");
        goPhrase = `${sub ? `${sub} ` : ""}${domain
            .replace(`.${tld}`, "")
            .replace(".", "")}`;
    }

    if (isGoWebsite) {
        const goSuggestion = {
            title: `Say "go ${goPhrase}" to go directly there in future.`,
            link: "",
            command: "",
            color: "",
            type: "tip",
        };
        suggestionsList.unshift(goSuggestion);
    }

    return suggestionsList;
};
