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
import WebsiteCitation from "./WebsiteCitation";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";
import removeTruncatedLastSentence from "../../utilities/removeTruncatedLastSentence";
import ChatActions from "./ChatActions";
import createOptimalDescription from "../../utilities/createOptimalDescription";

const EntityAnswer = (props) => {
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
    // const [citationTitle, setCitationTitle] = useState(
    //     result.title ? result.title : result.answer
    // );
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
    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

    const sourceCitation = source
        ? `Source: ${result.title} on ${source}`
        : `Source: ${result.title} on ${domain}`;

    // Handle WA tables
    let answerText =
        result.answer.includes("\n") && !result.answer.includes("|")
            ? result.answer.replace(/(?:\r\n|\r|\n)/g, "\n\n")
            : result.answer;

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
    const attribution = `${
        result.results_type === "Answer" ? "According to" : "I found"
    } this ${
        result.results_type &&
        (result.results_type === "Search" ||
            result.results_type === "Videos" ||
            result.results_type === "Images")
            ? "information"
            : result.results_type
            ? result.results_type.toLowerCase()
            : ""
    } on ${source ? source : domain}:`;

    answerText = removeTruncatedLastSentence(answerText);

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
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            children={emoji.emojify(answerText.trim())}
                            style={{ whiteSpace: "pre-wrap" }}
                            //allowDangerousHtml={true}
                            linkTarget="_blank"
                            remarkPlugins={[remarkGfm]}
                        />
                    ) : (
                        <blockquote className="lw-chat-blockquote">
                            {citationDescription}
                        </blockquote>
                    )}
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
                            className={
                                mode === "desktop" && currentResultsChat
                                    ? "lw-message-collapsed lw-message-selected"
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
                                {citationDescription &&
                                !result.link.includes("wikipedia") &&
                                !result.description
                                    .trim()
                                    .includes(
                                        citationDescription.substr(0, 32)
                                    ) ? (
                                    <WebsiteCitation
                                        result={result}
                                        query={query}
                                        responseType="official_website"
                                    />
                                ) : null}
                            </div>
                            <ChatActions
                                intentName={intentName}
                                query={query}
                                result={result}
                                parent="EntityAnswer"
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
                            className={
                                mode === "desktop" && currentResultsChat
                                    ? "lw-message-collapsed lw-message-selected"
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
                                    responseType="answer"
                                    handleShowPanel={handleShowPanel}
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
                                {result.title && result.link !== "" ? (
                                    <WebsiteCitation
                                        result={result}
                                        query={query}
                                        responseType="official_website"
                                    />
                                ) : null}

                                <ChatActions
                                    intentName={intentName}
                                    query={query}
                                    result={result}
                                    parent="EntityCredibleAnswer"
                                    // citationDescription={citationDescription}
                                    // setCitationDescription={
                                    //     setCitationDescription
                                    // }
                                    mode={mode}
                                    commands={commands}
                                    refineSearch={refineSearch}
                                />
                            </div>

                            {displayResultsAvailableMessage}
                        </Segment>
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};

export default EntityAnswer;
