import React from "react";
import { Link } from "react-router-dom";
import { Segment } from "semantic-ui-react";
import * as emoji from 'node-emoji';
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Prompt from "./Prompt";
import WebsiteCitation from "./WebsiteCitation";

const SimpleResponse = (props) => {
    const {
        suggestions,
        query,
        handleNewUserMessage,
        id,
        // heroMode,
        useSeparateMessages,
        citationResults,
    } = props;

    const components = {
        a: ({ node, ...props }) => {
            if (props.href && props.href.startsWith("/")) {
                return <Link to={props.href}>{props.children}</Link>;
            } else {
                return (
                    <a
                        href={props.href}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                    >
                        {props.children}
                    </a>
                );
            }
        },
    };

    if (
        useSeparateMessages &&
        props.message &&
        props.message.startsWith(`{"messages":[`)
    ) {
        const messagesList = JSON.parse(props.message).messages
            ? JSON.parse(props.message).messages
            : null;

        return (
            <div id={props.id} className="lw-response">
                {messagesList
                    ? messagesList.slice(0, -1).map((item, index) => (
                          <Segment
                              secondary
                              size="large"
                              className={
                                  index === 0
                                      ? "lw-message-simple lw-message-simple-top"
                                      : index === messagesList.length - 1
                                      ? "lw-message-simple lw-message-simple-bottom"
                                      : "lw-message-simple lw-message-simple-mid"
                              }
                              key={index}
                          >
                              <ReactMarkdown
                                  rehypePlugins={[rehypeRaw]}
                                  children={emoji.emojify(item.value)}
                                  components={components}
                                  style={{ whiteSpace: "pre-wrap" }}
                                  remarkPlugins={[remarkGfm]}
                              />
                          </Segment>
                      ))
                    : null}
                {suggestions && suggestions.length > 0 ? (
                    <Prompt
                        suggestions={suggestions}
                        query={query}
                        handleNewUserMessage={handleNewUserMessage}
                        message={messagesList.slice(-1)[0].value}
                    />
                ) : null}
            </div>
        );
    } else {
        let combinedMessage = "";
        if (props.message.startsWith(`{"messages":[`)) {
            const messagesList = JSON.parse(props.message).messages
                ? JSON.parse(props.message).messages
                : null;
            // console.log("messagesList", messagesList);
            // const messageListValues = messagesList.map((item) => item.value);
            combinedMessage = messagesList
                .map((item) => item.value)
                .join("\n\n");
        } else {
            combinedMessage = props.message;
        }
        // console.log("SimpleResponse", combinedMessage);
        // console.log("Suggestions", suggestions);

        return (
            <div id={props.id} className="lw-response">
                {suggestions && suggestions.length > 0 ? (
                    <Prompt
                        suggestions={suggestions}
                        query={query}
                        handleNewUserMessage={handleNewUserMessage}
                        message={combinedMessage}
                        citationResults={citationResults}
                    />
                ) : (
                    <Segment
                        secondary
                        size="large"
                        className={
                            id && id === "welcome" 
                                ? "lw-message-banner"
                                : "lw-message-simple"
                        }
                    >
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            children={emoji.emojify(props.message)}
                            components={components}
                            style={{ whiteSpace: "pre-wrap" }}
                            remarkPlugins={[remarkGfm]}
                        />
                        {citationResults && citationResults.length > 0
                            ? citationResults.map((citationResult, index) => (
                                  <div>
                                      <WebsiteCitation
                                          key={index}
                                          result={citationResult}
                                          query={query}
                                          responseType="Citation Source"
                                      />
                                  </div>
                              ))
                            : null}
                    </Segment>
                )}
            </div>
        );
    }
};
export default SimpleResponse;
