import React, { useContext } from "react";
import { Slug } from "../utilitiesResponse";
import { UserContext } from "../../../UserContext";
import CardToolsMenu from "../CardToolsMenu";
import { Button } from "semantic-ui-react";
// import tldExtract from "tld-extract";
import getDomainNameAndSubdomain from "../../../utilities/getDomainNameAndSubdomain";

const NewsList = (props) => {
    const { news, commands, refineSearch } = props;
    const { view } = useContext(UserContext);

    const newsLinks = news.map((newsItem, index) => {
        //console.log(profile);
        // let domain = "";
        // try {
        //     domain = tldExtract(newsItem.link).domain;
        // } catch (error) {
        //     domain = null;
        // }

        let { domain } =
            newsItem.link && getDomainNameAndSubdomain(newsItem.link);
        if (domain === null || domain === "") {
            domain = newsItem.source ? newsItem.source : null;
        }

        return (
            <div className={`lw-results-view-${view}`} key={index}>
                {view === "list" ? (
                    <Button.Group size="large" floated="right" basic compact>
                        <CardToolsMenu
                            refineSearch={refineSearch}
                            result={newsItem}
                            context="list"
                            commands={commands}
                        />
                    </Button.Group>
                ) : null}
                <h4 className="title">
                    <a
                        href={newsItem.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="News Link Title"
                    >
                        {newsItem.title}
                    </a>
                    {view === "hacker" && domain ? (
                        <span style={{ fontSize: "8pt" }}> ({domain})</span>
                    ) : null}
                </h4>
                <p className="description">
                    {newsItem.date && Slug(newsItem.date)
                        ? `${Slug(newsItem.date)} - `
                        : null}
                    {newsItem.desc}
                </p>
                <p className="link">
                    <span className="url">
                        <a
                            href={newsItem.link}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="News Link"
                        >
                            {view !== "details"
                                ? newsItem.link
                                      .replace("https://", "")
                                      .replace("http://", "")
                                : newsItem.link}
                        </a>
                    </span>
                </p>
            </div>
        );
    });

    return <div style={{ marginTop: "0rem" }}>{newsLinks}</div>;
};

export default NewsList;
