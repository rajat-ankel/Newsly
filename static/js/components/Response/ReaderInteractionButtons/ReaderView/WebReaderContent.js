import React, { useEffect, useRef, useState, useContext } from "react";
import {
    Container,
    Item,
    Modal,
    Dimmer,
    Loader,
    Divider,
    Image,
    Message,
} from "semantic-ui-react";
// import tldExtract from "tld-extract";
import hljs from "highlight.js";
import CodeBlock from "react-copy-code";
import "highlight.js/styles/night-owl.css";
import { ReactComponent as CopyIcon } from "../../../../assets/icons/copy-solid.svg";
import { Slug } from "../../utilitiesResponse";
import { FAVICON_PROXY } from "../../../../constants";
import textDiscriminator from "../../../../utilities/textDiscriminator";
import getLeadImage from "./getLeadImage";
// import { escapePreCodeBlocks } from "../../../../utils";
import cleanHtml from "./cleanHtml";
import getDomainNameAndSubdomain from "../../../../utilities/getDomainNameAndSubdomain";
import extractAuthorFromByline from "../../../../utilities/extractAuthorFromByline";
import removeTruncatedLastSentence from "../../../../utilities/removeTruncatedLastSentence";
import extractSiteSource from "../../../../utilities/extractSiteSource";
import { UserContext } from "../../../../UserContext";

function extractContent(s) {
    var span = document.createElement("span");
    span.innerHTML = s;
    return span.textContent || span.innerText;
}

