import React, { useState } from "react";
import { Segment, Button, Card, Embed, Modal, Icon } from "semantic-ui-react";
import * as emoji from 'node-emoji';
import ReactMarkdown from "react-markdown";

const CalculatorResponse = (props) => {
    const { source, message, query } = props;
    const [showCalc, setShowCalc] = useState(false);
    const [showGraphing, setShowGraphing] = useState(false);
    // const onClickCalcButton = () => {
    //     setShowCalc(!showCalc);
    //     setShowGraphing(false);
    // };
    // const onClickGraphingButton = () => {
    //     setShowGraphing(!showGraphing);
    //     setShowCalc(false);
    // };

    const SimpleCalculatorButtons = () => {
        return (
            <div>
                <div
                    className="lw-suggestions-calc"
                    // className="lw-card-action-buttons"
                >
                    <Modal
                        trigger={
                            <Button
                                // className="lw-suggestions-calc-button"
                                // basic
                                compact
                                // size="small"
                                content={
                                    !showCalc ? "Calculator" : "Hide Calculator"
                                }
                                // onClick={onClickCalcButton}
                                data-Newsly-event="Engagement"
                                data-Newsly-action="Tools"
                                data-Newsly-channel="Calculator"
                            />
                        }
                        size="large"
                        basic
                        // closeIcon
                        open={showCalc}
                        onClose={() => setShowCalc(false)}
                        onOpen={() => setShowCalc(true)}
                    >
                        <Modal.Content>
                            <div
                            // className="lw-calc-card"
                            >
                                <Card fluid>
                                    <Embed
                                        className="lw-calc-embed"
                                        // style={{ maxWidth: "600px"}}
                                        active
                                        url="https://www.desmos.com/scientific"
                                        iframe={{
                                            allow: "encrypted-media",
                                            allowtransparency: "true",
                                            sandbox:
                                                "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-presentation",
                                        }}
                                        data-Newsly-event="Engagement"
                                        data-Newsly-action="Tools"
                                        data-Newsly-channel="Calculator"
                                    />
                                </Card>
                            </div>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                color="green"
                                onClick={() => setShowCalc(false)}
                            >
                                <Icon name="checkmark" /> Done
                            </Button>
                        </Modal.Actions>
                    </Modal>

                    <Modal
                        trigger={
                            <Button
                                // className="lw-suggestions-calc-button"
                                // basic
                                compact
                                // size="small"
                                content={
                                    !showGraphing ? "Graphing" : "Hide Graphing"
                                }
                                // onClick={onClickGraphingButton}
                                data-Newsly-event="Engagement"
                                data-Newsly-action="Tools"
                                data-Newsly-channel="Calculator"
                            />
                        }
                        size="fullscreen"
                        basic
                        // closeIcon
                        open={showGraphing}
                        onClose={() => setShowGraphing(false)}
                        onOpen={() => setShowGraphing(true)}
                    >
                        <Modal.Content>
                            <div
                            // className="lw-calc-card"
                            >
                                <Card fluid>
                                    <Embed
                                        className="lw-calc-embed"
                                        active
                                        url="https://www.desmos.com/calculator"
                                        iframe={{
                                            allow: "encrypted-media",
                                            allowtransparency: "true",
                                            sandbox:
                                                "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-presentation",
                                        }}
                                        data-Newsly-event="Engagement"
                                        data-Newsly-action="Tools"
                                        data-Newsly-channel="Calculator"
                                    />
                                </Card>
                            </div>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                color="green"
                                onClick={() => setShowGraphing(false)}
                            >
                                <Icon name="checkmark" /> Done
                            </Button>
                        </Modal.Actions>
                    </Modal>

                    <Button
                        // className="lw-suggestions-calc-button"
                        // basic
                        compact
                        // size="small"
                        content={
                            source && source.toLowerCase().includes("wolfram")
                                ? "Source: Wolfram|Alpha"
                                : "Wolfram|Alpha"
                        }
                        icon="external"
                        as="a"
                        onClick={(e) => e.stopPropagation()}
                        href={`https://www.wolframalpha.com/input/?i=${query}`}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        data-Newsly-event="Engagement"
                        data-Newsly-action="Tools"
                        data-Newsly-channel="Wolfram"
                    />
                </div>
            </div>
        );
    };

    return (
        <div id={props.id}>
            <div className="lw-response">
                <Segment secondary size="large" className="lw-message-simple">
                    <ReactMarkdown
                        children={emoji.emojify(message)}
                        style={{ whiteSpace: "pre-wrap" }}
                    />
                    <SimpleCalculatorButtons />
                </Segment>
            </div>
        </div>
    );
};
export default CalculatorResponse;
