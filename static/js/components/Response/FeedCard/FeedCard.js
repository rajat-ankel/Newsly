import React, { useState, useContext, useEffect, useRef } from "react";
import { Card, Image, Button } from "semantic-ui-react";
import hljs from "highlight.js";
import "highlight.js/styles/night-owl.css";
import { useColor } from "color-thief-react";
import CodeBlock from "react-copy-code";
import { ReactComponent as CopyIcon } from "../../../assets/icons/copy-solid.svg";
import {
    FAVICON_PROXY,
    LAZYWEB_ROTATING_PROXY,
    CORS_PROXY,
} from "../../../constants";
import { cardImageSpecialHandler, Slug } from "../utilitiesResponse";
import lightOrDark from "../../../utilities/lightOrDark";
import ColorLuminance from "../../../utilities/ColorLuminance";
import getDomainNameAndSubdomain from "../../../utilities/getDomainNameAndSubdomain";
import extractSiteSource from "../../../utilities/extractSiteSource";
import imageDiscriminator from "../../../utilities/imageDiscriminator";
import { escapeCode } from "../../../utils";
import CardActionButtons from "../CardActionButtons";
import CardToolsMenu from "../CardToolsMenu";

import Profiles from "../Profiles";
import NewsProfilesButtons from "../NewsProfilesButtons";
import { UserContext } from "../../../UserContext";
import createOptimalDescription from "../../../utilities/createOptimalDescription";

