import React, { useContext } from "react";
import { Button } from "semantic-ui-react";
// import tldExtract from "tld-extract";
import { UserContext } from "../../UserContext";
import getDomainNameAndSubdomain from "../../utilities/getDomainNameAndSubdomain";

const TextTools = (props) => {
    const { result, commands, refineSearch, divider="-" } = props;
    const { setChatUpdateRequired } = useContext(UserContext);
    let refineHistory =
        commands && commands.refineHistory ? commands.refineHistory : "";
    let refineHistoryQuery =
        commands && commands.refineHistoryQuery
            ? commands.refineHistoryQuery
            : "";
    const refineProps = {
        setChatUpdateRequired: setChatUpdateRequired,
    };

    // let domain = "";
    // try {
    //     domain = tldExtract(result.link).domain;
    // } catch (error) {
    //     domain = result.source ? result.source : null;
    // }


    // tldextract fails with some domains so use function with regex fallback
    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

    return (
        <span className="extras">
            {" "}
            {divider}{" "}
            {result.link ? (
                <a
                    href={`https://webcache.googleusercontent.com/search?q=cache:${
                        result.link?.split("://")[1]
                    }`}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Tools"
                    data-Newsly-channel="Cached Version"
                >
                    Cached
                </a>
            ) : (
                ""
            )}{" "}
            {divider}{" "}
            <Button
                onClick={(e) =>
                    refineSearch(
                        domain,
                        "related",
                        refineHistory,
                        refineHistoryQuery,
                        refineProps,
                        e
                    )
                }
                data-Newsly-event="Engagement"
                data-Newsly-action="Refine"
                data-Newsly-channel="Similar Pages"
            >
                Similar pages
            </Button>
            {domain ? (
                <span>
                    {" "}{divider}{" "}
                    <Button
                        onClick={(e) =>
                            refineSearch(
                                domain,
                                "domain",
                                refineHistory,
                                refineHistoryQuery,
                                refineProps,
                                e
                            )
                        }
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Refine"
                        data-Newsly-channel="More Results from Domain"
                    >
                        More from {domain}
                    </Button>
                </span>
            ) : null}
        </span>
    );
};

export default TextTools;
