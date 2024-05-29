import React from "react";
import { Card, Image } from "semantic-ui-react";
import { FAVICON_PROXY } from "../../constants";
// import tldExtract from "tld-extract";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";

const NewsProfiles = (props) => {
    const { profiles } = props;

    const profileButtons = profiles.map((profile) => {
        const { domain, sub } =
            profile.link &&
            getDomainNameAndSubdomain(profile.link.replace("www.", ""));

        // const domain = profile.link && tldExtract(profile.link).domain;
        const cardImage = `${FAVICON_PROXY}/${domain}.ico`;
        // const cardImage = cardImageSpecialHandler(
        //     sourceFaviconUrl,
        //     profile.link,
        //     true
        // );

        // const sourceSubDomain = tldExtract(profile.link)?.sub?.replace(
        //     "www",
        //     ""
        // );
        const sourceString = profile.source
            ? profile.source
            : `${sub ? `${sub}.` : ""}${domain}`;
        return (
            <Card
                className="lw-tile-card"
                style={{ background: "#fff!important" }}
                key={profile.link}
                as="a"
                onClick={(e) => e.stopPropagation()}
                href={profile.link}
                target="_blank"
                rel="nofollow noopener noreferrer"
                data-Newsly-event="Engagement"
                data-Newsly-action="Click"
                data-Newsly-channel="Result Link News Profile"
                data-Newsly-destination={sourceString}
                fluid
            >
                <Card.Content
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Click"
                    data-Newsly-channel="Result Link News Profile"
                    data-Newsly-destination={sourceString}
                >
                    <Image
                        rounded
                        floated="right"
                        src={cardImage}
                        // size="small"
                        style={{ width: "32px", height: "32px" }}
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Result Link News Profile"
                        data-Newsly-destination={sourceString}
                    />

                    <Card.Header
                        as="h5"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Result Link News Profile"
                        data-Newsly-destination={sourceString}
                    >
                        {profile.title}
                    </Card.Header>
                    <Card.Meta
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Result Link News Profile"
                        data-Newsly-destination={sourceString}
                    >
                        {sourceString}
                    </Card.Meta>
                </Card.Content>
            </Card>
        );
    });

    return (
        <div style={{ marginTop: "2rem" }}>
            <Card.Group
                style={{
                    marginBottom: "1rem",
                    width: "100%",
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
                // className="lw-tile-card-group"
            >
                {profileButtons}
            </Card.Group>
        </div>
    );
};

export default NewsProfiles;
