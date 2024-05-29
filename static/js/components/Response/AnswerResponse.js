import React, { useState, useContext, useEffect } from "react";
import posthog from "posthog-js";
import { Segment, Button, Placeholder } from "semantic-ui-react";
import * as emoji from 'node-emoji';
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";
import { sourceName } from "./utilitiesResponse";
import { UserContext } from "../../UserContext";
import DesktopShowResultsButton from "./DesktopShowResultsButton";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";
import removeTruncatedLastSentence from "../../utilities/removeTruncatedLastSentence";
import WebsiteCitation from "./WebsiteCitation";
import ChatActions from "./ChatActions";
import { isTextGeneration } from "../../utils";
import createOptimalDescription from "../../utilities/createOptimalDescription";

const Answer = (props) => {
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
    const citationTitle = result.title ? result.title : result.answer;
    // const [fullContentAvailable, setFullContentAvailable] = useState(null);

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

    const source = sourceName(result);
    // tldextract fails with some domains so use function with regex fallback
    const { domain } =
        result.link &&
        getDomainNameAndSubdomain(result.link.replace("www.", ""));

    const sourceCitation = source
        ? `Source: ${result.title} on ${source}`
        : `Source: ${result.title} on ${domain}`;

    // Handle WA tables
    let answerText =
        result.answer.includes("\n") && !result.answer.includes("|")
            ? result.answer.replace(/(?:\r\n|\r|\n)/g, "\n\n")
            : result.answer;

    // No confidence answer
    const noConfidenceAnswer = answerText.startsWith(
        "I'm sorry, I couldn't give you a direct answer"
    );

    // From a credible source so provide a factual answer
    const credibleSource =
        source &&
        (result.results_type === "Answer" ||
            result.results_type === "Knowledge" ||
            result.results_type === "Snippet" ||
            result.results_type === "Card" ||
            result.results_type === "Entity") &&
        (source.toLowerCase().includes("wikipedia") ||
            source.toLowerCase().includes("wolfram") ||
            source.toLowerCase().includes("britannica"));

    // Attribution text on the result
    let attribution = noConfidenceAnswer
        ? ""
        : result.results_type === "Translations"
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
                  : result.results_type === "Places" ||
                    result.results_type === "Translations"
                  ? ""
                  : result.results_type
                  ? result.results_type.toLowerCase()
                  : ""
          } on ${source ? source : domain}:`;

    // Check if the answer cNewslydates equal the title and is short, and if so use the description if it's longer
    if (
        answerText.trim() === result.title.trim() &&
        answerText.length < 50 &&
        result.description.length > 100
    ) {
        answerText = result.description.trim();
    }

    answerText = removeTruncatedLastSentence(answerText);

    let postAttribution = "";

    if (intentName === "GenerateTextIntent" || isTextGeneration(query)) {
        attribution = `I found some useful resources for writing this content, including from ${
            source ? source : domain
        }.`;
        postAttribution =
            "You can view the full search results or click Generate Text and I can write it for you.";
    }

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
                </Placeholder.Paragraph>
            </Placeholder>
        </blockquote>
    );

    const answerContent =
        !credibleSource && attribution ? (
            <React.Fragment>
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    children={emoji.emojify(attribution)}
                    style={{ whiteSpace: "pre-wrap" }}
                    //allowDangerousHtml={true}
                    linkTarget="_blank"
                    remarkPlugins={[remarkGfm]}
                />

                <div style={{ marginBottom: "1rem" }}>
                    {citationDescription === "pending" ? (
                        placeholderBlockquote
                    ) : answerText.includes("<") ||
                      answerText.includes(" | ") ? (
                        <blockquote className="lw-chat-blockquote">
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                children={emoji.emojify(
                                    intentName === "GenerateTextIntent" ||
                                        isTextGeneration(query)
                                        ? citationTitle
                                        : answerText.trim().endsWith(".")
                                        ? answerText
                                        : citationDescription
                                              .trim()
                                              .endsWith(".") ||
                                          citationDescription
                                              .trim()
                                              .endsWith("?") ||
                                          citationDescription
                                              .trim()
                                              .endsWith("!")
                                        ? citationDescription
                                        : citationTitle &&
                                          citationTitle !== citationDescription
                                        ? citationTitle
                                        : citationDescription
                                )}
                                //style={{ whiteSpace: "pre-wrap" }}
                                style={{ whiteSpace: "pre" }}
                                //allowDangerousHtml={true}
                                linkTarget="_blank"
                                remarkPlugins={[remarkGfm]}
                            />
                        </blockquote>
                    ) : (
                        <blockquote className="lw-chat-blockquote">
                            {(intentName === "GenerateTextIntent" ||
                                isTextGeneration(query)) &&
                            citationTitle.length > 32
                                ? citationTitle
                                : citationDescription}
                        </blockquote>
                    )}
                    {postAttribution ? <p>{postAttribution}</p> : null}
                </div>
            </React.Fragment>
        ) : (
            <React.Fragment>
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    children={emoji.emojify(answerText)}
                    style={{ whiteSpace: "pre-wrap" }}
                    //allowDangerousHtml={true}
                    linkTarget="_blank"
                    remarkPlugins={[remarkGfm]}
                />
            </React.Fragment>
        );

    return (
        <div>
            {!credibleSource && attribution ? (
                <React.Fragment>
                    <div className="lw-response">
                        <Segment
                            secondary
                            size="large"
                            // className={
                            //     mode === "desktop" && currentResultsChat
                            //         ? "lw-message-collapsed lw-message-selected"
                            //         : mode === "mobile"
                            //         ? "lw-message-collapsed lw-message-simple-result-top"
                            //         : "lw-message-collapsed"
                            // }
                            className={
                                mode === "desktop" && currentResultsChat
                                    ? "lw-message-collapsed lw-message-selected"
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
                                />
                            ) : null}
                            <div>
                                {answerContent}
                                <WebsiteCitation
                                    result={result}
                                    query={query}
                                    responseType="source"
                                    citation={sourceCitation}
                                />
                            </div>

                            <ChatActions
                                intentName={intentName}
                                query={query}
                                result={result}
                                parent="Answer"
                                // citationTitle={citationTitle}
                                // setCitationTitle={setCitationTitle}
                                // citationDescription={citationDescription}
                                // setCitationDescription={setCitationDescription}
                                mode={mode}
                                commands={commands}
                                refineSearch={refineSearch}
                            />

                            {displayResultsAvailableMessage}
                        </Segment>
                    </div>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <div className="lw-response">
                        <Segment
                            secondary
                            size="large"
                            // className={
                            //     mode === "desktop" && currentResultsChat
                            //         ? "lw-message-collapsed lw-message-selected"
                            //         : mode === "mobile"
                            //         ? "lw-message-collapsed lw-message-simple-result-top"
                            //         : "lw-message-collapsed"
                            // }
                            className={
                                mode === "desktop" && currentResultsChat
                                    ? "lw-message-collapsed lw-message-selected"
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
                                />
                            ) : null}
                            <div>
                                {answerContent}
                                <WebsiteCitation
                                    result={result}
                                    query={query}
                                    responseType="source"
                                    citation={sourceCitation}
                                />
                            </div>
                            <ChatActions
                                intentName={intentName}
                                query={query}
                                result={result}
                                parent="CredibleAnswer"
                                // citationTitle={citationTitle}
                                // setCitationTitle={setCitationTitle}
                                // citationDescription={citationDescription}
                                // setCitationDescription={setCitationDescription}
                                mode={mode}
                                commands={commands}
                                refineSearch={refineSearch}
                            />
                            {displayResultsAvailableMessage}
                        </Segment>
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};

export default Answer;
