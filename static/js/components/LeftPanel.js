import React from "react";
import { Link } from "react-router-dom";
import { Image, Icon, Divider, Button } from "semantic-ui-react";

import logoImg from "../assets/Newsly-logo-name-transparent-320x114.png";
// import styles from "../styles/LeftPanel.module.css";
import robotCloudsImg from "../assets/robot-clouds.png";
import fb from "../assets/icons/facebook.png";
import twitter from "../assets/icons/twitter-icon.png";
import li from "../assets/icons/li.png";
import ig from "../assets/icons/instagram.png";
import reddit from "../assets/icons/reddit.png";
import discord from "../assets/icons/discord-icon.png";
import tiktok from "../assets/icons/tiktok.png";
import youtube from "../assets/icons/youtube-icon.png";

import {
    leftPanel,
    logo,
    robotClouds,
    nav,
    navItem,
    footer,
    socials,
    leftMenu,
    socialButton,
    madeWithLove,
    footerNav,
    leftButtons,
} from "../styles/LeftPanel.module.css";

const LeftPanel = () => {
    // const { view, setView, mode } = useContext(UserContext);

    // const handleViewClick = (e, { name }) => {
    //     setView(name);
    // };

    return (
        <div className={leftPanel}>
            <Link
                to="/"
                data-Newsly-event="Navigation"
                data-Newsly-action="Menu"
                data-Newsly-channel="Home"
            >
                <Image
                    className={logo}
                    src={logoImg}
                    alt="Newsly Home"
                    size="tiny"
                />
            </Link>
            <Image
                className={robotClouds}
                src={robotCloudsImg}
                alt="Newsly is Search for the Next Generation"
                width="100%"
            />

            <div className={nav}>
                <Link
                    className={navItem}
                    to="/about/"
                    data-Newsly-event="Navigation"
                    data-Newsly-action="Menu"
                    data-Newsly-channel="About"
                >
                    <p>About</p>
                </Link>
                <Link
                    className={navItem}
                    to="/privacy/"
                    data-Newsly-event="Navigation"
                    data-Newsly-action="Menu"
                    data-Newsly-channel="Privacy"
                >
                    <p>Privacy</p>
                </Link>
                <Link
                    className={navItem}
                    to="/help/"
                    data-Newsly-event="Navigation"
                    data-Newsly-action="Menu"
                    data-Newsly-channel="Help"
                >
                    <p>Help</p>
                </Link>
                <Link
                    className={navItem}
                    to="/settings"
                    data-Newsly-event="Navigation"
                    data-Newsly-action="Menu"
                    data-Newsly-channel="Settings"
                >
                    <p>Settings</p>
                </Link>
                <Link
                    className={navItem}
                    to="/contact"
                    data-Newsly-event="Navigation"
                    data-Newsly-action="Menu"
                    data-Newsly-channel="Contact"
                >
                    <p>Contact</p>
                </Link>
                <Divider
                    style={{
                        marginTop: "1.5rem",
                        marginRight: "3rem",
                        marginLeft: "1.5rem",
                    }}
                />
                <a
                    className={navItem}
                    href="https://discord.gg/Newsly"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    data-Newsly-event="Menu"
                    data-Newsly-action="Navigation"
                    data-Newsly-channel="Community"
                >
                    <p>
                        Community{" "}
                        <Icon
                            name="external"
                            size="small"
                            style={{
                                width: "1rem",
                                // marginBottom: "8px",
                                // marginTop: "0",
                                verticalAlign: "middle",
                                marginLeft: "4px",
                                marginTop: "-2px",
                            }}
                        />
                    </p>
                </a>
            </div>

            <div className={footer}>
                <div className={leftButtons}>
                    <Button
                        content="Clear session"
                        onClick={() => window.location.reload()}
                    />
                </div>
                <div className={socials}>
                    <a
                        className={leftMenu}
                        href="https://discord.gg/Newsly"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Social"
                        data-Newsly-action="Discord"
                        data-Newsly-channel="Newsly"
                    >
                        <Image
                            className={socialButton}
                            src={discord}
                            alt="Newsly Community on Discord"
                        />
                    </a>
                    <a
                        className={leftMenu}
                        href="https://twitter.com/Newsly_search"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Social"
                        data-Newsly-action="Twitter"
                        data-Newsly-channel="@Newsly_search"
                    >
                        <Image
                            className={socialButton}
                            src={twitter}
                            alt="@Newsly_search on Twitter"
                        />
                    </a>
                    <a
                        className={leftMenu}
                        href="https://www.tiktok.com/@Newsly_search"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Social"
                        data-Newsly-action="TikTok"
                        data-Newsly-channel="@Newsly_search"
                    >
                        <Image
                            className={socialButton}
                            src={tiktok}
                            alt="@Newsly_search on TikTok"
                        />
                    </a>
                    <a
                        className={leftMenu}
                        href="https://www.linkedin.com/company/Newslysearch/"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Social"
                        data-Newsly-action="LinkedIn"
                        data-Newsly-channel="Newslysearch"
                    >
                        <Image
                            className={socialButton}
                            src={li}
                            alt="@Newslysearch on LinkedIn"
                        />
                    </a>
                    <br></br>
                    <a
                        className={leftMenu}
                        href="https://www.youtube.com/@Newsly_search"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Social"
                        data-Newsly-action="YouTube"
                        data-Newsly-channel="@Newsly_search"
                    >
                        <Image
                            className={socialButton}
                            src={youtube}
                            alt="@Newsly_search on YouTube"
                        />
                    </a>
                    <a
                        className={leftMenu}
                        href="https://www.instagram.com/Newsly_search/"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Social"
                        data-Newsly-action="Instagram"
                        data-Newsly-channel="Newsly_search"
                    >
                        <Image
                            className={socialButton}
                            src={ig}
                            alt="@Newsly_search on Instagram"
                        />
                    </a>
                    <a
                        className={leftMenu}
                        href="https://www.reddit.com/r/AskNewsly/"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Social"
                        data-Newsly-action="Reddit"
                        data-Newsly-channel="AskNewsly"
                    >
                        <Image
                            className={socialButton}
                            src={reddit}
                            alt="AskNewsly on Reddit"
                        />
                    </a>
                    <a
                        className={leftMenu}
                        href="https://www.facebook.com/Newslysearch"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Social"
                        data-Newsly-action="Facebook"
                        data-Newsly-channel="Newslysearch"
                    >
                        <Image
                            className={socialButton}
                            src={fb}
                            alt="@Newslysearch on Facebook"
                        />
                    </a>
                </div>

                <div className={footerNav}>
                    <Link
                        className={madeWithLove}
                        to="/team"
                        data-Newsly-event="Navigation"
                        data-Newsly-action="Menu"
                        data-Newsly-channel="Team"
                    >
                        <p>Made with ❤️ in SF</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LeftPanel;
