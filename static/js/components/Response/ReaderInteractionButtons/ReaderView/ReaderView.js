import React, { useState, useContext } from "react";
import { Modal, Button, Image } from "semantic-ui-react";
import posthog from "posthog-js";
// import tldExtract from "tld-extract";
import { CORS_PROXY } from "../../../../constants";
import PdfReaderContent from "./PdfReaderContent";
import WebReaderContent from "./WebReaderContent";
import ShareButton from "../../ShareButton";
// import { isMobileDevice } from "../../../../utils";
import getDomainNameAndSubdomain from "../../../../utilities/getDomainNameAndSubdomain";
import extractSiteSource from "../../../../utilities/extractSiteSource";
import { FAVICON_PROXY } from "../../../../constants";
import { UserContext } from "../../../../UserContext";

export default function ReaderView(props) {
    const [open, setOpen] = useState(false);
    const {
        result,
        reader,
        loading,
        readerAvailable,
        cardIconColor,
        buttonClass,
    } = props;
    const { mode } = useContext(UserContext);
    // let domain = "";
    // try {
    //     domain = tldExtract(result.link).domain;
    // } catch (error) {
    //     domain = result.source;
    // }

    // tldextract fails with some domains so use function with regex fallback
    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

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

    const handleBack = (linkDetails, e) => {
        setOpen(false);
        posthog.capture(linkDetails.event, {
            Action: linkDetails.action,
            Channel: linkDetails.channel,
            //Destination: linkDetails.destination ? linkDetails.destination : "",
        });
    };

    // Special handling for yahoo lists missing actual content
    const readDisabled =
        (readerAvailable &&
            result.link.includes("yahoo.com") &&
            reader.content &&
            (reader.content.startsWith("<ul ") ||
                reader.content.startsWith("<head></head><body><ul>"))) ||
        (!readerAvailable &&
            !(result.type === "download" || result.link.endsWith(".pdf")));

    const sourceFaviconUrl = result.favicon
        ? result.favicon
        : `${FAVICON_PROXY}/${domain}.ico`;

    let displaySource = extractSiteSource(result);
    if (displaySource === null) {
        displaySource = result.source ? result.source : domain;
    }
    const actionText = result.type === "download" ? "Download" : "View";
    const viewButtonText =
        displaySource && displaySource.length > 20 && mode === "mobile"
            ? actionText + " on " + domain
            : actionText + " on " + displaySource;

    return (
        <Modal
            //style={{padding: "0.5rem 0.2rem 0.5rem 0.2rem!important", height: "98vh"}}
            className="long lw-reader-modal"
            closeIcon={false}
            size="large"
            centered={false}
            open={open}
            dimmer={mode === "desktop" ? "blurring" : "inverted"}
            onClose={() => setOpen(false)}
            onOpen={() => {
                setOpen(true);
                posthog.capture("Engagement", {
                    Action: "View",
                    Channel:
                        result.type === "download" ||
                        result.link.endsWith(".pdf")
                            ? "View PDF"
                            : "View in Reader",
                });
                //console.log("Open modal");
            }}
            trigger={
                <Button
                    className={
                        readDisabled
                            ? "lw-feedcard-actions-disabled"
                            : buttonClass
                            ? buttonClass
                            : "lw-feedcard-actions"
                    }
                    style={{ paddingLeft: "1.25vw" }}
                    compact
                    loading={loading}
                    disabled={readDisabled || loading}
                >
                    {result.type === "download" ||
                    result.link.endsWith(".pdf") ? (
                        <div>View</div>
                    ) : (
                        <div>Read</div>
                    )}
                </Button>
            }
        >
            {result.type === "download" || result.link.endsWith(".pdf") ? (
                <PdfReaderContent
                    pdf={CORS_PROXY + result.link}
                    result={result}
                    reader={reader}
                    cardIconColor={cardIconColor}
                />
            ) : reader && !loading ? (
                <WebReaderContent
                    result={result}
                    reader={reader}
                    loading={loading}
                    cardIconColor={cardIconColor}
                />
            ) : null}
            <Modal.Actions style={{ padding: "0.25rem 0px!important" }}>
                <Button.Group size="small" floated="left">
                    <Button
                        //onClick={() => setOpen(false)}
                        onClick={(e) =>
                            handleBack(
                                {
                                    link: result.link,
                                    event: "Engagement",
                                    action: "View",
                                    channel:
                                        result.type === "download" ||
                                        result.link.endsWith(".pdf")
                                            ? "Close PDF Viewer"
                                            : "Close Reader View",
                                    destination: null,
                                },
                                e
                            )
                        }
                        icon={{ name: "left chevron", size: "big", color: "black", style: {marginTop: "-6px"}}}
                        basic
                        compact
                        content="Back"
                        style={{ marginTop: "5px" }}
                        //size={buttonSize}
                    />
                </Button.Group>

                <Button.Group size="small">
                    <Button
                        float="right"
                        icon
                        basic
                        compact
                        style={{
                            borderRadius: "24px",
                            backgroundColor: "white",
                            border: "1px solid #e0e1e2",
                            padding: "0.75rem 1.5rem 0.75rem 1.5rem",
                        }}
                        download={result.type === "download" ? true : false}
                        onClick={(e) =>
                            handleOpenLink(
                                {
                                    link: result.link,
                                    event: "Engagement",
                                    action: "Click",
                                    channel: "Open Link from Reader",
                                    destination: domain,
                                },
                                e
                            )
                        }
                    >
                        <Image
                            src={sourceFaviconUrl}
                            style={{
                                width: "16px",
                                height: "16px",
                                display: "inline",
                                marginRight: "8px",
                                marginTop: "-3px",
                            }}
                            float="left"
                        />
                        <strong>{viewButtonText}</strong>
                    </Button>
                    {/* <Button
                        //size={buttonSize}
                        icon="external"
                        content={
                            result.type === "download"
                                ? `Download from ${
                                      result.source ? result.source : domain
                                  }`
                                : `Open on ${
                                      result.source ? result.source : domain
                                  }`
                        }
                        basic
                        compact
                        download={result.type === "download" ? true : false}
                        onClick={(e) =>
                            handleOpenLink(
                                {
                                    link: result.link,
                                    event: "Engagement",
                                    action: "Click",
                                    channel: "Download File",
                                    destination: domain,
                                },
                                e
                            )
                        }
                    /> */}
                    <ShareButton
                        result={result}
                        //buttonSize="large"
                    />
                </Button.Group>
            </Modal.Actions>
        </Modal>
    );
}
