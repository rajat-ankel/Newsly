import {
    addResponseMessage,
    addUserMessage,
    deleteMessages,
    renderCustomComponent,
    toggleMsgLoader,
} from "react-chat-widget";
import * as emoji from 'node-emoji';
import emojiTree from "emoji-tree";
import zlib from "zlib";
import { emojiEmotion } from "emoji-emotion";
import { retry } from "@lifeomic/attempt";
import SimpleResponse from "../components/Response/SimpleResponse";
import Response from "../components/Response/Response";
import PermissionResponse from "../components/Response/PermissionResponse";
import BugReport from "../components/AppCards/BugReport";
import Feedback from "../components/AppCards/Feedback";
import TutorialCard from "../components/AppCards/TutorialCard";
import { sendMessage } from "./sendMessage";
import { suggestionsList } from "./suggestionsList";
import { isMobileDevice, isQuestion, isValidURL } from "../utils";
import { getScores } from "./getGrade";
import posthog from "posthog-js";
import getDomainNameAndSubdomain from "./getDomainNameAndSubdomain";

export const messageBroker = async (
    newMessage,
    responseRef,
    messageProps,
    handleSuggestions,
    handlePanel,
    handleNewUserMessage
    // terminalUpdateNeeded,
    // setTerminalUpdateNeeded,
) => {
    const {
        sessionAttributes,
        setSessionAttributes,
        messages,
        setMessages,
        allowLocation,
        userSettings,
        locationData,
        mode,
        heroMode,
        setHeroChange,
        setHeroMode,
        changeLocationAllowed,
        isAnalyticsAllowed,
        setPromptOptions,
    } = messageProps;

    const { useDeepAnswers, persona } = userSettings;

    // Clean up text before sending to backend
    let cleanMessage = emoji.replace(newMessage, (emoji) => `:${emoji.key}:`);

    const addMessage = (response, messageId, queryMessage) => {
        let messagesHistory = messages;
        if (!messageId) {
            messageId = new Date()
                .getTime()
                .toString()
                .concat(performance.now());
        }
        const messageToAdd = {
            query: queryMessage ? queryMessage : cleanMessage,
            response: response,
            requestId: messageId,
            timestamp: Date.now(),
        };
        messagesHistory.push(messageToAdd);
        setMessages(messagesHistory);
        // console.log("Set messages", messagesHistory);

        // // Turn off hero mode if it is on
        // if (heroMode) {
        //     setHeroMode(false);
        //     //console.log("Hero mode is now false");
        // }

        // if (terminalUpdateNeeded === false) {
        //     setTerminalUpdateNeeded(true);
        // }
    };

    // Check for commands
    if (newMessage.startsWith("/")) {
        let responseMessage = `Say '${newMessage?.replace(
            "/",
            ""
        )}' in terminal mode as a shortcut next time.`;

        addMessage({ message: responseMessage });

        if (newMessage.toLowerCase().startsWith("/bug")) {
            renderCustomComponent(BugReport, {
                sessionAttributes: sessionAttributes,
            });
            handleSuggestions([]);
            if (isAnalyticsAllowed) {
                posthog.capture("Message", {
                    Action: "Command",
                    Channel: "Bug Report",
                });
            }
            return;
        }
        if (newMessage.toLowerCase().startsWith("/feedback")) {
            renderCustomComponent(Feedback);
            handleSuggestions([]);
            if (isAnalyticsAllowed) {
                posthog.capture("Message", {
                    Action: "Command",
                    Channel: "Feedback",
                });
            }
            return;
        }
        if (newMessage.toLowerCase().startsWith("/tutorial")) {
            renderCustomComponent(TutorialCard);
            handleSuggestions([]);
            if (isAnalyticsAllowed) {
                posthog.capture("Message", {
                    Action: "Command",
                    Channel: "Tutorial",
                });
            }
            return;
        }
        if (
            newMessage.toLowerCase().startsWith("/clear") ||
            newMessage.toLowerCase().startsWith("/clean")
        ) {
            if (isAnalyticsAllowed) {
                posthog.capture("Message", {
                    Action: "Command",
                    Channel: "Clear Session",
                });
            }
            // Clear local storage
            sessionStorage.clear();
            // localStorage.clear();
            //window.location += "";
            window.location.reload
                ? window.location.reload(true)
                : (window.location += "");
            return false;
        }
        if (newMessage.toLowerCase().startsWith("/reset")) {
            if (isAnalyticsAllowed) {
                posthog.capture("Message", {
                    Action: "Command",
                    Channel: "Reset Application",
                });
            }
            // Clear local storage
            sessionStorage.clear();
            localStorage.clear();
            //window.location += "";
            window.location.reload
                ? window.location.reload(true)
                : (window.location += "");
            return false;
        }
    }

    // Check for local IP address query
    if (
        newMessage.toLowerCase().startsWith("what's my ip") ||
        newMessage.toLowerCase().startsWith("what is my ip") ||
        newMessage.toLowerCase().startsWith("whats my ip")
    ) {
        if (isAnalyticsAllowed) {
            posthog.capture("Message", {
                Action: "Command",
                Channel: "IP Lookup",
            });
        }
        let responseMessage = locationData.ip
            ? `Your public IP is ${locationData.ip}`
            : "Please enable location for me to access your IP address :smile:";
        let responsePrompts = [
            {
                title: `Web search for '${cleanMessage
                    .replace("~d ", "")
                    .replace("~e ", "")}'`,
                link: "",
                command: `~e ${cleanMessage
                    .replace("~d ", "")
                    .replace("~e ", "")}`,
                color: "blue",
                type: "action",
            },
            {
                title:
                    allowLocation || !isMobileDevice() || !navigator.geolocation
                        ? "Location settings"
                        : "Enable GPS",
                link: "",
                command: "location settings",
                color: "blue",
                type: "action",
            },
            {
                title: "Open whatsmyipaddress.com",
                link: "https://whatismyipaddress.com/",
                command: "",
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: responseMessage,
            suggestions: responsePrompts,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
        });
        //handleSuggestions();
        const messageId = new Date()
            .getTime()
            .toString()
            .concat(performance.now());

        addMessage({ message: responseMessage }, messageId, cleanMessage);
        setPromptOptions({
            message: responseMessage,
            prompts: responsePrompts,
        });

        return false;
    }

    // Check for question intent and warn user about Deep Answers delay - find a deeper answer for you
    if (isQuestion(newMessage)) {
        if (isAnalyticsAllowed) {
            posthog.capture("Message", {
                Action: "Deep Answers",
                Channel: "Warning",
            });
        }
        const messageScores = getScores(newMessage);
        //console.log(messageScores);
        const readingGrade =
            messageScores && messageScores["medianGrade"]
                ? messageScores["medianGrade"]
                : 0;

        let complexityNotice =
            "Let me research that for you. Give me a minute please.";

        if (readingGrade > 6) {
            complexityNotice =
                "Looking into that now. It may be 10 seconds or more to look for a direct answer.";
        } else if (readingGrade > 4) {
            complexityNotice =
                "Give me 5 to 10 seconds to research that question for you please.";
        }

        if (readingGrade > 1) {
            const responseMessage = `Thanks for your question. ${complexityNotice}`;
            addResponseMessage(responseMessage, "deep-answers-warning");
        }

        // const messageId = new Date()
        //     .getTime()
        //     .toString()
        //     .concat(performance.now());

        // renderCustomComponent(SimpleResponse, {
        //     id: "deep-answers-warning",
        //     message: responseMessage,
        //     query: cleanMessage,
        //     handleNewUserMessage: handleNewUserMessage,
        // });
        //handleSuggestions();

        // Don't add message to chat history
        // addMessage({ message: responseMessage }, messageId, cleanMessage);
    }

    // Check for emojis response and sentiment
    // Get the average sentiment of emojis in post. If positive say thanks and offer feedback. If negative express sympath and offer bug report
    let emoCount = 0;
    let emoSum = 0;
    let matchList = [];

    // Disabled emoji emotion due to problem with updates on emoji-emotion
    const charList = emojiTree(newMessage);

    charList.forEach((item) => {
        if (item.type === "emoji") {
            emojiEmotion.forEach((emo) => {
                if (emo.emoji === item.text) {
                    emoCount = emoCount + 1;
                    emoSum =
                        emoSum + emo.polarity > 4
                            ? 4
                            : emoSum + emo.polarity < -2
                            ? -2
                            : emoSum + emo.polarity;
                }
            });
        }
    });

    // Find matching emojis
    emojiEmotion.forEach((emo) => {
        if (emo.polarity === emoSum) {
            matchList.push(emo.emoji);
        }
    });

    // Generate a random list up to length of user message

    let startEmo = Math.floor(Math.random() * matchList.length);
    let countEmo = Math.floor(Math.random() * 6);
    let responseEmojis = matchList.slice(startEmo, startEmo + countEmo);

    if (
        responseEmojis.length > 0 &&
        emoji.unemojify(newMessage.trim()).startsWith(":") &&
        emoji.unemojify(newMessage.trim()).endsWith(":") &&
        newMessage.length < 20
    ) {
        if (emoSum >= 1) {
            // handleSuggestions();
            const responseMessage = `Thank you ${responseEmojis.join("")}`;
            let responsePrompts = [
                {
                    title: "Give feedback",
                    link: "",
                    command: "/feedback",
                    color: "green",
                    type: "action",
                },
            ];
            renderCustomComponent(SimpleResponse, {
                message: responseMessage,
                query: cleanMessage,
                handleNewUserMessage: handleNewUserMessage,
                suggestions: responsePrompts,
            });
            const messageId = new Date()
                .getTime()
                .toString()
                .concat(performance.now());
            addMessage({ message: responseMessage }, messageId, cleanMessage);
            setPromptOptions({
                message: responseMessage,
                prompts: responsePrompts,
            });
            return;
        } else if (emoSum <= -1) {
            // handleSuggestions();
            const responseMessage = `Sorry ${responseEmojis.join("")}`;
            let responsePrompts = [
                {
                    title: "Report a Bug",
                    link: "",
                    command: "/bug",
                    color: "red",
                    type: "action",
                },
                {
                    title: "Give feedback",
                    link: "",
                    command: "/feedback",
                    color: "green",
                    type: "action",
                },
            ];
            renderCustomComponent(SimpleResponse, {
                message: responseMessage,
                query: cleanMessage,
                handleNewUserMessage: handleNewUserMessage,
                suggestions: responsePrompts,
            });
            const messageId = new Date()
                .getTime()
                .toString()
                .concat(performance.now());
            addMessage({ message: responseMessage }, messageId, cleanMessage);
            setPromptOptions({
                message: responseMessage,
                prompts: responsePrompts,
            });
            return;
        }
    }

    // Now send the message throught the backend API

    // Turn on the typing indicator

    toggleMsgLoader();

    let response = "";
    let includeLastSearch = true;
    const lexSessionAttributes = {
        currentSearchResult:
            includeLastSearch && sessionAttributes.currentSearchResult
                ? sessionAttributes.currentSearchResult
                : "",
        searchResultHistory:
            includeLastSearch && sessionAttributes.searchResultHistory
                ? sessionAttributes.searchResultHistory
                : "",
        format:
            includeLastSearch && sessionAttributes.format
                ? sessionAttributes.format
                : "",
    };

    const locationString = [
        locationData.city,
        locationData.region,
        locationData.country,
    ]
        .filter(function (val) {
            return val !== null && val !== "";
        })
        .slice(0, 2)
        .join(" ")
        .trim();

    const lexRequestAttributes = {
        //ip: locationData.ip,
        location: locationString,
        //formattedAddress: locationData.formattedAddress,
        latitude: (
            Math.round(locationData.latitude * 10000) / 10000
        ).toString(),
        longitude: (
            Math.round(locationData.longitude * 10000) / 10000
        ).toString(),
        accuracy: locationData.accuracy.toString(),
        "x-amz-lex:time-zone":
            new window.Intl.DateTimeFormat().resolvedOptions().timeZone,
        compress: "true",
        features: useDeepAnswers ? "deep answers" : "",
        persona: persona,
        safety: "false",
        cleanup: "true",
    };

    const options = {
        delay: 200,
        factor: 2,
        maxAttempts: 5,
        minDelay: 100,
        maxDelay: 500,
        jitter: true,
        timeout: 30000,
    };
    try {
        // Send lex message with retries and jitter backoff

        response = await retry(
            //async () => Interactions.send("lazyweb_dev", cleanMessage),
            async () =>
                sendMessage(
                    cleanMessage,
                    lexSessionAttributes,
                    lexRequestAttributes
                ),
            options
        );

        //console.log("Response received: ", response);
    } catch (err) {
        console.log("Error getting results from backend: ", err);
        response = {
            exception: err.toString(),
            message: "I'm having a hard time finding a good answer :flushed:",
        };
        if (isAnalyticsAllowed) {
            posthog.capture("Error", {
                Action: "Chat",
                Channel: "No Response",
            });
        }
    }
    toggleMsgLoader();
    // Turn off hero mode if it is on and flag it has changed
    if (heroMode === true) {
        setHeroMode(false);
        setHeroChange(true);
        //console.log("Hero mode is now false");
    }
    deleteMessages(0, "deep-answers-warning");

    //console.log("Response: ", response);

    const refineSearch = async (
        refineContent,
        refineType,
        refineHistory,
        refineHistoryQuery,
        refineProps
    ) => {
        const { setChatUpdateRequired } = refineProps;
        // Refine results by executing a new message from within previous results
        let refineMessage = "";
        let replacementRefineHistory =
            refineHistory === "" ? newMessage : refineHistory;
        let replacementRefineHistoryQuery =
            refineHistoryQuery === "" ? newMessage : refineHistoryQuery;
        let refineHistoryPost = "";

        switch (refineType) {
            case "author":
                //code
                console.log("Author refine");
                break;
            case "entities":
                //code
                console.log("Entities refine");
                break;
            case "domain":
                if (replacementRefineHistoryQuery.includes("related:")) {
                    replacementRefineHistoryQuery =
                        replacementRefineHistoryQuery.replace(
                            "related:",
                            "site:"
                        );
                    if (replacementRefineHistory.startsWith("websites like ")) {
                        replacementRefineHistory =
                            replacementRefineHistory.replace(
                                "websites like ",
                                "website "
                            );
                    }
                } else if (replacementRefineHistoryQuery.includes("site:")) {
                    replacementRefineHistoryQuery =
                        replacementRefineHistoryQuery.replace(
                            /\(site:(.*?)\)/g,
                            "(site:" + refineContent + ")"
                        );
                    replacementRefineHistory = replacementRefineHistory.replace(
                        /website(.*?)for/g,
                        "website " + refineContent + " for"
                    );
                } else {
                    replacementRefineHistoryQuery = `(site:${refineContent}) AND (${replacementRefineHistoryQuery})`;
                    replacementRefineHistory = `website ${refineContent} for more results about '${replacementRefineHistory}'`;
                }
                refineHistoryPost = `Search ${replacementRefineHistory}`;
                // addResponseMessage(refineHistoryPost);
                addUserMessage(refineHistoryPost);
                addMessage({ message: refineHistoryPost });
                break;
            case "related":
                if (replacementRefineHistoryQuery.includes("site:")) {
                    replacementRefineHistoryQuery =
                        replacementRefineHistoryQuery.replace(
                            "site:",
                            "related:"
                        );
                    if (replacementRefineHistory.startsWith("website ")) {
                        replacementRefineHistory =
                            replacementRefineHistory.replace(
                                "website ",
                                "websites like "
                            );
                    }
                } else if (replacementRefineHistoryQuery.includes("related:")) {
                    replacementRefineHistoryQuery =
                        replacementRefineHistoryQuery.replace(
                            /\(related:(.*?)\)/g,
                            "(related:" + refineContent + ")"
                        );
                    replacementRefineHistory = replacementRefineHistory.replace(
                        /websites like(.*?)for/g,
                        "websites like " + refineContent + " for"
                    );
                } else {
                    replacementRefineHistoryQuery = `(related:${refineContent}) AND (${replacementRefineHistoryQuery})`;
                    replacementRefineHistory = `websites like ${refineContent} for more results about '${replacementRefineHistory}'`;
                }
                refineHistoryPost = `Search ${replacementRefineHistory}`;
                // addResponseMessage(refineHistoryPost);
                addUserMessage(refineHistoryPost);
                addMessage({ message: refineHistoryPost });
                break;
            case "within":
                replacementRefineHistoryQuery = `(allintext:${refineContent}) AND ${replacementRefineHistoryQuery}`;
                replacementRefineHistory = `'${refineContent}' within the results for '${replacementRefineHistory}'`;
                refineHistoryPost = `Search ${replacementRefineHistory}`;
                // addResponseMessage(refineHistoryPost);
                addUserMessage(refineHistoryPost);
                addMessage({ message: refineHistoryPost });
                break;
            default:
                addResponseMessage("Something went wrong");
                addMessage({ message: "Something went wrong" });
        }
        refineMessage = replacementRefineHistoryQuery;

        // Now send the message throught the backend API
        // Turn on the typing indicator
        // console.log("Sending message to API: ", refineMessage);
        toggleMsgLoader();
        setChatUpdateRequired(true);
        let refineResponse = "";
        try {
            // Send lex message with retries and jitter backoff
            refineResponse = await retry(
                async () =>
                    sendMessage(
                        refineMessage,
                        lexSessionAttributes,
                        lexRequestAttributes
                    ),
                options
            );
        } catch (err) {
            console.log("Error getting results from backend: ", err);
            refineResponse = {
                exception: err.toString(),
                message:
                    "Oops @#&! Something went wrong sorry! Try again?? :sob:",
            };
            if (isAnalyticsAllowed) {
                posthog.capture("Error", {
                    Action: "Search",
                    Channel: "Problem Refining Results",
                });
            }
        }
        toggleMsgLoader();
        setChatUpdateRequired(true);

        // Display results panel if we have have results
        let refineSearchResult = {};
        if (
            refineResponse &&
            refineResponse.sessionAttributes &&
            refineResponse.sessionAttributes.currentSearchResult
        ) {
            if (
                response.sessionAttributes.format &&
                response.sessionAttributes.format === "gzip"
            ) {
                refineSearchResult = JSON.parse(
                    zlib
                        .gunzipSync(
                            new Buffer.from(
                                refineResponse.sessionAttributes.currentSearchResult,
                                "base64"
                            )
                        )
                        .toString("utf8")
                );
            } else {
                refineSearchResult = JSON.parse(
                    refineResponse.sessionAttributes.currentSearchResult
                );
            }

            // refineSearchResult = JSON.parse(
            //     refineResponse.sessionAttributes.currentSearchResult
            // );
            if (
                refineSearchResult.results &&
                refineSearchResult.results.length > 0
            ) {
                const messageId =
                    refineResponse &&
                    refineResponse.$metadata &&
                    refineResponse.$metadata.requestId
                        ? refineResponse.$metadata.requestId
                        : new Date()
                              .getTime()
                              .toString()
                              .concat(performance.now());
                // Replace the first result if it matches previous search
                if (refineSearchResult.link === currentSearchResult.link) {
                    refineSearchResult.link =
                        refineSearchResult.results[1].link;
                    refineSearchResult.title =
                        refineSearchResult.results[1].title;
                    refineSearchResult.description = refineSearchResult
                        .results[1].description
                        ? refineSearchResult.results[1].description
                        : refineSearchResult.results[1].desc;
                    refineSearchResult.image = refineSearchResult.results[1]
                        .image
                        ? refineSearchResult.results[1].image
                        : "";
                    refineSearchResult.answer = refineSearchResult.description;
                    refineSearchResult.results.shift();
                }

                // Display results
                let commands = {
                    refineHistory: replacementRefineHistory,
                    refineHistoryQuery: replacementRefineHistoryQuery,
                    tester: "testing",
                };
                renderCustomComponent(Response, {
                    currentSearchResult: refineSearchResult,
                    intentName: response.intentName,
                    query: refineMessage,
                    commands: commands,
                    refineSearch: refineSearch,
                    handlePanel: handlePanel,
                    handleNewUserMessage: handleNewUserMessage,
                    mode: mode,
                    id: messageId,
                });
                handleSuggestions(
                    suggestionsList({
                        currentSearchResult: refineSearchResult,
                        intentName: response.intentName,
                        query: refineMessage,
                        allowLocation: allowLocation,
                    })
                );

                addMessage(refineResponse, messageId, refineMessage);
            } else {
                const responseMessage = emoji.emojify(
                    "That search was too narrow to find any good results sorry :hushed:"
                );
                addResponseMessage(responseMessage);
                addMessage(
                    { message: responseMessage },
                    messageId,
                    refineMessage
                );
                if (isAnalyticsAllowed) {
                    posthog.capture("Error", {
                        Action: "Search",
                        Channel: "No Refine Results",
                    });
                }
            }
        } else if (
            refineResponse &&
            (refineResponse.exception ||
                refineResponse.results_type === "Exception")
        ) {
            const responseMessage = emoji.emojify(
                "I had a problem finding any more good search results sorry :hushed:"
            );
            addResponseMessage(responseMessage);

            addMessage({ message: responseMessage }, messageId, refineMessage);
            if (isAnalyticsAllowed) {
                posthog.capture("Error", {
                    Action: "Search",
                    Channel: "Backend Exception",
                });
            }
        } else {
            addResponseMessage(
                emoji.emojify(
                    "There are no matches for that search sorry :hushed:"
                )
            );
            addMessage(
                {
                    message: emoji.emojify(
                        "There are no matches for that search sorry :hushed:"
                    ),
                },
                messageId,
                refineMessage
            );
            if (isAnalyticsAllowed) {
                posthog.capture("Error", {
                    Action: "Search",
                    Channel: "No Results",
                });
            }
        }
        // Force chat to update
        // console.log("Force chat to update");
        setChatUpdateRequired(true);
    };

    /* Handle Main Search Results */
    // console.log(response);

    // Get the results from sessionAttributes strings if available
    let currentSearchResult = {};
    //let searchResultHistory = [{}];
    if (
        response &&
        response.sessionAttributes &&
        response.sessionAttributes.currentSearchResult
    ) {
        setSessionAttributes(response.sessionAttributes);

        // Check if result is json or needs to be unzipped
        if (
            response.sessionAttributes.format &&
            response.sessionAttributes.format === "gzip"
        ) {
            currentSearchResult = JSON.parse(
                zlib
                    .gunzipSync(
                        new Buffer.from(
                            response.sessionAttributes.currentSearchResult,
                            "base64"
                        )
                    )
                    .toString("utf8")
            );
            //console.log(currentSearchResult);
            //console.log(response);
        } else {
            currentSearchResult = JSON.parse(
                response.sessionAttributes.currentSearchResult
            );
        }

        /* if (response.sessionAttributes.searchResultHistory) {
            searchResultHistory = JSON.parse(
                response.sessionAttributes.searchResultHistory
            );
        } */
    }

    // Set the ID for the message response item from the requestId
    // Keep a history of messages with request id, query and the response in state
    const messageId =
        response && response.$metadata && response.$metadata.requestId
            ? response.$metadata.requestId
            : new Date().getTime().toString().concat(performance.now());

    let commands = { intentName: response ? response.intentName : null };

    // Check for any text commands or intents

    if (
        response &&
        response.intentName === "NetworkIntent" &&
        allowLocation &&
        cleanMessage.toLowerCase().includes("ip")
    ) {
        const responseMessage =
            allowLocation && locationData.ip
                ? `Your public IP is ${locationData.ip}`
                : "Please enable location for me to access your IP address :smile:";
        let responsePrompts = [
            {
                title: `Web search for '${cleanMessage
                    .replace("~d ", "")
                    .replace("~e ", "")}'`,
                link: "",
                command: `~e ${cleanMessage
                    .replace("~d ", "")
                    .replace("~e ", "")}`,
                color: "blue",
                type: "action",
            },
            {
                title:
                    allowLocation || !isMobileDevice() || !navigator.geolocation
                        ? "Location settings"
                        : "Enable GPS",
                link: "",
                command: "location settings",
                color: "blue",
                type: "action",
            },
            {
                title: currentSearchResult.source
                    ? `Open ${currentSearchResult.source}`
                    : "Open whatsmyipaddress.com",
                link: currentSearchResult.source
                    ? `${currentSearchResult.link}`
                    : "https://whatismyipaddress.com/",
                command: "",
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: responseMessage,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: responsePrompts,
        });
        // handleSuggestions();
        addMessage({ message: responseMessage }, messageId, cleanMessage);
        setPromptOptions({
            message: responseMessage,
            prompts: responsePrompts,
        });
        return;
    }

    if (
        !response ||
        response.exception ||
        (currentSearchResult.answer === response.message &&
            currentSearchResult.results_type === "Exception")
    ) {
        // let exceptionResponse =
        //     "Alternatively, you can try that search at [Duck Duck Go](https://duckduckgo.com/?q=" +
        //     cleanMessage.replace(/\s/g, "+") +
        //     ") :relaxed:";
        const responseMessage = emoji.emojify(
            response
                ? response.message
                : "Oh no! I'm having problems connecting to my brain sorry. It could be an error or an Internet connection problem, or even an outage online.  :boom:\n\nPlease check your Internet connection and if it's all okay and the problem keeps happening then let us know so we can investigate!"
        );
        const responsePrompts = [
            {
                title: "Clear app and reload",
                link: "",
                command: "/clear",
                color: "blue",
                type: "action",
            },
            {
                title: "Report a problem",
                link: "",
                command: "/bug",
                color: "blue",
                type: "action",
            },
            {
                title: "Try search again",
                link: "",
                command: cleanMessage,
                color: "blue",
                type: "action",
            },
            {
                title: "Try your search on Duck Duck Go",
                link: `https://duckduckgo.com/?q=${cleanMessage.replace(
                    /\s/g,
                    "+"
                )}`,
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: responseMessage,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: responsePrompts,
        });
        // handleSuggestions();
        if (isAnalyticsAllowed) {
            posthog.capture("Error", {
                Action: "Chat",
                Channel: "Connection Failed",
            });
        }
        addMessage({ message: responseMessage }, messageId, cleanMessage);
        // addResponseMessage(emoji.emojify(exceptionResponse));
        setPromptOptions({
            message: responseMessage,
            prompts: responsePrompts,
        });
        // addMessage({ message: emoji.emojify(exceptionResponse) });
        /*addResponseMessage(exceptionResponse);*/
    } else if (
        // Check for Generate Text Intent
        response &&
        currentSearchResult.answer &&
        response.message === currentSearchResult.answer &&
        currentSearchResult.results_type !== "Navigate" &&
        currentSearchResult.results_type !== "Redirect Search" &&
        (response.intentName === "GenerateTextIntent" ||
            response.alternativeIntents.some(
                (intent) => intent.intentName === "GenerateTextIntent"
                // &&
                // "nluIntentConfidence" in intent &&
                // "score" in intent.nluIntentConfidence &&
                // intent.nluIntentConfidence.score > 0.60
            ) ||
            cleanMessage.toLowerCase().startsWith("write") ||
            cleanMessage.toLowerCase().startsWith("create") ||
            cleanMessage.toLowerCase().startsWith("draft") ||
            cleanMessage.toLowerCase().startsWith("rewrite") ||
            cleanMessage.toLowerCase().startsWith("list") ||
            cleanMessage.toLowerCase().startsWith("brainstorm") ||
            cleanMessage.toLowerCase().startsWith("give me") ||
            cleanMessage.toLowerCase().startsWith("suggest"))
    ) {
        // The response message and current search result match.
        renderCustomComponent(Response, {
            currentSearchResult: currentSearchResult,
            intentName: "GenerateTextIntent",
            query: cleanMessage,
            commands: commands,
            refineSearch: refineSearch,
            handlePanel: handlePanel,
            handleNewUserMessage: handleNewUserMessage,
            mode: mode,
            id: messageId,
        });
        handleSuggestions(
            suggestionsList({
                currentSearchResult: currentSearchResult,
                intentName: response.intentName,
                query: cleanMessage,
                allowLocation: allowLocation,
            })
        );
        addMessage(response, messageId, cleanMessage);
    } else if (
        // User has requested location settings
        response.intentName === "LocationIntent" &&
        allowLocation &&
        locationData.city
    ) {
        let locationString = locationData.city
            ? `${locationData.city} ${locationData.region} ${locationData.country}`
            : "";
        // Display location
        renderCustomComponent(SimpleResponse, {
            message: emoji.emojify(locationString),
            id: messageId,
        });
        addMessage(
            { message: emoji.emojify(locationString) },
            messageId,
            cleanMessage
        );
    } else if (
        // User has requested location settings
        response.intentName === "LWLocationIntent" ||
        (response.intentName === "LocationIntent" &&
            !(allowLocation && locationData.city))
    ) {
        // Prompt user to allow location
        const suggestions =
            messages.length > 2
                ? [
                      {
                          title: `${messages
                              .slice(-2)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`,
                          link: "",
                          command: messages
                              .slice(-2)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")
                              ? `${messages
                                    .slice(-2)[0]
                                    .query.replace("~d ", "")
                                    .replace("~e ", "")}`
                              : "",
                          color: "blue",
                          type: "action",
                      },
                  ]
                : null;
        const responseMessage = emoji.emojify(
            response.message
                ? response.message
                : "Please grant me access to your more precise location so I can help you with that :smiley:"
        );
        renderCustomComponent(PermissionResponse, {
            message: responseMessage,
            changeLocationAllowed: changeLocationAllowed,
            id: messageId,
            suggestions: suggestions,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
        });
        addMessage({ message: responseMessage }, messageId, cleanMessage);
        setPromptOptions({ message: responseMessage, prompts: suggestions });
        // handleSuggestions(suggestions);
    } else if (response.dialogState === "ConfirmIntent") {
        // The message is not from the search result
        // SimpleResponse includes markdown support - nb new lines need two spaces then \n
        const suggestions = [
            { title: "Yes", link: "", command: "yes" },
            { title: "No", link: "", command: "no" },
            // {
            //     title: `Web search for '${cleanMessage
            //         .replace("~d ", "")
            //         .replace("~e ", "")}'`,
            //     link: "",
            //     command: `~e ${cleanMessage
            //         .replace("~d ", "")
            //         .replace("~e ", "")}`,
            // },
        ];
        renderCustomComponent(SimpleResponse, {
            message: emoji.emojify(response.message),
            id: messageId,
            intentName: response.intentName,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: suggestions,
        });
        // handleSuggestions();
        addMessage(
            { message: emoji.emojify(response.message) },
            messageId,
            cleanMessage
        );
        setPromptOptions({
            message: emoji.emojify(response.message),
            prompts: suggestions,
        });
    } else if (response.dialogState === "Failed") {
        // The message is not from the search result
        // SimpleResponse includes markdown support - nb new lines need two spaces then \n
        const suggestions =
            messages.length > 2
                ? [
                      {
                          title: `Web search for '${messages
                              .slice(-2)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}'`,
                          link: "",
                          command: messages
                              .slice(-2, -1)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")
                              ? `~e ${messages
                                    .slice(-2, -1)[0]
                                    .query.replace("~d ", "")
                                    .replace("~e ", "")}`
                              : "",
                      },
                  ]
                : null;
        renderCustomComponent(SimpleResponse, {
            message: emoji.emojify(response.message),
            id: messageId,
            intentName: response.intentName,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: suggestions,
        });
        // handleSuggestions();
        addMessage(response, messageId, cleanMessage);
        setPromptOptions({
            message: emoji.emojify(response.message),
            prompts: suggestions,
        });
    } else if (
        response.intentName === "LWHelpIntent" ||
        response.intentName === "AdditionalHelpIntents" ||
        response.intentName === "TipsIntent"
    ) {
        // Corporate intents - display information and help links
        // SimpleResponse includes markdown support - nb new lines need two spaces then \n

        const suggestions = [
            {
                title: "Read our help guide",
                link: "/help/",
                command: "",
                color: "blue",
                type: "action",
            },
            {
                title: "Learn more about me",
                link: "/about/",
                command: "",
                color: "blue",
                type: "action",
            },
            {
                title: "Discover power-user commands",
                link: "/commands/",
                command: "",
                color: "blue",
                type: "action",
            },
            {
                title: "Report a bug",
                link: "",
                command: "/bug/",
                color: "red",
                type: "action",
            },
            {
                title: "Give us feedback",
                link: "",
                command: "/feedback/",
                color: "green",
                type: "action",
            },
            {
                title: `Web search for '${
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `${messages
                              .slice(-1)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`
                }'`,
                link: "",
                command:
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `~e ${messages
                              .slice(-1)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `~e ${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`,
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: response.message,
            id: messageId,
            intentName: response.intentName,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: suggestions,
        });
        // handleSuggestions();
        addMessage(response, messageId, cleanMessage);
        setPromptOptions({ message: response.message, prompts: suggestions });
    } else if (
        response.intentName === "CorporateIntent" ||
        response.intentName === "LWNameChangeIntent" ||
        response.intentName === "LWMoneyIntent"
    ) {
        // Corporate intents - display information and help links
        // SimpleResponse includes markdown support - nb new lines need two spaces then \n

        const suggestions = [
            {
                title: "Learn more about me",
                link: "/about/",
                command: "",
                color: "blue",
                type: "action",
            },
            {
                title: "See how we protect privacy",
                link: "/privacy/",
                command: "",
                color: "blue",
                type: "action",
            },
            {
                title: "Join our Discord community",
                link: "https://discord.gg/Newsly",
                command: "",
                color: "green",
                type: "action",
            },
            {
                title: `Web search for '${
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `${messages
                              .slice(-2)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`
                }'`,
                link: "",
                command:
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `~e ${messages
                              .slice(-2)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `~e ${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`,
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: response.message,
            id: messageId,
            intentName: response.intentName,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: suggestions,
        });
        // handleSuggestions();
        addMessage(response, messageId, cleanMessage);
        setPromptOptions({ message: response.message, prompts: suggestions });
    } else if (response.intentName === "LWPrivacy") {
        // Corporate intents - display information and help links
        // SimpleResponse includes markdown support - nb new lines need two spaces then \n
        const suggestions = [
            {
                title: "See how we protect privacy",
                link: "/privacy/",
                command: "",
                color: "blue",
                type: "action",
            },
            {
                title: "Learn more about me",
                link: "/about/",
                command: "",
                color: "blue",
                type: "action",
            },
            {
                title: `Web search for '${
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `${messages
                              .slice(-2)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`
                }'`,
                link: "",
                command:
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `~e ${messages
                              .slice(-2)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `~e ${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`,
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: response.message,
            id: messageId,
            intentName: response.intentName,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: suggestions,
        });
        // handleSuggestions();
        addMessage(response, messageId, cleanMessage);
        setPromptOptions({ message: response.message, prompts: suggestions });
    } else if (response.intentName === "LWContactIntent") {
        let feedbackMessage = response.message
            ? response.message
            : "Would you like to contact us? :smile:\n\nOr I can search the web for that.";

        const suggestions = [
            {
                title: "Give us feedback",
                link: "",
                command: "/feedback/",
                color: "green",
                type: "action",
            },
            {
                title: "Connect with us on Discord",
                link: "https://discord.gg/Newsly",
                command: "",
                color: "green",
                type: "action",
            },
            {
                title: "Follow @Newsly_search on Twitter",
                link: "https://twitter.com/Newsly_search",
                command: "",
                color: "green",
                type: "action",
            },

            {
                title: "Email Newsly's founders",
                link:
                    "mailto:info@Newslysearch.com?subject=Newsly Web Contact&body=Contact request re '" +
                    cleanMessage +
                    "'",
                command: "",
                color: "green",
                type: "action",
            },
            {
                title: `Web search for '${
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `${messages
                              .slice(-1)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`
                }'`,
                link: "",
                command:
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `~e ${messages
                              .slice(-1)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `~e ${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`,
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: feedbackMessage,
            id: messageId,
            intentName: response.intentName,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: suggestions,
        });
        addMessage(response, messageId, cleanMessage);
        setPromptOptions({ message: feedbackMessage, prompts: suggestions });

        if (isAnalyticsAllowed) {
            posthog.capture("Support", {
                Action: "Intent",
                Channel: "Contact",
            });
        }
    } else if (
        response.intentName === "LWFeedbackIntent" ||
        response.intentName === "ThankYouIntent" ||
        response.intentName === "LoveIntent" ||
        response.intentName === "LWBugReportIntent"
    ) {
        // console.log(response);

        let feedbackMessage = response.message
            ? response.message
            : response.intentName === "LWBugReportIntent"
            ? "I'm sorry. Would you like to report a bug? :sob:\n\nOr I can search the web for that."
            : "Thank you! Would you like to give our team some feedback? :smile:\n\nOr I can search the web for that.";

        // Ask the user if they'd like to provide feedback or web search for the phrase

        const suggestions = [
            {
                title: "Give us feedback",
                link: "",
                command: "/feedback/",
                color: "green",
                type: "action",
            },
            {
                title: "Report a bug",
                link: "",
                command: "/bug/",
                color: "red",
                type: "action",
            },
            {
                title: "Join our Discord community",
                link: "https://discord.gg/Newsly",
                command: "",
                color: "green",
                type: "action",
            },
            {
                title: `Web search for '${
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `${messages
                              .slice(-1)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`
                }'`,
                link: "",
                command:
                    cleanMessage.toLowerCase().includes("yes") &&
                    messages.length > 1
                        ? `~e ${messages
                              .slice(-1)[0]
                              .query.replace("~d ", "")
                              .replace("~e ", "")}`
                        : `~e ${cleanMessage
                              .replace("~d ", "")
                              .replace("~e ", "")}`,
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: feedbackMessage,
            id: messageId,
            intentName: response.intentName,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: suggestions,
        });
        addMessage(response, messageId, cleanMessage);
        setPromptOptions({ message: feedbackMessage, prompts: suggestions });

        if (isAnalyticsAllowed) {
            posthog.capture("Support", {
                Action: "Intent",
                Channel: "Feedback",
            });
        }
    } else if (
        response &&
        (response.intentName === "NavigationIntent" ||
            response.intentName === "DomainSearchIntent") &&
        currentSearchResult &&
        currentSearchResult.link.startsWith("http") &&
        (currentSearchResult.results_type === "Navigate" ||
            currentSearchResult.results_type === "Redirect Search")
    ) {
        // Handle direct navigation

        let navWin = window.open(currentSearchResult.link, "_blank");

        const navResponsePrompt = cleanMessage.startsWith("!")
            ? `Run bang command '${cleanMessage}'`
            : currentSearchResult.link.startsWith("http")
            ? `Go to ${
                  currentSearchResult.title.length <= 70
                      ? currentSearchResult.title
                      : currentSearchResult.source
                      ? currentSearchResult.source
                      : currentSearchResult.link &&
                        isValidURL(currentSearchResult.link)
                      ? getDomainNameAndSubdomain(currentSearchResult.link)
                            .domain
                      : "link"
              }${
                  currentSearchResult.results_type === "Redirect Search"
                      ? " search"
                      : ""
              }`
            : "Hmmm something went wrong with that link sorry";

        let responseMessage = emoji.emojify(
            response
                ? response.message
                : "Opening website in a new window. Allow popups in your browser if you don't see it."
        );

        if (!navWin || navWin.closed || typeof navWin.closed == "undefined") {
            responseMessage +=
                "Please allow popups for this site and try again.";
        }
        const responsePrompts = [
            {
                title: navResponsePrompt,
                link: currentSearchResult.link,
                command: "",
                color: "blue",
                type: "action",
            },
            {
                title: "Web search for '" + cleanMessage + "'",
                link: "",
                command: `/e ${cleanMessage}`,
                color: "blue",
                type: "action",
            },
            {
                title: "Learn more about Commands",
                link: "/commands",
                command: "",
                color: "blue",
                type: "action",
            },
        ];

        renderCustomComponent(Response, {
            currentSearchResult: currentSearchResult,
            intentName: response.intentName,
            query: cleanMessage,
            commands: commands,
            refineSearch: refineSearch,
            handlePanel: handlePanel,
            message: responseMessage,
            suggestions: responsePrompts,
            handleNewUserMessage: handleNewUserMessage,
            mode: mode,
            id: messageId,
        });
        handleSuggestions(
            suggestionsList({
                currentSearchResult: currentSearchResult,
                intentName: response.intentName,
                query: cleanMessage,
                allowLocation: allowLocation,
            })
        );

        addMessage({ message: responseMessage }, messageId, cleanMessage);
        setPromptOptions({
            message: responseMessage,
            prompts: responsePrompts,
        });

        if (isAnalyticsAllowed) {
            posthog.capture("Navigation", {
                "Search Result": currentSearchResult.results_type,
            });
        }
    } else if (
        currentSearchResult.answer &&
        response.message === currentSearchResult.answer
    ) {
        // The response message and current search result match.
        renderCustomComponent(Response, {
            currentSearchResult: currentSearchResult,
            intentName: response.intentName,
            query: cleanMessage,
            commands: commands,
            refineSearch: refineSearch,
            handlePanel: handlePanel,
            handleNewUserMessage: handleNewUserMessage,
            mode: mode,
            id: messageId,
        });
        handleSuggestions(
            suggestionsList({
                currentSearchResult: currentSearchResult,
                intentName: response.intentName,
                query: cleanMessage,
                allowLocation: allowLocation,
            })
        );
        addMessage(response, messageId, cleanMessage);
    } else if (response.message) {
        // The message is not from the search result
        const suggestions = [
            {
                title: `Web search for '${cleanMessage
                    .replace("~d ", "")
                    .replace("~e ", "")}'`,
                link: "",
                command: `~e ${cleanMessage
                    .replace("~d ", "")
                    .replace("~e ", "")}`,
                color: "blue",
                type: "action",
            },
            {
                title: "Learn more about me",
                link: "/about/",
                command: "",
                color: "blue",
                type: "action",
            },
        ];
        renderCustomComponent(SimpleResponse, {
            message: emoji.emojify(response.message),
            id: messageId,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: suggestions,
        });
        addMessage(response, messageId, cleanMessage);
        setPromptOptions({
            message: emoji.emojify(response.message),
            prompts: suggestions,
        });
        // handleSuggestions(suggestions.concat(getRandomItem(TIPS_LIST)));
    } else if (commands.intentName && currentSearchResult) {
        // Pass a command intent through
        renderCustomComponent(Response, {
            currentSearchResult: currentSearchResult,
            intentName: response.intentName,
            query: cleanMessage,
            commands: commands,
            refineSearch: refineSearch,
            handlePanel: handlePanel,
            handleNewUserMessage: handleNewUserMessage,
            mode: mode,
            id: messageId,
        });
        handleSuggestions(
            suggestionsList({
                currentSearchResult: currentSearchResult,
                intentName: response.intentName,
                query: cleanMessage,
                allowLocation: allowLocation,
            })
        );
        addMessage(response, messageId, cleanMessage);
    } else {
        // No results so pass the info for debug

        renderCustomComponent(SimpleResponse, {
            message: emoji.emojify(
                "Hmmm I may need some more information :hushed:"
            ),
        });
        addMessage(
            {
                message: emoji.emojify(
                    "Hmmm I may need some more information :hushed:"
                ),
            },
            messageId,
            cleanMessage
        );
        if (isAnalyticsAllowed) {
            posthog.capture("Error", {
                Action: "Command",
                Channel: "No Results Debug",
            });
        }
        let debugMessage = `Debug info: ${response.dialogState} - ${response.intentName}`;

        renderCustomComponent(SimpleResponse, {
            message: debugMessage,
            query: cleanMessage,
            handleNewUserMessage: handleNewUserMessage,
            suggestions: [
                {
                    title: "Clear app and reload",
                    link: "",
                    command: "/clear",
                    color: "blue",
                    type: "action",
                },
            ],
        });
        // handleSuggestions();
    }

    if (isAnalyticsAllowed) {
        posthog.capture("Search", {
            "Result Type": currentSearchResult.results_type,
            "Search Intent": response ? response.intentName : null,
            "Conversation State": response ? response.dialogState : null,
        });
    }
};
