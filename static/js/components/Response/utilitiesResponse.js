import {
    FAVICON_PROXY,
    IMAGE_PROXY,
    IMAGE_KEY,
    profileTypes,
} from "../../constants";
import camoUrl from "camo-url";
// import tldExtract from "tld-extract";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";

/* Calculate time display since posting */
function timeDifference(current, previous) {
    const milliSecondsPerMinute = 60 * 1000;
    const milliSecondsPerHour = milliSecondsPerMinute * 60;
    const milliSecondsPerDay = milliSecondsPerHour * 24;
    const milliSecondsPerMonth = milliSecondsPerDay * 30;
    const milliSecondsPerYear = milliSecondsPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < milliSecondsPerMinute / 3) {
        return "just now";
    }

    if (elapsed < milliSecondsPerMinute) {
        return "less than 1 min ago";
    } else if (elapsed < milliSecondsPerHour) {
        return Math.round(elapsed / milliSecondsPerMinute) + " min ago";
    } else if (elapsed < milliSecondsPerDay) {
        return Math.round(elapsed / milliSecondsPerHour) + " h ago";
    } else if (elapsed < milliSecondsPerMonth) {
        return Math.round(elapsed / milliSecondsPerDay) + " days ago";
    } else if (elapsed < milliSecondsPerYear) {
        return Math.round(elapsed / milliSecondsPerMonth) + " mo ago";
    } else {
        return Math.round(elapsed / milliSecondsPerYear) + " years ago";
    }
}

export function timeDifferenceForDate(date) {
    const now = new Date().getTime();
    const updated = new Date(date).getTime();
    return timeDifference(now, updated);
}

export function cardImageSpecialHandler(imageUrl, link, useFavicon) {
    // Add proxy and special hNewslyng for card images
    const camoImageProxy = camoUrl({
        host: IMAGE_PROXY,
        key: IMAGE_KEY,
        type: "path",
    });
    let cardImage = imageUrl;
    if (imageUrl) {
        if (false) {
            if (imageUrl.includes("wolfram-alpha-logo.svg")) {
                cardImage = "/assets/cardHeaders/wolframalpha.png";
            } else if (link && link.includes("stackoverflow.com")) {
                cardImage = "/assets/cardHeaders/stackoverflow.png";
            } else if (
                cardImage.includes("zillow.") &&
                cardImage.includes("icon.png")
            ) {
                cardImage = "/assets/cardHeaders/zillow.png";
            }
        } else {
            cardImage = camoImageProxy(imageUrl);
        }
    } else if (imageUrl === "" && link && false) {
        if (link && link.includes("yelp.")) {
            cardImage = "/assets/cardHeaders/yelp.png";
        } else if (link && link.includes("tripadvisor.")) {
            cardImage = "/assets/cardHeaders/tripadvisor.jpeg";
        } else if (link && link.includes("opentable.")) {
            cardImage = "/assets/cardHeaders/opentable.png";
        } else if (link && link.includes("realestate.com.au")) {
            cardImage = "/assets/cardHeaders/realestate.png";
            // } else if (link && link.includes("instagram.com")) {
            //     cardImage = "/assets/cardHeaders/instagram.png";
        } else if (link && link.includes("bestbuy.com")) {
            cardImage = "/assets/cardHeaders/bestbuy.jpg";
        } else if (link && link.includes("gucci.com")) {
            cardImage = "/assets/cardHeaders/gucci.png";
        } else if (link && link.includes("news.ycombinator.com")) {
            cardImage = "/assets/cardHeaders/yclogo.jpg";
        } else if (link && link.includes("amazon.")) {
            cardImage = "/assets/cardHeaders/amazon.jpg";
        } else if (link && link.includes("twitter.")) {
            cardImage = "/assets/cardHeaders/twitter.png";
        } else if (link && link.includes("facebook.")) {
            cardImage = "/assets/cardHeaders/facebook.png";
        } else if (link && link.includes("spotify.")) {
            cardImage = "/assets/cardHeaders/spotify.png";
        } else if (link && link.includes("imdb.")) {
            cardImage = "/assets/cardHeaders/imdb.png";
            // } else if (link && link.includes("wikipedia.org")) {
            //     cardImage = "/assets/cardHeaders/wikipedia.png";
        } else if (link && link.includes("itunes.")) {
            cardImage = "/assets/cardHeaders/apple.png";
        } else if (link && link.includes("music.apple.")) {
            cardImage = "/assets/cardHeaders/apple.png";
        } else if (link && link.includes("rottentomatoes.")) {
            cardImage = "/assets/cardHeaders/rotten_tomatoes.jpeg";
        } else if (link && link.includes("soundcloud.com")) {
            cardImage = "/assets/cardHeaders/soundcloud.png";
        } else if (link && link.includes("youtube.com")) {
            cardImage = "/assets/cardHeaders/youtube.png";
        } else if (link && link.includes("tiktok.com")) {
            cardImage = "/assets/cardHeaders/tiktok.jpeg";
            // } else if (link && link.includes("britannica.com")) {
            //     cardImage = "/assets/cardHeaders/britannica.png";
        } else if (useFavicon) {
            //Swap in Favicon as fallback
            // cardImage = camoImageProxy(`${FAVICON_PROXY}/${tldExtract(link)?.domain}.ico`);
            let { domain } = link && getDomainNameAndSubdomain(link);
            if (domain) {
                cardImage = `${FAVICON_PROXY}/${domain}.ico`;
            } else {
                cardImage = `${FAVICON_PROXY}/no-favicon.ico`;
            }
        } else if (link && link.includes("ycombinator.com")) {
            cardImage = "/assets/cardHeaders/ycombinator.jpg";
        }
    } else if (useFavicon) {
        //Swap in Favicon as fallback
        // cardImage = camoImageProxy(`${FAVICON_PROXY}/${tldExtract(link)?.domain}.ico`);
        let { domain } = link && getDomainNameAndSubdomain(link);
        if (domain) {
            cardImage = `${FAVICON_PROXY}/${domain}.ico`;
        } else {
            cardImage = `${FAVICON_PROXY}/no-favicon.ico`;
        }
    } else if (link && link.includes("ycombinator.com")) {
        cardImage = "/assets/cardHeaders/ycombinator.jpg";
    }

    return cardImage;
}

