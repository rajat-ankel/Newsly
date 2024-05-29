import React from "react";
import { Card, Image, Popup } from "semantic-ui-react";
//import { profileTypes } from "../../constants";
// import tldExtract from "tld-extract";
import {
    convertProfilesToResults,
    cardImageSpecialHandler,
} from "./utilitiesResponse";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";

const Profiles = (props) => {
    const { profiles, entityName } = props;

    let officialWebsite = {};

    profiles.forEach((profile) => {
        if (profile.type === "official_website") {
            const { domain, sub } =
                profile.link &&
                getDomainNameAndSubdomain(profile.link.replace("www.", ""));
            const sourceString = `${sub ? `${sub}.` : ""}${domain}`;
            officialWebsite["link"] = profile.link;
            officialWebsite["title"] = entityName;
            officialWebsite["source"] = sourceString;
        }
    });

    const profileResults = convertProfilesToResults(
        (props = {
            profiles: profiles,
            officialWebsite: officialWebsite,
            entityName: entityName,
        })
    );

    const profileButtons = profileResults.map((profile) => {
        const cardImage = cardImageSpecialHandler(
            profile.image,
            profile.link,
            true
        );

        const { domain, sub } =
            profile.link &&
            getDomainNameAndSubdomain(profile.link.replace("www.", ""));
        const sourceString = `${sub ? `${sub}.` : ""}${domain}`;

        return (
            <Popup
                content={profile.title}
                // position="top center"
                style={{ zIndex: 9999 }}
                on="hover"
                // content="testing"
                trigger={
                    <Card
                        // className="lw-tile-card"
                        className="lw-citation-card"
                        //style={{background: "#fff!important"}}
                        // key={profile.link}
                        as="a"
                        onClick={(e) => e.stopPropagation()}
                        href={profile.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Click"
                        data-Newsly-channel={
                            profile.type === "official_website"
                                ? "Result Link Official Site"
                                : "Result Link Profile"
                        }
                        data-Newsly-destination={sourceString}
                        style={{
                            border: "2px solid lightgrey",
                            borderRadius: "9999px",
                            padding: "0",
                            // display: "inline-block",
                            textAlign: "left",
                            margin: "0 0.5rem 0.5rem 0.5rem",
                            color: "black",
                            width: "fit-content",
                            boxShadow: "none",
                            position: "relative",
                        }}
                    >
                        <Card.Content
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
                                style={{
                                    margin: "0.25rem 0 0 0",
                                    padding: "0 0 0 0.5rem",
                                }}
                            />
                            <Card.Meta
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
                style={{ marginBottom: "1rem", marginTop: "1rem", marginLeft: "0", marginRight: "0" }}
                className="lw-tile-card-group"
            >
                {profileButtons}
            </Card.Group>
        </div>
    );
};

export default Profiles;
