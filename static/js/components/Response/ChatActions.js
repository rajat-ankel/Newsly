import React from "react";
import { Button, Image } from "semantic-ui-react";
import { isQuestion, isTextGeneration } from "../../utils";
import GenerateText from "./Generation/GenerateText";
import AiIcon from "../../assets/icons/ai-icon-transparent-64px.png";
import ReaderView from "./ReaderInteractionButtons/ReaderView/ReaderView";
import SummarizeView from "./ReaderInteractionButtons/SummarizeView/SummarizeView";
import ExplainerView from "./ReaderInteractionButtons/ExplainerView/ExplainerView";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";

import MobileSearchPrompt from "./MobileSearchPrompt";

const ChatActions = (props) => {
    const {
        query,
        intentName,
        result,
        parent,
        mode,
        commands,
        refineSearch,
        reader,
        loading,
        score,
    } = props;

    
    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

    return (
        <React.Fragment>
            <div className="lw-chat-action-buttons">
                {mode === "mobile" ? (
                    <MobileSearchPrompt
                        result={result}
                        commands={commands}
                        refineSearch={refineSearch}
                    />
                ) : null}
                {intentName === "GenerateTextIntent" ||
                isTextGeneration(query) ? (
                    <GenerateText query={query} result={result} />
                ) : false &&
                  (parent === "EntityAnswer" ||
                      parent === "CredibleAnswer" ||
                      parent === "EntityCredibleAnswer") ? (
                    <Button
                        // style={{ paddingLeft: "0.875em" }}
                        // content="Generate Answer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Generation"
                        compact
                        className="lw-chat-actions"
                    >
                        Tell Me More
                        <Image
                            src={AiIcon}
                            size="mini"
                            align="right"
                            alt="AI Icon"
                            style={{
                                margin: "-8px -16px -8px 0.5rem",
                                padding: "3px",
                                width: "30px",
                                height: "30px",
                                borderRadius: "9999px",
                                backgroundColor: "var(--color-Newsly-dark)",
                            }}
                        />
                    </Button>
                ) : false &&
                  ((query && isQuestion(query)) ||
                      (intentName &&
                          intentName.toLowerCase().includes("Question"))) ? (
                    <Button
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Generation"
                        compact
                        className="lw-chat-actions"
                    >
                        Generate Answer{" "}
                        <Image
                            src={AiIcon}
                            size="mini"
                            align="right"
                            alt="AI Icon"
                            style={{
                                margin: "-8px -16px -8px 0.5rem",
                                padding: "3px",
                                width: "30px",
                                height: "30px",
                                borderRadius: "9999px",
                                backgroundColor: "var(--color-Newsly-dark)",
                            }}
                        />
                    </Button>
                ) : false ? (
                    <Button
                        // style={{ paddingLeft: "0.875em" }}
                        // content="Generate Results Summary"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Generation"
                        compact
                        className="lw-chat-actions"
                    >
                        Summarize Results{" "}
                        <Image
                            src={AiIcon}
                            size="mini"
                            align="right"
                            alt="AI Icon"
                            style={{
                                margin: "-8px -16px -8px 0.5rem",
                                padding: "3px",
                                width: "30px",
                                height: "30px",
                                borderRadius: "9999px",
                                backgroundColor: "var(--color-Newsly-dark)",
                            }}
                        />
                    </Button>
                ) : null}
                {score && score > 20 ? (
                    <React.Fragment>
                        <ReaderView
                            buttonSize="mini"
                            result={result}
                            reader={reader}
                            loading={loading}
                            readerAvailable={score > 20}
                            buttonClass="lw-chat-actions"
                        />
                        <SummarizeView
                            buttonSize="mini"
                            result={result}
                            reader={reader}
                            loading={loading}
                            readerAvailable={score > 20}
                            buttonClass="lw-chat-actions"
                        />
                        <ExplainerView
                            buttonSize="mini"
                            result={result}
                            reader={reader}
                            loading={loading}
                            readerAvailable={score > 20}
                            buttonClass="lw-chat-actions"
                        />
                    </React.Fragment>
                ) : null}
            </div>
        </React.Fragment>
    );
};

export default ChatActions;
