import React, { useContext } from "react";
import { profileTypes } from "../../constants";
import { UserContext } from "../../UserContext";
import TextTools from "./TextTools";
import CardToolsMenu from "./CardToolsMenu";
import { Button } from "semantic-ui-react";
// import tldExtract from "tld-extract";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";

function isHandleName(query) {
    const profilesWithHandles = [
        "soundcloud_id",
        "linkedin_profile",
        "facebook_profile",
        "instagram_profile",
        "twitter_profile",
    ];
    if (
        profilesWithHandles.some((term) => query.toLowerCase().startsWith(term))
    ) {
        return true;
    }
    return false;
}

const ProfilesList = (props) => {
    const { profiles, entityName, officialWebsite, commands, refineSearch } =
        props;
    const { view } = useContext(UserContext);

    const profileLinks = profiles.map((profile, index) => {
        //console.log(profile);
        if (!(profile.type in profileTypes) || (profile.link.toLowerCase().includes("wikipedia") && entityName)) {
            // If it's an unknown profile type, or a wikipedia link, skip it
            return null;
        }
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
        const profileHandle = isHandleName(profile.type)
            ? profile.link.slice(profile.link.lastIndexOf("/") + 1)
            : null;

        switch (profile.type) {
            case "official_website":
                title = officialWebsite.title
                    ? officialWebsite.title
                    : profile.title
                    ? profile.title
                    : "Official Website";
                description =
                    !(
                        officialWebsite.title &&
                        officialWebsite.title.toLowerCase().includes("official")
                    ) ||
                    (officialWebsite.description &&
                        officialWebsite.description
                            .toLowerCase()
                            .includes("official"))
                        ? officialWebsite.description
                            ? officialWebsite.description +
                              " (Official Website)"
                            : `${entityName} (Official Website)`
                        : officialWebsite.description
                        ? officialWebsite.description
                        : `Official website for ${entityName}`;
                break;
            case "instagram_profile":
                title = `${entityName} (@${profileHandle}) • Instagram photos and videos`;
                description = `See Instagram photos and videos from ${entityName} (@${profileHandle})`;
                break;
            case "twitter_profile":
                title = `${entityName} (@${profileHandle}) · Twitter`;
                description = `See the latest tweets from ${entityName} (@${profileHandle})`;
                break;
            case "facebook_profile":
                title = `${entityName} - Home | Facebook`;
                description = `${entityName} is on Facebook (${profileHandle})`;
                break;
            case "youtube_channel":
                title = `${entityName} YouTube Channel`;
                description = `${entityName}${
                    entityName.slice(-1) === "s" ? "'" : "'s"
                } Official YouTube`;
                break;
            case "linkedin_profile":
                title = `${entityName} | LinkedIn`;
                description = `View  ${entityName}${
                    entityName.slice(-1) === "s" ? "'" : "'s"
                } profile on LinkedIn, the world's largest professional community.`;
                break;
            case "imdb_id":
                title = profile.title ? profile.title : `${entityName} - IMDb`;
                description = `${entityName} is on IMDb`;
                break;
            case "spotify_artist_id":
                title = profile.title
                    ? profile.title
                    : `${entityName} | Spotify`;
                description = `Listen to ${entityName} on Spotify. Artist`;
                break;
            case "spotify_album_id":
                title = profile.title
                    ? profile.title
                    : `${entityName} | Spotify`;
                description = `Listen to ${entityName} on Spotify. Album`;
                break;
            case "spotify_playlist_id":
                title = profile.title
                    ? profile.title
                    : `${entityName} | Spotify`;
                description = `Listen to ${entityName} on Spotify. Playlist`;
                break;
            case "itunes_artist_id":
                title = profile.title
                    ? profile.title
                    : `${entityName} on Apple Music`;
                description = `Listen to music by ${entityName} on Apple Music. Find top songs and albums by ${entityName}`;
                break;
            case "soundcloud_id":
                title = `${entityName}${
                    entityName.slice(-1) === "s" ? "'" : "'s"
                } stream - SoundCloud`;
                description = `Listen to ${entityName} | Explore the largest community of artists, bands, podcasters and creators of music & audio.`;
                break;
            default:
                title = profile.title
                    ? profile.title
                    : `${entityName} - ${profileTypes[profile.type].name}`;
                description = `${entityName} is on ${
                    profileTypes[profile.type].name
                }`;
        }

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
                        data-Newsly-channel="Result Link Profile"
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
                            data-Newsly-channel="Result Link Profile"
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
                            divider={view === "goggles" ? "-" : "|"}
                        />
                    ) : null}
                </p>
            </div>
        );
    });

    return <div style={{ marginTop: "0rem" }}>{profileLinks}</div>;
};

export default ProfilesList;
