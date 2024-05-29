import React from "react";
import posthog from "posthog-js";
import { Card, Image, Popup } from "semantic-ui-react";

const CitationButton = (props) => {
    const { image, link, sourceString, title, type } = props;

    const handleLinkClick = (e) => {
        // open link in new tab with noopener noreferrer
        window.open(link, "_blank");
        // track event with posthog
         posthog.capture("Engagement", {
             Action: "View",
             Channel:
                 type === "official_website"
                     ? "Result Link Official Site"
                     : "Result Link Top Match",
         });
    };

    return (
        <Popup
            content={title}
            // position="top center"
            // style={{ zIndex: 9999 }}
            on="hover"
            // content="testing"
            trigger={
                <Card
                    className="lw-citation-card"
                    onClick={handleLinkClick}
                    style={{
                        border: "2px solid lightgrey",
                        borderRadius: "9999px",
                        padding: "0",
                        margin: "0",
                        textAlign: "left",
                        color: "black",
                        width: "fit-content",
                        boxShadow: "none",
                        position: "relative",
                    }}
                >
                    <Card.Content
                        style={{
                            padding: "0",
                            borderRadius: "9999px",
                            boxShadow: "none",
                            margin: "0",
                        }}
                    >
                        <Image
                            rounded
                            floated="left"
                            src={image}
                            size="mini"
                            style={{
                                margin: "0.5rem 4px 0px 10px",
                                width: "16px",
                                height: "16px",
                            }}
                        />
                        <Card.Meta
                            style={{
                                padding: "0 0 0 0",
                                marginLeft: "0.25rem",
                            }}
                        >
                            {sourceString}
                        </Card.Meta>
                    </Card.Content>
                </Card>
            }
        />
    );
};

export default CitationButton;
