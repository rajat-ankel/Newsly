import React, { useContext } from "react";
import { UserContext } from "../../UserContext";
import TextTools from "./TextTools";
import CardToolsMenu from "./CardToolsMenu";
import { Button } from "semantic-ui-react";
// import tldExtract from "tld-extract";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";

const NewsProfilesList = (props) => {
    const { profiles, entityName, commands, refineSearch, query } = props;
    const { view } = useContext(UserContext);

    const profileLinks = profiles.map((profile, index) => {
        //console.log(profile);

        // let domain = "";
        // try {
        //     domain = tldExtract(profile.link).domain;
        // } catch (error) {
        //     domain = null;
        // }

        let { domain } =
            profile.link && getDomainNameAndSubdomain(profile.link);

        let title = "";
        let description = "";

        let descriptionEntityString = entityName
            ? ` about ${entityName}`
            : query
            ? ` for '${query}'`
            : "";

        title = profile.title
            ? profile.title
            : `${entityName} on ${profile.source}`;
        description = `News and coverage${descriptionEntityString} on ${profile.source}`;

        return (
            <div className={`lw-results-view-${view}`} key={index}>
                {view === "list" ? (
                    <Button.Group size="large" floated="right" basic compact>
                        <CardToolsMenu
                            refineSearch={refineSearch}
                            result={profile}
                            context="list"
                            commands={commands}
                            
                        />
                    </Button.Group>
                ) : null}
                <h4 className="title">
                    <a
                        href={profile.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Result Link News Profile"
                    >
                        {title}
                    </a>
                    {view === "hacker" && domain ? (
                        <span style={{ fontSize: "8pt" }}> ({domain})</span>
                    ) : null}
                </h4>
                <p className="description">{description}</p>
                <p className="link">
                    <span className="url">
                        <a
                            href={profile.link}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="Result Link News Profile"
                        >
                            {view !== "details"
                                ? profile.link
                                      .replace("https://", "")
                                      .replace("http://", "")
                                : profile.link}
                        </a>
                    </span>
                    {view === "goggles" || view === "hacker" ? (
                        <TextTools
                            result={profile}
                            commands={commands}
                            refineSearch={refineSearch}
                        />
                    ) : null}
                </p>
            </div>
        );
    });

    return <div style={{ marginTop: "0rem" }}>{profileLinks}</div>;
};

export default NewsProfilesList;
