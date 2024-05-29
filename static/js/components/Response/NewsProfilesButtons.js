import React from "react";
import { Card, Image, Popup } from "semantic-ui-react";
import { FAVICON_PROXY } from "../../constants";
// import tldExtract from "tld-extract";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";

const NewsProfilesButtons = (props) => {
    const { profiles } = props;

    const profileButtons = profiles.map((profile) => {
        const { domain, sub } =
            profile.link &&
            getDomainNameAndSubdomain(profile.link.replace("www.", ""));

        const cardImage = `${FAVICON_PROXY}/${domain}.ico`;
        
        const sourceString = profile.source
            ? profile.source
            : `${sub ? `${sub}.` : ""}${domain}`;
        return (
            <Popup
                content={profile.title}
                // position="top center"
                style={{ zIndex: 9999 }}
                on="hover"
                trigger={
                    <Card
                        // className="lw-tile-card"
                        className="lw-citation-card"
                        //style={{background: "#fff!important"}}
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
                        style={{
                            border: "2px solid lightgrey",
                            borderRadius: "9999px",
                            padding: "0",
                            display: "inline-block",
                            textAlign: "left",
                            margin: "0 0.5rem 0.5rem 0.5rem",
                            color: "black",
                            width: "fit-content",
                            boxShadow: "none",
                            position: "relative",
                        }}
                    >
                        <Card.Content
                            data-Newsly-event="Engagement"
                            data-Newsly-action="Click"
                            data-Newsly-channel="Result Link News Profile"
                            data-Newsly-destination={sourceString}
                            style={{
                                padding: "0",
                                borderRadius: "9999px",
                                boxShadow: "none",
                            }}
                        >
                            <Image
                                rounded
                                floated="left"
                                src={cardImage}
                                size="mini"
                                data-Newsly-event="Engagement"
                                data-Newsly-action="Click"
                                data-Newsly-channel="Result Link News Profile"
                                data-Newsly-destination={sourceString}
                                style={{
                                    margin: "0.25rem 0 0 0",
                                    padding: "0 0 0 0.5rem",
                                }}
                            />
                            <Card.Meta
                                data-Newsly-event="Engagement"
                                data-Newsly-action="Click"
                                data-Newsly-channel="Result Link News Profile"
                                data-Newsly-destination={sourceString}
                                style={{
                                    padding: "0 0 0 0",
                                }}
                            >
                                {sourceString}
                            </Card.Meta>
                        </Card.Content>
                    </Card>
                }
                key={profile.link}
            />
        );
    });

    return (
        <div style={{ marginTop: "1rem" }}>
            <Card.Group
                style={{ marginBottom: "0", marginLeft: "0", marginRight: "0" }}
                className="lw-tile-card-group"
            >
                {profileButtons}
            </Card.Group>
        </div>
    );
};

export default NewsProfilesButtons;

/*                     <Card.Header
                        as="h5"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel="Result Link News Profile"
                        data-Newsly-destination={sourceString}
                    >
                        {profile.title}
                    </Card.Header> */
