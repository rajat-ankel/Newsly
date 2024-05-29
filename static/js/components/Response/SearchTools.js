import React, { useState, useContext } from "react";
import { Dropdown, Input, Icon, Divider, Menu } from "semantic-ui-react";
import posthog from "posthog-js";
import { UserContext } from "../../UserContext";
import RelatedSearchSuggestions from "./RelatedSearchSuggestions";
// import {
//     lwPanelToolsMenu,
// } from "../../styles/Panel.module.css";

const SearchTools = (props) => {
    const { result, refineSearch, commands, query, handleNewUserMessage } =
        props;
    const { view, setView, setChatUpdateRequired } = useContext(UserContext);
    const [refineSearchInput, setRefineSearchInput] = useState("");
    let refineHistory =
        commands && commands.refineHistory ? commands.refineHistory : "";
    let refineHistoryQuery =
        commands && commands.refineHistoryQuery
            ? commands.refineHistoryQuery
            : "";

    const handleViewClick = (e, { name, text }) => {
        setView(name);
        posthog.capture("Engagement", { Action: "View", Channel: text });
    };

    const handleChange = (event) => {
        setRefineSearchInput(event.target.value);
        //console.log(event.target.value);
    };

    const handleSubmit = (event) => {
        //console.log("Click submitted:", refineSearchInput);
        posthog.capture("Engagement", {
            Action: "Tools",
            Channel: "Search Within Results",
        });
        if (refineSearchInput) {
            const refineProps = {
                setChatUpdateRequired: setChatUpdateRequired,
            };
            refineSearch(
                refineSearchInput,
                "within",
                refineHistory,
                refineHistoryQuery,
                refineProps
            );
        }
        setRefineSearchInput("");
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            //console.log("Key down submitted:", refineSearchInput);
            posthog.capture("Engagement", {
                Action: "Tools",
                Channel: "Search Within Results",
            });
            if (refineSearchInput) {
                const refineProps = {
                    setChatUpdateRequired: setChatUpdateRequired,
                };
                refineSearch(
                    refineSearchInput,
                    "within",
                    refineHistory,
                    refineHistoryQuery,
                    refineProps,
                );
            }
            setRefineSearchInput("");
        } else if (event.keyCode === 32) {
            //console.log("Space pressed");
            event.stopPropagation();
        }
    };

    const handleOpenLink = (linkDetails, e) => {
        // New window for external links
        if (linkDetails.link) {
            window.open(linkDetails.link, "_blank");
            posthog.capture(linkDetails.event, {
                Action: linkDetails.action,
                Channel: linkDetails.channel,
            });
        }
    };

    return (
        <Menu
            // size="small"
            borderless
            color="black"
            style={{
                margin: 0,
                padding: "0 0 0.75rem 0.5rem",
                borderTop: "1px solid var(--color-grey-2)",
                borderBottom: "none",
                borderLeft: "none",
                borderRight: "none",
                boxShadow: "none",
            }}
            // floated="right"
            // fixed="top"
            compact
            // attached="top"
            // className={lwPanelToolsMenu}
        >
            <Menu.Item>
                <Dropdown
                    text="Change View"
                    floating
                    closeOnChange
                    // compact
                    // className={lwPanelDropdown}
                    // className={lwPanelToolsMenu}
                >
                    <Dropdown.Menu >
                        <Dropdown.Item
                            text="Feed"
                            icon="id card outline"
                            active={view === "feed"}
                            name="feed"
                            onClick={handleViewClick}
                            // className={lwPanelToolsMenu}
                        />
                        <Dropdown.Item
                            text="Grid"
                            icon="grid layout"
                            active={view === "grid"}
                            name="grid"
                            onClick={handleViewClick}
                        />
                        <Dropdown.Item
                            text="List"
                            icon="list layout"
                            active={view === "complex-list"}
                            name="complex-list"
                            onClick={handleViewClick}
                        />

                        <Dropdown.Divider />
                        <Dropdown.Item
                            text="Simple List"
                            icon="list"
                            active={view === "list"}
                            name="list"
                            onClick={handleViewClick}
                        />
                        <Dropdown.Item
                            text="Hacker News"
                            icon="hacker news"
                            active={view === "hacker"}
                            name="hacker"
                            onClick={handleViewClick}
                        />
                        <Dropdown.Item
                            text="Classic Google"
                            icon="google"
                            active={view === "goggles"}
                            name="goggles"
                            onClick={handleViewClick}
                        />
                        <Dropdown.Item
                            text="Markdown Text"
                            icon="terminal"
                            active={view === "text"}
                            name="text"
                            onClick={handleViewClick}
                        />
                    </Dropdown.Menu>
                </Dropdown>
            </Menu.Item>
            <Menu.Item>
                <Dropdown
                    //item
                    //simple
                    //button
                    //compact
                    //direction="right"
                    text="Refine Search"
                    floating
                    //icon="ellipsis vertical"
                    // className={lwPanelDropdown}
                >
                    <Dropdown.Menu>
                        {refineSearch && "answer" in result ? (
                            <React.Fragment>
                                <Dropdown.Header content="Search within these results" />
                            </React.Fragment>
                        ) : null}
                        {refineSearch && "answer" in result ? (
                            <Input
                                icon={
                                    <Icon
                                        name="search"
                                        onClick={handleSubmit}
                                        link
                                    />
                                }
                                name="search"
                                onClick={(e) => e.stopPropagation()}
                                value={refineSearchInput}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                            />
                        ) : null}
                        {result.related_searches &&
                        result.related_searches.length > 0 ? (
                            <React.Fragment>
                                <Divider />
                                <RelatedSearchSuggestions
                                    suggestions={result.related_searches}
                                    handleNewUserMessage={handleNewUserMessage}
                                />
                            </React.Fragment>
                        ) : null}
                        <Divider />
                        <Dropdown.Header content="Try this search on..." />
                        <Dropdown.Item
                            icon="search"
                            text="Duck Duck Go"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://duckduckgo.com/?q=${query}`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Search with DDG",
                                    },
                                    e
                                )
                            }
                        />
                        <Dropdown.Item
                            icon="search"
                            text="Brave Search"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://search.brave.com/search?q=${query}`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Search with Brave",
                                    },
                                    e
                                )
                            }
                        />
                        <Dropdown.Item
                            icon="search"
                            text="Startpage"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://startpage.com/do/metasearch.pl?query=${query}`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Search with Startpage",
                                    },
                                    e
                                )
                            }
                        />
                        <Dropdown.Item
                            icon="google"
                            text="Google"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://google.com/search?q=${query}`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Search with Google",
                                    },
                                    e
                                )
                            }
                        />
                        <Dropdown.Item
                            icon="microsoft"
                            text="Bing"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://bing.com/search?q=${query}`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Search with Bing",
                                    },
                                    e
                                )
                            }
                        />
                    </Dropdown.Menu>
                </Dropdown>
            </Menu.Item>
            {/* <Menu.Item>
                <Dropdown
                    //item
                    //simple
                    //button
                    //compact
                    //direction="right"
                    floating
                    text="Sort By"
                    //icon="ellipsis vertical"
                    // className={lwPanelDropdown}
                >
                    <Dropdown.Menu>
                        <Dropdown.Item
                            icon="target"
                            text="Relevance"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://startpage.com/do/metasearch.pl?query=${query}`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Search with Startpage",
                                    },
                                    e
                                )
                            }
                        />
                        <Dropdown.Item
                            icon="sort descending"
                            text="Latest Date"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://duckduckgo.com/?q=${query}`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Search with DDG",
                                    },
                                    e
                                )
                            }
                        />
                        <Dropdown.Item
                            icon="sort ascending"
                            text="Oldest Date"
                            onClick={(e) =>
                                handleOpenLink(
                                    {
                                        link: `https://search.brave.com/search?q=${query}`,
                                        event: "Engagement",
                                        action: "Tools",
                                        channel: "Search with Brave",
                                    },
                                    e
                                )
                            }
                        />
                    </Dropdown.Menu>
                </Dropdown>
            </Menu.Item> */}
        </Menu>
    );
};

export default SearchTools;
