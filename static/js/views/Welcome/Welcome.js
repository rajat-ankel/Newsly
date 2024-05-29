import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import * as emoji from "node-emoji";
import {
    welcomeHeader,
    mainHeader,
    simple,
    cardLarge,
    cardSmall,
    cardHeaderLight,
    cardHeaderDark,
    cardCaption,
    cardDetails,
} from "../../styles/Welcome.module.css";
import { Button, Segment, Header, Card, Message } from "semantic-ui-react";
import { CORS_PROXY } from "../../constants";

const Explain = () => {
    return (
        <Button
            color="black"
            content="Explain"
            circular
            size="small"
            disabled
            style={{ background: "black" }}
        />
    );
};

const Summarize = () => {
    return (
        <Button
            color="black"
            content="Summarize"
            circular
            size="small"
            disabled
            style={{ background: "black" }}
        />
    );
};

const Read = () => {
    return (
        <Button
            compact
            color="black"
            content="Read"
            circular
            size="small"
            disabled
            style={{ background: "black" }}
        />
    );
};

const Generate = () => {
    return (
        <Button
            compact
            color="black"
            content="Generate Text"
            circular
            size="small"
            disabled
            style={{ background: "black" }}
        />
    );
};

const exampleContents = {
    find: {
        heading:
            "Search by simply chatting. Ask questions, or say what you need.",
        examples: [
            {
                heading: "How to get to the Whitsundays",
                large: true,
                image: "/assets/welcome/whitsundays.webp",
                dark: false,
                caption:
                    "Ask me questions in plain language and get direct answers.",
            },
            {
                heading: "Give me colorful birds with interesting names",
                large: false,
                image: "/assets/welcome/birdcall.webp",
                dark: false,
                caption: "The more details the better.",
            },
            {
                heading: "San Francisco hidden gems",
                large: false,
                image: "/assets/welcome/sfbridge.webp",
                dark: false,
                caption: "Or use keyword search.",
            },
        ],
    },
    explain: {
        heading:
            "Understand the world with accurate summaries and clear explanations",
        examples: [
            {
                heading: "List of reasons NASA is going back to the moon",
                large: true,
                image: "/assets/welcome/moon.webp",
                dark: false,
                caption: (
                    <React.Fragment>
                        For an uncluttered view of the content for any result
                        click <Read />
                    </React.Fragment>
                ),
            },
            {
                heading: "Outline why South Korea is a global innovation hub",
                large: false,
                image: "/assets/welcome/seoul.webp",
                dark: false,
                caption: (
                    <React.Fragment>
                        For a concise summary click <Summarize />
                    </React.Fragment>
                ),
            },
            {
                heading: "Explain why dolphins are intelligent",
                large: false,
                image: "/assets/welcome/dolphin.webp",
                dark: true,
                caption: (
                    <React.Fragment>
                        For a simple explanation click <Explain />
                    </React.Fragment>
                ),
            },
        ],
    },
    generate: {
        heading: "Create new content based on real sources and facts",
        examples: [
            {
                heading: "Write a 3 day itinerary for Miami Beach",
                large: true,
                image: "/assets/welcome/miamibeach.webp",
                dark: true,
                caption: (
                    <React.Fragment>
                        I can write content for you using AI with <Generate />
                    </React.Fragment>
                ),
            },
            {
                heading: "Create a packing list for a two week trip in Vietnam",
                large: false,
                image: "/assets/welcome/vietnam.webp",
                dark: false,
                caption: "Use words like 'create' or 'write'",
            },
            {
                heading:
                    "Tell me where Taylor Swift has sold out on her Eras Tour",
                large: false,
                image: "/assets/welcome/crowd.webp",
                dark: false,
                caption: "Content is factually grounded.",
            },
        ],
    },
};

