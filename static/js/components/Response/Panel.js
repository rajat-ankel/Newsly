import React, { useState, useEffect } from "react";
import { Tab, Button } from "semantic-ui-react";
import SearchResults from "./SearchResults/SearchResults";
import NewsResults from "./NewsResults/NewsResults";
import ImageResults from "./ImageResults";
import VideoResults from "./VideoResults/VideoResults";
import PlacesResults from "./PlacesResults";
import SearchTools from "./SearchTools";

import {
    lwPanelMenu,
    lwPanelTab,
    lwPanelMenuItem,
    lwPanelMenuItemExtra,
    lwPanelMenuItemActive,
    lwPanelButton,
} from "../../styles/Panel.module.css";

const Panel = (props) => {
    const {
        result,
        refineSearch,
        commands,
        id,
        tab,
        query,
        handleNewUserMessage,
    } = props;

    const [activeIndex, setActiveIndex] = useState(tab ? tab : 0);
    const [currentResults, setCurrentResults] = useState(result);
    const [showToolsMenu, setShowToolsMenu] = useState(true);

    const showTabLables = true; //window.innerWidth >= 992;

    const handleTabChange = (e, { activeIndex }) => {
        setActiveIndex(activeIndex);
        
    };

    
    useEffect(() => {
        if (result !== currentResults) {
            // New results have populated
            setActiveIndex(tab);
            setCurrentResults(result);
        }

        return () => {
            //console.log("panel removed");
        };
    }, [setActiveIndex, tab, result, setCurrentResults, currentResults]);

    const handleShowToolsMenu = (e) => {
        setShowToolsMenu(!showToolsMenu);
    };

    let resultPanes = result
        ? [
              {
                  menuItem: {
                      key: `results-${id}`,
                      //icon: "list",
                      //   content: showTabLables ? "Results" : null,
                      children: (
                          <div
                              className={
                                  activeIndex === 0
                                      ? lwPanelMenuItemActive
                                      : lwPanelMenuItem
                              }
                          >
                              {showTabLables ? "Results" : null}
                          </div>
                      ),
                      disabled: !result.results || result.results.length === 0,
                      "data-Newsly-event": "Engagement",
                      "data-Newsly-action": "View",
                      "data-Newsly-channel": "Web Tab",
                  },
                  render: () => (
                      <Tab.Pane
                          attached={false}
                          style={{
                              background: "white",
                              marginTop: "0",
                              //paddingTop: "0.25rem",
                          }}
                          className={lwPanelTab}
                      >
                          {showToolsMenu ? (
                              <React.Fragment>
                                  <SearchTools
                                      result={result}
                                      refineSearch={refineSearch}
                                      commands={commands}
                                      query={query}
                                      handleNewUserMessage={
                                          handleNewUserMessage
                                      }
                                  />
                                  <SearchResults
                                      result={result}
                                      refineSearch={refineSearch}
                                      commands={commands}
                                      query={query}
                                      handleNewUserMessage={
                                          handleNewUserMessage
                                      }
                                  />
                              </React.Fragment>
                          ) : (
                              <React.Fragment>
                                  <SearchResults
                                      result={result}
                                      refineSearch={refineSearch}
                                      commands={commands}
                                      query={query}
                                      handleNewUserMessage={
                                          handleNewUserMessage
                                      }
                                  />
                              </React.Fragment>
                          )}
                      </Tab.Pane>
                  ),
              },
              {
                  menuItem: {
                      key: `news-${id}`,
                      //icon: "newspaper outline",
                      //   content: showTabLables ? `|  News` : null,
                      children: (
                          <div className={lwPanelMenuItemExtra}>
                              {showTabLables ? "News" : null}
                          </div>
                      ),
                      disabled:
                          (!result.news || result.news.length === 0) &&
                          (!result.news_profiles ||
                              result.news_profiles.length === 0),
                      "data-Newsly-event": "Engagement",
                      "data-Newsly-action": "View",
                      "data-Newsly-channel": "News Tab",
                  },
                  render: () => (
                      <Tab.Pane
                          attached={false}
                          style={{ background: "white", marginTop: "0" }}
                          className={lwPanelTab}
                      >
                          <NewsResults
                              result={result}
                              refineSearch={refineSearch}
                              commands={commands}
                              query={query}
                          />
                      </Tab.Pane>
                  ),
              },
              {
                  menuItem: {
                      key: `images-${id}`,
                      //icon: "image outline",
                      //   content: showTabLables ? "Images" : null,
                      children: (
                          <div className={lwPanelMenuItemExtra}>
                              {showTabLables ? "Images" : null}
                          </div>
                      ),
                      disabled: !result.images || result.images.length === 0,
                      "data-Newsly-event": "Engagement",
                      "data-Newsly-action": "View",
                      "data-Newsly-channel": "Images Tab",
                  },
                  render: () => (
                      <Tab.Pane
                          attached={false}
                          style={{
                              background: "white",
                              marginTop: "0",
                              width: "initial",
                              //paddingTop: "0.5rem",
                          }}
                          className={lwPanelTab}
                      >
                          <ImageResults result={result} />
                      </Tab.Pane>
                  ),
              },
              {
                  menuItem: {
                      key: `videos-${id}`,
                      //icon: "video",
                      //   content: showTabLables ? "Videos" : null,
                      children: (
                          <div className={lwPanelMenuItemExtra}>
                              {showTabLables ? "Videos" : null}
                          </div>
                      ),
                      disabled: !result.videos || result.videos.length === 0,
                      "data-Newsly-event": "Engagement",
                      "data-Newsly-action": "View",
                      "data-Newsly-channel": "Videos Tab",
                  },
                  render: () => (
                      <Tab.Pane
                          attached={false}
                          style={{
                              background: "white",
                              marginTop: "0",
                              //paddingTop: "0.5rem",
                          }}
                          className={lwPanelTab}
                      >
                          <VideoResults
                              results={result.videos}
                              //commands={commands}
                          />
                      </Tab.Pane>
                  ),
              },
              {
                  menuItem: {
                      key: `maps-${id}`,
                      //icon: "map",
                      //   content: showTabLables ? "Places" : null,
                      children: (
                          <div className={lwPanelMenuItemExtra}>
                              {showTabLables ? "Places" : null}
                          </div>
                      ),

                      disabled: !result.places || result.places.length === 0,
                      "data-Newsly-event": "Engagement",
                      "data-Newsly-action": "View",
                      "data-Newsly-channel": "Maps Tab",
                  },
                  render: () => (
                      <Tab.Pane
                          attached={false}
                          style={{ background: "white", marginTop: "0" }}
                          className={lwPanelTab}
                      >
                          <PlacesResults results={result.places} />
                      </Tab.Pane>
                  ),
              },
          ].filter((item) => !item.menuItem.disabled)
        : [
              {
                  menuItem: {
                      key: `welcome`,
                      //icon: "map",
                      content: "Search results show here",
                      active: false,
                  },
                  render: () => null,
              },
          ];

    return (
        <React.Fragment>
            {result && activeIndex === 0 ? (
                <Button
                    color={showToolsMenu ? "black" : "black"}
                    floated="right"
                    content={showToolsMenu ? "Showing Tools" : "Tools"}
                    icon={showToolsMenu ? "chevron down" : null}
                    onClick={(e) => handleShowToolsMenu()}
                    className={lwPanelButton}
                />
            ) : null}

            <Tab
                menu={{
                    attached: false,
                    tabular: false,
                    pointing: false,
                    compact: true,
                    borderless: true,
                    text: true,
                    color: "black",
                    // renderActiveOnly: false,
                }}
                panes={resultPanes}
                className={lwPanelMenu}
                //style={{background: "white"}}
                hidden={!result}
                activeIndex={activeIndex}
                onTabChange={handleTabChange}
                // renderActiveOnly={false}
                menuPosition="right"
            />
        </React.Fragment>
    );
};
export default Panel;
