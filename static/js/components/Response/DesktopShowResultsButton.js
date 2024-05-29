import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Button, Popup } from "semantic-ui-react";
import { UserContext } from "../../UserContext";

export default function DesktopShowResultsButton(props) {
    const { currentSearchId, query, additionalPrompt, handleShowPanel } = props;
    const { currentPanelResultId, showResults } = useContext(UserContext);
    const resultsVisible =
        showResults && currentSearchId === currentPanelResultId;

    const displayPopupContent = `${
        resultsVisible ? "Showing" : "See"
    } the full search results ${query ? `for '${query}'` : ""}${
        additionalPrompt ? `, ${additionalPrompt}` : "."
    }${
        resultsVisible
            ? ` Click any chat bubble to see the matching results panel. `
            : ""
    }`;

    const handleNoActionOnClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    return (
        <React.Fragment>
            {resultsVisible ? (
                <Popup
                    content={displayPopupContent}
                    trigger={
                        <Button
                            onClick={handleNoActionOnClick}
                            size="big"
                            color="blue"
                            circular
                            icon={
                                <FontAwesomeIcon
                                    icon={faArrowRight}
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                    }}
                                />
                            }
                            floated="right"
                            style={{
                                // display: `${!resultsVisible ? "none" : "block"}`,
                                marginRight: "-36px",
                                marginTop: "6px",
                                padding: "8px",
                                backgroundColor: "var(--color-Newsly)",
                            }}
                        />
                    }
                />
            ) : (
                <Button
                    onClick={handleShowPanel}
                    className="lw-show-results-button"
                    size="big"
                    color="grey"
                    circular
                    icon={
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            style={{
                                width: "18px",
                                height: "18px",
                            }}
                        />
                    }
                    floated="right"
                    style={{
                        marginRight: "-36px",
                        marginTop: "6px",
                        padding: "8px",
                        backgroundColor: "var(--color-grey-5)",
                    }}
                />
            )}
        </React.Fragment>
    );
}
