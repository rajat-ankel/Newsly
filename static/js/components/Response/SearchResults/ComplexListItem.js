import React, { useContext, useEffect, useState, useRef } from "react";
import Profiles from "../Profiles";
import NewsProfilesButtons from "../NewsProfilesButtons";
import NewsList from "../NewsResults/NewsList";
import { Card, Image, Icon, Button } from "semantic-ui-react";
import { UserContext } from "../../../UserContext";
import CardToolsMenu from "../CardToolsMenu";
import { escapeCode } from "../../../utils";
import lightOrDark from "../../../utilities/lightOrDark";
import { Slug } from "../utilitiesResponse";
import ColorLuminance from "../../../utilities/ColorLuminance";
import {
    FAVICON_PROXY,
    LAZYWEB_ROTATING_PROXY,
    CORS_PROXY,
} from "../../../constants";
import getDomainNameAndSubdomain from "../../../utilities/getDomainNameAndSubdomain";
import { useColor } from "color-thief-react";
import extractSiteSource from "../../../utilities/extractSiteSource";
import createOptimalDescription from "../../../utilities/createOptimalDescription";

const ComplexListItem = (props) => {
    const { result, officialWebsite, commands, refineSearch, query } = props;
    const { view } = useContext(UserContext);
    const cardRef = useRef(null);
    const [cardImageFailed, setCardImageFailed] = useState(false);
    // const defaultCardImage = cardImageSpecialHandler(result.image, result.link);
    // const [imageLoaded, setImageLoaded] = useState(false);

    const [cardImage, setCardImage] = useState(null);
    const [cardTitle, setCardTitle] = useState(
        result.title ? result.title : result.answer
    );

    const defaultCardDescription = createOptimalDescription(result);
    const [cardDescription, setCardDescription] = useState(
        result.link.toLowerCase().includes("wikipedia.org") &&
            result.results_type === "Entity"
            ? defaultCardDescription
            : "pending"
    );

    const [readerLoaded, setReaderLoaded] = useState(false);
    const [cardUpdatedForReader, setCardUpdatedForReader] = useState(false);

    const [cardDate, setCardDate] = useState(result.date ? result.date : null);

    // tldextract fails with some domains so use function with regex fallback
    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

    const [cardIconColor, setCardIconColor] = useState(null);
    const [cardIconLoaded, setCardIconLoaded] = useState(false);

    let cardSource = extractSiteSource(result);
    let displayQuote = null;

    const sourceFaviconUrl = result.favicon
        ? result.favicon
        : `${FAVICON_PROXY}/${domain}.ico`;

    const { data, loading, error } = useColor(
        CORS_PROXY + sourceFaviconUrl,
        "hex",
        {
            crossOrigin: "anonymous",
        }
    );

    function hideHeroImage(i) {
        setCardImageFailed(true);
        i.target.onerror = null;
        i.target.style.display = "none";
        i.target.parentElement.style.display = "none";
        return true;
    }
    function imgError(i, image) {
        i.target.onerror = hideHeroImage(i);
        i.target.src = `${LAZYWEB_ROTATING_PROXY}${image}`;
        i.target.parentElement.style.background = `linear-gradient(rgba(255, 255, 255, 0.86), rgba(32, 32, 32, 0.86) 94%, rgba(64, 64, 64, 0.86)),url(${LAZYWEB_ROTATING_PROXY}${image})`;
        return true;
    }

    useEffect(() => {
        // Set card icon color
        if (!loading && !error && !cardIconColor) {
            if (data && lightOrDark(data) === "light") {
                setCardIconColor(ColorLuminance(data, -0.4));
            } else {
                setCardIconColor(data);
            }
        }
    }, [cardIconColor, cardIconLoaded, sourceFaviconUrl, data, loading, error]);

    // Force card to update if there has been a change in readerLoaded
    useEffect(() => {
        if (readerLoaded && !cardUpdatedForReader) {
            setCardUpdatedForReader(true);
        }
    }, [readerLoaded, cardUpdatedForReader]);

    const descriptionWithSlug = `${
        Slug(cardDate) ? Slug(cardDate) + " - " : ""
    }${cardDescription && escapeCode(cardDescription)}`;

    return (
        <div>
            <Card
                className={`lw-results-view-${view} lw-results-view-complex-list-card-content`}
                centered
                fluid
                style={{
                    width: "86%",
                    maxWidth: "1000px",
                    border: "none",
                    boxShadow: "none",
                    marginRight: "auto",
                    marginLeft: "auto",
                }}
            >
                <Card.Content>
                    <Card.Meta
                        style={{
                            color: cardIconColor
                                ? cardIconColor
                                : "var(--color-black)",
                            paddingTop: "0rem",
                            paddingBottom: "0.5rem",
                            lineHeight: "1.25",
                            fontSize: "1.175rem",
                            display: "inline-block",
                            width: "100%",
                            margin: "0 0 0 0",
                        }}
                    >
                        {view === "complex-list" ? (
                            <Button.Group
                                size="large"
                                floated="right"
                                basic
                                compact
                            >
                                <CardToolsMenu
                                    refineSearch={refineSearch}
                                    result={result}
                                    context="list"
                                    commands={commands}
                                    cardIconColor={
                                        cardIconColor
                                            ? cardIconColor
                                            : "var(--color-black)"
                                    }
                                    setCardImage={setCardImage}
                                    cardImage={cardImage}
                                    setCardTitle={setCardTitle}
                                    cardTitle={cardTitle}
                                    setCardDescription={setCardDescription}
                                    cardDescription={cardDescription}
                                    setCardDate={setCardDate}
                                    cardDate={cardDate}
                                    readerLoaded={readerLoaded}
                                    setReaderLoaded={setReaderLoaded}
                                />
                            </Button.Group>
                        ) : null}
                        <a
                            onClick={(e) => e.stopPropagation()}
                            href={result.link}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="Result Link Source"
                            style={{
                                color: cardIconColor
                                    ? cardIconColor
                                    : "var(--color-grey-7)",
                            }}
                        >
                            <Image
                                src={sourceFaviconUrl}
                                style={{
                                    borderRadius: "4px",
                                    height: "20px",
                                    width: "20px",
                                    margin: "-4px 8px 0 0",
                                    display: "inline-block",
                                }}
                                onError={(i) =>
                                    (i.target.style.display = "none")
                                }
                                onLoad={(i) => {
                                    setCardIconLoaded(true);
                                }}
                            />
                            {cardSource}{" "}
                        </a>
                    </Card.Meta>
                    {cardImage ? (
                        <div style={{ float: "right", paddingTop: "0.75rem" }}>
                            <img
                                // onLoad={() => setImageLoaded(true)}
                                alt={result.title}
                                src={cardImage}
                                style={{
                                    height: "auto%",
                                    maxHeight: "16vh",
                                    maxWidth: "10vw",
                                    marginLeft: "2rem",
                                    marginRight: "2.5rem",
                                    marginBottom: "2rem",
                                    border: "1px white",
                                    borderRadius: "16px",

                                    backgroundColor: "rgba(0,0,0, 0.5)",
                                    boxShadow:
                                        "0 0 0 1px #d4d4d5, 0 2px 4px 0 rgb(34 36 38 / 12%), 0 2px 10px 0 rgb(34 36 38 / 15%)",
                                }}
                                onError={(i) => {
                                    if (cardImageFailed) {
                                        i.target.style.display = "none";
                                        i.target.parentElement.style.display =
                                            "none";
                                    } else {
                                        imgError(i, result.image);
                                    }
                                }}
                                data-Newsly-event="Engagement"
                                data-Newsly-action="Click"
                                data-Newsly-channel="Result Link Banner"
                            />
                        </div>
                    ) : null}
                    <Card.Header
                        className="lw-card-image-header"
                        as="a"
                        onClick={(e) => e.stopPropagation()}
                        href={result.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Result Link Title"
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: "500",
                            paddingBottom: "0.75rem",
                            paddingTop: "0.75rem",
                            width: "75%",
                        }}
                    >
                        {cardTitle}
                    </Card.Header>

                    <div>
                        <Card.Description
                            style={{
                                marginBottom: "1.2rem",
                                marginRight: "6rem",
                            }}
                        >
                            <div
                                ref={cardRef}
                                dangerouslySetInnerHTML={{
                                    __html:
                                        cardDescription &&
                                        cardDescription !== "pending"
                                            ? descriptionWithSlug
                                            : defaultCardDescription,
                                }}
                            />
                            {displayQuote &&
                            (displayQuote.trim().length >
                                cardDescription.trim().length ||
                                !cardDescription
                                    .trim()
                                    .startsWith(
                                        displayQuote.trim().substr(0, 32)
                                    )) &&
                            !(
                                result.answer === "Video gallery" ||
                                result.answer === "Image gallery"
                            ) ? (
                                <div
                                    style={{
                                        margin: "1rem 1rem 0.5rem 1rem",
                                        color: "rgba(0,0,0,.50)",
                                    }}
                                >
                                    <Icon
                                        size="tiny"
                                        name="quote left"
                                        style={{ verticalAlign: "super" }}
                                    />
                                    {` ${displayQuote} `}
                                    <Icon
                                        size="tiny"
                                        name="quote right"
                                        style={{ verticalAlign: "super" }}
                                    />
                                </div>
                            ) : null}
                        </Card.Description>
                    </div>

                    {result.profiles && result.link.includes("wikipedia") ? (
                        <blockquote>
                            <Profiles
                                officialWebsite={officialWebsite}
                                profiles={result.profiles}
                                entityName={result.title}
                                commands={commands}
                                refineSearch={refineSearch}
                                query={query}
                                result={result}
                            />
                        </blockquote>
                    ) : (
                        <Card.Meta
                            as="a"
                            onClick={(e) => e.stopPropagation()}
                            href={result.link}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="Result Link Citation"
                            className="lw-citation-button"
                        >
                            <Image
                                src={sourceFaviconUrl}
                                style={{
                                    borderRadius: "4px",
                                    heigh: "16px",
                                    width: "16px",
                                    margin: "2px 8px 4px 0px",
                                    display: "inline-block",
                                }}
                                alt={domain}
                                // align="left"
                                onError={(i) =>
                                    (i.target.style.display = "none")
                                }
                            />
                            {domain}{" "}
                        </Card.Meta>
                    )}
                    {result.news_profiles && result.news_profiles.length > 0 ? (
                        result.link.includes("wikipedia") ? (
                            <div
                                style={{
                                    marginTop: "0",
                                    marginLeft: "0.5rem",
                                    paddingTop: "1rem",
                                    borderTop: "1px solid lightgrey",
                                }}
                            >
                                <NewsProfilesButtons
                                    profiles={result.news_profiles}
                                    entityName={result.title}
                                    commands={commands}
                                    refineSearch={refineSearch}
                                    query={query}
                                />
                            </div>
                        ) : null
                    ) : null}
                </Card.Content>
            </Card>

            {result.news && false ? (
                <NewsList
                    news={result.news}
                    commands={commands}
                    refineSearch={refineSearch}
                    query={query}
                    result={result}
                />
            ) : null}

            {/* <Divider/> */}
        </div>
    );
};

export default ComplexListItem;
