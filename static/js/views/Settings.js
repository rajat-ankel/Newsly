import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import posthog from "posthog-js";
import {
    Container,
    Header,
    Button,
    Checkbox,
    Dropdown,
} from "semantic-ui-react";
import { UserContext } from "../UserContext";
import LeftPanel from "../components/LeftPanel";
import "../styles/Settings.module.css";

const Settings = () => {
    const {
        isAnalyticsAllowed,
        setIsAnalyticsAllowed,
        isCommissionAllowed,
        setIsCommissionAllowed,
        userSettings,
        setUserSettings,
        mode
    } = useContext(UserContext);
    const { persona, useDeepAnswers, safety, cleanup, allowFilters, autoSuggest } =
        userSettings;

    const depthOptions = [
        {
            key: "mixed",
            text: "Best bet",
            value: "mixed",
        },
        {
            key: "hawking",
            text: "High depth but slower",
            value: "hawking",
        },
        {
            key: "gandalf",
            text: "Medium depth and speed",
            value: "gandalf",
        },
        {
            key: "indiana",
            text: "Low depth but faster",
            value: "indiana",
        },
    ];

    const handleClearSession = () => {
        posthog.capture("Support", {
            Action: "Settings",
            Channel: "Clear Session",
        });
        // localStorage.clear();
        window.location = "/";

        return false;
    };

    const handleResetSettings = () => {
        posthog.capture("Support", {
            Action: "Settings",
            Channel: "Reset Application",
        });
        localStorage.clear();
        sessionStorage.clear();
        window.location = "/";

        return false;
    };

    const handleAnalyticsChange = () => {
        if (isAnalyticsAllowed) {
            // Disable Analytics
            posthog.capture("Privacy Settings", {
                Analytics: "Disabled",
            });
            //400ms second delay
            setTimeout(function () {
                posthog.opt_out_capturing();
            }, 400);
        } else {
            // Enable Analytics
            posthog.opt_in_capturing();
            posthog.capture("Privacy Settings", { Analytics: "Allowed" });
        }
        setIsAnalyticsAllowed(!isAnalyticsAllowed);
        //sessionStorage.clear();
        //window.location = "/settings";
        return false;
    };

    const handleDeepAnswersChange = () => {
        if (useDeepAnswers) {
            // Disable DA
            posthog.capture("Settings", {
                DeepAnswers: "Disabled",
            });
        } else {
            // Enable Analytics
            posthog.capture("Settings", { DeepAnswers: "Allowed" });
        }
        let newUserSettings = userSettings;
        newUserSettings = {
            useDeepAnswers: !useDeepAnswers,
            allowFilters: allowFilters,
            persona: persona,
            safety: safety,
            cleanup: cleanup,
            autoSuggest: autoSuggest,
        };
        setUserSettings(newUserSettings);
        return false;
    };

    const handlePersonaChange = (e, { value }) => {
        console.log(value);
        posthog.capture("Settings", {
            Persona: value,
        });
        let newUserSettings = userSettings;
        newUserSettings = {
            useDeepAnswers: useDeepAnswers,
            allowFilters: allowFilters,
            persona: value,
            safety: safety,
            cleanup: cleanup,
            autoSuggest: autoSuggest,
        };
        //console.log("Persona:", value);
        setUserSettings(newUserSettings);
        
    };

    useEffect(() => {
        // Analytics
        posthog.capture("$pageview");
    }, []);

    return (
        <div>
            { mode === "desktop" && (
                <LeftPanel />
            )}
            <Container
            style={{
                background: "white",
                // margin: "56px 5% 2rem 5%",
                // marginTop: "56px",
                padding: "1rem 0 6rem 0",
                // height: "100vh",
                height: "100vh",
                overflow: "auto",
                borderRadius: "8px",
                width: "100%"
            }}
        >
            <Container text>
                <Header style={{ color: "var(--color-Newsly-darker)", fontSize: "28px", fontFamily: "QualyBold", margin: "2rem 0 2rem 0" }} >Settings</Header>
                <p style={{ fontSize: "18px" }}>Set Newsly as your homepage and default search engine.</p>
                <p>
                    <Link as="a" to="/default">
                        Step-by-step instructions
                    </Link>
                </p>
                <Header style={{ color: "var(--color-Newsly-light)" }} as="h3">Local settings</Header>
                <p style={{ fontSize: "18px" }}>
                    Newsly is a new product in alpha testing undergoing rapid
                    development and things may break from time to time.
                </p>
                <p style={{ fontSize: "18px" }}>
                    If you're getting a lot of errors, clearing local settings
                    and reloading the app may help and will make sure you have
                    an up-to-date version. This will remove all preferences.
                </p>
                <p>
                    <Button
                        color="red"
                        content="Reset local settings and reload"
                        onClick={handleResetSettings}
                    />
                </p>
                <p style={{ fontSize: "18px" }}>You can also clear the current search session only.</p>
                <p>
                    <Button
                        color="green"
                        content="Clear search session and reload"
                        onClick={handleClearSession}
                    />
                </p>
                <Header style={{ color: "var(--color-Newsly-light)" }} as="h3">Deep Answers</Header>
                <Header style={{ color: "var(--color-Newsly-light)" }} as="h4">Complex question answering</Header>
                <p style={{ fontSize: "18px" }}>
                    Deep Answers is an experimental feature in Newsly that answers
                    complex questions. You can think of it as being like a
                    researcher that reads up on a topic, and gives you an answer
                    based on the best online matches it can find.
                </p>
                <p style={{ fontSize: "18px" }}>
                    This is very different to traditional web search. So there
                    is a trade-off between speed and giving Deep Answers module
                    time to find and work through more detailed content online.
                    Some research tasks might take 10 or even 20+ seconds to
                    run. But when it works, it can save you a large amount of
                    time wading through search results yourself. Because it's
                    experimental, sometimes it misses the mark, but it's
                    learning fast. You can turn it off and on here.
                </p>

                <Checkbox
                    toggle
                    label="Disable complex question answering"
                    checked={!useDeepAnswers}
                    onChange={handleDeepAnswersChange}
                />

                <p style={{ fontSize: "18px" }}>
                    You can also change the tradeoff between how much time and
                    resources you give to the research process. The "Best Bet"
                    option will trade off depending on the question. Or you can
                    choose High, Medium or Low depth. High will have better
                    answers but take longer, and low will be faster but not as
                    accurate.
                </p>

                <Dropdown
                    //placeholder="Select researcher depth"
                    selection
                    defaultValue={persona}
                    options={depthOptions}
                    onChange={handlePersonaChange}
                />

                <Header style={{ color: "var(--color-Newsly-light)" }} as="h3">Privacy settings</Header>
                <Header style={{ color: "var(--color-Newsly-light)" }} as="h4">In-App Analytics</Header>
                <p style={{ fontSize: "18px" }}>
                    Newsly doesn't log searches, and it blocks tracking and
                    ad-tech. We only collect and retain sufficient data to
                    improve the service we provide and help our customers use
                    the service effectively, or when customers want to create an
                    account or be remembered between devices and sessions. See
                    more on our <Link to="/privacy/">Privacy</Link> page.
                </p>
                <p style={{ fontSize: "18px" }}>
                    We use limited in-app analytics solely to help improve the
                    application for people using it. The metrics are anonymous,
                    reported in aggregate, and it do not contain any personal
                    data or searches. They are not shared with anyone. You can
                    disable in-app analytics here. Changing permissions will
                    clear your search session.
                </p>

                <Checkbox
                    toggle
                    label="Disable in-app analytics"
                    checked={!isAnalyticsAllowed}
                    onChange={handleAnalyticsChange}
                />

                <Header style={{ color: "var(--color-Newsly-light)" }} as="h4">Reader-supported purchase commissions</Header>
                <p style={{ fontSize: "18px" }}>
                    Newsly is reader-supported and may make a small commission
                    anonymously if you buy something after searching. This{" "}
                    <strong>never</strong> impacts the search results displayed.
                    We will share any revenue with the content producers whose
                    content was used in the search who partner with us.
                </p>
                <p style={{ fontSize: "18px" }}>
                    This is done anonymously using traffic attribution and
                    aggregate reporting. We never log what you search for, what
                    results you click on, or what you buy or do anywhere else.
                    Websites you search or visit don't receive any information
                    from us either. They can't see what you searched or any
                    other information other than the anonymous traffic
                    attribution to Newsly.
                </p>
                <p style={{ fontSize: "18px" }}>
                    You can disable us receiving commissions from your searches
                    here.
                </p>

                <Checkbox
                    toggle
                    label="Disable commissions"
                    checked={!isCommissionAllowed}
                    onChange={() => {
                        setIsCommissionAllowed(!isCommissionAllowed);
                    }}
                />
                <Header style={{ color: "var(--color-Newsly-light)" }} as="h5">Support Newsly without commissions</Header>
                <p style={{ fontSize: "18px" }}>
                    If you'd like to support us directly, we'd be grateful for
                    any donations through PayPal. We're bootstrapping this
                    project without any funding.
                </p>
                <p>
                    <Button
                        as="a"
                        href="https://www.paypal.com/donate?business=angela%40lazyweb.ai&no_recurring=0&item_name=Support+Newsly&currency_code=USD"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Revenue"
                        data-Newsly-action="Donate"
                        data-Newsly-channel="PayPal"
                        //icon="paypal"
                        content="Donate with PayPal"
                        color="yellow"
                    />
                    {/* <form
                    action="https://www.paypal.com/donate"
                    method="post"
                    target="_top"
                >
                    <input
                        type="hidden"
                        name="business"
                        value="jem@Newslysearch.com"
                    />
                    <input type="hidden" name="no_recurring" value="0" />
                    <input
                        type="hidden"
                        name="item_name"
                        value="Donate to Newsly"
                    />
                    <input type="hidden" name="currency_code" value="USD" />
                    <input
                        type="image"
                        src="https://proxy.Newslysearch.com/https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
                        border="0"
                        name="submit"
                        title="PayPal - The safer, easier way to pay online!"
                        alt="Donate with PayPal button"
                    />
                    <img
                        alt=""
                        border="0"
                        //src="https://www.paypal.com/en_US/i/scr/pixel.gif"
                        width="1"
                        height="1"
                    />
                </form> */}
                </p>
            </Container>
        </Container></div>
    );
};

export default Settings;
