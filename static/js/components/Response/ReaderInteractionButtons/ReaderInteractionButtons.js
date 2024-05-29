import React from "react";
import posthog from "posthog-js";
import { Button } from "semantic-ui-react";
import ReaderView from "./ReaderView/ReaderView";
import SummarizeView from "./SummarizeView/SummarizeView";
import ExplainerView from "./ExplainerView/ExplainerView";

export default function ReaderInteractionButtons(props) {
    const {
        buttonSize,
        result,
        reader,
        loading,
        readerAvailable,
        type,
        cardIconColor,
    } = props;

    const handleOpenLink = (linkDetails, e) => {
        // New window for external links
        if (linkDetails.link) {
            window.open(linkDetails.link, "_blank");
            posthog.capture(linkDetails.event, {
                Action: linkDetails.action,
                Channel: linkDetails.channel,
                //Destination: linkDetails.destination ? linkDetails.destination : "",
            });
        }
    };

    switch (result.type) {
        case "download": {
            //console.log("Download file");
            switch (result.description.split(";")[0]) {
                case "application/pdf": {
                    return (
                        <ReaderView
                            type={type}
                            buttonSize={buttonSize}
                            result={result}
                            reader={reader}
                            loading={loading}
                            readerAvailable={true}
                        />
                    );
                }
                default: {
                    return (
                        <Button
                            // basic
                            // compact
                            //color="yellow"
                            // icon="cloud download"
                            // content={type === "button" ? null : "Download"}
                            className="lw-feedcard-actions"
                            content="Download"
                            download
                            size={buttonSize}
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: result.link,
                                        event: "Engagement",
                                        action: "Click",
                                        channel: "Download",
                                        destination: result.source,
                                    },
                                    e
                                )
                            }
                        />
                    );
                }
            }
        }
        case "videodownload": {
            //console.log("Download file");
            return (
                <Button
                    // basic
                    // compact
                    //color="yellow"
                    // icon="play"
                    // content={type === "button" ? null : "Play"}
                    className="lw-feedcard-actions"
                    content="Play"
                    size={buttonSize}
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Click"
                    data-Newsly-channel="Play"
                />
            );
        }

        default: {
            if (result.link.endsWith(".pdf")) {
                return (
                    <ReaderView
                        type={type}
                        buttonSize={buttonSize}
                        result={result}
                        reader={reader}
                        loading={loading}
                        readerAvailable={true}
                        cardIconColor={cardIconColor}
                    />
                );
            } else {
                return (
                    <React.Fragment>
                        <ReaderView
                            type={type}
                            buttonSize={buttonSize}
                            result={result}
                            reader={reader}
                            loading={loading}
                            readerAvailable={readerAvailable}
                            cardIconColor={cardIconColor}
                        />

                        <SummarizeView
                            type={type}
                            buttonSize={buttonSize}
                            result={result}
                            reader={reader}
                            loading={loading}
                            readerAvailable={readerAvailable}
                            cardIconColor={cardIconColor}
                        />
                        <ExplainerView
                            type={type}
                            buttonSize={buttonSize}
                            result={result}
                            reader={reader}
                            loading={loading}
                            readerAvailable={readerAvailable}
                            cardIconColor={cardIconColor}
                        />
                    </React.Fragment>
                );
            }
        }
    }
}
