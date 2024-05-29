import React, { useContext } from "react";
import { Slug } from "../utilitiesResponse";
import { UserContext } from "../../../UserContext";
import CardToolsMenu from "../CardToolsMenu";
import { Button } from "semantic-ui-react";
// import tldExtract from "tld-extract";
import getDomainNameAndSubdomain from "../../../utilities/getDomainNameAndSubdomain";

const VideosList = (props) => {
    const { videos, commands, refineSearch } = props;
    const { view } = useContext(UserContext);

    const videosLinks = videos.map((videoItem, index) => {
        //console.log(profile);
        // let domain = "";
        // try {
        //     domain = tldExtract(videoItem.link).domain;
        // } catch (error) {
        //     domain = null;
        // }

        let { domain } =
            videoItem.link && getDomainNameAndSubdomain(videoItem.link);

        return (
            <div className={`lw-results-view-${view}`} key={index}>
                {view === "list" ? (
                    <Button.Group size="large" floated="right" basic compact>
                        <CardToolsMenu
                            refineSearch={refineSearch}
                            result={videoItem}
                            context="list"
                            commands={commands}
                        />
                    </Button.Group>
                ) : null}
                <h4 className="title">
                    <a
                        href={videoItem.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Video Link Title"
                    >
                        {videoItem.title}
                    </a>
                    {view === "hacker" && domain ? (
                        <span style={{ fontSize: "8pt" }}> ({domain})</span>
                    ) : null}
                </h4>

                <p className="description">
                    {videoItem.date && Slug(videoItem.date)
                        ? `${Slug(videoItem.date)} - `
                        : null}
                    {videoItem.source ? videoItem.source + " - " : null}
                    {videoItem.views ? `${videoItem.views} views` : null}
                </p>
                <p className="link">
                    <span className="url">
                        <a
                            href={videoItem.link}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="Video Link"
                        >
                            {view !== "details"
                                ? videoItem.link
                                      .replace("https://", "")
                                      .replace("http://", "")
                                : videoItem.link}
                        </a>
                    </span>
                </p>
            </div>
        );
    });

    return <div style={{ marginTop: "0rem" }}>{videosLinks}</div>;
};

export default VideosList;
