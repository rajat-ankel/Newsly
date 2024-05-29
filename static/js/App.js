import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Amplify, Auth, Cache } from "aws-amplify";
import posthog from "posthog-js";
import axios from "axios";

import awsconfig from "./aws-exports";
import useWindowDimensions from "./utilities/useWindowDimensions";
import useLocalStorage from "./utilities/useLocalStorage";
import { useDarkMode } from "./utilities/useDarkMode";
// import TopNav from "./components/TopNav";
import Desktop from "./components/Desktop/Desktop";
// import Hero from "./components/Desktop/Hero";
import Mobile from "./components/Mobile/Mobile";

import Settings from "./views/Settings";
import ContentPage from "./views/ContentPage";
import BugReportPage from "./views/BugReportPage";
import FeedbackPage from "./views/FeedbackPage";
import DemoPage from "./views/DemoPage";
import NavRedirect from "./components/NavRedirect";
import { UserContext } from "./UserContext";
import {
    VERSION,
    GEO_LOOKUP,
    LOCATION_DATA_PLACEHOLDER,
    COORDS_PLACEHOLDER,
    botConfig,
} from "./constants";
import { stateNameToAbbreviation } from "./utils";

//import "./styles/App.module.css";

function useQuery() {
    return new URLSearchParams(window.location.search);
}

Amplify.configure(awsconfig);

Amplify.configure({
    aws_cloud_logic_custom: [
        {
            name: "lazyweb-apis-stack",
            endpoint:
                "https://u0bjeceiah.execute-api.us-west-2.amazonaws.com/Prod",
            region: "us-west-2",
        },
    ],
});
Amplify.configure({
    Interactions: {
        bots: {
            lazyweb_dev: botConfig,
        },
    },
});

// Content Caching
const config = {
    capacityInBytes: 5000000,
    defaultTTL: 3600000,
    itemMaxSize: 500000, // 3000 bytes
    //defaultPriority: 4,
    // ...
};
Cache.configure(config);

