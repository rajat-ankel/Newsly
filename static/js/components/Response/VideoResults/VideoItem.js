import React, { useState, useContext } from "react";
import posthog from "posthog-js";
import { Card, Image } from "semantic-ui-react";
// import tldExtract from "tld-extract";
import * as emoji from 'node-emoji';
import ReactPlayer from "react-player";
import camoUrl from "camo-url";
import { Slug } from "../utilitiesResponse";
import { FAVICON_PROXY, IMAGE_PROXY, IMAGE_KEY } from "../../../constants";
import getDomainNameAndSubdomain from "../../../utilities/getDomainNameAndSubdomain";
import extractSiteSource from "../../../utilities/extractSiteSource";
import { UserContext } from "../../../UserContext";

const camoImageProxy = camoUrl({
    host: IMAGE_PROXY,
    key: IMAGE_KEY,
    type: "path",
});

const VideoItem = (props) => {
    const [replaceWithPlaceholder, setReplaceWithPlaceholder] = useState(false);
    const { result, videoKey, fluid, size } = props;
    const { mode } = useContext(UserContext);

    const onPlayError = () => {
        setReplaceWithPlaceholder(true);
    };

    let cardImage = result.image ? `${camoImageProxy(result.image)}` : "";

    // Replace image and go to nocookie server for YouTube if available
    const isYouTube = result.link.includes("youtube.com");

    // YouTube IDs in form /watch/{id} or watch/?v={id}
    if (isYouTube && !cardImage) {
        let ytId = "";
        if (result.link.includes("watch/")) {
            ytId = result.link.substring(result.link.indexOf("watch/") + 6);
        } else if (result.link.includes("watch?v=")) {
            ytId = result.link.substring(result.link.indexOf("watch?v=") + 8);
        }
        let ytIdStripped =
            ytId.indexOf("?") > 0
                ? ytId.substring(0, ytId.indexOf("?"))
                : ytId.indexOf("&") > 0
                ? ytId.substring(0, ytId.indexOf("&"))
                : ytId;

        if (!cardImage && ytIdStripped) {
            let imgProxyUrl = `https://img.youtube.com/vi/${ytIdStripped}/hqdefault.jpg`;
            cardImage = `${camoImageProxy(imgProxyUrl)}`;
        }
    }

    function AnswerCardContent() {
        // const domain = result.link.startsWith("/")
        //     ? ""
        //     : tldExtract(result.link).domain;

        // tldextract fails with some domains so use function with regex fallback
        let { domain } = result.link && getDomainNameAndSubdomain(result.link);
        if (domain === null || domain === "") {
            domain = result.source ? result.source : null;
        }

        const sourceFaviconUrl = result.favicon
            ? result.favicon
            : `${FAVICON_PROXY}/${domain}.ico`;

        let cardSource = extractSiteSource(result);
        const cardTitle = result.title ? result.title : result.answer;
        const cardDescription =
            result.description !== cardTitle
                ? result.description
                : result.answer !== cardTitle
                ? result.answer
                : result.title !== cardTitle
                ? result.title
                : "";

        return (
            <Card.Content
                style={{
                    // background: "#f3f4f5",
                    background: "black",
                    margin: "0 1rem 24px 1rem",
                    color: "white",
                }}
            >
                <Card.Header
                    as="a"
                    onClick={(e) => e.stopPropagation()}
                    href={result.link}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Click"
                    data-Newsly-channel="Result Link Video"
                    style={{ color: "var(--color-grey-4)" }}
                >
                    {cardTitle}
                </Card.Header>

                {replaceWithPlaceholder ? (
                    <Card.Description
                        style={{
                            color: "var(--color-grey-4)",
                            fontSize: "1.1rem",
                        }}
                    >
                        {emoji.emojify(
                            `${
                                result.source ? result.source : "This website"
                            } won't let us play this media directly on here so just click through above :innocent:`
                        )}
                    </Card.Description>
                ) : (
                    <Card.Description
                        style={{
                            color: "var(--color-grey-4)",
                            fontSize: "1.1rem",
                        }}
                    >
                        {cardDescription
                            ? emoji.emojify(cardDescription)
                            : null}
                    </Card.Description>
                )}

                <Card.Meta
                    style={{
                        marginTop: "0.5rem",
                        color: "var(--color-grey-4)",
                        fontSize: "1.1rem",
                    }}
                >
                    {cardSource}
                    {" - "}Views {result.views}
                    {Slug(result.date) ? " - " + Slug(result.date) : null}
                    <Image
                        style={{ width: "24px", height: "24px" }}
                        floated="right"
                        src={sourceFaviconUrl}
                        onError={(i) => (i.target.style.display = "none")}
                    />
                </Card.Meta>
            </Card.Content>
        );
    }

    return (
        <Card
            fluid={fluid ? fluid : true}
            style={
                size && size === "large"
                    ? { marginBottom: "1rem", maxWidth: "100%" }
                    : size === "medium"
                    ? {
                          marginBottom: "1.5rem",
                          maxWidth: mode === "desktop" ? "90%" : "99%",
                          marginLeft: "auto",
                          marginRight: "auto",
                          paddingTop: "0.5rem",
                          borderRadius: "24px",
                          backgroundColor: "black",
                      }
                    : { marginBottom: "1rem", maxWidth: "290px" }
            }
            key={videoKey}
            raised
        >
            {replaceWithPlaceholder ? (
                <a
                    onClick={(e) => e.stopPropagation()}
                    href={result.link}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Watch"
                    data-Newsly-channel="External Player"
                    data-Newsly-destination={result.source}
                    style={{
                        width: "94%",
                        borderRadius: "24px!important",
                        margin: "8px auto",
                    }}
                >
                    {" "}
                    <div
                        className="lw-player-placeholder"
                        style={{
                            backgroundImage: `url(${cardImage})`,
                        }}
                    />
                </a>
            ) : (
                <div
                    className="player-wrapper"
                    style={{
                        borderRadius: "24px!important",
                        margin: "8px auto",
                        width: "94%",
                    }}
                >
                    <ReactPlayer
                        className="react-player"
                        url={
                            isYouTube
                                ? result.link.replace(
                                      "youtube.com",
                                      "youtube-nocookie.com"
                                  )
                                : result.link
                        }
                        width="100%"
                        height="100%"
                        controls={true}
                        onError={onPlayError}
                        onPlay={() => {
                            posthog.capture("Engagement", {
                                Action: "Watch",
                                Channel: "Embedded Player",
                                Destination: result.source,
                            });
                        }}
                    />
                </div>
            )}

            <AnswerCardContent />
        </Card>
    );
};

export default VideoItem;