export default function WebReaderContent(props) {
    const { result, reader, loading, cardIconColor } = props;
    const { mode } = useContext(UserContext);
    const [highlightsDone, setHighlightsDone] = useState(false);
    const [displayHtml, setDisplayHtml] = useState("");
    const [displayHtmlCleaned, setDisplayHtmlCleaned] = useState(false);
    const readerRef = useRef(null);

    let headerDescription = result.description
        ? result.description
        : result.desc
        ? result.desc
        : result.answer;
    if (headerDescription.startsWith("<")) {
        headerDescription = extractContent(headerDescription);
    }

    let headerContent = reader.excerpt;

    if (
        !headerContent ||
        headerContent.endsWith("...") ||
        headerContent.endsWith("&hellip;") ||
        headerContent.endsWith("¶")
    ) {
        headerContent = textDiscriminator(
            headerDescription,
            reader.excerpt,
            result
        );
    }
    const titleContent =
        reader.title !== ""
            ? reader.title
            : result.title !== ""
            ? result.title
            : result.answer;

    let { domain, sub } =
        result.link &&
        getDomainNameAndSubdomain(result.link.replace("www.", ""));
    domain = sub ? sub + "." + domain : domain;
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

    // If the header is the same as start of the body then skip it
    if (
        headerContent &&
        displayHtml &&
        headerContent.trim().toLowerCase().substring(0, 100) ===
            extractContent(displayHtml).trim().toLowerCase().substring(0, 100)
    ) {
        headerContent = "";
    } else {
        //Replace elipsis from Mercury parser
        headerContent =
            headerContent && headerContent.replace(/&hellip;/g, "...");
    }

    // Remove truncated last sentence
    if (
        headerContent &&
        (headerContent.trim().endsWith("...") ||
            headerContent.trim().endsWith("…"))
    ) {
        headerContent = removeTruncatedLastSentence(headerContent);
    }

    let displayAuthor = reader.author && extractAuthorFromByline(reader.author);

    // Check the author field isn't garbage - long composite strings
    let authorIsJunk = false;

    if (displayAuthor && displayAuthor.split(" ").length > 1) {
        for (let word of displayAuthor.split(" ")) {
            if (word.toString().length > 20) {
                authorIsJunk = true;
                break;
            }
        }
    }

    // Image to use for lead
    const leadImage =
        displayHtml !== ""
            ? getLeadImage(
                  displayHtml,
                  result.image,
                  reader.lead_image_url,
                  "camo"
              )
            : "";

    const sourceFaviconUrl = result.favicon
        ? result.favicon
        : `${FAVICON_PROXY}/${domain}.ico`;

    let displaySource = extractSiteSource(result);

    // Cleanup html from reader.content using the cleanHtml function async
    useEffect(() => {
        async function cleanHtmlAsync() {
            setDisplayHtml(await cleanHtml(reader.content));
            setDisplayHtmlCleaned(true);
        }
        if (!loading && !displayHtmlCleaned) {
            cleanHtmlAsync();
        }
    }, [
        displayHtmlCleaned,
        setDisplayHtmlCleaned,
        loading,
        reader.content,
        displayHtml,
    ]);

    useEffect(() => {
        // Highlight code blocks in the content in displayHtml
        if (
            displayHtml !== "" &&
            !highlightsDone &&
            !loading &&
            readerRef &&
            readerRef.current
        ) {
            if (displayHtml && displayHtml.includes("<code>")) {
                let currentReaderRef = readerRef.current;
                const codeBlocks =
                    currentReaderRef.querySelectorAll("pre code");
                codeBlocks.forEach((el) => {
                    if (!el.classList.contains("hljs")) {
                        hljs.highlightElement(el);
                    }
                });
            }
            setHighlightsDone(true);
        }
    }, [displayHtml, loading, highlightsDone]);

    const mastheadTopMargin = mode === "desktop" ? "1rem" : "1rem";
    const mastheadFontSize = mode === "desktop" ? "2.2rem" : "1.5rem";

    return (
        <Modal.Content scrolling className="lw-reader-modal-content">
            <Container text>
                <Item.Group unstackable>
                    <Item>
                        <Item.Content style={{ maxWidth: "100%!important" }}>
                            <Image
                                // style={{
                                //     padding: "8px",
                                //     borderRadius: "24px",
                                //     border: "1px solid #e0e1e2",
                                //     // marginLeft: "8rem",
                                // }}
                                // circular
                                // avatar
                                // rounded
                                // border
                                //bordered
                                floated="left"
                                size="tiny"
                                src={sourceFaviconUrl}
                                verticalAlign="top"
                            />
                            <Item.Header
                                style={{
                                    marginTop: mastheadTopMargin,
                                    marginLeft: "12px",
                                    lineHeight: "1.5",
                                    fontSize: mastheadFontSize,
                                    color: cardIconColor
                                        ? cardIconColor
                                        : "var(--color-grey-7)",
                                    FontFamily:
                                        "GTEestiMedium, Helvetica Neue, Helvetica, Arial, Droid Sans, Ubuntu, sans-serif",
                                    fontWeight: "500",
                                }}
                            >
                                {displaySource}
                            </Item.Header>
                        </Item.Content>
                    </Item>
                    <Item>
                        <Item.Content style={{ maxWidth: "100%!important" }}>
                            <Item.Header
                                style={{
                                    // marginTop: "0.5rem",
                                    // marginBottom: "0.5rem",
                                    lineHeight: 1.5,
                                    color: "var(--color-grey-7)",
                                    fontSize: "1.8rem",
                                    FontFamily:
                                        "GTEestiMedium, Helvetica Neue, Helvetica, Arial, Droid Sans, Ubuntu, sans-serif",
                                    fontWeight: "500",
                                }}
                            >
                                {titleContent}
                            </Item.Header>
                            <Item.Description
                                style={{
                                    // paddingRight: "128px",
                                    fontSize: "1.3rem",
                                    lineHeight: "1.5",
                                    marginBottom: "1.5rem",
                                    // marginTop: "0.4rem",
                                    color: "var(--color-grey-7)",
                                }}
                            >
                                {headerContent}
                            </Item.Description>

                            {Slug(reader.date_published) ? (
                                <Item.Meta
                                    style={{ color: "var(--color-grey-6)" }}
                                >
                                    {Slug(reader.date_published).split(" (")[0]}
                                </Item.Meta>
                            ) : null}

                            {displayAuthor && !authorIsJunk ? (
                                <Item.Extra
                                    style={{
                                        // marginTop: "1rem",
                                        // marginBottom: "0.5rem",
                                        color: "var(--color-grey-6)",
                                    }}
                                >
                                    {`By ${displayAuthor}`}
                                </Item.Extra>
                            ) : null}

                            {displayHtml &&
                            (displayHtml.includes("<code>") ||
                                displayHtml.includes("<pre>")) ? (
                                <Message
                                    content={`View on ${displaySource} for formatted code and embedded content (like Gists).`}
                                />
                            ) : null}
                        </Item.Content>
                    </Item>
                </Item.Group>
            </Container>
            <Modal.Description>
                <Container
                    text
                    style={{ fontSize: "1.25rem", maxWidth: "100%!important" }}
                >
                    <Divider />
                    <Dimmer
                        active={
                            loading ||
                            !highlightsDone ||
                            !displayHtml ||
                            !displayHtmlCleaned
                        }
                    >
                        <Loader />
                    </Dimmer>
                    {leadImage ? (
                        <img
                            className="lw-reader-lead-image"
                            alt={result.title}
                            src={leadImage}
                            onError={(i) => (i.target.style.display = "none")}
                        />
                    ) : null}

                    <CodeBlock svg={CopyIcon} className="lw-copy-button">
                        <div
                            className="lw-reader"
                            ref={readerRef}
                            dangerouslySetInnerHTML={{
                                __html: displayHtml,
                            }}
                        />
                    </CodeBlock>
                </Container>
            </Modal.Description>
        </Modal.Content>
    );
}
