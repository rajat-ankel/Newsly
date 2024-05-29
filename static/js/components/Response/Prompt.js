import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import * as emoji from 'node-emoji';
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { addUserMessage } from "react-chat-widget";
import { UserContext } from "../../UserContext";
import WebsiteCitation from "./WebsiteCitation";

const Prompt = (props) => {
    const { suggestions, handleNewUserMessage, message, query, citationResults } = props;
    const { mode, setChatUpdateRequired } = useContext(UserContext);

    const components = {
        a: ({ node, ...props }) => {
            if (props.href.startsWith("/")) {
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

    const onClickSuggestion = (event, suggestion) => {
        addUserMessage(query ? `Follow up to '${query}': ${suggestion.title}` : suggestion.title);
        handleNewUserMessage(suggestion.command);
        setChatUpdateRequired(true);
    };

    const suggestionItems =
        suggestions && suggestions.length > 0
            ? suggestions.map((suggestion) => {
                  if (suggestion) {
                      if (suggestion.command) {
                          return (
                              <Menu.Item
                                  //active={currentInput === suggestion}
                                  style={{
                                      //color: "#007aff",
                                      color: "var(--color-blue-5)!important",
                                      textAlign: "center",
                                      //fontSize: "1.1rem",
                                      fontSize:
                                          mode === "desktop"
                                              ? "calc(var(--chat-font-size)*.9)"
                                              : "calc(var(--mobile-chat-font-size)*.9)",
                                  }}
                                  //color={suggestion.color ? suggestion.color : null}
                                  key={suggestion.title}
                                  value={suggestion.command}
                                  content={suggestion.title}
                                  onClick={(e) =>
                                      onClickSuggestion(e, suggestion)
                                  }
                                  data-Newsly-event="Engagement"
                                  data-Newsly-action="Click"
                                  data-Newsly-channel="Suggested Prompt"
                              />
                          );
                      } else if (suggestion.link.startsWith("/")) {
                          return (
                              <Menu.Item
                                  //active={currentInput === suggestion}
                                  style={{
                                      //color: "#007aff",
                                      color: "var(--color-blue-5)!important",
                                      textAlign: "center",
                                      //fontSize: "1.1rem",
                                      fontSize:
                                          mode === "desktop"
                                              ? "calc(var(--chat-font-size)*.9)"
                                              : "calc(var(--mobile-chat-font-size)*.9)",
                                  }}
                                  to={suggestion.link}
                                  as={Link}
                                  //color={suggestion.color ? suggestion.color : null}
                                  key={suggestion.title}
                                  content={suggestion.title}
                                  data-Newsly-event="Engagement"
                                  data-Newsly-action="Click"
                                  data-Newsly-channel={`Suggested Page - ${
                                      suggestion.link?.split("/")[1]
                                  }`}
                              />
                          );
                      } else if (suggestion.link) {
                          return (
                              <Menu.Item
                                  style={{
                                      //color: "#007aff",
                                      color: "var(--color-blue-5)!important",
                                      textAlign: "center",
                                      //fontSize: "1.1rem",
                                      fontSize:
                                          mode === "desktop"
                                              ? "calc(var(--chat-font-size)*.9)"
                                              : "calc(var(--mobile-chat-font-size)*.9)",
                                  }}
                                  //color={suggestion.color ? suggestion.color : null}
                                  key={suggestion.title}
                                  content={suggestion.title}
                                  href={suggestion.link}
                                  target="_blank"
                                  rel="nofollow noopener noreferrer"
                                  data-Newsly-event="Engagement"
                                  data-Newsly-action="Click"
                                  data-Newsly-channel="Suggested Link"
                              />
                          );
                      } else {
                          return null;
                      }
                  } else {
                      return null;
                  }
              })
            : null;

    return (
        <div className="lw-message-simple-menu">
            <Menu
                vertical
                borderless
                // secondary
                style={{
                    // border: "none",
                    // boxShadow: "none",
                    // margin: 0,
                    // padding: 0,
                    //border: "1px solid",
                    //borderColor: "var(--color-grey-2)",
                    borderRadius: "24px",
                    borderBottomLeftRadius: "24px",
                    width: "100%",
                    // minWidth: "15rem",
                    // marginBottom: "0.5rem",
                    // border: "2px solid var(--color-grey-2)",
                    boxShadow: "none",

                    //maxWidth: "40rem",
                }}
            >
                {message ? (
                    <Menu.Item
                        style={{
                            fontSize:
                                mode === "desktop"
                                    ? "var(--chat-font-size)"
                                    : "var(--mobile-chat-font-size)",
                            // fontWeight: 400,
                            //background: "#f3f4f5",
                            // background: "var(--color-grey-1)",
                            //color: "rgba(0,0,0,.6)",
                            // color: "#000000",
                            //borderRadius: "24px",
                            //borderBottomLeftRadius: "0px",
                            // borderTopLeftRadius: "22px",
                            // borderTopRightRadius: "22px",
                            borderBottom: "1px solid var(--color-grey-1)",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            children={emoji.emojify(message)}
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
                    </Menu.Item>
                ) : null}
                {suggestionItems}
            </Menu>
        </div>
    );
};
export default Prompt;
