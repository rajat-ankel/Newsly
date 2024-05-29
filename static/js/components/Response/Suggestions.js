import React from "react";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { addUserMessage } from "react-chat-widget";

const Suggestions = (props) => {
    const { suggestions, handleNewUserMessage } = props;

    const onClickSuggestion = (event, suggestion) => {
        addUserMessage(suggestion.title);
        handleNewUserMessage(suggestion.command);
    };

    const suggestionButtons =
        suggestions && suggestions.length > 0
            ? suggestions.map((suggestion, index) => {
                  if (suggestion) {
                      if (suggestion.command) {
                          return (
                              <Button
                                  size="tiny"
                                  className="lw-suggestions-button"
                                  color={
                                      suggestion.color ? suggestion.color : null
                                  }
                                  compact
                                  basic
                                  key={index + ": " + suggestion.title}
                                  value={suggestion.command}
                                  content={suggestion.title}
                                  onClick={(e) =>
                                      onClickSuggestion(e, suggestion)
                                  }
                                  data-Newsly-event="Engagement"
                                  data-Newsly-action="Click"
                                  data-Newsly-channel="Suggested Search"
                              />
                          );
                      } else if (suggestion.link.startsWith("/")) {
                          return (
                              <Button
                                  to={suggestion.link}
                                  as={Link}
                                  size="tiny"
                                  className="lw-suggestions-button"
                                  compact
                                  color={
                                      suggestion.color ? suggestion.color : null
                                  }
                                  basic
                                  key={index + ": " + suggestion.title}
                                  content={suggestion.title}
                                  data-Newsly-event="Engagement"
                                  data-Newsly-action="Click"
                                  data-Newsly-channel={`Suggested Page - ${suggestion.link
                                      ?.split("/")[1]
                                      .replace(/^\w/, (c) => c.toUpperCase())}`}
                              />
                          );
                      } else if (suggestion.link) {
                          return (
                              <Button
                                  size="tiny"
                                  className="lw-suggestions-button"
                                  compact
                                  color={
                                      suggestion.color ? suggestion.color : null
                                  }
                                  basic
                                  key={index + ": " + suggestion.title}
                                  content={suggestion.title}
                                  as="a"
                                  onClick={(e) => e.stopPropagation()}
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

    return <div className="lw-suggestions">{suggestionButtons}</div>;
};
export default Suggestions;
