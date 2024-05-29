import React from "react";
// import tldExtract from "tld-extract";
// import { v4 as uuidv4 } from "uuid";
// import posthog from "posthog-js";
import Answer from "./AnswerResponse";
import NavAnswer from "./NavAnswerResponse";
import EntityAnswer from "./EntityAnswerResponse";
import SimpleResponse from "./SimpleResponse";
import CalculatorResponse from "./CalculatorResponse";
// import { UserContext } from "../../UserContext";
import { isQuestion } from "../../utils";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";
import { isValidURL } from "../../utils";
// import CardActionButtons from "./CardActionButtons";

// proper case function (JScript 5.5+)
function toProperCase(s) {
    return s.toLowerCase().replace(/^(.)|\s(.)/g, function ($1) {
        return $1.toUpperCase();
    });
}

const Response = (props) => {
    const {
        message,
        currentSearchResult,
        commands,
        refineSearch,
        handlePanel,
        handleNewUserMessage,
        intentName,
        query,
        id,
        suggestions,
    } = props;
    // const [navigateLink, setNavigateLink] = useState("");
    // const [navigationRequired, setNavigationRequired] = useState(false);
    // const [navigationRecorded, setNavigationRecorded] = useState(false);
    // const [navigationExecuted, setNavigationExecuted] = useState(false);
    //const [messageId, setMessageId] = useState(uuidv4());
    // const [popupsAllowed, setPopupsAllowed] = useState(null);
    // const {
    //     browserPopupNoticeDisplayed,
    //     setBrowserPopupNoticeDisplayed,
    //     isAnalyticsAllowed,
    // } = useContext(UserContext);
    // const messageId = uuidv4();

    let displayResponseType = currentSearchResult.results_type;
    const fallbackWebSearch = {
        title: `Web search for '${query}'`,
        link: "",
        command: `~e ${query}`,
        color: "blue",
        type: "action",
    };

    // console.log("\n\nintentName", intentName);
    // console.log("Response", currentSearchResult);
    // console.log("Response suggestions", suggestions);

    // Exit if no currentSearchResult
    if (!currentSearchResult.results) {
        return (
            <SimpleResponse
                message="Sorry, there aren't any results to display. Let's try a new search!"
                id={props.id}
            />
        );
    }

    // Check if there is a reasonable amount of content - title, description, image, source, link - ,'image'
    const fieldsToCheck = ["title", "description", "link"];
    const fieldHasContent = (currentField) =>
        currentSearchResult[currentField] !== "";
    let isContentful = fieldsToCheck.every(fieldHasContent);
    var sourceCheck = currentSearchResult.source.toString().toLowerCase();
    var isMedia =
        currentSearchResult.link &&
        currentSearchResult.type &&
        (sourceCheck.includes("youtube") ||
            currentSearchResult.link.includes("music.amazon.com") ||
            currentSearchResult.link.includes("music.apple.com") ||
            currentSearchResult.link.includes("open.spotify.com") ||
            currentSearchResult.type.includes("video") ||
            currentSearchResult.type.includes("music")) &&
        (!currentSearchResult.link.includes("music.apple.com/us/artist/") ||
            !currentSearchResult.type === "error");

    var isImages =
        currentSearchResult.images &&
        currentSearchResult.images.length > 0 &&
        (currentSearchResult.results_type === "Images" ||
            intentName === "ImageSearchIntent");
    var isVideos =
        currentSearchResult.videos &&
        currentSearchResult.videos.length > 0 &&
        currentSearchResult.results_type === "Videos" &&
        intentName === "VideoSearchIntent";

    // Over-ride Navigation results
    if (
        currentSearchResult.link &&
        (currentSearchResult.results_type === "Navigate" ||
            currentSearchResult.results_type === "Redirect Search")
    ) {
        displayResponseType = "Navigate";
    } else {
        // Handle news results

        if (
            intentName === "LatestNewsIntent" &&
            currentSearchResult.results_type === "News" &&
            !isContentful &&
            currentSearchResult.news.length > 0
        ) {
            displayResponseType = "News";
        } else if (
            intentName === "LatestNewsIntent" &&
            isContentful &&
            currentSearchResult.type === "article"
        ) {
            displayResponseType = "News";
        }

        // Handle media and players
        if (isMedia || isVideos) {
            displayResponseType = "Play";
        } else if (currentSearchResult.results_type === "Videos") {
            displayResponseType = "Card";
        }

        if (
            isImages &&
            !(
                intentName === "BusinessSearchIntent" ||
                intentName === "FoodPlaceSearchIntent"
            )
        ) {
            displayResponseType = "Images";
        }

        // Handle programming results
        if (intentName === "ProgrammingIntent" && !isMedia && isContentful) {
            displayResponseType = "Card";
        }

        // Handle clear answers
        if (
            displayResponseType === "Snippet" ||
            displayResponseType === "Answer" ||
            displayResponseType === "Knowledge" ||
            displayResponseType === "Information" ||
            displayResponseType === "Card" ||
            (displayResponseType === "Search" &&
                currentSearchResult.answer &&
                currentSearchResult.answer.trim().endsWith("."))
        ) {
            if (
                (intentName === "QuestionsIntent" || isQuestion(query)) &&
                currentSearchResult.answer &&
                (currentSearchResult.title ||
                    currentSearchResult.description) &&
                !currentSearchResult.answer
                    .trim()
                    .startsWith(
                        currentSearchResult.description.trim().substr(0.32)
                    ) &&
                !currentSearchResult.answer
                    .trim()
                    .startsWith(currentSearchResult.title.trim().substr(0.32))
            ) {
                // Response to a direct question
                displayResponseType = "Answer";
            }

            // Determine whether an answer-type response should display with a direct answer or a card
        } else if (
            displayResponseType === "Snippet" ||
            displayResponseType === "Answer" ||
            displayResponseType === "Knowledge"
        ) {
            if (intentName === "QuestionsIntent" || isQuestion(query)) {
                // Response to a direct question
                displayResponseType = "Answer";
            } else if (
                currentSearchResult.answer &&
                (currentSearchResult.title ||
                    currentSearchResult.description) &&
                !currentSearchResult.answer
                    .trim()
                    .startsWith(
                        currentSearchResult.description.trim().substr(0.32)
                    ) &&
                !currentSearchResult.answer
                    .trim()
                    .startsWith(currentSearchResult.title.trim().substr(0.32))
            ) {
                // Answer is different to the description and title
                displayResponseType = "Answer";
            } else if (
                isContentful &&
                currentSearchResult.image !== "" &&
                currentSearchResult.type === "article"
            ) {
                // Snippet-like response has ample content
                displayResponseType = "Card";
            }
            //
        }

        if (
            displayResponseType === "Entity" ||
            displayResponseType === "Instant Answer"
        ) {
            if (intentName === "QuestionsIntent" || isQuestion(query)) {
                // direct question
                displayResponseType = "Answer";
            }
            // else if (
            //     !currentSearchResult.image ||
            //     currentSearchResult.image.endsWith(".webm")
            // ) {
            //     displayResponseType = "Knowledge";
            // }
        }

        if (
            currentSearchResult.results_type === "Entity" &&
            displayResponseType !== "Disambiguation" &&
            currentSearchResult.source.toLowerCase().includes("wikipedia")
        ) {
            displayResponseType = "Entity";
        } else if (
            currentSearchResult.source.toLowerCase().includes("wikipedia") ||
            currentSearchResult.source.toLowerCase().includes("biography") ||
            currentSearchResult.source.toLowerCase().includes("imdb") ||
            currentSearchResult.source.toLowerCase().includes("britannica")
        ) {
            displayResponseType =
                displayResponseType !== "Answer" &&
                displayResponseType !== "Disambiguation"
                    ? (displayResponseType = "Entity")
                    : displayResponseType;
        }

        if (currentSearchResult.results_type === "Category") {
            displayResponseType = "Disambiguation";
        }

        if (
            (intentName === "BusinessSearchIntent" ||
                intentName === "FoodPlaceSearchIntent") &&
            currentSearchResult.results_type !== "Weather" &&
            currentSearchResult.results_type !== "TimeZone" &&
            currentSearchResult.results_type !== "Navigate" &&
            currentSearchResult.results_type !== "Calculator" &&
            currentSearchResult.results_type !== "Redirect Search"
        ) {
            displayResponseType = "Card";
        }
    }

    // Handle content generation
    if (intentName === "GenerateTextIntent") {
        displayResponseType = "Text Generation";
    }

    const source = currentSearchResult.source
        ? currentSearchResult.source
        : currentSearchResult.link && isValidURL(currentSearchResult.link)
        ? getDomainNameAndSubdomain(currentSearchResult.link).domain
        : currentSearchResult.engine
        ? currentSearchResult.engine
        : "";

    // Prompt for disambiguation
    let disambiguateMessage = currentSearchResult.answer;
    // console.log("related topics:", currentSearchResult.related_topics);
    const disambiguateSuggestions = currentSearchResult.related_topics
        ?.map((result) => {
            let regExp = /\(([^)]+)\)/;
            const suggestion = {
                title: (result.includes("(") && !result.includes("()")
                    ? toProperCase(regExp.exec(result)[1])
                    : result
                ).replace("Wikipedia ", "Topic - "),
                link: "",
                command: `~d ${result}`,
                color: "blue",
                type: "action",
            };
            return suggestion;
        })
        .concat(fallbackWebSearch);

    // console.log(displayResponseType, "-", currentSearchResult.results_type);
    // console.log(currentSearchResult);
    // console.log("intent:", intentName);

    switch (displayResponseType) {
        case "Answer":
            return (
                <div>
                    {currentSearchResult.link !== "" &&
                    currentSearchResult.results &&
                    currentSearchResult.results.length > 0 ? (
                        <Answer
                            result={currentSearchResult}
                            handlePanel={handlePanel}
                            handleNewUserMessage={handleNewUserMessage}
                            refineSearch={refineSearch}
                            commands={commands}
                            query={query}
                            id={id}
                        />
                    ) : (
                        <SimpleResponse
                            message={currentSearchResult.answer}
                            id={props.id}
                        />
                    )}
                </div>
            );
        case "Entity":
        case "Instant Answers":
            return (
                <div>
                    <EntityAnswer
                        result={currentSearchResult}
                        handlePanel={handlePanel}
                        handleNewUserMessage={handleNewUserMessage}
                        refineSearch={refineSearch}
                        commands={commands}
                        query={query}
                        id={id}
                    />
                </div>
            );
        case "Snippet":
        case "Knowledge":
            return (
                <div>
                    {currentSearchResult.link !== "" &&
                    currentSearchResult.results &&
                    currentSearchResult.results.length > 0 ? (
                        <Answer
                            result={currentSearchResult}
                            id={id}
                            handlePanel={handlePanel}
                            handleNewUserMessage={handleNewUserMessage}
                            refineSearch={refineSearch}
                            commands={commands}
                            query={query}
                        />
                    ) : (
                        <SimpleResponse
                            message={currentSearchResult.answer}
                            id={props.id}
                        />
                    )}
                </div>
            );

        case "Play":
        case "Video":
        case "Videos":
            return (
                <div style={{ width: "100%" }}>
                    <NavAnswer
                        result={currentSearchResult}
                        id={id}
                        handlePanel={handlePanel}
                        handleNewUserMessage={handleNewUserMessage}
                        refineSearch={refineSearch}
                        commands={commands}
                        query={query}
                    />
                </div>
            );

        case "Card":
        case "Top Search Result":
        case "Search":
        case "Site Search":
        case "Places":
        case "Information":
            return (
                <div>
                    <NavAnswer
                        result={currentSearchResult}
                        id={id}
                        handlePanel={handlePanel}
                        handleNewUserMessage={handleNewUserMessage}
                        refineSearch={refineSearch}
                        commands={commands}
                        query={query}
                    />
                </div>
            );

        case "News":
            return (
                <div>
                    <NavAnswer
                        result={currentSearchResult}
                        id={id}
                        handlePanel={handlePanel}
                        handleNewUserMessage={handleNewUserMessage}
                        refineSearch={refineSearch}
                        commands={commands}
                        query={query}
                        intentName={intentName}
                    />
                </div>
            );
        case "Message":
            return (
                <div>
                    <Answer
                        result={currentSearchResult}
                        id={id}
                        handlePanel={handlePanel}
                        handleNewUserMessage={handleNewUserMessage}
                        refineSearch={refineSearch}
                        commands={commands}
                        query={query}
                    />
                </div>
            );
        case "Calculator":
            return (
                <div>
                    <CalculatorResponse
                        message={currentSearchResult.answer}
                        id={props.id}
                        query={query}
                        source={source}
                    />
                </div>
            );
        case "Weather":
            return (
                <div>
                    <SimpleResponse
                        message={currentSearchResult.answer}
                        id={props.id}
                    />
                </div>
            );
        case "TimeZone":
            return (
                <div>
                    <SimpleResponse
                        message={currentSearchResult.answer}
                        id={props.id}
                    />
                </div>
            );
        case "Disambiguation":
            return (
                <div>
                    <SimpleResponse
                        message={disambiguateMessage}
                        id={props.id}
                        suggestions={disambiguateSuggestions}
                        query={query}
                        handleNewUserMessage={handleNewUserMessage}
                    />
                </div>
            );
        case "Prompt":
            return (
                <div>
                    <SimpleResponse
                        message={currentSearchResult.answer}
                        id={props.id}
                    />
                </div>
            );
        case "Navigate":
        case "Redirect Search":
            // if (currentSearchResult.link.startsWith("http") && !navigateLink && !navigationExecuted) {
            //     setNavigateLink(currentSearchResult.link);
            //     setNavigationRequired(true);
            // }

            return (
                <div>
                    <SimpleResponse
                        message={
                            query.startsWith("!")
                                ? `Running bang command '${query}' in a new window. ${
                                      message &&
                                      message
                                          .toLowerCase()
                                          .includes("allow popups")
                                          ? "Allow the popup in your browser address bar for 'go' links to open automatically 😇"
                                          : ""
                                  }`
                                : currentSearchResult.link.startsWith("http") &&
                                  currentSearchResult.results_type ===
                                      "Redirect Search"
                                ? `Running command to perform an external ${
                                      currentSearchResult.title.length <= 70
                                          ? currentSearchResult.title
                                          : currentSearchResult.source
                                          ? currentSearchResult.source
                                          : currentSearchResult.link &&
                                            isValidURL(currentSearchResult.link)
                                          ? getDomainNameAndSubdomain(
                                                currentSearchResult.link
                                            ).domain
                                          : "link"
                                  } search in a new window. ${
                                      message &&
                                      message
                                          .toLowerCase()
                                          .includes("allow popups")
                                          ? "Allow my popup in your browser address bar for 'go' links to open automatically 😇"
                                          : ""
                                  }`
                                : currentSearchResult.link.startsWith("http") &&
                                  currentSearchResult.results_type ===
                                      "Navigate"
                                ? `Running command to navigate to '${
                                      currentSearchResult.title.length <= 70
                                          ? currentSearchResult.title
                                          : currentSearchResult.source
                                          ? currentSearchResult.source
                                          : currentSearchResult.link &&
                                            isValidURL(currentSearchResult.link)
                                          ? getDomainNameAndSubdomain(
                                                currentSearchResult.link
                                            ).domain
                                          : "link"
                                  }' in a new window. ${
                                      message &&
                                      message
                                          .toLowerCase()
                                          .includes("allow popups")
                                          ? "Allow my popup in your browser address bar for 'go' links to open automatically 😇"
                                          : ""
                                  }`
                                : "Hmmm something went wrong with that link sorry"
                        }
                        id={props.id}
                        suggestions={suggestions}
                        query={query}
                        handleNewUserMessage={handleNewUserMessage}
                        citationResults={[currentSearchResult]}
                    />
                </div>
            );
        case "Images":
            return (
                <div>
                    <Answer
                        result={currentSearchResult}
                        id={id}
                        handlePanel={handlePanel}
                        handleNewUserMessage={handleNewUserMessage}
                        refineSearch={refineSearch}
                        commands={commands}
                        query={query}
                    />
                </div>
            );

        case "Text Generation":
            return (
                <div>
                    <Answer
                        result={currentSearchResult}
                        id={id}
                        handlePanel={handlePanel}
                        handleNewUserMessage={handleNewUserMessage}
                        refineSearch={refineSearch}
                        commands={commands}
                        query={query}
                        intentName={intentName}
                    />
                </div>
            );

        default:
            return (
                <div>
                    <NavAnswer
                        result={currentSearchResult}
                        id={id}
                        handlePanel={handlePanel}
                        handleNewUserMessage={handleNewUserMessage}
                        refineSearch={refineSearch}
                        commands={commands}
                        query={query}
                    />
                </div>
            );
    }
};

export default Response;