const FeedCard = (props) => {
    const {
        result,
        refineSearch,
        commands,
        size,
        // handleNewUserMessage,
        query,
    } = props;
    const fluid = props.fluid === false ? false : true;
    const { mode } = useContext(UserContext);
    const cardRef = useRef(null);
    const imageRef = useRef();
    const [readerLoaded, setReaderLoaded] = useState(false);
    const [cardUpdatedForReader, setCardUpdatedForReader] = useState(false);

    const [cardImageFailed, setCardImageFailed] = useState(false);

    const [cardImage, setCardImage] = useState(null);

    const [cardIconColor, setCardIconColor] = useState(null);
    const [cardIconLoaded, setCardIconLoaded] = useState(false);

    const [cardBackground, setCardBackground] = useState(
        "linear-gradient(rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.25) 30%, white)"
    );
    const [cardBackgroundColor, setCardBackgroundColor] = useState("white");
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageType, setImageType] = useState(null);
    const [cardImagePaddingHeight, setCardImagePaddingHeight] =
        useState("2rem");

    const [cardDate, setCardDate] = useState(result.date ? result.date : null);
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

    const { domain } =
        result.link &&
        getDomainNameAndSubdomain(result.link.replace("www.", ""));

    const sourceFaviconUrl = result.favicon
        ? result.favicon
        : `${FAVICON_PROXY}/${domain}.ico`;

    let cardSource = extractSiteSource(result);
    // let displayQuote = null;

    const heroImageHeight = mode === "desktop" ? 55 : 70; // Was 36 max and 40 max

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
    }, [cardIconColor, cardIconLoaded, sourceFaviconUrl, data, loading, error]);

    useEffect(() => {
        // Highlight code blocks in the content in displayHtml
        if (cardRef && cardRef.current) {
            let currentCardRef = cardRef.current;
            const codeBlocks = currentCardRef.querySelectorAll("code");
            codeBlocks.forEach((el) => {
                if (
                    (el.innerHTML.includes("<") ||
                        el.innerHTML.includes(">")) &&
                    !(
                        el.innerHTML.includes("&gt;") ||
                        el.innerHTML.includes("&lt;")
                    )
                ) {
                    // If not already escaped then escape
                    el.innerHTML = el.innerHTML.replace(
                        escapeCode(el.innerHTML)
                    );
                }
                if (!el.classList.contains("hljs")) {
                    hljs.highlightElement(el);
                }
            });
        }
    }, [cardDescription]);

    useEffect(() => {
        const getImageDetails = async () => {
            const { imgType, cardPaddingHeightRelative, imageDimensions } =
                await imageDiscriminator(imageRef, result);

            let renderedImgType = imgType;
            const { imgWidth, imgHeight } = imageDimensions;

            if (
                (imgType === "cardImg" || imgType === "sideImg") &&
                mode === "mobile"
            ) {
                renderedImgType = "mediaImg";
            }

            if (
                // Replace the image for entities if small or missing
                result.results_type === "Entity" &&
                result.link.includes("wikipedia") &&
                (renderedImgType === "borderImg" ||
                    renderedImgType === "noImg") &&
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

                // Adjust for mobile
                if (mode === "mobile") {
                    if (renderedImgType === "mediaImg") {
                        const scaleFactor = window.innerWidth / imgWidth;

                        // set the newCardPaddingHeightRelative so it displays the image at screen width up to 50% of the screen height
                        const scaledImageHeight = imgHeight * scaleFactor;
                        newCardPaddingHeightRelative = Math.min(
                            (scaledImageHeight / window.innerHeight) * 100,
                            50
                        );

                        imageScaleDimension = "vh";
                    }

                    // newCardPaddingHeightRelative =
                    //     cardImageVerticalScreenPercent > 50
                    //         ? 50
                    //         : cardImageVerticalScreenPercent;
                    // imageScaleDimension = "vh";
                }

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
                    renderedImgType === "cardImg"
                        ? bgOverlayCard
                        : renderedImgType === "mediaImg"
                        ? bgOverlayMedia
                        : renderedImgType === "borderImg"
                        ? bgOverlayBorder
                        : cardBackground
                );
                setCardBackgroundColor(
                    renderedImgType !== "noImg"
                        ? "transparent"
                        : cardIconColor
                        ? cardIconColor
                        : "var(--color-grey-5)"
                );

                const cardPaddingHeightString =
                    renderedImgType === "cardImg"
                        ? "0"
                        : renderedImgType === "mediaImg" && mode === "mobile"
                        ? `calc(${newCardPaddingHeightRelative}${imageScaleDimension} - 0.5rem)`
                        : renderedImgType === "mediaImg"
                        ? `${newCardPaddingHeightRelative}${imageScaleDimension}`
                        : renderedImgType === "cardImg"
                        ? "0"
                        : "2rem";

                setImageType(renderedImgType);
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
        mode,
    ]);

    const displaySlugCardDate = Slug(cardDate);

    // Force card to update if there has been a change in readerLoaded
    useEffect(() => {
        if (readerLoaded && !cardUpdatedForReader) {
            setCardUpdatedForReader(true);
        }
    }, [readerLoaded, cardUpdatedForReader]);

    // if (result.description) {
    //     console.log("\n\ntop card link", result.link);
    //     console.log("top card image url", cardImage);
    //     console.log("top card description", cardDescription);
    //     console.log("top card title", cardTitle);
    // }

    return (
        <div className="lw-feed-results">
            <Card
                fluid={fluid}
                raised
                className="lw-card-hero-entity"
                style={
                    size && size === "large"
                        ? {
                              //   display: "inline-block",
                              //   marginBottom: "1rem",
                              //   maxWidth: "10%",
                              //   borderTop: "none",
                              //   background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8) 94%, rgba(0, 0, 0, 0.6)),url(${cardImage})`,
                          }
                        : size === "medium"
                        ? {
                              marginBottom: "1.5rem",
                              width:
                                  mode === "desktop"
                                      ? "calc(100% - 2.5rem)"
                                      : "99%",
                              //   maxWidth: mode === "desktop" ? "1200px" : "99%",
                              marginLeft: "auto",
                              marginRight: "auto",
                              height: "auto",
                              overflow: "hidden",
                              background: cardBackground,
                              backgroundColor: imageType
                                  ? cardBackgroundColor
                                  : cardIconColor,
                          }
                        : { marginBottom: "1rem", maxWidth: "290px" }
                }
            >
                <img
                    ref={imageRef}
                    src={cardImage}
                    alt=""
                    onLoad={() => setImageLoaded(true)}
                    className="lw-card-hero-entity-image"
                    // onError={hideHeroImage}
                    style={{
                        width: "100%",
                        maxWidth: "100%",
                        position: "absolute",
                        borderTopLeftRadius: mode === "desktop" ? "24px" : "0",
                        borderTopRightRadius: mode === "desktop" ? "24px" : "0",
                        zIndex: "-9999",
                        filter:
                            imageType && imageType === "mediaImg"
                                ? "none"
                                : "blur(7px)",
                        objectFit:
                            imageType && imageType !== "borderImg"
                                ? "cover"
                                : "initial",
                        WebkitBoxReflect: `below -4px`,
                    }}
                />

                {(result.image || cardImage) &&
                imageType &&
                imageType === "cardImg" ? (
                    <Card.Content
                        as="a"
                        onClick={(e) => e.stopPropagation()}
                        href={result.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Result Link Banner"
                    >
                        <img
                            alt={result.title}
                            src={cardImage}
                            style={{
                                maxHeight: `${heroImageHeight - 15}vh`,
                                //maxWidth: "90%",
                                // width: "90%",
                                display: "block",
                                marginLeft: "auto",
                                marginRight: "auto",
                                marginTop: "0.5rem",
                                border: "1px white",
                                borderRadius:
                                    mode === "desktop" ? "16px" : "16px",

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
                    </Card.Content>
                ) : null}

                <div>
                    <Card.Content
                        textAlign="left"
                        className="lw-card-content"
                        style={{
                            marginTop: cardImagePaddingHeight,
                            border: "none",
                            borderRadius: "12px",
                            backgroundColor: "blue",
                        }}
                    >
                        {imageType && imageType === "sideImg" ? (
                            <Image
                                alt={result.title}
                                src={cardImage}
                                style={{
                                    width: "12vw",
                                    float: "right",
                                    marginLeft: "2rem",
                                    marginBottom: "2rem",
                                    border: "1px white",
                                    borderRadius:
                                        mode === "desktop" ? "16px" : "16px",

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
                        ) : null}
                        <Card.Meta
                            className="lw-card-image-header"
                            as="a"
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
                                paddingBottom: "0.5rem",
                                lineHeight: "1.25",
                                fontSize: "1.3rem",
                                fontWeight: "400",
                            }}
                        >
                            <Image
                                src={sourceFaviconUrl}
                                style={{
                                    borderRadius: "4px",
                                    heigh: "46px",
                                    width: "46px",
                                    marginRight: "1.2rem",
                                    marginTop: "-4px",
                                }}
                                onError={(i) =>
                                    (i.target.style.display = "none")
                                }
                                onLoad={(i) => {
                                    setCardIconLoaded(true);
                                }}
                            />
                            {cardSource}{" "}
                        </Card.Meta>
                        <Card.Header
                            className="lw-card-image-header"
                            style={{
                                fontSize: "1.4rem",
                                fontWeight: "500",
                                paddingBottom: "0.5rem",
                                paddingTop: "1.2rem",
                            }}
                        >
                            <a
                                href={result.link}
                                onClick={(e) => e.stopPropagation()}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                data-Newsly-event="Engagement"
                                data-Newsly-action="Click"
                                data-Newsly-channel="Result Link Title"
                            >
                                {cardTitle}
                            </a>
                        </Card.Header>
                        {displaySlugCardDate ? (
                            <Card.Meta
                                style={{
                                    marginTop: "0.5rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                {displaySlugCardDate
                                    ? displaySlugCardDate
                                    : null}
                            </Card.Meta>
                        ) : null}

                        <CodeBlock svg={CopyIcon} className="lw-copy-button">
                            <Card.Description
                                style={{
                                    marginTop: "0.5rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                <div
                                    ref={cardRef}
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            cardDescription &&
                                            cardDescription !== "pending"
                                                ? escapeCode(cardDescription)
                                                : defaultCardDescription,
                                    }}
                                />
                                {/* {displayQuote &&
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
                                ) : null} */}
                            </Card.Description>
                        </CodeBlock>
                        <Card.Meta
                            style={{
                                marginTop: "1.5rem",
                                marginBottom: "0.5rem",
                                // marginLeft: "0.5rem",
                                // marginRight: "0.25rem",
                            }}
                            className="lw-profile-container"
                        >
                            {result.profiles &&
                            result.profiles.length > 0 &&
                            result.link.includes("wikipedia") ? (
                                <Profiles
                                    profiles={
                                        result.link.includes("wikipedia") &&
                                        !Object.values(result.profiles).indexOf(
                                            "wikipedia"
                                        )
                                            ? result.profiles.concat({
                                                  link: result.link,
                                                  type: "wikipedia",
                                              })
                                            : result.profiles
                                    }
                                    entityName={result.title}
                                />
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
                                        onError={(i) =>
                                            (i.target.style.display = "none")
                                        }
                                    />
                                    {domain}{" "}
                                </Card.Meta>
                            )}
                            {result.profiles &&
                            result.profiles.length > 0 &&
                            result.news_profiles &&
                            result.news_profiles.length > 0 &&
                            result.link.includes("wikipedia") ? (
                                <div
                                    style={{
                                        marginTop: "0",
                                        paddingTop: "1rem",
                                        borderTop: "1px solid lightgrey",
                                    }}
                                >
                                    <NewsProfilesButtons
                                        profiles={result.news_profiles}
                                        entityName={
                                            result.link.includes("wikipedia")
                                                ? result.title
                                                : result.topics.length > 0 &&
                                                  query.includes(
                                                      result.topics[0]
                                                  )
                                                ? result.topics[0]
                                                : ""
                                        }
                                    />
                                </div>
                            ) : null}
                        </Card.Meta>
                        <Card.Meta className="lw-card-action-buttons">
                            <CardActionButtons
                                result={result}
                                refineSearch={refineSearch}
                                commands={commands}
                                cardImage={cardImage}
                                setCardImage={setCardImage}
                                cardDescription={cardDescription}
                                setCardDescription={setCardDescription}
                                cardDate={cardDate}
                                setCardDate={setCardDate}
                                cardTitle={cardTitle}
                                setCardTitle={setCardTitle}
                                cardIconColor={
                                    cardIconColor
                                        ? cardIconColor
                                        : "var(--color-black)"
                                }
                                readerLoaded={readerLoaded}
                                setReaderLoaded={setReaderLoaded}
                            />
                            <Button.Group
                                size="large"
                                floated="right"
                                basic
                                compact
                                className="lw-card-action-tools-menu"
                            >
                                <CardToolsMenu
                                    refineSearch={refineSearch}
                                    result={result}
                                    context="feed"
                                    commands={commands}
                                />
                            </Button.Group>
                        </Card.Meta>
                    </Card.Content>
                </div>
            </Card>
        </div>
    );
};

export default FeedCard;
