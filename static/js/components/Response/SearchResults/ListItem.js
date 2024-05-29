import React, { useContext, useState } from "react";
import ProfilesList from "../ProfilesList";
import NewsProfilesList from "../NewsProfilesList";
import NewsList from "../NewsResults/NewsList";
import { UserContext } from "../../../UserContext";
import TextTools from "../TextTools";
import CardToolsMenu from "../CardToolsMenu";
import { Button } from "semantic-ui-react";
import getDomainNameAndSubdomain from "../../../utilities/getDomainNameAndSubdomain";

const ListItem = (props) => {
    const { result, officialWebsite, commands, refineSearch, query } = props;
    const { view } = useContext(UserContext);
    
    const [cardTitle, setCardTitle] = useState(
        result.title ? result.title : result.answer
    );

    const [cardDescription, setCardDescription] = useState("pending");

    const [readerLoaded, setReaderLoaded] = useState(false);
    const [cardDate, setCardDate] = useState(result.date ? result.date : null);

    // tldextract fails with some domains so use function with regex fallback
    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

    return (
        <div className={`lw-results-view-${view}`}>
            {view === "list" ? (
                <Button.Group size="large" floated="right" basic compact>
                    <CardToolsMenu
                        refineSearch={refineSearch}
                        result={result}
                        context="list"
                        commands={commands}
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
            ) : null}
            <h4 className="title">
                <a
                    onClick={(e) => e.stopPropagation()}
                    href={result.link}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Click"
                    data-Newsly-channel="Result Link Title"
                >
                    {result.title}
                </a>
                {view === "hacker" && domain ? (
                    <span style={{ fontSize: "8pt" }}> ({domain})</span>
                ) : null}
            </h4>

            <p className="description">
                {result.description ? result.description : result.desc}
            </p>
            <p className="link">
                <span className="url">
                    <a
                        onClick={(e) => e.stopPropagation()}
                        href={result.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="click"
                        data-Newsly-channel="Result Link"
                    >
                        {view !== "details"
                            ? result.link
                                  .replace("https://", "")
                                  .replace("http://", "")
                            : result.link}
                    </a>
                </span>
                {view === "goggles" || view === "hacker" ? (
                    <TextTools
                        result={result}
                        commands={commands}
                        refineSearch={refineSearch}
                        divider={view === "goggles" ? "-" : "|"}
                    />
                ) : null}
            </p>

            {result.profiles && result.link.includes("wikipedia") ? (
                <blockquote>
                    <ProfilesList
                        officialWebsite={officialWebsite}
                        profiles={result.profiles}
                        entityName={result.title}
                        commands={commands}
                        refineSearch={refineSearch}
                        query={query}
                    />
                </blockquote>
            ) : null}

            {result.news_profiles && result.news_profiles.length > 0 ? (
                result.link.includes("wikipedia") ? (
                    <div>
                        <blockquote>
                            <NewsProfilesList
                                profiles={result.news_profiles}
                                entityName={result.title}
                                commands={commands}
                                refineSearch={refineSearch}
                                query={query}
                            />
                        </blockquote>
                    </div>
                ) : (
                    <div>
                        <NewsProfilesList
                            profiles={result.news_profiles}
                            entityName={
                                result.topics.length > 0 &&
                                query.includes(result.topics[0])
                                    ? result.topics[0]
                                    : ""
                            }
                            commands={commands}
                            refineSearch={refineSearch}
                            query={query}
                        />
                    </div>
                )
            ) : null}

            {result.news ? (
                <NewsList
                    news={result.news}
                    commands={commands}
                    refineSearch={refineSearch}
                    query={query}
                />
            ) : null}

            {/* <Divider/> */}
        </div>
    );
};

export default ListItem;
