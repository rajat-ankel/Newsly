import React, { useState, useContext, useEffect } from "react";
import posthog from "posthog-js";
import { Segment, Button, Placeholder } from "semantic-ui-react";
import * as emoji from "node-emoji";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";
import { getTopDomainMatchesForQuery, sourceName } from "./utilitiesResponse";
import { UserContext } from "../../UserContext";
import DesktopShowResultsButton from "./DesktopShowResultsButton";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";
import removeTruncatedLastSentence from "../../utilities/removeTruncatedLastSentence";
import WebsiteCitation from "./WebsiteCitation";
import ChatActions from "./ChatActions";
import createOptimalDescription from "../../utilities/createOptimalDescription";

const NavAnswer = (props) => {
    const {
        result,
        handlePanel,
        commands,
        refineSearch,
        query,
        handleNewUserMessage,
        id,
        intentName,
    } = props;
    const { mode, currentPanelResultId, showResults } = useContext(UserContext);
    const [currentSearchId] = useState(id ? id : uuidv4());

    const [initialResultsDisplayed, setInitialResultsDisplayed] =
        useState(false);

    const citationDescription = createOptimalDescription(result);
    
    

    const onClickShowPanel = () => {
        // Toggle button
        if (showResults && currentSearchId === currentPanelResultId) {
            handlePanel(null, false);
        } else {
            handlePanel(
                {
                    result: result,
                    id: currentSearchId,
                    commands: commands,
                    refineSearch: refineSearch,
                    query: query,
                    handleNewUserMessage: handleNewUserMessage,
                },
                true
            );
        }
    };

    const regex = /^(?:https?:\/\/)/;
    const source = sourceName(result);
    // tldextract fails with some domains so use function with regex fallback
    const { domain } =
        result.link &&
        getDomainNameAndSubdomain(result.link.replace("www.", ""));

    // const sourceFaviconUrl = result.favicon
    //     ? result.favicon
    //     : `${FAVICON_PROXY}/${domain}.ico`;

    const sourceCitation = source
        ? `Source: ${result.title} on ${source}`
        : `Source: ${result.title} on ${domain}`;

    const isTopLevelWebsite =
        result.link && result.link?.split(regex)[1].split("/")[1] === "";

    // Handle WA tables
    let answerText =
        result.answer.includes("\n") && !result.answer.includes("|")
            ? result.answer.replace(/(?:\r\n|\r|\n)/g, "\n\n")
            : result.answer;

    // Construct message to display
    answerText = removeTruncatedLastSentence(answerText);

    // Attribution text on the result
    const attribution =
        result.results_type === "Translations"
            ? "I found this translation for you:"
            : `${
                  result.results_type === "Answer" ? "According to" : "I found"
              } this ${
                  result.results_type &&
                  result.results_type === "Search" &&
                  (result.link.includes("tripadvisor") ||
                      result.link.includes("yelp"))
                      ? "consumer review "
                      : result.results_type && result.results_type === "Search"
                      ? "information"
                      : result.results_type &&
                        (result.results_type === "Videos" ||
                            result.results_type === "Images")
                      ? "media"
                      : result.results_type === "Places"
                      ? ""
                      : result.results_type
                      ? result.results_type.toLowerCase()
                      : ""
              } on ${source ? source : domain}:`;
    // const attributionSourceString =
    //     result.results_type === "Translations" ? "" : `Source: ${result.title}`;

    // Include reference to other close matches
    const additionalDomains = getTopDomainMatchesForQuery(
        result.results,
        query
    );
    const additionalDomainsString = additionalDomains
        .map(
            (item, index) =>
                `${item.title}${
                    index === additionalDomains.length - 1 ? " and more." : ""
                }`
        )
        .join(", ");

    let additionalDomainsMessage =
        additionalDomains.length > 0
            ? ` including matches from ${additionalDomainsString}`
            : "";

    // Display website information for a top level match
    const displayMessage = isTopLevelWebsite
        ? `**${result.title}** looks like the top match.`
        : attribution;

    useEffect(() => {
        if (!initialResultsDisplayed && mode === "desktop") {
            handlePanel(
                {
                    result: result,
                    id: currentSearchId,
                    commands: commands,
                    refineSearch: refineSearch,
                    query: query,
                    handleNewUserMessage: handleNewUserMessage,
                },
                true
            );
            setInitialResultsDisplayed(true);
        }
    }, [
        handlePanel,
        handleNewUserMessage,
        result,
        commands,
        refineSearch,
        currentSearchId,
        setInitialResultsDisplayed,
        initialResultsDisplayed,
        mode,
        showResults,
        currentPanelResultId,
        query,
    ]);

    useEffect(() => {
        return () => {
            // Clean up if unmounted
            handlePanel(null, false);
            setInitialResultsDisplayed(false);
        };
    }, [handlePanel, setInitialResultsDisplayed]);

    const handleShowPanel = () => {
        posthog.capture("Engagement", {
            Action: "View",
            Channel: "Show Results Panel",
        });
        onClickShowPanel();
    };

    const handleNoActionOnClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const currentResultsChat =
        showResults && currentSearchId === currentPanelResultId;

    const displayResultsAvailableMessage =
        false && mode === "desktop" ? (
            <Button
                onClick={
                    currentResultsChat ? handleNoActionOnClick : handleShowPanel
                }
                circular
                inverted
                content={
                    currentResultsChat ? "Showing results" : "See full results"
                }
                floated="right"
                style={{
                    backgroundColor: currentResultsChat
                        ? "var(--color-Newsly)"
                        : "var(--color-grey-5)",
                }}
                // color="white"
                className={
                    currentResultsChat
                        ? "lw-showing-results-button"
                        : "lw-show-results-button"
                }
            />
        ) : null;

    const placeholderBlockquote = (
        <blockquote className="lw-chat-blockquote">
            <Placeholder>
                <Placeholder.Header>
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder.Header>
                <Placeholder.Paragraph>
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder.Paragraph>
            </Placeholder>
        </blockquote>
    );

    const answerContent = (
        <React.Fragment>
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                children={emoji.emojify(displayMessage)}
                style={{ whiteSpace: "pre-wrap" }}
                linkTarget="_blank"
                remarkPlugins={[remarkGfm]}
            />
            {citationDescription === "pending" ? (
                placeholderBlockquote
            ) : citationDescription ? (
                <div style={{ marginBottom: "1rem" }}>
                    {answerText.includes("<") ||
                    answerText.startsWith("|Details |") ? (
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            children={emoji.emojify(answerText.trim())}
                            style={{ whiteSpace: "pre-wrap" }}
                            linkTarget="_blank"
                            remarkPlugins={[remarkGfm]}
                        />
                    ) : (
                        <blockquote className="lw-chat-blockquote">
                            {result.title &&
                            citationDescription !== result.title &&
                            !isTopLevelWebsite ? (
                                <React.Fragment>
                                    <h3>{result.title}</h3>
                                    <p>{citationDescription}</p>
                                </React.Fragment>
                            ) : (
                                citationDescription
                            )}
                        </blockquote>
                    )}
                </div>
            ) : null}
        </React.Fragment>
    );

    return (
        <div>
            <React.Fragment>
                <div className="lw-response">
                    <Segment
                        secondary
                        size="large"
                        className={
                            mode === "desktop" && currentResultsChat
                                ? "lw-message-simple lw-message-selected"
                                : mode === "mobile"
                                ? "lw-message-collapsed lw-message-simple-result-top"
                                : "lw-message-collapsed"
                        }
                        onClick={
                            mode === "desktop" && !currentResultsChat
                                ? handleShowPanel
                                : handleNoActionOnClick
                        }
                        style={
                            mode === "desktop" && !currentResultsChat
                                ? { cursor: "pointer" }
                                : null
                        }
                    >
                        {mode === "desktop" ? (
                            <DesktopShowResultsButton
                                currentSearchId={currentSearchId}
                                handleShowPanel={handleShowPanel}
                                responseType="answer"
                                query={query}
                                additionalPrompt={additionalDomainsMessage}
                            />
                        ) : null}
                        <div>
                            {answerContent}
                            <WebsiteCitation
                                result={result}
                                query={query}
                                responseType="source"
                                citation={sourceCitation}
                                // verbose={fullContentAvailable}
                                visit={false}
                            />
                        </div>
                        <ChatActions
                            intentName={intentName}
                            query={query}
                            result={result}
                            parent="NavAnswer"
                            // citationTitle={citationTitle}
                            // setCitationTitle={setCitationTitle}
                            // citationDescription={citationDescription}
                            // setCitationDescription={setCitationDescription}
                            // setFullContentAvailable={setFullContentAvailable}
                            mode={mode}
                            commands={commands}
                            refineSearch={refineSearch}
                        />
                        {displayResultsAvailableMessage}
                    </Segment>
                </div>
            </React.Fragment>
        </div>
    );
};

export default NavAnswer;