const App = () => {
    const [isLocationAllowed, setIsLocationAllowed] = useLocalStorage(
        "Newsly-location-allowed",
        false
    );
    const [isReturningClient, setIsReturningClient] = useLocalStorage(
        "Newsly-return-user",
        false
    );
    const [isAnalyticsAllowed, setIsAnalyticsAllowed] = useLocalStorage(
        "Newsly-analytics-allowed",
        true
    );
    const [isCommissionAllowed, setIsCommissionAllowed] = useLocalStorage(
        "Newsly-commission-allowed",
        true
    );

    const [userSettings, setUserSettings] = useLocalStorage(
        "Newsly-user-settings",
        {
            useDeepAnswers: true,
            allowFilters: true,
            persona: "mixed",
            safety: true,
            cleanup: false,
            reportedSpam: [],
            blackList: [],
            autoSuggest: false,
        }
    );

    const [authState, setAuthState] = useState("unauthorized");
    const [identityId, setIdentityId] = useState(null);
    const [identityLoading, setIdentityLoading] = useState(true);
    const [updateLocationPermission, setUpdateLocationPermission] =
        useState(isLocationAllowed);
    const [lookupNeeded, setLookupNeeded] = useState(true);
    const [location, setLocation] = useState(LOCATION_DATA_PLACEHOLDER);
    const [locationLoading, setLocationLoading] = useState(false);
    const [navigatorPermission, setNavigatorPermission] = useState(false);
    const [navigatorCoords, setNavigatorCoords] = useState(COORDS_PLACEHOLDER);
    const { width } = useWindowDimensions();
    const [isDesktop, setIsDesktop] = useState(width >= 992);
    const [heroMode, setHeroMode] = useState(false);
    const [heroChange, setHeroChange] = useState(false);
    const [currentPanelResultId, setCurrentPanelResultId] = useState(null);
    const [browserPopupNoticeDisplayed, setBrowserPopupNoticeDisplayed] =
        useState(null);

    const [newChatSession, setNewChatSession] = useState(null);
    const [welcomeDisplayed, setWelcomeDisplayed] = useState(false);
    const [pageViewRecorded, setPageViewRecorded] = useState(false);

    // Message history for the session
    const [messages, setMessages] = useState([
        {
            query: "",
            response: { message: "What are you looking for?" },
            requestId: null,
            timestamp: Date.now(),
        },
    ]);

    // Force the chat component to update
    const [chatUpdateRequired, setChatUpdateRequired] = useState(false);

    // Prompt options for text entry
    const [promptOptions, setPromptOptions] = useState(null);

    // Dark mode or light mode
    const [theme, toggleTheme] = useDarkMode();

    // Assistant or Terminal interaction mode

    let queryString = useQuery();
    let interactionUIParam = queryString.get("interaction");
    const [interactionUI, setInteractionUI] = useLocalStorage(
        "Newsly-interaction-mode",
        interactionUIParam && interactionUIParam === "terminal"
            ? "terminal"
            : "assistant"
    );

    // View preferences
    const [view, setView] = useLocalStorage("Newsly-view", "feed");

    // Results are a modal on mobile and panel on desktop
    const [showResults, setShowResults] = useState(false);
    const [resultsContent, setResultsContent] = useState(null);

    const changeLocationAllowed = (status, e) => {
        // If a user grants us permission for location, change the location permission status
        setUpdateLocationPermission(status);
        posthog.capture("Privacy Settings", {
            Location: status ? "Allowed" : "Disabled",
        });

        // Enable browser Geolocation
        if (status === true) {
            //setLookupNeeded(true);
            //window.location = "/";
            setTimeout(function () {
                window.location.reload();
            }, 400);
        } else {
            setLocation(LOCATION_DATA_PLACEHOLDER);
            // 400ms second delay
            setTimeout(function () {
                window.location.reload();
            }, 400);
        }
    };

    useEffect(() => {
        // Clean up address bar if there are interaction parameters
        if (interactionUIParam) {
            window.history.replaceState("Newsly", "Newsly", "/");
        }
        // Adjust desktop or mobile on resize - or if a page other than chat
        if (isDesktop && width < 992) {
            setIsDesktop(false);
        } else if (!isDesktop && width >= 992) {
            setIsDesktop(true);
        }

        const getLocationDataWithAxios = async () => {
            try {
                // Use known latlon if available from browser
                let queryParams = navigatorCoords.latitude
                    ? `?latitude=${navigatorCoords.latitude}&longitude=${navigatorCoords.longitude}&accuracy=${navigatorCoords.accuracy}`
                    : "";
                setLocationLoading(true);
                const response = await axios.get(
                    `${GEO_LOOKUP}${queryParams}`,
                    {
                        headers: { "x-lazyweb-origin": "Newslysearch.com" },
                    }
                );

                const locationData = {
                    ip: response.data.ip,
                    latitude: response.data.latitude,
                    longitude: response.data.longitude,
                    accuracy: response.data.accuracy,
                    zipcode: response.data.zipcode,
                    streetName: response.data.streetName,
                    streetNumber: response.data.streetNumber,
                    city: response.data.city,
                    region: response.data.region,
                    country: response.data.country,
                    countryCode: response.data.countryCode,
                    formattedAddress: response.data.formattedAddress,
                    source: response.data.source,
                    status: "success",
                };
                setLocation(locationData);
                setLocationLoading(false);
            } catch (error) {
                console.log("Problem getting geo data: ", error);
                setLocationLoading(false);
            }
        };

        let geoipLookupRequired = lookupNeeded ? true : false;
        if (isLocationAllowed !== updateLocationPermission) {
            setIsLocationAllowed(updateLocationPermission);

            if (
                updateLocationPermission === true &&
                (!location || !location.ip)
            ) {
                // Update location data due to a change of permission allowed status
                if (!locationLoading) {
                    geoipLookupRequired = true;
                }
            } else if (
                updateLocationPermission === false &&
                location &&
                location.ip
            ) {
                // Location permission denied - set location to empty then look up geo from IP
                //let disallowedLocationData = LOCATION_DATA_PLACEHOLDER;
                //disallowedLocationData.status = "disallowed";
                //console.log(disallowedLocationData);
                setLocation(LOCATION_DATA_PLACEHOLDER);
                // Update location data due to a change of permission allowed status
                if (!locationLoading) {
                    geoipLookupRequired = true;
                }
            }
        } else if (isLocationAllowed && (!location || !location.ip)) {
            // Update location data when allowed but empty
            if (!locationLoading) {
                geoipLookupRequired = true;
            }
        } else if (
            isLocationAllowed &&
            navigatorPermission &&
            !location.source
        ) {
            // Update loaction data when we have navigator permission but there is no latlon geocoder source
            geoipLookupRequired = true;
        }

        // Run GeoIP lookup if an update is needed and not already pending
        if (geoipLookupRequired && !locationLoading) {
            if (navigator.geolocation && isLocationAllowed) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    setNavigatorCoords(position.coords);
                    setNavigatorPermission(true);
                });
            } else {
                setNavigatorCoords(COORDS_PLACEHOLDER);
                setNavigatorPermission(false);
            }
            getLocationDataWithAxios();
            geoipLookupRequired = false;
            setLookupNeeded(false);
        }

        // Record if a user is returning for preferences / notications / analytics
        Auth.currentCredentials()
            .then((d) => {
                setAuthState(d.authenticated);
                setIdentityId(d.identityId);
                setIdentityLoading(false);
            })
            .catch((e) => console.log("error: ", e));

        // Set session and pageview information after location loads
        if (!locationLoading && !identityLoading) {
            // If unauhenticated set whether this is first visit or return visit

            if (!authState) {
                // Handling for anonymous visitors with broad location and type

                // do we have a browser default search query (?q or ?query) or a shared query (?share)
                let displayMode = "Browser";

                const mqStandAlone = "(display-mode: standalone)";
                if (
                    navigator.standalone ||
                    window.matchMedia(mqStandAlone).matches
                ) {
                    // PWA
                    displayMode = "PWA";
                }

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
                    !isReturningClient &&
                    !sessionStorage.getItem("Newsly-existing-session")
                ) {
                    // First time visit on this browser client with a new session
                    setIsReturningClient(true);
                    if (newChatSession === null) {
                        setNewChatSession(true);
                    }

                    // Set a flag that we have a session in progress so we don't set return visitor for this session
                    sessionStorage.setItem("Newsly-existing-session", true);
                    if (isAnalyticsAllowed && !pageViewRecorded) {
                        let timeZone =
                            new window.Intl.DateTimeFormat().resolvedOptions()
                                .timeZone;
                        let firstSeen = new Date(Date.now()).toISOString();
                        // Set analytics user identity from indentity id
                        posthog.identify(identityId);
                        //console.log("New identity:", identityId);

                        posthog.capture("$pageview", {
                            $current_url: currentUrl,
                            Visit: "New",
                            Client: isDesktop
                                ? "Desktop " + displayMode
                                : "Mobile " + displayMode,
                            Version: VERSION,
                            First: firstSeen,
                            $geoip_city_name: location.city,
                            $geoip_country_name: location.country,
                            $geoip_country_code: location.countryCode,
                            $geoip_latitude: location.latitude,
                            $geoip_longitude: location.longitude,
                            $geoip_time_zone: timeZone,
                            $geoip_postal_code: location.zipcode,
                            $geoip_subdivision_1_code: location.region
                                ? stateNameToAbbreviation(location.region)
                                : null,
                            $geoip_subdivision_1_name: location.region,
                            $set: {
                                $geoip_city_name: location.city,
                                $geoip_country_name: location.country,
                                $geoip_country_code: location.countryCode,
                                $geoip_latitude: location.latitude,
                                $geoip_longitude: location.longitude,
                                $geoip_time_zone: timeZone,
                                $geoip_postal_code: location.zipcode,
                                $geoip_subdivision_1_code: location.region
                                    ? stateNameToAbbreviation(location.region)
                                    : null,
                                $geoip_subdivision_1_name: location.region,
                            },
                            $set_once: {
                                $initial_geoip_city_name: location.city,
                                $initial_geoip_country_name: location.country,
                                $initial_geoip_country_code:
                                    location.countryCode,
                                $initial_geoip_latitude: location.latitude,
                                $initial_geoip_longitude: location.longitude,
                                $initial_geoip_time_zone: timeZone,
                                $initial_geoip_postal_code: location.zipcode,
                                $initial_geoip_subdivision_1_code:
                                    location.region
                                        ? stateNameToAbbreviation(
                                              location.region
                                          )
                                        : null,
                                $initial_geoip_subdivision_1_name:
                                    location.region,
                            },
                        });
                        setPageViewRecorded(true);
                    }
                } else if (
                    isReturningClient &&
                    sessionStorage.getItem("Newsly-existing-session")
                ) {
                    // Visitor with an existing session in progress - no logging or status change
                    if (newChatSession === null) {
                        setNewChatSession(false);
                    }
                } else if (
                    isReturningClient &&
                    !sessionStorage.getItem("Newsly-existing-session")
                ) {
                    // Returning visitor with a new session
                    if (newChatSession === null) {
                        setNewChatSession(true);
                    }
                    if (isAnalyticsAllowed && !pageViewRecorded) {
                        let timeZone =
                            new window.Intl.DateTimeFormat().resolvedOptions()
                                .timeZone;
                        // Set analytics user identity from indentity id
                        posthog.identify(identityId);
                        //console.log("Returning identity:", identityId);
                        posthog.capture("$pageview", {
                            $current_url: currentUrl,
                            Visit: "Returning",
                            Client: isDesktop
                                ? "Desktop " + displayMode
                                : "Mobile " + displayMode,
                            Version: VERSION,
                            $geoip_city_name: location.city,
                            $geoip_country_name: location.country,
                            $geoip_country_code: location.countryCode,
                            $geoip_latitude: location.latitude,
                            $geoip_longitude: location.longitude,
                            $geoip_time_zone: timeZone,
                            $geoip_postal_code: location.zipcode,
                            $geoip_subdivision_1_code: location.region
                                ? stateNameToAbbreviation(location.region)
                                : null,
                            $geoip_subdivision_1_name: location.region,
                            $set: {
                                $geoip_city_name: location.city,
                                $geoip_country_name: location.country,
                                $geoip_country_code: location.countryCode,
                                $geoip_latitude: location.latitude,
                                $geoip_longitude: location.longitude,
                                $geoip_time_zone: timeZone,
                                $geoip_postal_code: location.zipcode,
                                $geoip_subdivision_1_code: location.region
                                    ? stateNameToAbbreviation(location.region)
                                    : null,
                                $geoip_subdivision_1_name: location.region,
                            },
                        });
                        setPageViewRecorded(true);
                    }
                }
            }
        }
    }, [
        isLocationAllowed,
        updateLocationPermission,
        location,
        setIsLocationAllowed,
        lookupNeeded,
        locationLoading,
        navigatorCoords,
        navigatorPermission,
        isReturningClient,
        setIsReturningClient,
        authState,
        isDesktop,
        width,
        newChatSession,
        isAnalyticsAllowed,
        interactionUIParam,
        pageViewRecorded,
        identityId,
        identityLoading,
    ]);

    useEffect(() => {
        // Capture any click with an Newsly action data attribute and send to analytics
        window.addEventListener("click", function (event) {
            if (event.target.hasAttribute("data-Newsly-action")) {
                let targetData = event.target.dataset;
                const eventProperties = {
                    Action: targetData.NewslyAction,
                    Channel: targetData.NewslyChannel,
                    // Destination: targetData.NewslyDestination ? targetData.NewslyDestination : event.target.hostname,
                };
                posthog.capture(targetData.NewslyEvent, eventProperties);
            }
        });
    }, []);

    useEffect(() => {
        // Clean up address bar if there are parameters after logging - ?query, ?q, ?share (share query)
        if (
            window.location.href.indexOf("?") > -1 &&
            pageViewRecorded
            //  ||
            //  queryString.get("query") ||
            //  queryString.get("q") ||
            //  queryString.get("share")
        ) {
            window.history.replaceState("Newsly", "Newsly", "/");
        }
    }, [pageViewRecorded]);

    return (
        <UserContext.Provider
            value={{
                allowLocation: isLocationAllowed,
                userSettings: userSettings,
                setUserSettings: setUserSettings,
                locationData: location,
                mode: isDesktop ? "desktop" : "mobile",
                heroMode: heroMode,
                setHeroMode: setHeroMode,
                heroChange: heroChange,
                setHeroChange: setHeroChange,
                theme: theme,
                toggleTheme: toggleTheme,
                view: view,
                setView: setView,
                currentPanelResultId: currentPanelResultId,
                setCurrentPanelResultId: setCurrentPanelResultId,
                browserPopupNoticeDisplayed: browserPopupNoticeDisplayed,
                setBrowserPopupNoticeDisplayed: setBrowserPopupNoticeDisplayed,
                showResults: showResults,
                setShowResults: setShowResults,
                resultsContent: resultsContent,
                setResultsContent: setResultsContent,
                session: {
                    isReturningClient: isReturningClient,
                    newChatSession: newChatSession,
                    setNewChatSession: setNewChatSession,
                },
                isAnalyticsAllowed: isAnalyticsAllowed,
                setIsAnalyticsAllowed: setIsAnalyticsAllowed,
                isCommissionAllowed: isCommissionAllowed,
                setIsCommissionAllowed: setIsCommissionAllowed,
                interactionUI: interactionUI,
                setInteractionUI: setInteractionUI,
                messages: messages,
                setMessages: setMessages,
                welcomeDisplayed: welcomeDisplayed,
                setWelcomeDisplayed: setWelcomeDisplayed,
                promptOptions: promptOptions,
                setPromptOptions: setPromptOptions,
                chatUpdateRequired: chatUpdateRequired,
                setChatUpdateRequired: setChatUpdateRequired,
            }}
        >
            <Router>
                <div>
                    <Routes>
                        <Route
                            path=":article"
                            element={<ContentPage />}
                        ></Route>
                        <Route
                            path="/settings/"
                            //component={Settings}
                            element={<Settings />}
                        />
                        <Route
                            path="/bug/"
                            //component={BugReportPage}
                            element={<BugReportPage />}
                        />
                        <Route
                            path="/feedback/"
                            //component={FeedbackPage}
                            element={<FeedbackPage />}
                        />
                        <Route
                            path="/nav/"
                            //component={NavRedirect}
                            element={<NavRedirect />}
                        />
                        <Route
                            path="/demo/"
                            //component={DemoPage}
                            element={<DemoPage />}
                        />

                        <Route
                            path="/"
                            element={
                                isDesktop ? (
                                    <Desktop
                                        changeLocationAllowed={
                                            changeLocationAllowed
                                        }
                                    />
                                ) : (
                                    <Mobile
                                        changeLocationAllowed={
                                            changeLocationAllowed
                                        }
                                    />
                                )
                            }
                        ></Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </UserContext.Provider>
    );
};

export default App;
