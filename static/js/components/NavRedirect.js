import React, { useEffect, useState, useContext } from "react";
import { API } from "aws-amplify";
import posthog from "posthog-js";
import { useSearchParams } from "react-router-dom";
import { Container, Loader, Dimmer } from "semantic-ui-react";
import { UserContext } from "../UserContext";

// function useQuery() {
//     return new URLSearchParams(useLocation().search);
// }

const NavRedirect = (props) => {
    const { isAnalyticsAllowed } = useContext(UserContext);
    const [lookupNeeded, setLookupNeeded] = useState(true);
    const [searchParams] = useSearchParams();
    const params = Object.fromEntries([...searchParams]);
    let query = params.query;
    const getNav = async (command) => {
        try {
            const navResult = await API.get("lazyweb-apis-stack", "/navigate", {
                queryStringParameters: {
                    query: command,
                },
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Expose-Headers": "Authorization",
                    "Content-Type": "application/json",
                },
            });
            setLookupNeeded(false);

            // Check if there is a url query string and remove from logging if so
            let currentUrl = window.location.href;
            if (currentUrl.includes("?query=")) {
                currentUrl = currentUrl.substring(
                    0,
                    currentUrl.indexOf("?query=") + 6
                );
            } else if (currentUrl.includes("?q=")) {
                currentUrl = currentUrl.substring(
                    0,
                    currentUrl.indexOf("?q=") + 2
                );
            } else if (currentUrl.includes("?share=")) {
                currentUrl = currentUrl.substring(
                    0,
                    currentUrl.indexOf("?share=") + 3
                );
            }

            if (
                navResult &&
                navResult.link.startsWith("http") &&
                (navResult.results_type === "Browser" ||
                    navResult.results_type === "Redirect Search")
            ) {
                if (isAnalyticsAllowed) {
                    posthog.capture("Navigation", {
                        "Address Bar": "Direct Navigation",
                    });
                }
                window.location.replace(navResult.link);
            } else if (navResult && navResult.link.startsWith("site:")) {
                if (isAnalyticsAllowed) {
                    posthog.capture("Browser Action", {
                        $current_url: currentUrl,
                        "Address Bar": "Navigation Result",
                    });
                }
                window.location.replace(`/?query=${navResult.link}`);
            } else {
                if (isAnalyticsAllowed) {
                    posthog.capture("Browser Action", {
                        $current_url: currentUrl,
                        "Address Bar": "Search Result",
                    });
                }
                window.location.replace(`/?query=${command}`);
            }
        } catch (error) {
            window.location.replace(`/?query=${command}`);
        }
    };

    useEffect(() => {
        if (query && lookupNeeded) {
            getNav(query);
        }
        // Redirect the page to search results if navigation hasn't loaded
        setTimeout(() => {
            window.location.replace(`/?query=${query}`);
        }, 3000);
        // eslint-disable-next-line
    }, [lookupNeeded, query]);

    return (
        <Container>
            <Dimmer active inverted>
                <Loader>Redirecting</Loader>
            </Dimmer>
        </Container>
    );
};
export default NavRedirect;
