import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Image,
    Loader,
    Dimmer,
    Segment,
    Message,
    Dropdown,
} from "semantic-ui-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import posthog from "posthog-js";
import { AwsClient } from "aws4fetch";
import { Auth } from "aws-amplify";
import { WRITER } from "../../../constants";
// import { getGeneration } from "../../../utilities/getGeneration";
import getDomainNameAndSubdomain from "../../../utilities/getDomainNameAndSubdomain";
import extractSiteSource from "../../../utilities/extractSiteSource";
import AiPencilIcon from "../../../assets/icons/ai-pencil-icon-transparent-64px.png";

export default function GenerateText(props) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState([]);
    const [isTextStreaming, setIsTextStreaming] = useState(false);
    const [textGenerations, setTextGenerations] = useState([]);
    const [displayTextGenerationVersion, setDisplayTextGenerationVersion] =
        useState(0);
    const [generationCollectionRequired, setGenerationCollectionRequired] =
        useState(false);
    const [textGenerationLoading, setTextGenerationLoading] = useState(false);
    const { result, query } = props;

    const handleClose = (linkDetails, e) => {
        setOpen(false);
        posthog.capture(linkDetails.event, {
            Action: linkDetails.action,
            Channel: linkDetails.channel,
            //Destination: linkDetails.destination ? linkDetails.destination : "",
        });
    };

    let { domain } = result.link && getDomainNameAndSubdomain(result.link);
    if (domain === null || domain === "") {
        domain = result.source ? result.source : null;
    }

    let displaySource = extractSiteSource(result);
    if (displaySource === null) {
        displaySource = result.source ? result.source : domain;
    }

    const handleGenerate = async (linkDetails, e) => {
        setTextGenerationLoading(true);
        setGenerationCollectionRequired(true);
        setDisplayTextGenerationVersion(0);
        setIsTextStreaming(true);
        setData([]);
        setOpen(true);
        posthog.capture("Engagement", {
            Action: "Generation",
            Channel: "Generate Text",
        });
    };

    const handleRetryGenerate = async (linkDetails, e) => {
        setTextGenerationLoading(true);
        setGenerationCollectionRequired(true);
        setDisplayTextGenerationVersion(0);
        setIsTextStreaming(true);
        setData([]);
        setOpen(true);
        posthog.capture("Engagement", {
            Action: "Generation",
            Channel: "Retry Generate Text",
        });
    };

    // Pickup the textGeneration text using await and set it to the textGeneration state once available

    useEffect(() => {
        const fetchData = async (link) => {
            // let generatorLookup = await getGeneration(query, result);

            let timeout = 600000;
            let url = WRITER;

            // axios.defaults.headers.put['Content-Type'] = "application/json";
            let headers = {
                Accept: "text/event-stream",
                "Newsly-origin": "x-Newsly-origin",
                "Newsly-auth-key": "Newsly-summarizer",
                "Content-Type": "application/json",
            };

            const credentials = Auth.essentialCredentials(
                await Auth.currentCredentials()
            );

            let awsCredentials = {
                region: "us-west-2",
                service: "execute-api",
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
            };

            const aws = new AwsClient(awsCredentials);

            try {
                const summarizeAPIResponse = await aws.fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        query: query,
                        serp: result,
                        debug: false,
                    }),
                    timeout: timeout,
                });

                const reader = summarizeAPIResponse.body
                    // eslint-disable-next-line no-undef
                    .pipeThrough(new TextDecoderStream())
                    .getReader();
                while (true) {
                    const { value, done } = await reader.read();
                    if (generationCollectionRequired && value) {
                        setGenerationCollectionRequired(false);
                        setTextGenerationLoading(false);
                    }

                    if (done) {
                        setData((data) => [...data, value]);
                        setIsTextStreaming(false);

                        const thisTextGeneration = {
                            query: query,
                            version: textGenerations.length + 1,
                            contentText: "",
                        };

                        setDisplayTextGenerationVersion(
                            textGenerations.length + 1
                        );
                        setTextGenerations((textGenerations) => [
                            ...textGenerations,
                            thisTextGeneration,
                        ]);

                        break;
                    } else {
                        setData((data) => [...data, value]);
                    }
                }
            } catch (error) {
                setTextGenerationLoading(false);
                setGenerationCollectionRequired(false);
            }
        };
        if (generationCollectionRequired) {
            fetchData(result.link);
        }
    }, [result, generationCollectionRequired, query, textGenerations, data]);

    // Map the data text to a text string called textGenerationContent

    let textGenerationContent = "";
    let wordsList = [];

    // if data is is populated and text has finished streaming but the current version does not have contentText, then populate the contentText from data
    if (
        !isTextStreaming &&
        data &&
        data.length > 0 &&
        textGenerations.length > 0 &&
        displayTextGenerationVersion > 0
    ) {
        const textGenerationVersion = textGenerations.filter(
            (item) => item.version === displayTextGenerationVersion
        )[0];
        if (
            textGenerationVersion &&
            !textGenerationVersion.contentText &&
            data.length > 0
        ) {
            wordsList = data.map((item) => {
                if (item) {
                    return `${item}`;
                } else {
                    return "";
                }
            });
            if (wordsList && wordsList.length > 0) {
                textGenerationContent = wordsList.join("");
            }
            textGenerationVersion.contentText = textGenerationContent;
            setTextGenerations((textGenerations) => [
                ...textGenerations,
                textGenerationVersion,
            ]);
        }
    }

    // if the current version has contentText, then use that

    if (
        !isTextStreaming &&
        displayTextGenerationVersion > 0 &&
        textGenerations.length > 0
    ) {
        const textGenerationVersion = textGenerations.filter(
            (item) => item.version === displayTextGenerationVersion
        )[0];
        if (textGenerationVersion && textGenerationVersion.contentText) {
            textGenerationContent = textGenerationVersion.contentText;
        }
    } else if (isTextStreaming && data && data.length > 0) {
        wordsList = data.map((item) => {
            if (item) {
                return `${item}`;
            } else {
                return "";
            }
        });
        if (wordsList && wordsList.length > 0) {
            textGenerationContent = wordsList.join("");
        }
    }

    const versionOptions = textGenerations.map((item) => {
        return {
            key: item.version,
            text: `V ${item.version}`,
            value: item.version,
        };
    });
    const DropdownVersions = () => {
        return (
            <Dropdown
                style={{
                    width: "6rem",
                    minWidth: "6rem",
                    borderRadius: "24px",
                }}
                placeholder={
                    displayTextGenerationVersion
                        ? `V ${displayTextGenerationVersion}`
                        : "Draft..."
                }
                selection
                options={versionOptions}
                onChange={(e, { value }) => {
                    setDisplayTextGenerationVersion(value);
                }}
            />
        );
    };

    return (
        <Modal
            closeIcon={false}
            size="small"
            centered={false}
            open={open}
            dimmer="blurring"
            onClose={() => setOpen(false)}
            onOpen={() => {
                handleGenerate(result.link);
            }}
            trigger={
                <Button
                    // style={{ paddingLeft: "0.875em" }}
                    // content="Generate Text"
                    data-Newsly-event="Engagement"
                    data-Newsly-action="Click"
                    data-Newsly-channel="Generation"
                    compact
                    // icon="pencil"
                    className="lw-chat-actions"
                >
                    Generate Text{" "}
                    <Image
                        src={AiPencilIcon}
                        size="mini"
                        align="right"
                        alt="AI Icon"
                        style={{
                            margin: "-8px -16px -8px 0.5rem",
                            padding: "3px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "9999px",
                            backgroundColor: "var(--color-Newsly-dark)",
                        }}
                    />
                    {/* <Icon name="pencil" color="blue" fitted inverted style={{ paddingLeft: "0.5rem", paddingRight: 0 }} /> */}
                </Button>
            }
        >
            <Modal.Header>
                Newsly's Writeup
                <Modal
                    // size="mini"
                    centered={false}
                    closeIcon={true}
                    // basic
                    content={
                        "This text was generated by AI using content found on the web as source material. See the full search results for more details."
                    }
                    header={"Where does this text come from?"}
                    trigger={
                        <div style={{ float: "right" }}>
                            <Button
                                icon="info"
                                size="tiny"
                                circular
                                basic
                                compact
                            />
                            <Button
                                onClick={(e) =>
                                    handleClose(
                                        {
                                            link: result.link,
                                            event: "Engagement",
                                            action: "Summarize",
                                            channel: "Close Summary",
                                            destination: null,
                                        },
                                        e
                                    )
                                }
                                icon="close"
                                positive
                                content="Close"
                                basic
                                compact
                                size="tiny"
                                style={{
                                    borderRadius: "24px",
                                    display: "inline-block",
                                }}
                            />
                        </div>
                    }
                />
            </Modal.Header>

            <Modal.Content scrolling style={{ minHeight: "calc(70vh)" }}>
                {/* <Header style={{ fontSize: "1.4rem"}}>{result.title}</Header> */}
                <Modal.Description>
                    <Segment
                        className="lw-generated-text"
                        style={{
                            border: "none",
                            boxShadow: "none",
                            // padding: "0",
                            // margin: "0",
                            width: "90%",
                            margin: "0 auto",
                            fontSize: "1.4rem",
                            lineHeight: "1.5rem",
                        }}
                    >
                        <Dimmer active={textGenerationLoading} inverted>
                            <Loader
                                inverted
                                content="Reading through search results..."
                            />
                        </Dimmer>

                        {generationCollectionRequired ? (
                            <React.Fragment>
                                <p>
                                    <Image src="/assets/placeholders/placeholder-short-paragraph.png" />
                                </p>
                                <p>
                                    <Image src="/assets/placeholders/placeholder-short-paragraph.png" />
                                </p>
                                <p>
                                    <Image src="/assets/placeholders/placeholder-short-paragraph.png" />
                                </p>
                                <p>
                                    <Image src="/assets/placeholders/placeholder-short-paragraph.png" />
                                </p>
                                <p>
                                    <Image src="/assets/placeholders/placeholder-short-paragraph.png" />
                                </p>
                            </React.Fragment>
                        ) : textGenerationContent ? (
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                children={textGenerationContent}
                                //components={components}
                            />
                        ) : (
                            <Message warning>
                                Sorry, I wasn't able to generate text for you.
                                If you like, please wait a few minutes and try
                                again.
                            </Message>
                        )}
                    </Segment>
                </Modal.Description>
            </Modal.Content>

            <Modal.Actions style={{ padding: "0.25rem 0px!important" }}>
                {textGenerations?.length > 1 ? (
                    <DropdownVersions />
                ) : displayTextGenerationVersion === 1 ? (
                    "Verson 1 "
                ) : (
                    "Drafting... "
                )}
                <Button
                    onClick={() => {
                        handleRetryGenerate(result.link);
                    }}
                    icon="redo"
                    // positive
                    content="Retry"
                    basic
                    // color="blue"
                    style={{ borderRadius: "24px" }}
                    disabled={isTextStreaming || textGenerationLoading}
                    active={!isTextStreaming && !textGenerationLoading}
                />
            </Modal.Actions>
        </Modal>
    );
}

/*                 <Button
                    onClick={(e) =>
                        handleClose(
                            {
                                link: result.link,
                                event: "Engagement",
                                action: "Generation",
                                channel: "Close Generation Modal",
                                destination: null,
                            },
                            e
                        )
                    }
                    icon="checkmark"
                    positive
                    content="Done"
                    basic
                    // color="blue"
                    style={{ borderRadius: "24px" }}
                /> */
