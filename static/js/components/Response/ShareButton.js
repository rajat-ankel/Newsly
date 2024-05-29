import React, { useContext } from "react";
import posthog from "posthog-js";
import { Dropdown } from "semantic-ui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEvernote } from "@fortawesome/free-brands-svg-icons";
import { faSms } from "@fortawesome/free-solid-svg-icons";
// import { ReactComponent as UploadIcon } from "../../assets/icons/upload.svg";
import { UserContext } from "../../UserContext";

export default function ShareButton(props) {
    const { result } = props;
    const { isAnalyticsAllowed } = useContext(UserContext);

    const onClickShare = async (pageToShare, event) => {
        if (navigator.share && pageToShare) {
            try {
                await navigator.share({
                    title: pageToShare.title,
                    text: pageToShare.description + " (via Newslysearch.com)",
                    url: pageToShare.link,
                });

                posthog.capture("Engagement", {
                    Action: "Share",
                    Channel: `Native ${
                        isApple()
                            ? "Apple"
                            : navigator.userAgent.includes("Windows")
                            ? "Windows"
                            : navigator.userAgent.includes("Android")
                            ? "Android"
                            : "OS"
                    }`,
                });
            } catch (err) {
                // this will catch the second share attempt
                // window.location.reload(true); // now share works again but whole page is reloaded

                if (err.toString().includes("AbortError")) {
                    console.log("User cancelled");
                }
                console.log("Error sharing", err);
            }
        } else {
            // fallback
        }
    };

    function isApple() {
        return (
            navigator.vendor != null &&
            navigator.vendor.match(/Apple Computer, Inc./)
        );
    }

    const copyTextToClipboard = async (text) => {
        try {
            navigator.clipboard.writeText(text).then(
                function () {
                    /* clipboard successfully set */
                    if (isAnalyticsAllowed) {
                        posthog.capture("Engagement", {
                            Action: "Share",
                            Channel: "Clipboard",
                        });
                    }
                },
                function (err) {
                    /* clipboard write failed */
                    console.log("Clipboard failed: ", err);
                }
            );
        } catch (err) {
            /* clipboard write failed */
            console.log("Clipboard failed:", err);
        }
    };

    const handleOpenLink = (linkDetails, e) => {
        // New window for external links
        if (linkDetails.link) {
            window.open(linkDetails.link, "_blank");
            posthog.capture(linkDetails.event, {
                Action: linkDetails.action,
                Channel: linkDetails.channel,
            });
        }
    };

    const encodedLink = encodeURIComponent(result.link);
    const encodedTitle = encodeURIComponent(result.title);
    const encodedDescription = encodeURIComponent(result.description);
    const encodedSource = encodeURIComponent(result.source);

    const osShareDropdown = (
        <Dropdown.Item
            icon={
                isApple()
                    ? "apple"
                    : navigator.userAgent.includes("Windows")
                    ? "windows"
                    : navigator.userAgent.includes("Android")
                    ? "android"
                    : "computer"
            }
            text={
                isApple()
                    ? "Share via Apple"
                    : navigator.userAgent.includes("Windows")
                    ? "Share via Windows"
                    : navigator.userAgent.includes("Android")
                    ? "Share via Android"
                    : "Share via OS"
            }
            className="lw-dropdown-text"
            onClick={(e) => onClickShare(result, e)}
            data-Newsly-event="Engagement"
            data-Newsly-action="Share"
            data-Newsly-channel={`Native ${
                isApple()
                    ? "Apple"
                    : navigator.userAgent.includes("Windows")
                    ? "Windows"
                    : navigator.userAgent.includes("Android")
                    ? "Android"
                    : "OS"
            }`}
        />
    );

    const simpleShare = (
        <Dropdown
            button
            as="button"
            floated="right"
            icon="share alternate"
            // icon={
            //     <UploadIcon
            //         //className="lw-feedcard-actions-button"
            //         style={{
            //             width: "18px",
            //             height: "18px",
            //             color: "var(--color-grey-2) !important",
            //         }}
            //     />
            // }
            disabled={!result.link}
            compact
            basic
            //simple
            //size={buttonSize}
            direction="left"
            //className="lw-feedcard-actions-drop"
        >
            <Dropdown.Menu direction="left">
                {navigator.share ? osShareDropdown : null}
                {navigator.share ? <Dropdown.Divider /> : null}
                {!navigator.share &&
                (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
                    navigator.userAgent.includes("Macintosh")) ? (
                    <Dropdown.Item
                        icon={
                            <FontAwesomeIcon
                                icon={faSms}
                                style={{
                                    marginRight: "10px",
                                    width: "16px",
                                    height: "16px",
                                }}
                            />
                        }
                        text="Messaging"
                        className="lw-dropdown-text"
                        onClick={(e) =>
                            handleOpenLink(
                                {
                                    link: navigator.userAgent.includes(
                                        "Macintosh"
                                    )
                                        ? `sms:replace with recipient&body=${encodedTitle}%20(via%20Newslysearch.com)%0A%0A${encodedLink}`
                                        : `sms://;?&body=${encodedTitle}%20(via%20Newslysearch.com)%0A%0A${encodedLink}`,
                                    event: "Engagement",
                                    action: "Share",
                                    channel: "Messaging",
                                },
                                e
                            )
                        }
                    />
                ) : null}
                <Dropdown.Item
                    icon="whatsapp"
                    text="Whatsapp"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `https://api.whatsapp.com/send?text=${encodedTitle}%0A%0A${encodedLink}%0A%0A(via%20https://Newslysearch.com)`,
                                event: "Engagement",
                                action: "Share",
                                channel: "WhatsApp",
                            },
                            e
                        )
                    }
                    //https://api.whatsapp.com/send?text=  whatsapp://send?text=
                />
                <Dropdown.Item
                    icon="telegram"
                    text="Telegram"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `https://t.me/share/url?url=${encodedLink}&text=${encodedTitle}%20(via%20Newslysearch.com)`,
                                event: "Engagement",
                                action: "Share",
                                channel: "Telegram",
                            },
                            e
                        )
                    }
                    //https://t.me/share/url?url=
                />
                {!navigator.userAgent.includes("Windows") ? (
                    <Dropdown.Item
                        icon="skype"
                        text="Skype"
                        className="lw-dropdown-text"
                        onClick={(e) =>
                            handleOpenLink(
                                {
                                    link: `skype://share?url=${encodedLink}&text=${encodedTitle}%20(via%20Newslysearch.com)`,
                                    event: "Engagement",
                                    action: "Share",
                                    channel: "Skype",
                                },
                                e
                            )
                        }
                        //https://web.skype.com/share?url='&text='
                    />
                ) : null}
                <Dropdown.Item
                    icon="twitter"
                    text="Twitter"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `https://twitter.com/intent/tweet?url=${encodedLink}&text=${encodedTitle}&via=Newsly_search`,
                                event: "Engagement",
                                action: "Share",
                                channel: "Twitter",
                            },
                            e
                        )
                    }
                />
                <Dropdown.Item
                    icon="facebook"
                    text="Facebook"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedDescription}%20(via%20Newslysearch.com)`,
                                event: "Engagement",
                                action: "Share",
                                channel: "Facebook",
                            },
                            e
                        )
                    }
                />
                <Dropdown.Item
                    icon="linkedin"
                    text="LinkedIn"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `http://www.linkedin.com/shareArticle?mini=true&url=${encodedLink}&title=${encodedTitle}&summary=${encodedDescription}%20(via%20Newslysearch.com)&source=${encodedSource}`,
                                event: "Engagement",
                                action: "Share",
                                channel: "LinkedIn",
                            },
                            e
                        )
                    }
                />
                <Dropdown.Item
                    icon="reddit alien"
                    text="Reddit"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `http://www.reddit.com/submit?url=${encodedLink}&title=${encodedTitle}`,
                                event: "Engagement",
                                action: "Share",
                                channel: "Reddit",
                            },
                            e
                        )
                    }
                />
                <Dropdown.Item
                    icon="hacker news"
                    text="Hacker News"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `https://news.ycombinator.com/submitlink?u=${encodedLink}&t=${encodedTitle}`,
                                event: "Engagement",
                                action: "Share",
                                channel: "Hacker News",
                            },
                            e
                        )
                    }
                />
                <Dropdown.Divider />
                {!navigator.share ? (
                    <Dropdown.Item
                        className="lw-dropdown-text"
                        text="Send to Evernote"
                        icon={
                            <FontAwesomeIcon
                                icon={faEvernote}
                                style={{
                                    marginRight: "10px",
                                    width: "16px",
                                    height: "16px",
                                }}
                            />
                        }
                        onClick={(e) =>
                            handleOpenLink(
                                {
                                    link: `http://www.evernote.com/clip.action?url=${encodedLink}&title=${encodedTitle}&text=${encodedDescription}`,
                                    event: "Engagement",
                                    action: "Share",
                                    channel: "Evernote",
                                },
                                e
                            )
                        }
                    />
                ) : null}
                <Dropdown.Item
                    icon="bookmark"
                    text="Send to Pocket"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `https://getpocket.com/save?url=${encodedLink}&title=${encodedTitle}`,
                                event: "Engagement",
                                action: "Share",
                                channel: "Pocket",
                            },
                            e
                        )
                    }
                />
                <Dropdown.Item
                    icon="copy"
                    text="Copy link"
                    className="lw-dropdown-text"
                    onClick={(e) => copyTextToClipboard(result.link, e)}
                />
                <Dropdown.Item
                    icon="mail"
                    text="Email"
                    className="lw-dropdown-text"
                    onClick={(e) =>
                        handleOpenLink(
                            {
                                link: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedLink}`,
                                event: "Engagement",
                                action: "Share",
                                channel: "Email",
                            },
                            e
                        )
                    }
                />
            </Dropdown.Menu>
        </Dropdown>
    );

    return simpleShare;
}
