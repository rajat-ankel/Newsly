import React, {
    useState,
    useEffect,
    useContext,
    useCallback,
    useRef,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// import { Popup } from "semantic-ui-react";
import _ from "lodash";
import {
    addUserMessage,
    renderCustomComponent,
    toggleWidget,
    isWidgetOpened,
    Widget,
    // toggleInputDisabled,
} from "react-chat-widget";
import posthog from "posthog-js";
import hljs from "highlight.js";
import "highlight.js/styles/night-owl.css";
import CodeBlock from "react-copy-code";
import { ReactComponent as CopyIcon } from "../assets/icons/copy-solid.svg";
import SimpleResponse from "./Response/SimpleResponse";
import Suggestions from "./Response/Suggestions";
// import AutoSearchSuggestions from "./Response/AutoSearchSuggestions";
import { UserContext } from "../UserContext";
import {
    WELCOME,
    WELCOME_SUGGESTIONS,
    //WELCOME_HELLOS,
    // WELCOME_PROMPTS,
    //WELCOME_INFOS,
    AUTOSUGGEST_FILTER,
    PROMO_MESSAGES,
} from "../constants";
import { TIPS_LIST } from "../content/tips";
import { searchSuggestions } from "../utilities/suggestedSearchExamples";
import { getRandomItem, isOperation, escapeCode } from "../utils";
import { messageBroker } from "../utilities/messageBroker";

import axios from "axios";

import "react-chat-widget/lib/styles.css";
import "../styles/Widget.css";
import "../styles/Chat.css";

axios.defaults.timeout = 21000; // 21 seconds

function containsMarkers(str) {
    const pattern = new RegExp('^(?=.*[-+_!@#$%^&*.,?/"~]).+$');
    return pattern.test(str);
}

const Chat = (props) => {
    const { changeLocationAllowed, placeholder } = props;
    const {
        allowLocation,
        userSettings,
        locationData,
        mode,
        heroMode,
        setHeroMode,
        heroChange,
        setHeroChange,
        setShowResults,
        setCurrentPanelResultId,
        setResultsContent,
        session,
        isAnalyticsAllowed,
        messages,
        setMessages,
        welcomeDisplayed,
        setWelcomeDisplayed,
        promptOptions,
        setPromptOptions,
        chatUpdateRequired,
        setChatUpdateRequired,
    } = useContext(UserContext);
    const { newChatSession, setNewChatSession, isReturningClient } = session;
    const { autoSuggest } = userSettings;

    const [sessionAttributes, setSessionAttributes] = useState({});
    const [suggestions, setSuggestions] = useState(WELCOME_SUGGESTIONS);

    const [updateSenderInput, setUpdateSenderInput] = useState(null);
    const [autoSuggestions, setAutoSuggestions] = useState(null);
    const [autoSuggestionsOpen, setAutoSuggestionsOpen] = useState(true);
    const [exampleSearchSuggestions, setExampleSearchSuggestions] = useState(
        searchSuggestions(8)
    );
    // const [navList, setNavList] = useState(
    //     messages?.map((message) => message.query)
    // );
    // Make query list unique
    const [navList, setNavList] = useState([
        ...new Set(messages?.map((message) => message.query)),
    ]);

    /* eslint-disable-next-line */
    const [currentInput, setCurrentInput] = useState(null);
    const [resetInput, setResetInput] = useState(null);
    const [placeholderText, setPlaceholderText] = useState("Ask Newsly...");
    const [placeholderExecuted, setPlaceholderExecuted] = useState(false);
    const navigate = useNavigate();
    const chatRef = useRef(null);

    // const avatar = "../assets/Newsly-avatar-transparent-128px.png";

    // Test welcome using state rather than context wrapper
    //const [chatLoaded, setChatLoaded] = useState(false);

    const [searchParams] = useSearchParams();
    const params = Object.fromEntries([...searchParams]);

    //let queryString = useQuery();

    let query = params.query
        ? params.query
        : params.q
        ? params.q
        : params.share
        ? params.share
        : null;

    const handleSuggestions = (newSuggestions) => {
        if (newSuggestions) {
            setSuggestions(newSuggestions.concat(getRandomItem(TIPS_LIST)));
            setExampleSearchSuggestions([]);
        } else {
            setSuggestions(getRandomItem(TIPS_LIST));
            setExampleSearchSuggestions(searchSuggestions(8));
        }
    };

    const handleSearchChange = async (event) => {
        setCurrentInput(event.target.value);
        if (
            !autoSuggest ||
            isOperation(event.target.value) ||
            event.target.value.length < 4 ||
            (event.target.value.length >= 4 &&
                containsMarkers(event.target.value))
        ) {
            if (
                autoSuggestions !== null ||
                cursor !== 0 ||
                navList !==
                    [...new Set(messages?.map((message) => message.query))]
            ) {
                setAutoSuggestions(null);
                setCursor(0);
                setNavList([
                    ...new Set(messages?.map((message) => message.query)),
                ]);
            }
            if (setAutoSuggestionsOpen) {
                setAutoSuggestionsOpen(false);
            }
        } else {
            try {
                const response = await fetch(
                    `https://api.Newslysearch.com/suggestions/${event.target.value}`,
                    {
                        headers: {
                            "x-lazyweb-origin": "Newslysearch.com",
                        },
                    }
                );
                const data = await response.json();
                const resultsRaw = data.suggestionGroups[0].searchSuggestions;

                // if a suggestion contains a filter item, don't include it unless it is also in the query
                const results = resultsRaw
                    .map((result) => result.displayText)
                    .filter(
                        (suggestion) =>
                            !AUTOSUGGEST_FILTER.some(
                                (term) =>
                                    suggestion?.toLowerCase().includes(term) &&
                                    !event.target.value
                                        ?.toLowerCase()
                                        .includes(term)
                            )
                    )
                    .slice(0, 7);

                if (results) {
                    setAutoSuggestions(results);
                    setNavList(results);
                } else {
                    // Wait on lookups if there were no results
                    setTimeout(() => {
                        setAutoSuggestions(null);
                        setNavList([
                            ...new Set(
                                messages?.map((message) => message.query)
                            ),
                        ]);
                    }, 2000);
                }

                if (results && !autoSuggestionsOpen) {
                    setAutoSuggestionsOpen(true);
                }
            } catch (error) {
                console.error(
                    `Error fetching search ${event.target.value}:`,
                    error
                );
                setAutoSuggestions(null);
                setAutoSuggestionsOpen(false);
                setNavList([
                    ...new Set(messages?.map((message) => message.query)),
                ]);
                setCursor(0);
            }
        }
    };

    const handleNewUserMessage = useCallback(
        async (newMessage, responseRef) => {
            if (newChatSession) {
                setNewChatSession(false);
            }
            setNavList(
                [...new Set(messages?.map((message) => message.query))].concat(
                    newMessage
                )
            );
            //setNavList(null);
            setCursor(0);
            setCurrentInput(null);
            setResetInput(true);
            // setExampleSearchSuggestions([]);
            const handlePanel = (newContent, showStatus) => {
                if (newContent) {
                    setResultsContent(newContent);
                }
                setShowResults(showStatus);
                setCurrentPanelResultId(
                    newContent && newContent.id ? newContent.id : null
                );

                //handle suggestions
                // if (newContent && newContent.suggestions) {
                //     handleSuggestions(newContent.suggestions);
                // }
            };
            let messageProps = {
                sessionAttributes: sessionAttributes,
                setSessionAttributes: setSessionAttributes,
                locationData: locationData,
                allowLocation: allowLocation,
                userSettings: userSettings,
                mode: mode,
                messages: messages,
                setMessages: setMessages,
                heroMode: heroMode,
                setHeroMode: setHeroMode,
                heroChange: heroChange,
                setHeroChange: setHeroChange,
                setNavList: setNavList,
                changeLocationAllowed: changeLocationAllowed,
                isAnalyticsAllowed: isAnalyticsAllowed,
                promptOptions: promptOptions,
                setPromptOptions: setPromptOptions,
            };

            messageBroker(
                newMessage,
                responseRef,
                messageProps,
                handleSuggestions,
                handlePanel,
                handleNewUserMessage
                // heroMode,
                // heroChange,
                // setHeroChange,
                // setHeroMode,
                // warningVisible,
                // setWarningVisible,
            );
        },
        [
            sessionAttributes,
            setSessionAttributes,
            locationData,
            allowLocation,
            userSettings,
            mode,
            messages,
            setResultsContent,
            changeLocationAllowed,
            setShowResults,
            setCurrentPanelResultId,
            newChatSession,
            setNewChatSession,
            isAnalyticsAllowed,
            setMessages,
            heroMode,
            setHeroMode,
            promptOptions,
            setPromptOptions,
            heroChange,
            setHeroChange,
        ]
    );

    useEffect(() => {
        if (
            placeholder !== null &&
            placeholder !== undefined &&
            placeholder !== "" &&
            !placeholderExecuted
        ) {
            setPlaceholderExecuted(true);
            addUserMessage(placeholder);
            handleNewUserMessage(placeholder);
        }
    }, [placeholder, handleNewUserMessage, placeholderExecuted]);

    const handleQuickButtonClicked = (suggestion) => {
        if (suggestion.link) {
            if (suggestion.link.startsWith("/")) {
                // Local links keep history and session
                navigate(suggestion.link);
            } else {
                // New window for external links
                window.open(suggestion.link, "_blank");
            }
        } else {
            addUserMessage(suggestion.title);
            handleNewUserMessage(suggestion.command);
        }
    };

    /* Handle keyboard controls */
    const useKeyPress = function (targetKey) {
        const [keyPressed, setKeyPressed] = useState(false);
        function downHandler({ key }) {
            if (key === targetKey) {
                setKeyPressed(true);
            }
        }
        const upHandler = ({ key }) => {
            if (key === targetKey) {
                setKeyPressed(false);
            }
        };
        React.useEffect(() => {
            if (chatRef && chatRef.current) {
                // Needed for React.MutableRefObject<any>.current: any
                const currentChatRef = chatRef.current;
                currentChatRef.addEventListener("keydown", downHandler);
                currentChatRef.addEventListener("keyup", upHandler);
                return () => {
                    currentChatRef.removeEventListener("keydown", downHandler);
                    currentChatRef.removeEventListener("keyup", upHandler);
                };
            }
        });
        return keyPressed;
    };
    const [cursor, setCursor] = useState(0);
    const downPress = useKeyPress("ArrowDown");
    const upPress = useKeyPress("ArrowUp");
    const enterPress = useKeyPress("Enter");
    useEffect(() => {
        if (navList.length && downPress) {
            setCursor((prevState) =>
                prevState < navList.length - 1 ? prevState + 1 : 0
            );
            setUpdateSenderInput(true);
        }
        // eslint-disable-next-line
    }, [downPress]);
    useEffect(() => {
        if (navList.length && upPress) {
            setCursor((prevState) =>
                prevState > 0 ? prevState - 1 : navList.length - 1
            );
            setUpdateSenderInput(true);
        }
        // eslint-disable-next-line
    }, [upPress]);

    useEffect(() => {
        if (enterPress) {
            setTimeout(() => {
                // setNavList(messages?.map((message) => message.query));
                setCursor(0);
                setAutoSuggestionsOpen(false);
                setAutoSuggestions(null);
            }, 800);
        }
    }, [enterPress, messages]);

    useEffect(() => {
        // Update sender input if needed
        if (chatRef && chatRef.current) {
            let currentChatRef = chatRef.current;
            if (
                resetInput &&
                currentChatRef.getElementsByClassName("rcw-sender").length > 0
            ) {
                currentChatRef.getElementsByClassName(
                    "rcw-sender"
                )[0].message.value =
                    navList[cursor] !== undefined ? navList[cursor] : "";
                setResetInput(false);
                setCurrentInput(null);
            } else if (updateSenderInput) {
                // Set the input field value
                currentChatRef.getElementsByClassName(
                    "rcw-sender"
                )[0].message.value =
                    navList[cursor] !== undefined ? navList[cursor] : "";
                setCurrentInput(
                    navList[cursor] !== undefined ? navList[cursor] : ""
                );
                setUpdateSenderInput(null);
                if (!autoSuggestions?.includes(navList[cursor])) {
                    setAutoSuggestionsOpen(false);
                    // if (navList[cursor].length < 3) {
                    //     setNavList(messages?.map((message) => message.query));
                    // }
                    setNavList(
                        messages?.map(
                            (message) => message.query && message.query
                        )
                    );
                }

                //setAutoSuggestions(null);
            }
        }
    }, [
        updateSenderInput,
        cursor,
        messages,
        navList,
        autoSuggestions,
        resetInput,
    ]);

    useEffect(() => {
        if (isWidgetOpened()) {
            // Chat already displayed
            if (heroChange === true && heroMode === false) {
                // Clean up after Hero mode changed
                setHeroChange(false);
            }
        } else {
            // First load - display chat
            toggleWidget();
            //toggleInputDisabled();

            // Check if there is a query in url and handle search if so

            if (query) {
                // If we have a search result then use the message routing handler
                // Check if there is a url query string and remove from logging if so
                let currentUrl = window.location.href;
                if (currentUrl.includes("?query=")) {
                    currentUrl = currentUrl.substring(
                        0,
                        currentUrl.indexOf("?query=") + 6
                    );
                } else if (currentUrl.includes("?q=")) {
                    currentUrl = currentUrl.substring(
                        0,
                        currentUrl.indexOf("?q=") + 2
                    );
                } else if (currentUrl.includes("?share=")) {
                    currentUrl = currentUrl.substring(
                        0,
                        currentUrl.indexOf("?share=") + 6
                    );
                }

                addUserMessage(query);
                handleNewUserMessage(query);

                if (isAnalyticsAllowed) {
                    if (params.share || document.referrer) {
                        posthog.capture("Browser Action", {
                            $current_url: currentUrl,
                            "Shared Search": "Query",
                        });
                    } else {
                        posthog.capture("Browser Action", {
                            $current_url: currentUrl,
                            "Address Bar": "Query",
                        });
                    }
                }

                // Remove the query string
                window.history.replaceState("Newsly", "Newsly", "/");
            } else if (!welcomeDisplayed) {
                // On first visit display full welcome

                if (isReturningClient) {
                    if (PROMO_MESSAGES.length > 0) {
                        let promoMessage = getRandomItem(PROMO_MESSAGES);
                        renderCustomComponent(SimpleResponse, {
                            message: promoMessage,
                            id: "promo",
                        });
                    }

                    renderCustomComponent(SimpleResponse, {
                        message: WELCOME,
                        id: "welcome",
                        heroMode: heroMode,
                    });
                } else {
                    if (params.ref === "producthunt") {
                        let promoMessage =
                            "Thank you for visiting from Product Hunt, and welcome 🙏";
                        renderCustomComponent(SimpleResponse, {
                            message: promoMessage,
                            id: "promo",
                        });
                    }
                    renderCustomComponent(SimpleResponse, {
                        message: WELCOME, //getRandomItem(WELCOME_PROMPTS),
                        id: "welcome",
                        heroMode: heroMode,
                    });
                    // renderCustomComponent(SimpleResponse, {
                    //     message: JSON.stringify(welcomeMessage),
                    //     id: "welcome",
                    //     suggestions: suggestions,
                    //     query: query,
                    //     intentName: null,
                    //     handleNewUserMessage: handleNewUserMessage,
                    // });
                }
                setWelcomeDisplayed(true);
            }
        }

        window.addEventListener("touchstart", (e) => {
            // is not near edge of view, exit
            if (e.pageX > 10 && e.pageX < window.innerWidth - 10) return;

            // prevent swipe to navigate gesture
            if (e.cancelable) {
                e.preventDefault();
            }
        });
    }, [
        welcomeDisplayed,
        query,
        handleNewUserMessage,
        isAnalyticsAllowed,
        params.share,
        params.ref,
        isReturningClient,
        setWelcomeDisplayed,
        heroMode,
        heroChange,
        setHeroChange,
    ]);

    // console.log("suggestions", suggestions);
    // console.log("query", messages[messages.length - 1]?.query);
    const relatedSuggestions =
        suggestions?.length > 0 &&
        suggestions.filter((suggestion) => {
            let suggestionValid =
                suggestion.type === "related" &&
                !AUTOSUGGEST_FILTER.some(
                    (term) =>
                        suggestion.command?.toLowerCase().includes(term) &&
                        !messages[messages.length - 1]?.query
                            ?.toLowerCase()
                            .includes(term)
                );

            return suggestionValid;
        });

    // Input bar tips
    const tipSuggestions =
        suggestions?.length > 0 &&
        suggestions?.filter((suggestion) => suggestion.type === "tip");

    useEffect(() => {
        // Highlight code blocks in any content in the current react component
        if (chatRef && chatRef.current) {
            let currentChatRef = chatRef.current;
            const codeBlocks = currentChatRef.querySelectorAll("pre code");
            codeBlocks.forEach((el) => {
                if (
                    (el.innerHTML.includes("<") ||
                        el.innerHTML.includes(">")) &&
                    !(
                        el.innerHTML.includes("&gt;") ||
                        el.innerHTML.includes("&lt;")
                    )
                ) {
                    // If not already escaped then escape
                    el.innerHTML = el.innerHTML.replace(
                        escapeCode(el.innerHTML)
                    );
                }
                if (!el.classList.contains("hljs")) {
                    hljs.highlightElement(el);
                }
            });
        }
    });

    /* Force an update if messages has changed or chatUpdateRequired is set */
    useEffect(() => {
        if (chatUpdateRequired) {
            setChatUpdateRequired(false);
        }
    }, [chatUpdateRequired, setChatUpdateRequired]);

    useEffect(() => {
        // swap out the placeholder text and style if there are tip suggestions
        if (tipSuggestions && tipSuggestions.length > 0) {
            document.documentElement.style.setProperty(
                "--searchbar-placeholder-color",
                "var(--color-grey-4)"
            );
            document.documentElement.style.setProperty(
                "--searchbar-placeholder-font-face",
                '"GTEesti", sans-serif'
            );
            document.documentElement.style.setProperty(
                "--searchbar-placeholder-font-size",
                "1.2rem"
            );
            setPlaceholderText(tipSuggestions[0].title);
        } else if (navList && navList.length > 1) {
            setPlaceholderText("");
        }

        // Update example search suggestions if there are no related searches
        if (
            relatedSuggestions &&
            relatedSuggestions.length === 0 &&
            exampleSearchSuggestions.length === 0
        ) {
            setExampleSearchSuggestions(searchSuggestions(8));
        } else if (
            relatedSuggestions &&
            relatedSuggestions.length > 0 &&
            exampleSearchSuggestions.length > 0
        ) {
            setExampleSearchSuggestions([]);
        }
    }, [tipSuggestions, navList, relatedSuggestions, exampleSearchSuggestions]);

    // console.log("related suggestions: ", relatedSuggestions);

    return (
        <div ref={chatRef}>
            <CodeBlock svg={CopyIcon} className="lw-copy-button">
                <Widget
                    title="Newsly"
                    subtitle=""
                    toggleWidget
                    showTimeStamp={false}
                    handleNewUserMessage={handleNewUserMessage}
                    handleQuickButtonClicked={handleQuickButtonClicked}
                    handleTextInputChange={_.debounce(handleSearchChange, 720, {
                        leading: true,
                    })}
                    senderPlaceHolder={placeholderText}
                    fullScreenMode={false}
                    imagePreview
                    toggleInputDisabled
                />
            </CodeBlock>
            {(relatedSuggestions && relatedSuggestions.length > 0) ||
            (exampleSearchSuggestions &&
                exampleSearchSuggestions.length > 0) ? (
                <div className="lw-suggestions-container">
                    <Suggestions
                        suggestions={
                            relatedSuggestions && relatedSuggestions.length > 0
                                ? relatedSuggestions
                                : exampleSearchSuggestions
                        }
                        query={query}
                        handleNewUserMessage={handleNewUserMessage}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default Chat;
