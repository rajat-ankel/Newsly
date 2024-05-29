import React, { useEffect, useContext, useState } from "react";
import { Grid } from "semantic-ui-react";
import Panel from "../Response/Panel";
import Chat from "../Chat.js";
import { UserContext } from "../../UserContext";
import LeftPanel from "../LeftPanel";
import Welcome from "../../views/Welcome/Welcome";
import styles from "../../styles/Desktop.module.css";

const Desktop = (props) => {
    const {
        mode,
        showResults,
        setShowResults,
        resultsContent,
        setResultsContent,
        // interactionUI,
    } = useContext(UserContext);
    const [placeholder, setPlaceholder] = useState(null);

    useEffect(() => {
        // Clean up if the component is not displayed
        return () => {
            if (mode !== "desktop" || window.location.pathname !== "/") {
                setShowResults(false);
                //setResultsContent(null);
            }
        };
    }, [mode, setShowResults, setResultsContent]);

    useEffect(() => {
        // Set chat height
        document.documentElement.style.setProperty(
            "--chat-height",
            "calc(var(--vh) + 1rem)"
        );
        document.documentElement.style.setProperty(
            "--chat-background",
            "var(--color-white)"
        );
        document.documentElement.style.setProperty(
            "--chat-font-size",
            "var(--desktop-chat-font-size)"
        );
        document.documentElement.style.setProperty(
            "--hero-chat-banner-width",
            "90%"
        );
        document.documentElement.style.setProperty(
            "--hero-chat-banner-top",
            "0.5rem"
        );
        document.documentElement.style.setProperty(
            "--hero-chat-banner-bottom",
            "0.5rem"
        );
    }, []);

    // console.log("content", resultsContent);

    return (
        <Grid
            style={{
                height: "100vh",
                marginTop: "0",
            }}
        >
            <Grid.Column
                computer={2}
                largeScreen={2}
                widescreen={2}
                style={{ paddingTop: 0, paddingRight: 0, paddingBottom: 0 }}
            >
                <LeftPanel />
            </Grid.Column>
            <Grid.Column
                computer={6}
                largeScreen={6}
                widescreen={6}
                className={styles.lwColumnChat}
            >
                <Chat
                    changeLocationAllowed={props.changeLocationAllowed}
                    placeholder={placeholder}
                />
            </Grid.Column>
            <Grid.Column
                style={{
                    background: "white",
                    padding: "0 0 0 0",
                }}
                computer={8}
                largeScreen={8}
                widescreen={8}
            >
                {showResults ? (
                    <Panel {...resultsContent} show={showResults} tab={0} />
                ) : (
                    <Welcome setPlaceholder={setPlaceholder} />
                )}
            </Grid.Column>
        </Grid>
    );
};

export default Desktop;
