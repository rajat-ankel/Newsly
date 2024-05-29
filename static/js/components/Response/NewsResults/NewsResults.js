import React, { useEffect, useRef, useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card } from "semantic-ui-react";
import FeedCard from "../FeedCard/FeedCard";
import NewsProfiles from "../NewsProfiles";
import { UserContext } from "../../../UserContext";

export default function NewsResults(props) {
    const {
        result,
        refineSearch,
        commands,
        query,
        imagesLoaded,
        handleExtraImageLoaded,
    } = props;
    const [currentResult, setCurrentResult] = useState(null);
    const resultsId = uuidv4();
    const { mode } = useContext(UserContext);

    const topContentRef = useRef(null);

    useEffect(() => {
        const scrollContentToTop = () => {
            topContentRef.current.scrollIntoView({
                alignToTop: true,
                behavior: "smooth",
                block: "start",
            });
        };
        if (result !== currentResult) {
            // New search results have populated
            setCurrentResult(result);
            scrollContentToTop();
        }
    }, [result, currentResult]);

    const ResultList =
        currentResult &&
        currentResult.news.map((item, index) => {
            return (
                <FeedCard
                    result={item}
                    query={query}
                    refineSearch={refineSearch}
                    key={`${resultsId}-news-${index}`}
                    commands={commands}
                    index={index}
                    fluid={true}
                    size="medium"
                    imagesLoaded={imagesLoaded}
                    handleExtraImageLoaded={handleExtraImageLoaded}
                />
            );
        });

        const bgOverlayMedia = `linear-gradient(rgb(211,211,211,0.25) 0.1rem, transparent 2rem, transparent 30%, rgb(211,211,211,0.25) 50%, rgb(255,255,255,0.98) 100%)`;
                

    return (
        <React.Fragment>
            <div id="scrollTop" ref={topContentRef} />
            {result.news_profiles && result.news_profiles.length > 0 ? (
                <div className="lw-feed-results">
                    <Card
                        fluid={true}
                        raised
                        className="lw-card-hero-entity"
                        style={{
                            marginBottom: "1.5rem",
                            width: mode === "desktop" ? "100%" : "99%",
                            //   maxWidth: mode === "desktop" ? "1200px" : "99%",
                            marginLeft: "auto",
                            marginRight: "auto",
                            height: "auto",
                            overflow: "hidden",
                            background: bgOverlayMedia,
                            backgroundColor: "transparent",
                        }}
                    >
                        <img
                            src="/assets/cardHeaders/breaking-news-motif.webp"
                            alt=""
                            style={{
                                width: "100%",
                                maxWidth: "100%",
                                position: "absolute",
                                borderTopLeftRadius: "24px",
                                borderTopRightRadius: "24px",
                                zIndex: "-9999",
                                filter: "blur(7px)",
                                objectFit: "cover",
                                WebkitBoxReflect: `below -4px`,
                            }}
                        />
                        <div>
                            <Card.Content
                                textAlign="left"
                                className="lw-card-content"
                                style={{
                                    marginTop: "2rem",
                                    border: "none",
                                    borderRadius: "12px",
                                    backgroundColor: "blue",
                                }}
                            >
                                <Card.Header
                                    className="lw-card-image-header"
                                    style={{
                                        fontSize: "1.5rem",
                                        color: "var(--color-grey-7)",
                                        fontWeight: "500",
                                        fontFamily: "GTEestiMedium, sans-serif",
                                        padding: "0 0 1rem 0",
                                        marginTop: "0",
                                    }}
                                >
                                    Dedicated news and topic coverage
                                </Card.Header>
                                <Card.Meta>
                                    <NewsProfiles
                                        profiles={result.news_profiles}
                                        entityName={
                                            result.link.includes("wikipedia")
                                                ? result.title
                                                : result.topics.length > 0 &&
                                                  query &&
                                                  query.includes(
                                                      result.topics[0]
                                                  )
                                                ? result.topics[0]
                                                : ""
                                        }
                                    />
                                </Card.Meta>
                            </Card.Content>
                        </div>
                    </Card>
                </div>
            ) : null}

            <div className="lw-results-list">{ResultList}</div>
        </React.Fragment>
    );
}
