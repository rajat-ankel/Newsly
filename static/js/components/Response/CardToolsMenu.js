import React, { useContext, useState, useEffect, createRef } from "react";
import posthog from "posthog-js";
import { Dropdown, Ref } from "semantic-ui-react";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";
import { UserContext } from "../../UserContext";
import ReaderView from "./ReaderInteractionButtons/ReaderView/ReaderView";
import SummarizeView from "./ReaderInteractionButtons/SummarizeView/SummarizeView";
import ExplainerView from "./ReaderInteractionButtons/ExplainerView/ExplainerView";
import readerScore from "../../utilities/readerScore";
import { getReader } from "../../utilities/getReader";
import { cardImageSpecialHandler } from "./utilitiesResponse";
import { extractDate, isBlocked } from "../../utils";
import textDiscriminator from "../../utilities/textDiscriminator";
import createOptimalDescription from "../../utilities/createOptimalDescription";

export default function CardToolsMenu(props) {
    const {
        result,
        refineSearch,
        commands,
        context,
        cardIconColor,
        cardImage,
        setCardImage,
        cardDescription,
        setCardDescription,
        cardDate,
        setCardDate,
        cardTitle,
        type,
        setCardTitle,
        readerLoaded,
        setReaderLoaded,
    } = props;
    const { setChatUpdateRequired } = useContext(UserContext);

    let refineHistory =
        commands && commands.refineHistory ? commands.refineHistory : "";
    let refineHistoryQuery =
        commands && commands.refineHistoryQuery
            ? commands.refineHistoryQuery
            : "";

    // tldextract fails with some domains so use function with regex fallback
    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

    function cleanupReaderMetadataText(text) {
        text = text
            .replaceAll("&hellip;", "...")
            .replaceAll("\\xa0", " ")
            .replaceAll("\xa0", " ")
            .replaceAll("\\u00a0", " ")
            .replaceAll("\u00a0", " ");
        return text;
    }

    const [reader, setReader] = useState({});
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const lookupReader = async (item) => {
            try {
                setLoading(true);
                const readerLookup = await getReader(item);
                if (readerLookup && readerLookup.content) {
                    const itemReaderScore = readerScore(
                        readerLookup.content,
                        140
                    );
                    setScore(itemReaderScore);
                    setReader(readerLookup);
                } else if (readerLookup && readerLookup.error) {
                    setReader(readerLookup);
                }
            } catch (error) {
                setLoading(false);
            }
        };

        if (context !== "feed") {
            if (!isBlocked(result.link) && !reader.content && !reader.error) {
                lookupReader(result);
            } else if (isBlocked(result.link)) {
                if (cardDescription === "pending") {
                    setCardDescription(createOptimalDescription(result));
                }
            }
        }
    }, [
        result,
        setCardDescription,
        cardDescription,
        reader,
        readerLoaded,
        context,
    ]);

    useEffect(() => {
        if (setReaderLoaded) {
            if (reader && (reader.content || reader.error) && loading) {
                setLoading(false);
                setReaderLoaded(true);
            }
        }
    }, [reader, setReaderLoaded, readerLoaded, loading]);

    // Once the ready is loaded, set the card description, title, image, and date
    useEffect(() => {
        if (readerLoaded) {
            if (reader && reader.content) {
                // Set description and title
                let newDescription = createOptimalDescription(
                    result,
                    cleanupReaderMetadataText(reader.excerpt)
                );
                const newTitle = textDiscriminator(
                    cardTitle,
                    cleanupReaderMetadataText(reader.title),
                    result
                );
                // Check that the new description does not start with the same first 50 characters as the new title
                if (
                    newDescription.substring(0, 50) ===
                    newTitle.substring(0, 50)
                ) {
                    newDescription = createOptimalDescription(result);
                }
                if (
                    cardDescription !== newDescription &&
                    (!cardDescription || cardDescription === "pending")
                ) {
                    setCardDescription(newDescription);
                }

                if (cardTitle !== newTitle) {
                    setCardTitle(newTitle);
                }

                // Set date
                if (setCardDate && !cardDate && reader.date_published) {
                    setCardDate(reader.date_published);
                } else if (setCardDate && !cardDate) {
                    const cardDateFromUrl = extractDate(result.link);
                    if (cardDateFromUrl) {
                        setCardDate(cardDateFromUrl);
                    }
                }

                // Set image
                const defaultCardImage = cardImageSpecialHandler(
                    result.image,
                    result.link
                );
                if (
                    !(result.results_type === "Entity" && result.image) &&
                    reader.lead_image_url &&
                    reader.lead_image_url.startsWith("http")
                ) {
                    const newCardImage = cardImageSpecialHandler(
                        reader.lead_image_url.includes("%20")
                            ? reader.lead_image_url.substring(
                                  0,
                                  reader.lead_image_url.indexOf("%20")
                              )
                            : reader.lead_image_url,
                        result.link
                    );
                    setCardImage && newCardImage && setCardImage(newCardImage);
                } else {
                    setCardImage && setCardImage(defaultCardImage);
                }
            } else {
                if (setCardDate && !cardDate) {
                    const cardDateFromUrl = extractDate(result.link);
                    if (cardDateFromUrl) {
                        setCardDate(cardDateFromUrl);
                    }
                }
                if (reader && reader.error) {
                    if (cardDescription === "pending") {
                        setCardDescription(createOptimalDescription(result));
                    }
                }
            }
        }
    }, [
        reader,
        readerLoaded,
        cardDescription,
        setCardDescription,
        result,
        cardImage,
        setCardImage,
        cardDate,
        setCardDate,
        cardTitle,
        setCardTitle,
    ]);

    useEffect(() => {
        return () => {
            setReader({});
            setLoading(false);
            setScore(0);
        };
    }, []);

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

    const handleRefineSearch = (linkDetails, e) => {
        // Pass through refineSearch details
        // console.log("Refine search", linkDetails);
        const refineProps = {
            setChatUpdateRequired: setChatUpdateRequired,
            test: "woohoo",
        };
        refineSearch(
            linkDetails.destination,
            linkDetails.refineType,
            refineHistory,
            refineHistoryQuery,
            refineProps,
            e
        );
        posthog.capture(linkDetails.event, {
            Action: linkDetails.action,
            Channel: linkDetails.channel,
            //Destination: linkDetails.destination ? linkDetails.destination : "",
        });
    };

    const handleDropdownButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const dropdownMenu = createRef();

    return (
        <Ref innerRef={dropdownMenu}>
            <Dropdown
                button
                icon={
                    context === "card" || context === "grid"
                        ? "ellipsis horizontal"
                        : "ellipsis horizontal"
                }
                disabled={!(result.topic || domain || refineSearch)} //{!(result.topic || domain || refineSearch)}
                text={context === "panel" ? "Tools" : null}
                upward={context === "feed"}
                floating
                className={
                    context === "feed"
                        ? "lw-feedcard-tools"
                        : context === "grid"
                        ? "lw-gridcard-tools"
                        : "lw-card-tools"
                }
                style={{
                    margin: "0.75rem auto 0 auto",
                    padding: "0 0 0 0",
                    textAlign: "center",
                    backgroundColor: "white",
                    border: "1px solid rgb(224, 224, 224)",
                }}
            >
                <Dropdown.Menu direction="left">
                    {reader && score > 20 && context !== "feed" ? (
                        <Dropdown.Item
                            onClick={(e) => handleDropdownButtonClick(e)}
                            style={{
                                paddingBottom: "0",
                                paddingTop: "1.5rem",
                                marginBottom: "0",
                            }}
                            className="lw-card-tools-content-actions"
                        >
                            <React.Fragment>
                                <ReaderView
                                    type={type}
                                    buttonSize="mini"
                                    result={result}
                                    reader={reader}
                                    loading={loading}
                                    readerAvailable={score > 20}
                                    cardIconColor={cardIconColor}
                                    buttonClass="lw-card-tools-actions"
                                />

                                <SummarizeView
                                    type={type}
                                    buttonSize="mini"
                                    result={result}
                                    reader={reader}
                                    loading={loading}
                                    readerAvailable={score > 20}
                                    cardIconColor={cardIconColor}
                                    buttonClass="lw-card-tools-actions"
                                />
                                <ExplainerView
                                    type={type}
                                    buttonSize="mini"
                                    result={result}
                                    reader={reader}
                                    loading={loading}
                                    readerAvailable={score > 20}
                                    cardIconColor={cardIconColor}
                                    buttonClass="lw-card-tools-actions"
                                />
                            </React.Fragment>
                        </Dropdown.Item>
                    ) : null}

                    {(result.topic || domain || refineSearch) &&
                    context !== "feed" &&
                    score > 20 ? (
                        <Dropdown.Divider style={{ marginBottom: "0px" }} />
                    ) : null}

                    {domain && refineSearch ? (
                        <Dropdown.Item
                            icon="search plus"
                            text={`More results from ${domain}`}
                            onClick={(e) =>
                                handleRefineSearch(
                                    {
                                        event: "Engagement",
                                        action: "Refine",
                                        channel: "More Results from Domain",
                                        destination: domain,
                                        refineType: "domain",
                                    },

                                    e
                                )
                            }
                        />
                    ) : null}
                    {domain && refineSearch ? (
                        <Dropdown.Item
                            style={{ wordWrap: "break-word", flex: "inherit" }}
                            icon="boxes"
                            text={`Similar pages`}
                            onClick={(e) =>
                                handleRefineSearch(
                                    {
                                        event: "Engagement",
                                        action: "Refine",
                                        channel: "Similar Pages",
                                        destination: domain,
                                        refineType: "related",
                                    },
                                    e
                                )
                            }
                        />
                    ) : null}

                    {result.topic && refineSearch ? (
                        <Dropdown.Item
                            icon="filter"
                            text={`Filter to results about ${result.topic}`}
                            onClick={(e) =>
                                handleRefineSearch(
                                    {
                                        event: "Engagement",
                                        action: "Refine",
                                        channel: "Filter to Topic",
                                        destination: result.topic,
                                        refineType: "topic",
                                    },
                                    e
                                )
                            }
                        />
                    ) : null}
                    {result.link ? (
                        <Dropdown.Item
                            as="a"
                            icon="google"
                            text="Check for Cached version (Google)"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://webcache.googleusercontent.com/search?q=cache:${
                                            result.link?.split("://")[1]
                                        }`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Cached Version",
                                    },
                                    e
                                )
                            }
                        />
                    ) : null}

                    <Dropdown.Item
                        as="a"
                        icon="unlock alternate"
                        text="Security and Privacy Info"
                        onClick={(e) =>
                            handleOpenLink(
                                {
                                    link: `https://noscript.net/about/${domain};${domain}`,
                                    event: "Engagement",
                                    action: "Tools",
                                    channel: "Security and Privacy Info",
                                    destination: domain,
                                },
                                e
                            )
                        }
                    />
                </Dropdown.Menu>
            </Dropdown>
        </Ref>
    );
}