export function extractContent(s, space) {
    var span = document.createElement("span");
    span.innerHTML = s;
    if (space) {
        var children = span.querySelectorAll("*");
        for (var i = 0; i < children.length; i++) {
            if (children[i].textContent) children[i].textContent += " ";
            else children[i].innerText += " ";
        }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g, " ");
}

export function Slug(pageDate) {
    let headerSlug = "";
    let dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    let publishTimeStamp = new Date();
    let publishedDate = new Date();
    if (pageDate) {
        publishTimeStamp = Date.parse(pageDate);
        //console.log(publishTimeStamp);
        publishedDate = new Date(publishTimeStamp);
        //console.log("Date: ", publishedDate);
    } else {
        publishedDate = null;
    }

    if (publishedDate !== null) {
        headerSlug =
            publishedDate.toLocaleString("en-US", dateOptions) +
            " (" +
            timeDifferenceForDate(publishedDate) +
            ")";
    }
    return headerSlug;
}

export const convertProfilesToResults = (props) => {
    const { profiles, officialWebsite, entityName } = props;

    function isHandleName(query) {
        const profilesWithHandles = [
            "soundcloud_id",
            "linkedin_profile",
            "facebook_profile",
            "instagram_profile",
            "twitter_profile",
        ];
        if (
            profilesWithHandles.some((term) =>
                query.toLowerCase().startsWith(term)
            )
        ) {
            return true;
        }
        return false;
    }

    const profileResults = profiles.map((profile, index) => {
        //console.log(profile);
        // let domain = "";
        // try {
        //     domain = tldExtract(profile.link).domain;
        // } catch (error) {
        //     domain = null;
        // }

        let { domain } =
            profile.link && getDomainNameAndSubdomain(profile.link);

        if (!(profile.type in profileTypes)) {
            return {
                title: profile.title,
                desc: `${entityName} is on ${domain}`,
                link: profile.link,
                image: "",
                source: domain,
                type: profile.type,
            };
        }

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

        return {
            title: title,
            desc: description,
            link: profile.link,
            image: "",
            source: domain,
            type: profile.type,
        };
    });

    return profileResults;
};

export const convertNewsProfilesToResults = (props) => {
    const { profiles, query, entityName } = props;

    const profileResults = profiles.map((profile, index) => {
        //console.log(profile);
        // let domain = "";
        // try {
        //     domain = tldExtract(profile.link).domain;
        // } catch (error) {
        //     domain = null;
        // }

        let { domain } =
            profile.link && getDomainNameAndSubdomain(profile.link);

        const cardImage = `${FAVICON_PROXY}/${domain}.ico`;

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

        return {
            title: title,
            desc: description,
            link: profile.link,
            image: cardImage,
            source: domain,
            type: "news",
        };
    });

    return profileResults;
};

export function getTopDomainMatchesForQuery(results, query) {
    // Add other high ranked domains that match the query
    if (!results) {
        return true;
    }
    const regex = /^(?:https?:\/\/)/;
    let queryMatches = [];
    let resultDomains = [];
    let resultDomainNames = [];
    let queryWords = query.toLowerCase().split(" ");
    results.every((item) => {
        let newDomain =
            item && item.link.includes("http")
                ? item.link?.split(regex)[1].split("/")[0].replace("www.", "")
                : null;
        if (newDomain && resultDomains.indexOf(newDomain) === -1) {
            resultDomains.push(newDomain);
            resultDomainNames.push({
                title: newDomain,
                link: item.link,
            });
        }
        return true;
    });
    [...new Set(resultDomainNames)].slice(0, -1).every((item, index) => {
        queryWords.every((word) => {
            if (item.title && item.title.toLowerCase().includes(word)) {
                queryMatches.push(item);
                return false;
            }
            return true;
        });
        return true;
    });

    // If there are no matches return the top three
    if (queryMatches.length < 3) {
        queryMatches = resultDomainNames.slice(0, 3);
    }
    return queryMatches;
}

export const sourceName = (result) => {
    if (result?.source) {
        return result.source;
    }

    // tldextract fails with some domains so use function with regex fallback
    const { domain, sub } =
        result.link &&
        getDomainNameAndSubdomain(result.link.replace("www.", ""));

    const fullSourceString = result.link
        ? `${sub ? `${sub}.` : ""}${domain}`
        : "";

    // const sourceSubDomain = result.link
    //     ? tldExtract(result.link)?.sub?.replace("www", "")
    //     : null;
    // const fullSourceString = result.link
    //     ? `${sourceSubDomain ? `${sourceSubDomain}.` : ""}${
    //           tldExtract(result.link)?.domain
    //       }`
    //     : "";

    const source = result.source
        ? result.source
        : result.link
        ? fullSourceString
        : result.engine
        ? result.engine
        : "";

    return source;
};
