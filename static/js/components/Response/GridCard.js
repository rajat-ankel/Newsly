import React, { useState, useContext, useEffect, useRef } from "react";
import { Card, Image, Button, Feed } from "semantic-ui-react";
import { useColor } from "color-thief-react";
import {
    FAVICON_PROXY,
    LAZYWEB_ROTATING_PROXY,
    CORS_PROXY,
} from "../../constants";
import { cardImageSpecialHandler, Slug } from "./utilitiesResponse";
import CardToolsMenu from "./CardToolsMenu";
import lightOrDark from "../../utilities/lightOrDark";
import ColorLuminance from "../../utilities/ColorLuminance";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";
import extractSiteSource from "../../utilities/extractSiteSource";
import imageDiscriminator from "../../utilities/imageDiscriminator";
import createOptimalDescription from "../../utilities/createOptimalDescription";
import { UserContext } from "../../UserContext";

const GridCard = (props) => {
    const { result, refineSearch, commands } = props;
    const { mode } = useContext(UserContext);

    const [cardIconColor, setCardIconColor] = useState(null);
    const [cardIconLoaded, setCardIconLoaded] = useState(false);
    const imageRef = useRef();
    const [readerLoaded, setReaderLoaded] = useState(false);
    const [cardUpdatedForReader, setCardUpdatedForReader] = useState(false);

    const [cardBackground, setCardBackground] = useState(
        "linear-gradient(rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.25) 30%, white)"
    );
    const [cardBackgroundColor, setCardBackgroundColor] = useState("white");
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageType, setImageType] = useState(null);
    const [cardImagePaddingHeight, setCardImagePaddingHeight] =
        useState("2rem");

    const [cardImageFailed, setCardImageFailed] = useState(false);
    const [cardImage, setCardImage] = useState(null);

    const [cardTitle, setCardTitle] = useState(
        result.title ? result.title : result.answer
    );
    const [cardDate, setCardDate] = useState(result.date ? result.date : null);

    const defaultCardDescription = createOptimalDescription(result);
    const [cardDescription, setCardDescription] = useState(
        result.link.toLowerCase().includes("wikipedia.org") &&
            result.results_type === "Entity"
            ? defaultCardDescription
            : "pending"
    );

    const {
        domain,
        // sub
    } =
        result.link &&
        getDomainNameAndSubdomain(result.link.replace("www.", ""));

    const sourceFaviconUrl = result.favicon
        ? result.favicon
        : `${FAVICON_PROXY}/${domain}.ico`;

    let cardSource = extractSiteSource(result);

    const heroImageHeight = mode === "desktop" ? 55 : 30; // Was 36 max and 40 max

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
        return true;
    }

    // Get the favicon color information
    const { data, loading, error } = useColor(
        CORS_PROXY + sourceFaviconUrl,
        "hex",
        {
            crossOrigin: "anonymous",
        }
    );
    useEffect(() => {
        // Set card icon color
        if (!loading && !error && !cardIconColor) {
            // console.log("iconImage", sourceFaviconUrl, "Color", data);
            if (data && lightOrDark(data) === "light") {
                setCardIconColor(ColorLuminance(data, -0.4));
            } else {
                setCardIconColor(data);
            }
        }
    }, [cardIconColor, sourceFaviconUrl, data, loading, error, cardIconLoaded]);

    useEffect(() => {
        const getImageDetails = async () => {
            const { imgType, cardPaddingHeightRelative } =
                await imageDiscriminator(imageRef, result);

            if (
                // Replace the image for entities if small or missing
                result.results_type === "Entity" &&
                result.link.includes("wikipedia") &&
                (imgType === "borderImg" || imgType === "noImg") &&
                result.images &&
                result.images.length > 0
            ) {
                // Get the first image
                const replacementImage = result.images[0].image;
                setImageLoaded(false);
                setCardImage(
                    cardImageSpecialHandler(replacementImage, result.link)
                );
            } else {
                // Set the image type and background
                // Adjust the image padding height to fit screen size
                const cardImageHeightPixels =
                    (cardPaddingHeightRelative / 100) * window.innerWidth;
                const cardImageVerticalScreenPercent =
                    (cardImageHeightPixels / window.innerHeight) * 100;

                let newCardPaddingHeightRelative =
                    cardImageVerticalScreenPercent > heroImageHeight
                        ? heroImageHeight
                        : cardPaddingHeightRelative;

                let imageScaleDimension =
                    cardImageVerticalScreenPercent > heroImageHeight
                        ? "vh"
                        : "vw";

                const bgImageHeight = `${
                    newCardPaddingHeightRelative * 0.9
                }${imageScaleDimension}`;
                const bgImageHeightFade = `${
                    newCardPaddingHeightRelative * 1.1
                }${imageScaleDimension}`;

                // Default: linear-gradient(rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.25) 30%, white)
                const bgOverlayMedia = `linear-gradient(rgb(211,211,211,0.25) 0.1rem, transparent 2rem, transparent ${bgImageHeight}, rgb(211,211,211,0.25) ${bgImageHeightFade}, rgb(255,255,255,0.98) 100%)`;
                const bgOverlayBorder = `linear-gradient(rgb(211,211,211,0.1) 30%, white)`;
                const bgOverlayCard = `linear-gradient(rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 50%, white)`;

                setCardBackground(
                    imgType === "cardImg"
                        ? bgOverlayCard
                        : imgType === "mediaImg"
                        ? bgOverlayMedia
                        : imgType === "borderImg"
                        ? bgOverlayBorder
                        : cardBackground
                );
                setCardBackgroundColor(
                    imgType !== "noImg"
                        ? "transparent"
                        : cardIconColor
                        ? cardIconColor
                        : "var(--color-grey-5)"
                );

                const cardPaddingHeightString =
                    imgType === "cardImg"
                        ? "0"
                        : imgType === "mediaImg"
                        ? `${newCardPaddingHeightRelative}${imageScaleDimension}`
                        : imgType === "cardImg"
                        ? "0"
                        : "2rem";

                setImageType(imgType);
                setCardImagePaddingHeight(cardPaddingHeightString);
            }
        };

        // Get image details once it has loaded
        if (cardImage && imageLoaded && !imageType && readerLoaded) {
            getImageDetails();
        }
    }, [
        imageLoaded,
        result,
        imageRef,
        cardImage,
        cardBackground,
        cardIconColor,
        imageType,
        cardBackgroundColor,
        heroImageHeight,
        cardImagePaddingHeight,
        readerLoaded,
    ]);

    // Force card to update if there has been a change in readerLoaded
    useEffect(() => {
        if (readerLoaded && !cardUpdatedForReader) {
            setCardUpdatedForReader(true);
        }
    }, [readerLoaded, cardUpdatedForReader]);

    return (
        <Card
            raised
            style={{
                borderRadius: "24px",
                margin: "1.2rem",
            }}
        >
            {cardImage && !cardImageFailed ? (
                <div>
                    <Card.Content
                        className="lw-card-hero-entity-grid"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            height: "150px",
                            maxHeight: "150px",
                            background: `url(${cardImage})`,
                        }}
                    >
                        <img
                            ref={imageRef}
                            alt={result.title}
                            src={cardImage}
                            style={{
                                display: "none",
                                maxHeight: "160px", //29vh target
                                maxWidth: "100%",
                                marginLeft: "auto",
                                marginRight: "auto",
                                marginTop: "12px !important",
                                marginBottom: "12px !important",
                                border: "1px white",
                                borderRadius:
                                    mode === "desktop" ? "16px" : "16px",
                                backgroundColor: "rgba(0,0,0, 0.4)",
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
                            onLoad={() => setImageLoaded(true)}
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="Result Link Banner"
                        />
                    </Card.Content>
                </div>
            ) : null}
            <Card.Content>
                <Feed>
                    <Feed.Event>
                        <Feed.Label
                            as="a"
                            onClick={(e) => e.stopPropagation()}
                            href={result.link}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="Result Link Logo"
                        >
                            <Image
                                src={sourceFaviconUrl}
                                style={{ borderRadius: "4px" }}
                                onError={(i) =>
                                    (i.target.style.display = "none")
                                }
                                onLoad={(i) => {
                                    setCardIconLoaded(true);
                                }}
                            />
                        </Feed.Label>
                        <Feed.Content
                            style={{ marginLeft: "0.5rem" }}
                            as="a"
                            onClick={(e) => e.stopPropagation()}
                            href={result.link}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="Result Link Source"
                        >
                            <div
                                className="lw-gridcard-source"
                                style={{
                                    width: "fit-content",
                                }}
                            >
                                <Feed.Summary
                                    style={{
                                        color: cardIconColor
                                            ? cardIconColor
                                            : "var(--color-grey-7)",
                                    }}
                                >
                                    {cardSource}{" "}
                                </Feed.Summary>
                            </div>
                        </Feed.Content>
                        <div style={{ marginTop: "0" }}>
                            <Button.Group
                                size="large"
                                floated="right"
                                basic
                                compact
                                style={{ boxShadow: "none", border: "none" }}
                            >
                                <CardToolsMenu
                                    refineSearch={refineSearch}
                                    result={result}
                                    context="grid"
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
                        </div>
                    </Feed.Event>
                </Feed>
            </Card.Content>
            <Card.Content
                style={{
                    margin: "0",
                    padding: "0 1rem 1rem 1rem",
                    overflow: "auto",
                    border: "none",
                    borderBottomLeftRadius: "24px",
                    borderBottomRightRadius: "24px",
                }}
            >
                <Card.Header
                    className="lw-gridcard-header"
                    as="a"
                    onClick={(e) => e.stopPropagation()}
                    href={result.link}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Click"
                    data-Newsly-channel="Result Link Title"
                    style={{
                        fontSize: "1.1rem",
                        color: "var(--color-grey-7)",
                        fontWeight: "600",
                        fontFeatureSettings: "'ss01' on",
                    }}
                >
                    {domain?.includes("wikipedia") ? `${cardTitle}` : cardTitle}
                </Card.Header>
                {result.date ? (
                    <Card.Meta style={{ marginTop: "0rem" }}>
                        {Slug(result.date) ? Slug(result.date) : null}
                    </Card.Meta>
                ) : null}

                <Card.Description
                    style={{
                        marginTop: "1rem",
                        marginBottom: "1.5rem",
                        display: "-webkit-box",
                        WebkitLineClamp: "5",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    <div
                        dangerouslySetInnerHTML={{
                            __html:
                                cardDescription && cardDescription !== "pending"
                                    ? cardDescription
                                    : defaultCardDescription,
                        }}
                    />
                </Card.Description>
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
                        onError={(i) => (i.target.style.display = "none")}
                    />
                    {domain}{" "}
                </Card.Meta>
            </Card.Content>
        </Card>
    );
};

export default GridCard;
