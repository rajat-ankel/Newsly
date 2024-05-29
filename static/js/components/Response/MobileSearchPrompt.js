import React, { useState } from "react";
import { Menu, Modal, Button, Image } from "semantic-ui-react";

import SearchResults from "./SearchResults/SearchResults";
import NewsResults from "./NewsResults/NewsResults";
import ImageResults from "./ImageResults";
import VideoResults from "./VideoResults/VideoResults";
import PlacesResults from "./PlacesResults";
import SearchIcon from "../../assets/icons/search-icon-transparent-128px.png";
import {
    searchModal,
    searchModalContent,
    searchModalActions,
    searchModalMenu,
    searchModalMenuItem,
    searchModalMenuItemActive,
} from "../../styles/MobileSearchPrompt.module.css";

function displayResultsReducer(state, action) {
    switch (action.type) {
        case "close":
            return { open: false };
        case "open":
            return { open: true, size: action.size };
        default:
            throw new Error("Unsupported action...");
    }
}

export default function MobileSearchPrompt(props) {
    const { result, commands, query } = props;
    const [activeItem, setActiveItem] = useState("search");

    const [state, dispatch] = React.useReducer(displayResultsReducer, {
        open: false,
        size: undefined,
    });
    const { open, size } = state;

    const displayNews =
        (result.news && result.news.length > 0) ||
        (result.news_profiles && result.news_profiles.length > 0);
    const displayImages = result.images && result.images.length > 0;
    const displayVideos = result.videos && result.videos.length > 0;
    const displayPlaces = result.places && result.places.length > 0;

    return (
        <React.Fragment>
            <Button
                compact
                className="lw-chat-actions"
                onClick={() => dispatch({ type: "open", size: "fullscreen" })}
                data-Newsly-event="Engagement"
                data-Newsly-action="View"
                data-Newsly-channel="See Results Mobile"
            >
                Show Results{" "}
                <Image
                    src={SearchIcon}
                    size="mini"
                    align="right"
                    alt="Search Icon"
                    style={{
                        margin: "-8px -16px -8px 0.5rem",
                        color: "white",
                        padding: "4px",
                        width: "30px",
                        height: "30px",
                        borderRadius: "9999px",
                        backgroundColor: "var(--color-Newsly-dark)",
                    }}
                />
            </Button>

            <Modal
                size={size}
                open={open}
                onClose={() => dispatch({ type: "close" })}
                centered={false}
                // className="long lw-search-modal"
                className={`long ${searchModal}`}
                dimmer="inverted"
                style={{ padding: 0 }}
            >
                <Modal.Content
                    scrolling
                    className={searchModalContent}
                    style={{ overscrollBehavior: "contain" }}
                >
                    {activeItem === "search" ? (
                        <SearchResults
                            result={result}
                            //refineSearch={refineSearch}
                            commands={commands}
                            query={query}
                        />
                    ) : null}
                    {activeItem === "news" ? (
                        <NewsResults
                            result={result}
                            //refineSearch={refineSearch}
                            commands={commands}
                            query={query}
                        />
                    ) : null}
                    {activeItem === "images" ? (
                        <ImageResults result={result} />
                    ) : null}
                    {activeItem === "videos" ? (
                        <VideoResults
                            results={result.videos}
                            //commands={commands}
                        />
                    ) : null}
                    {activeItem === "places" ? (
                        <PlacesResults results={result.places} />
                    ) : null}
                </Modal.Content>
                <Modal.Actions className={searchModalActions}>
                    <Menu compact size="small" className={searchModalMenu}>
                        <Menu.Menu>
                            <Menu.Item
                                icon={{ name: "left chevron", size: "big" }}
                                onClick={() => dispatch({ type: "close" })}
                                className={searchModalMenuItem}
                            />
                        </Menu.Menu>

                        <Menu.Item
                            value="search"
                            content="Results"
                            active={activeItem === "search"}
                            onClick={() => setActiveItem("search")}
                            className={
                                activeItem === "search"
                                    ? searchModalMenuItemActive
                                    : searchModalMenuItem
                            }
                        />
                        {displayNews ? (
                            <Menu.Item
                                value="news"
                                content="News"
                                disabled={!displayNews}
                                active={activeItem === "news"}
                                onClick={() => setActiveItem("news")}
                                className={
                                    activeItem === "news"
                                        ? searchModalMenuItemActive
                                        : searchModalMenuItem
                                }
                            />
                        ) : null}
                        {displayImages ? (
                            <Menu.Item
                                value="images"
                                // icon="picture"
                                content="Images"
                                disabled={!displayImages}
                                active={activeItem === "images"}
                                onClick={() => setActiveItem("images")}
                                className={
                                    activeItem === "images"
                                        ? searchModalMenuItemActive
                                        : searchModalMenuItem
                                }
                            />
                        ) : null}
                        {displayVideos ? (
                            <Menu.Item
                                value="videos"
                                // icon="video"
                                content="Videos"
                                disabled={!displayVideos}
                                active={activeItem === "videos"}
                                onClick={() => setActiveItem("videos")}
                                className={
                                    activeItem === "videos"
                                        ? searchModalMenuItemActive
                                        : searchModalMenuItem
                                }
                            />
                        ) : null}
                        {displayPlaces ? (
                            <Menu.Item
                                value="places"
                                // icon="map"
                                content="Places"
                                disabled={!displayPlaces}
                                active={activeItem === "places"}
                                onClick={() => setActiveItem("places")}
                                className={
                                    activeItem === "places"
                                        ? searchModalMenuItemActive
                                        : searchModalMenuItem
                                }
                            />
                        ) : null}
                    </Menu>
                </Modal.Actions>
            </Modal>
        </React.Fragment>
    );
}
