import React, { useState, useContext, useEffect } from "react";
import {
    Modal,
    Button,
    Image,
    Loader,
    Dimmer,
    Segment,
    Message,
} from "semantic-ui-react";
import posthog from "posthog-js";
import { UserContext } from "../../../../UserContext";
import { getSummary } from "../../../../utilities/getSummary";
import { FAVICON_PROXY } from "../../../../constants";
import getDomainNameAndSubdomain from "../../../../utilities/getDomainNameAndSubdomain";
import extractSiteSource from "../../../../utilities/extractSiteSource";

export default function SummarizeView(props) {
    const [open, setOpen] = useState(false);
    const [summary, setSummary] = useState("");
    const [summaryCollectionRequired, setSummaryCollectionRequired] =
        useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const { result, reader, loading, readerAvailable, buttonClass } = props;
    const { mode } = useContext(UserContext);

    const handleClose = (linkDetails, e) => {
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

    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }
    const sourceFaviconUrl = result.favicon
        ? result.favicon
        : `${FAVICON_PROXY}/${domain}.ico`;

    let displaySource = extractSiteSource(result);
    if (displaySource === null) {
        displaySource = result.source ? result.source : domain;
    }
    const viewButtonText =
        displaySource && displaySource.length > 20 && mode === "mobile"
            ? "Open on " + domain
            : "Open on " + displaySource;

    const handleSummarize = async (linkDetails, e) => {
        setSummaryLoading(true);
        setSummaryCollectionRequired(true);
        setOpen(true);
        posthog.capture("Engagement", {
            Action: "Summarize",
            Channel: "View Summary",
        });
    };

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

    // Pickup the summary text using await from the getSummary function and set it to the summary state once available
    useEffect(() => {
        const lookupSummary = async (link) => {
            let summaryLookup = await getSummary(link);
            if (summaryLookup && typeof summaryLookup === "string") {
                setSummary(summaryLookup);
                setSummaryCollectionRequired(false);
                setSummaryLoading(false);
            } else {
                setSummaryLoading(false);
                setSummaryCollectionRequired(false);
            }
        };
        if (summaryCollectionRequired) {
            lookupSummary(result.link);
        }
    }, [result, summary, summaryCollectionRequired]);

    return (
        <Modal
            closeIcon={false}
            size="tiny"
            centered={false}
            open={open}
            dimmer="blurring"
            onClose={() => setOpen(false)}
            onOpen={() => {
                handleSummarize(result.link);
            }}
            trigger={
                <Button
                    style={{ paddingLeft: "1.25vw" }}
                    content="Summarize"
                    loading={loading}
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Click"
                    data-Newsly-channel="Summarize"
                    compact
                    className={
                        readDisabled
                            ? "lw-feedcard-actions-disabled"
                            : buttonClass
                            ? buttonClass
                            : "lw-feedcard-actions"
                    }
                    disabled={readDisabled || loading}
                ></Button>
            }
        >
            <Modal.Header>
                Summarize
                <Modal
                    centered={false}
                    closeIcon={true}
                    content={
                        "This summary was generated by AI from the page content on " +
                        displaySource +
                        ". See the Read view or Visit the site to see the full content."
                    }
                    header={"Where does this summary come from?"}
                    trigger={
                        <div style={{ float: "right" }}>
                            <Button
                                icon="info"
                                size="tiny"
                                circular
                                basic
                                compact
                            />
                            <Button
                                onClick={(e) =>
                                    handleClose(
                                        {
                                            link: result.link,
                                            event: "Engagement",
                                            action: "Summarize",
                                            channel: "Close Summary",
                                            destination: null,
                                        },
                                        e
                                    )
                                }
                                icon="close"
                                positive
                                content="Close"
                                basic
                                size="tiny"
                                compact
                                style={{
                                    borderRadius: "24px",
                                    display: "inline-block",
                                }}
                            />
                        </div>
                    }
                />
            </Modal.Header>

            <Modal.Content scrolling>
                {/* <Header style={{ fontSize: "1.4rem"}}>{result.title}</Header> */}
                <Modal.Description>
                    <Segment
                        style={{
                            border: "none",
                            boxShadow: "none",
                            // padding: "0",
                            // margin: "0",
                            width: "90%",
                            margin: "0 auto",
                            fontSize: "1.4rem",
                            lineHeight: "1.5rem",
                        }}
                    >
                        <Dimmer active={summaryLoading} inverted>
                            <Loader inverted content="Generating summary" />
                        </Dimmer>

                        {summaryCollectionRequired ? (
                            <React.Fragment>
                                <p>
                                    <Image src="/assets/placeholders/placeholder-short-paragraph.png" />
                                </p>
                                <p>
                                    <Image src="/assets/placeholders/placeholder-short-paragraph.png" />
                                </p>
                                <p>
                                    <Image src="/assets/placeholders/placeholder-short-paragraph.png" />
                                </p>
                            </React.Fragment>
                        ) : summary ? (
                            <p>{summary}</p>
                        ) : (
                            <Message warning>
                                Sorry, I wasn't able to generate a summary for
                                this page. If you like, please wait a few
                                minutes and try again.
                            </Message>
                        )}
                    </Segment>
                </Modal.Description>
            </Modal.Content>

            <Modal.Actions style={{ padding: "0.25rem 0px!important" }}>
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
            </Modal.Actions>
        </Modal>
    );
}