const Welcome = (props) => {
    const { setPlaceholder } = props;
    const [markdown, setMarkdown] = useState("");

    useEffect(() => {
        async function fetchMarkdown(url) {
            const response = await fetch(url);
            const markdown_response = await response.text();
            if (
                markdown_response &&
                !markdown_response.startsWith("404: Not Found")
            ) {
                setMarkdown(markdown_response);
            }
        }
        const WELCOME_MESSAGE_URL =
            "https://raw.githubusercontent.com/Newslysearch/Newslysearch.github.io/main/welcome_promo_message.md";

        fetchMarkdown(CORS_PROXY + WELCOME_MESSAGE_URL);
    }, []);

    const PromoWelcomeMessage = (props) => {
        const { markdownToDisplay } = props;
        return (
            markdownToDisplay && (
                <Message
                    compact
                    info
                    color="orange"
                    style={{ marginTop: "2rem", borderRadius: "24px" }}
                    size="large"
                >
                    <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        children={emoji.emojify(markdownToDisplay)}
                        style={{ whiteSpace: "pre-wrap" }}
                        //allowDangerousHtml={true}
                        linkTarget="_blank"
                        remarkPlugins={[remarkGfm]}
                    />
                </Message>
            )
        );
    };

    const handleOnClickSearch = (event) => {
        if (event.target.value) {
            setPlaceholder(event.target.value);
        }
        event.preventDefault();
    };

    const TryItNowButton = (props) => {
        const { suggestion } = props;
        return (
            <Button
                content="Try Now"
                onClick={handleOnClickSearch}
                value={suggestion}
                alt="Try Now"
                icon={{
                    name: "arrow right",
                    style: {
                        borderRadius: "9999px",
                        color: "white",
                        backgroundColor: "var(--color-Newsly-darker)",
                        display: "inline-block",
                        textAlign: "left",
                        float: "right",
                    },
                }}
                labelPosition="right"
                circular
                size="tiny"
                style={{
                    backgroundColor: "rgba(88, 88, 88, 0.95)",
                    color: "white",
                    fontFamily: "QualyBold",
                    fontSize: "0.9rem",
                    width: "fit-content",
                    margin: "1rem auto 0 auto",
                    textShadow: "1px 1px rgba(0, 0, 0, 0.375)",
                }}
            />
        );
    };

    const ScrollForMoreButton = () => {
        // Scroll to the ExampleSections component onClick
        return (
            <Button
                content="Scroll for More"
                onClick={() =>
                    exampleSectionsRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    })
                }
                alt="Scroll for More"
                icon={{
                    name: "arrow down",
                    style: {
                        borderRadius: "9999px",
                        color: "white",
                        backgroundColor: "var(--color-Newsly-darker)",
                        display: "inline-block",
                        textAlign: "left",
                        float: "right",
                    },
                }}
                labelPosition="right"
                circular
                style={{
                    backgroundColor: "rgba(88, 88, 88, 0.95)",
                    color: "white",
                    // marginTop: "1rem",
                    fontFamily: "QualyBold",
                    fontSize: "1.067rem",
                    left: "0",
                    right: "0",
                    width: "fit-content",
                    bottom: "2rem",
                    position: "absolute",
                    margin: "0 auto 0 auto",
                    textShadow: "1px 1px rgba(0, 0, 0, 0.375)",
                }}
            />
        );
    };

    const ExampleSections = () => {
        // Enumerate through find, explain, and generate
        const ExampleSection = ({ heading, examples }) => {
            const ExampleCards = examples.map((example) => {
                return (
                    <Card
                        className={example.large ? cardLarge : cardSmall}
                        style={{
                            backgroundImage: `url(${example.image})`,
                        }}
                        key={example.heading}
                    >
                        <Card.Content>
                            <Card.Header
                                className={
                                    example.dark
                                        ? cardHeaderDark
                                        : cardHeaderLight
                                }
                                style={{
                                    color: example.color,
                                    margin: example.margin && example.margin,
                                    fontSize: example.large ? "3rem" : "2rem",
                                }}
                            >
                                {example.heading}
                            </Card.Header>
                            <Card.Content className={cardDetails}>
                                <Card.Meta className={cardCaption}>
                                    {example.caption && example.caption}{" "}
                                </Card.Meta>
                                <TryItNowButton suggestion={example.heading} />
                            </Card.Content>
                        </Card.Content>
                    </Card>
                );
            });
            return (
                <React.Fragment>
                    <Segment className={simple}>
                        <Header className={mainHeader}>{heading}</Header>
                    </Segment>
                    <Segment className={simple}>
                        <Card.Group>{ExampleCards}</Card.Group>
                    </Segment>
                </React.Fragment>
            );
        };
        return (
            <React.Fragment>
                <ExampleSection
                    heading={exampleContents.find.heading}
                    examples={exampleContents.find.examples}
                />
                <ExampleSection
                    heading={exampleContents.explain.heading}
                    examples={exampleContents.explain.examples}
                />
                <ExampleSection
                    heading={exampleContents.generate.heading}
                    examples={exampleContents.generate.examples}
                />
            </React.Fragment>
        );
    };

    // Create a ref to the ExampleSections component to use with Scroll for More button
    const exampleSectionsRef = useRef(null);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                overflowY: "scroll",
            }}
        >
            <Segment
                style={{
                    backgroundImage: `url('/assets/welcome/space.webp')`,
                    height: "100vh",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "bottom center",
                    backgroundColor: "black",
                    textAlign: "center",
                    margin: 0,
                    padding: 0,
                    width: "100%",
                    borderRadius: 0,
                    border: "none",
                    zIndex: "10",
                }}
            >
                <PromoWelcomeMessage markdownToDisplay={markdown} />
                <Header className={welcomeHeader}>
                    Welcome to the next generation of search using the power of
                    AI
                </Header>

                <ScrollForMoreButton />
            </Segment>
            <div ref={exampleSectionsRef} />
            <ExampleSections />
        </div>
    );
};

export default Welcome;
