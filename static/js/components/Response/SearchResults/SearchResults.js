import React, { useEffect, useRef, useState, useContext } from "react";
import { Dimmer, Loader, Card } from "semantic-ui-react";
import {
    // FAVICON_PROXY,
    // LAZYWEB_ROTATING_PROXY,
    // CORS_PROXY,
} from "../../../constants";
import { v4 as uuidv4 } from "uuid";
import FeedCard from "../FeedCard/FeedCard";
import GridCard from "../GridCard";
import ListItem from "./ListItem";
import ComplexListItem from "./ComplexListItem";
import TextItem from "./TextItem";
import { UserContext } from "../../../UserContext";
import VideosList from "../VideoResults/VideosList";
import VideoItem from "../VideoResults/VideoItem";
import {
    convertProfilesToResults,
    convertNewsProfilesToResults,
} from "../utilitiesResponse";
// import lightOrDark from "../../../utilities/lightOrDark";
// import ColorLuminance from "../../../utilities/ColorLuminance";
// import getDomainNameAndSubdomain from "../../../utilities/getDomainNameAndSubdomain";
// import { useColor } from "color-thief-react";

export default function SearchResults(props) {
    const {
        result,
        refineSearch,
        commands,
        query,
        imagesLoaded,
        handleExtraImageLoaded,
        handleNewUserMessage,
    } = props;
    const { view, mode } = useContext(UserContext);
    const [currentResult, setCurrentResult] = useState(null);
    const resultsId = uuidv4();

    // const [cardIconColor, setCardIconColor] = useState(null);
    // const [cardIconLoaded, setCardIconLoaded] = useState(false);

    const topContentRef = useRef(null);

    // const { domain } =
    //     result.link &&
    //     getDomainNameAndSubdomain(result.link.replace("www.", ""));

    // const sourceFaviconUrl = result.favicon
    //     ? result.favicon
    //     : `${FAVICON_PROXY}/${domain}.ico`;

    // const { data, loading, error } = useColor(
    //     CORS_PROXY + sourceFaviconUrl,
    //     "hex",
    //     {
    //         crossOrigin: "anonymous",
    //     }
    // );

    // useEffect(() => {
    //     // Set card icon color
    //     if (!loading && !error && !cardIconColor) {
    //         if (data && lightOrDark(data) === "light") {
    //             setCardIconColor(ColorLuminance(data, -0.4));
    //         } else {
    //             setCardIconColor(data);
    //         }
    //     }
    // }, [cardIconColor, sourceFaviconUrl, data, loading, error]);

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

    let compositeResults = currentResult
        ? [currentResult].concat(currentResult.results)
        : null;

    // If it's not a feed item, move offical website content to profile
    let officialWebsite = {};

    if (
        currentResult &&
        currentResult.profiles &&
        currentResult.profiles.length > 0 &&
        currentResult.profiles.some(
            (profile) => profile.type === "official_website"
        )
    ) {
        currentResult.profiles.forEach((profile) => {
            if (profile.type === "official_website") {
                officialWebsite["link"] = profile.link;
                currentResult.results.forEach((result) => {
                    if (
                        result.link === profile.link ||
                        result.link === profile.link + "/" ||
                        result.link.replace("www.", "") === profile.link ||
                        result.link.replace("www.", "") === profile.link + "/"
                    ) {
                        officialWebsite["title"] = result.title;
                        officialWebsite["description"] = result.description
                            ? result.description
                            : result.desc;
                        // Remove matching item from the result set to display
                        compositeResults = compositeResults.filter(
                            (resultItem) => {
                                if (resultItem.link.slice(-1) === "/") {
                                    return (
                                        resultItem.link.slice(0, -1) !==
                                        profile.link
                                    );
                                } else {
                                    return resultItem.link !== profile.link;
                                }
                            }
                        );
                    }
                });
            }
        });
    }

    const GridView = () => {
        let convertedProfileResults =
            compositeResults[0].profiles &&
            compositeResults[0].profiles.length > 0
                ? convertProfilesToResults(
                      (props = {
                          profiles: compositeResults[0].profiles,
                          officialWebsite: officialWebsite,
                          entityName: result.title,
                      })
                  )
                : [];
        let convertedNewsProfileResults =
            compositeResults[0].news_profiles &&
            compositeResults[0].news_profiles.length > 0
                ? convertNewsProfilesToResults(
                      (props = {
                          profiles: compositeResults[0].news_profiles,
                          query: query,
                          entityName: result.link.includes("wikipedia")
                              ? result.title
                              : "",
                      })
                  )
                : [];

        let resultsWithProfiles =
            compositeResults[0].profiles.length > 0 ||
            compositeResults[0].news_profiles.length > 0
                ? [compositeResults[0]]
                      .concat(convertedProfileResults)
                      .concat(convertedNewsProfileResults)
                      .concat(
                          compositeResults.slice(1, compositeResults.length - 1)
                      )
                : compositeResults;

        const ResultList = resultsWithProfiles
            ? resultsWithProfiles.map((item, index) => {
                  if (item && item.title && item.link !== "") {
                      return (
                          <GridCard
                              result={item}
                              query={query}
                              refineSearch={refineSearch}
                              key={`feed-${resultsId}-${index}`}
                              index={index}
                              commands={commands}
                              imagesLoaded={imagesLoaded}
                              handleExtraImageLoaded={handleExtraImageLoaded}
                          />
                      );
                  } else {
                      return null;
                  }
              })
            : null;
        return <Card.Group>{ResultList}</Card.Group>;
    };
    const FeedView = () => {
        let resultsWithModifications = compositeResults;

        if (
            result.results_type === "News" &&
            result.news &&
            result.news.length > 0
        ) {
            resultsWithModifications = [compositeResults[0]]
                .concat(compositeResults[0].news)
                .concat(compositeResults.slice(1, compositeResults.length - 1));
            resultsWithModifications[0].news = [];
        }

        const ResultList = resultsWithModifications
            ? resultsWithModifications.map((item, index) => {
                  if (item && item.title && item.link !== "") {
                      if (item.link.includes("youtube.com/watch")) {
                          return (
                              <div className="lw-image-gallery" key={index}>
                                  <VideoItem
                                      result={item}
                                      videoKey={index}
                                      size="medium"
                                      fluid={true}
                                  />
                              </div>
                          );
                      } else {
                          return (
                              <FeedCard
                                  result={item}
                                  query={query}
                                  refineSearch={refineSearch}
                                  key={`feed-${resultsId}-${index}`}
                                  index={index}
                                  commands={commands}
                                  feature={false}
                                  fluid={true}
                                  size="medium"
                                //   cardIconColor={cardIconColor}
                                  imagesLoaded={imagesLoaded}
                                  handleExtraImageLoaded={
                                      handleExtraImageLoaded
                                  }
                                  handleNewUserMessage={handleNewUserMessage}
                              />
                          );
                      }
                  } else {
                      return null;
                  }
              })
            : null;
        return ResultList;
    };
    const ComplexListView = () => {
        const ResultList = compositeResults
            ? compositeResults.map((item, index) => {
                  if (item && item.title) {
                      return (
                          <ComplexListItem
                              officialWebsite={officialWebsite}
                              result={item}
                              key={`list-${resultsId}-${index}`}
                              index={index}
                              refineSearch={refineSearch}
                              commands={commands}
                              query={query}
                          />
                      );
                  } else {
                      return null;
                  }
              })
            : null;
        return (
            <div>
                {ResultList}
                {/* {currentResult &&
                currentResult.videos &&
                currentResult.profiles ? (
                    <div>
                        <VideosList
                            videos={result.videos}
                            commands={commands}
                            refineSearch={refineSearch}
                            query={query}
                        />
                    </div>
                ) : null} */}
            </div>
        );
    };
    const ListView = () => {
        const ResultList = compositeResults
            ? compositeResults.map((item, index) => {
                  if (item && item.title) {
                      return (
                          <ListItem
                              officialWebsite={officialWebsite}
                              result={item}
                              key={`list-${resultsId}-${index}`}
                              index={index}
                              refineSearch={refineSearch}
                              commands={commands}
                              query={query}
                          />
                      );
                  } else {
                      return null;
                  }
              })
            : null;
        return (
            <div>
                {ResultList}
                {currentResult &&
                currentResult.videos &&
                currentResult.profiles ? (
                    <div className={`lw-results-view-${view}`}>
                        <VideosList
                            videos={result.videos}
                            commands={commands}
                            refineSearch={refineSearch}
                            query={query}
                        />
                    </div>
                ) : null}
            </div>
        );
    };
    const TextView = () => {
        const ResultList = compositeResults
            ? compositeResults.map((item, index) => {
                  if (item && item.title) {
                      return (
                          <TextItem
                              officialWebsite={officialWebsite}
                              result={item}
                              key={`list-${resultsId}-${index}`}
                          />
                      );
                  } else {
                      return null;
                  }
              })
            : null;
        return (
            <div className={`lw-results-view-${view}`}>
                <pre>
                    <code>{`# Search Results in Markdown for "${query}"\n\n\n`}</code>
                    <code>{ResultList}</code>
                </pre>
            </div>
        );
    };

    const ResultView = () => {
        switch (view) {
            case "feed":
                return <FeedView />;
            case "grid":
                return <GridView />;
            case "text":
                return <TextView />;
            case "list":
                return <ListView />;
            case "complex-list":
                return <ComplexListView />;
            default:
                return <ListView />;
        }
    };

    const displayClassName = mode === "desktop" ? `lw-results-listarea-${view}` : `lw-results-listarea-${view}-mobile`;

    return (
        <React.Fragment>
            <div id="scrollTop" ref={topContentRef} />
            {!currentResult || currentResult !== result ? (
                <Dimmer
                    active
                    inverted
                    style={{ width: "100%", minWidth: "290px" }}
                >
                    <Loader inverted />
                </Dimmer>
            ) : (
                <div
                    className={displayClassName}
                    // style={{ padding: "0 0 0 0" }}
                >
                    <ResultView />
                </div>
            )}
        </React.Fragment>
    );
}
