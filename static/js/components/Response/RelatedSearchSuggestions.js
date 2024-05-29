import React from "react";
import posthog from "posthog-js";
import { Dropdown } from "semantic-ui-react";
import { addUserMessage } from "react-chat-widget";

const RelatedSearchSuggestions = (props) => {
    const { suggestions, handleNewUserMessage } = props;

    const onClickSuggestion = (event, suggestion) => {
        posthog.capture("Engagement", {
            Action: "Click",
            Channel: "Related Search",
        });
        addUserMessage(suggestion);
        handleNewUserMessage(suggestion);
    };

    const suggestionItems =
        suggestions && suggestions.length > 0
            ? suggestions.map((suggestion) => {
                  if (suggestion) {
                      return (
                          <Dropdown.Item
                              //icon="search plus"
                              key={suggestion}
                              text={suggestion}
                              value={suggestion}
                              className="lw-dropdown-text"
                              onClick={(e) => onClickSuggestion(e, suggestion)}
                          />
                      );
                  } else {
                      return null;
                  }
              })
            : null;

    return (
        <React.Fragment>
            <Dropdown.Header content="Related Searches" />
            {suggestionItems}
        </React.Fragment>
    );
};
export default RelatedSearchSuggestions;
