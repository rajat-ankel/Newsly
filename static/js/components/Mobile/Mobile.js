import { useEffect } from "react";
import Chat from "../Chat";
// import { Segment } from "semantic-ui-react";

import { lwSegmentChat } from "../../styles/Mobile.module.css";

const Mobile = (props) => {

    useEffect(() => {
        // Set chat height
        document.documentElement.style.setProperty(
            "--chat-height",
            "calc(var(--vh) + 22px)"
        );
        document.documentElement.style.setProperty(
            "--chat-background",
            "var(--color-white)"
        );
        document.documentElement.style.setProperty(
            "--chat-font-size",
            "var(--mobile-chat-font-size)"
        );
        document.documentElement.style.setProperty(
            "--hero-chat-banner-width",
            "36rem"
        );
        document.documentElement.style.setProperty(
            "---hero-chat-banner-top",
            "1rem"
        );
        document.documentElement.style.setProperty(
            "--hero-chat-banner-bottom",
            "0.5rem"
        );
    }, []);

    return (
        <div className={lwSegmentChat}>
            <Chat changeLocationAllowed={props.changeLocationAllowed} />
        </div>
    );
};

export default Mobile;
