import packageJson from "../package.json";

export const VERSION = packageJson.version;
export const PARSER = "https://api.Newslysearch.com/parser/parser?url=";
export const SUMMARIZER = "https://api.Newslysearch.com/summarize/v1/url?url=";
export const EXPLAINER = "https://api.Newslysearch.com/summarize/v1/explain_url";
// export const WRITER = "https://api.Newslysearch.com/summarize/v1/write";
export const WRITER = "https://write.Newslysearch.com/v1/write_streaming";
// export const WRITER = "http://localhost:81/v1/write_streaming";
// export const SUMMARIZER = "https://cde5fft5tb.execute-api.us-west-2.amazonaws.com/prod/v1/url?url=";
export const CORS_PROXY = "https://api.Newslysearch.com/cors/";
export const FAVICON_PROXY = "https://api.Newslysearch.com/icons";

// WebSite Structured Data - https://schema.org/Article
export const appStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Newsly",
    headline: "Newsly - Search for the next generation",
    url: "https://Newslysearch.com/",
    description:
        "Newsly is search for the next generation using generative AI. Instead of just links, Newsly gives you answers - like chatting with a smart friend",
    applicationCategory: "Search",
    image: "https://Newslysearch.com/assets/Newsly-social-banner.jpg",
    about: {
        "@type": "Thing",
        description:
            "Newsly, Newsly chat, Newsly search chatbot, ask Newsly, ai question answering, chat search, Newslychat, Newsly search, Newslysearch, Newsly ai, Newsly generative ai, Newsly search engine, search, search engine, search chatbot, search chat bot, chat answers, Newsly search chat, factual chat, factual answers, conversational search engine, conversational search, chat search, generative, search assistant, ai assistant, generative ai, ai, genai, search engine, question answering, answers, instant answers, conversational, ads free, private, anonymous, ycombinator, y combinator, generative search, yc, Newsly yc, andysearch, andy search, synethis engine",
    },
    datePublished: new Date().toISOString(),
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    softwareVersion: VERSION,
    softwareHelp: {
        "@type": "CreativeWork",
        url: "https://Newslysearch.com/help",
    },
    operatingSystem: "All",
    author: {
        "@type": "Organization",
        name: "Newsly",
        url: "https://twitter.com/Newsly_search",
    },
};

// Image proxy for ad hoc requests - points to cloudfront distribution pointing to LW_PROXY on AWS K8S
export const LAZYWEB_ROTATING_PROXY = "https://proxy.Newslysearch.com/";

// Camo image proxy running on AWS K8S
export const IMAGE_PROXY = "https://image-proxy.Newslysearch.com";
export const IMAGE_KEY =
    "8220e367578f87ce6b3d5f3639dd12f28fbf1b454902027973bde99f63968592";

// GEO lookup running on AWS K8S
export const GEO_LOOKUP = "https://geoip.Newslysearch.com/";

export const LAZYWEB_URL = "https://Newslysearch.com";
export const LAZYWEB_SOCIAL_TAG = "Found%20with%20https://Newslysearch.com";
export const BUG_REPORT_WEBHOOK =
    "https://hooks.zapier.com/hooks/catch/9126219/ock6bds/";
export const FEEDBACK_REPORT_WEBHOOK =
    "https://hooks.zapier.com/hooks/catch/9126219/ocwr241/";
export const LAZYWEB_STORAGE =
    "https://lazyweb-images145522-dev.s3-us-west-2.amazonaws.com/";

// export const AMPLITUDE_API_KEY = "08835fec6f4bc1578e2453b5b7756488";

// WELCOME
//export const WELCOME = `Hi, I'm Newsly the search bot. I'm ad-free and privacy-focused thanks to reader support from links that earn commission. I can answer questions, navigate, or search the web :smile:`;
//export const WELCOME = `Hi, I'm Newsly, and I'm here to help. This is an ad-free, privacy-focused search engine. This service is reader-supported, so some links earn a commission. I can answer questions, navigate, or search the web :smile:`;
export const WELCOME =
    'Hello! I\'m <a href="/about/"><span style="font-family: \'QualyBold\'; color: var(--color-Newsly); ">Newsly</span></a>, your friendly search assistant. The more detailed your question, the better I can <a href="/help" style="color: var(--color-Newsly); font-weight: 700">help</a> :smile:'; 
    /* 'Hello! I\'m Newsly, your smart search assistant. The more detailed your question, the better I can help.'; */

export const WELCOME_HELLOS = [
    "Hey there, my name is Newsly :smile:",
    "Hi, I'm Newsly, short for Artificial Neural Directed Intelligence. I'm a bot and I'm here to help you search :wave:",
    "Welcome to our alpha test! I'm Newsly :construction_worker: :slightly_smiling_face:",
    "Welcome! My name is Newsly. Thanks for trying us out :new: :pray:",
    "Hello, I'm Newsly. Let's get you started searching :smiley:",
    "Hiya, I'm Newsly. I'm here to help you search and navigate to apps and websites :smiley:",
    "Hi, my name is Newsly. Ask me questions like you'd ask a smart friend, and I'll do my best to answer them :sunglasses:",
    "Hello, I'm Newsly and I'm here to help. Think of me as a smart friend who can answer questions and find links :blush:",
];
export const WELCOME_INFOS = [
    "I'm an ad-free, privacy-focused search chatbot. I can answer questions, navigate, or search the web :muscle:",
    "I'm here to make your searches productive and private. There are no ads. I can answer questions, navigate, and search the web :mag:",
    "There are no ads in our search results, and your searches stay completely private! Money **never** affects search results :innocent:",
    "This service is free from advertising and your searches are private. We're funded by reader support, and some links earn a small commission :money_with_wings:",
    "There are no ads here and searches are private. If you're not sure what to search for, say 'tips' to get ideas.",
    "Searches here are private, anonymous, and ad-free. If you're not sure what to do, you can say 'help' or 'tips' any time.",
    "You dont need to speak 'googlese'. Just ask me questions like you would a friend, with enough details to get a good answer.",
    "I work best with plain-language questions that include details on what you want, rather than google-speak. eg 'Find the best free drawing tools for kids under 12'.",
    "Ask me questions in plain language with plenty of detail for the best results. eg 'What are the best things to do in Hawaii in June?'",
    "Try out some of the different ways of viewing results on our desktop. You can Change View between visual Feed, Grid of cards or view as a List.",
    "Try Change View after searching on desktop - like 'Hacker News' mode, or 'Goggles' if you miss the old Google.",
    "Did you know you can scroll back through your chat window to get to earlier searches? Just click the orange search results button for any earlier search to get back to the results.",
    "Think of me like a search assistent. No tracking, no ads, and private (only you know what you search).",
    "We're trying a new approach to search, and I'm an assistant who can help you. Your searches hereare anonymous free from tracking and ads.",
    "I'm an AI assistant that tries to understand your questions and help find the best answers. There are no ads, no tracking, and your searches are private.",
    "I work in a different way to other search engines, because I am like your AI assistant that searches for you. There are no ads and searches are private to you.",
    "I'm a little different. You can chat with me. There's no advertising or tracking.",
    "I'm your friendly AI search assistant. I try to keep you safe online, with no ads or tracking. You just chat with me to ask questions and search.",
];
export const WELCOME_INFOS_AFFILIATE = [
    "I'm an ad-free, privacy-focused search chatbot. I'm reader-supported, so some links earn a commission. I can answer questions, navigate, or search the web :muscle:",
    "I'm here to make your searches productive and private. There are no ads, and I'm reader-supported, so some links earn a commission. I can answer questions, navigate, and search the web :mag:",
    "There are no ads in our search results, and your searches stay completely private! We may make a small commission if you buy something, but that **never** affects the results :innocent:",
    "This service is free from advertising and your searches are private. We're funded by reader support, and some links earn a small commission :money_with_wings:",
    "There are no ads here and searches are private. I'm funded by a small commission if you buy something. If you're not sure what to search for, say 'tips' to get ideas.",
    "Searches here are private, anonymous, and ad-free. I earn money from a small commission if you buy something.  If you're not sure what to do, you can say 'help' or 'tips' any time.",
    "We may make a small commission if you buy something with a referral link, but that never impacts search results, and we don't track you in any way :innocent:",
    "You dont need to speak 'googlese'. Just ask me questions like you would a friend, with enough details to get a good answer. We're reader-funded by a small commission on some links.",
    "I work best with plain-language questions that include details on what you want, rather than google-speak. eg 'Find the best free drawing tools for kids under 12'. We're reader-funded by a small commission on some links.",
    "Ask me questions in plain English with plenty of detail for the best results. eg 'What are the best things to do in Hawaii in June?' We're reader-funded by a small commission on some links.",
    "Try out some of our different ways of viewing results on desktop, with Feed, Grid or List views. We're reader-funded by a small commission on some links.",
    "Try some of our special result views after searching on desktop - like 'Hacker News' mode, or 'Goggles' if you miss the old Google. We're reader-funded by a small commission on some links.",
    "Did you know you can scroll back through your chat window to get to earlier searches? Just click the orange search results button for any earlier search to get back to the results. We're reader-funded by a small commission on some links.",
    "I'm search re-imagined. No tracking, no ads, private (only you know what you search) and give you control of how you view results. I may make a small commission if you buy something after searching. That doesn't affect results.",
    "This is a new approach to search. Anonymous and free from tracking and ads. We may make a small commission if you buy something after searching. Money doesn't influence the results.",
    "Think of me as search re-imagined. No ads. No tracking. Private. Better results. Control of how you view them. We sometimes make a small commission if you buy something. Money never affects results.",
    "This service is like a re-imagining of search. It works a new way to find better results. There are no ads or tracking. We're funded by traffic attribution. Money never affects results.",
    "I'm like a search engine re-imagined. You can chat with me. Zero ads or tracking. I'm reader-supported by a commission if you buy something. That doesn't affect results.",
    "I'm search re-imagined. There are no ads. There's no tracking. I'm conversational. We may make a small commission if you buy something. That has no effect on results.",
];
export const WELCOME_ASK_MESSAGES = [
    "What are you looking for?",
    "What can I help you find today?",
    "What can I find for you?",
    "What would you like to find today?",
    "What would you like to search for?",
    "What are you looking for today?",
    "What can I help you with?",
    "What's on your mind?",
    "What would you like to know?",
    "What question would you like me to answer?",
    "What question can I answer?",
    "What can I look up for you?",
    "Where do you want to go online?",
    "What are you looking for online?",
    "What information can I find for you?",
    "I can take you straight to places online. Just say 'go' and what you want. Try 'go facebook', 'go twitter @elonmusk', or 'go azure portal. Where would you like to go? :dash:",
    "Where can I take you?",
    "What do you seek, oh child of knowledge and wonder? :pray: :grin:",
    "What are you looking for?",
    "What would you like to know?",
    "Ask me a question to get started!",
];
export const WELCOME_PROMPTS = [
    "Welcome! I'm an AI search assistant and my name is Newsly. Type '[help](/help/)' or enter a search below to get started. What can I help with?",
    "Hey there, I'm Newsly. I'm an AI search assistant. Type '[help](/help/)' to get started or just ask me anything below! :smile:",
    "I'm Newsly! You can ask me anything in the box below. Or type [help](/help/) if you get stuck :pray:",
    "I'm Newsly, and it's nice to meet you. Type '[help](/help/)' any time for assistance. Or just ask a question to get started :smile:",
    "I'm Newsly and I'm your friendly search assistant. Type '[help](/help/)' below if you'd like a hand. What would you like to know? :smile:",
    "I'm Newsly. Just type '[help](/help/)' if you'd like a hand. Ask me a question to get started!",
];

export const PROMO_MESSAGES = [
    //"Newsly launched on Product Hunt. If you like what we're building, [we'd be grateful for your support there](https://www.producthunt.com/posts/Newsly) 🙏",
];

export const WELCOME_SUGGESTIONS = [
    {
        title: "Read the help guide",
        link: "/help/",
        command: "",
        color: "blue",
        type: "action",
    },
    {
        title: "Watch a quick video tour",
        link: "",
        command: "/tutorial",
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
        title: "See our privacy policy",
        link: "/privacy/",
        command: "",
        color: "blue",
        type: "action",
    },
    {
        title: "Update your location",
        link: "",
        command: "location settings",
        color: "blue",
        type: "action",
    },
];

// Challenge words for blocked parser content
export const CHALLENGE_WORDS = [
    "robot",
    "verify",
    "identity",
    "bot",
    "human",
    "access",
    "denied",
    "502",
    "503",
    "bad",
    "gateway",
    "forbidden",
    "unavailable",
    "404",
    "429",
    "available",
    "enable",
    "disabled",
    "detected",
    "login",
    "browser",
    "update",
];

// Sites to skip for parser
export const BLOCKED_SITES = [
    "youtube",
    "instagram",
    "usnews.com",
    "tripadvisor.com",
    "yelp.com",
];

// Location
export const LOCATION_DATA_PLACEHOLDER = {
    ip: "",
    latitude: 0,
    longitude: 0,
    accuracy: 18000,
    city: "",
    region: "",
    zipcode: "",
    streetName: "",
    streetNumber: "",
    country: "",
    countryCode: "",
    formattedAddress: "",
    source: "",
    status: "pending",
};

export const COORDS_PLACEHOLDER = {
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
};

export const botConfig = {
    name: "lazyweb_bot",
    alias: "prod",
    region: "us-west-2",
};

export const apiConfig = {
    endpoints: [
        {
            name: "lazyweb-apis-stack",
            endpoint:
                "https://u0bjeceiah.execute-api.us-west-2.amazonaws.com/Prod",
            region: "us-west-2",
        },
    ],
};

export const NAV_COMMANDS = [
    "~g ",
    "~go ",
    "~goto ",
    "~open ",
    "~nav ",
    "~navigate ",
    "/go ",
    "go to ",
    "go ",
    "goto ",
    "/g ",
    "open website for ",
    "open website ",
    "/open ",
    "/nav ",
    "nav ",
    "/navigate ",
    "login to ",
    "log in to ",
    "log in ",
];
export const SEARCH_COMMANDS = [
    "~s ",
    "~search ",
    "~find ",
    "/search ",
    "/s ",
    "search website ",
    "search site ",
    "search on ",
    "search for ",
    "/find ",
    "find ",
];
export const DISAMBIGUATION_COMMANDS = [
    "~d ",
    "~disambiguate ",
    "/d ",
    "/disambiguate ",
    "#!d ",
    "#!disambiguate ",
];

export const WIKI_COMMANDS = [
    "~w ",
    "~wiki ",
    "~wikipedia ",
    "~about ",
    "~wp ",
    "/w ",
    "/wiki ",
    "/about ",
    "/a ",
    "about ",
    "/wp ",
];

export const LITERAL_COMMANDS = [
    "~e ",
    "~exact ",
    "~l ",
    "~literal ",
    "/exact ",
    "/e ",
    "/literal ",
    "#!e ",
    "#!l ",
    "#!literal ",
    "#!explicit ",
    "#!exact ",
];

export const AUTOSUGGEST_FILTER = ["win", "windows", "microsoft", "azure"];

export const profileTypes = {
    official_website: {
        name: "Official Website",
        icon: "globe",
        prefix: "",
        color: "blue",
    },
    wikipedia: {
        name: "Wikipedia",
        icon: "globe",
        prefix: "",
        color: "purple",
    },
    twitter_profile: {
        name: "Twitter",
        icon: "twitter",
        prefix: "@",
        color: "twitter",
    },
    instagram_profile: {
        name: "Instagram",
        icon: "instagram",
        prefix: "@",
        color: "instagram",
    },
    youtube_channel: {
        name: "YouTube",
        icon: "youtube",
        prefix: "",
        color: "youtube",
    },
    spotify_artist_id: {
        name: "Spotify",
        icon: "spotify",
        prefix: "",
        color: "green",
    },
    spotify_album_id: {
        name: "Spotify",
        icon: "spotify",
        prefix: "",
        color: "green",
    },
    spotify_playlist_id: {
        name: "Spotify",
        icon: "spotify",
        prefix: "",
        color: "green",
    },
    facebook_profile: {
        name: "Facebook",
        icon: "facebook",
        prefix: "",
        color: "facebook",
    },
    linkedin_profile: {
        name: "Linkedin",
        icon: "linkedin",
        prefix: "",
        color: "linkedin",
    },
    itunes_artist_id: {
        name: "iTunes",
        icon: "music",
        prefix: "",
        color: "grey",
    },
    imdb_id: { name: "IMDB", icon: "imdb", prefix: "", color: "yellow" },
    soundcloud_id: {
        name: "SoundCloud",
        icon: "soundcloud",
        prefix: "",
        color: "orange",
    },
    rotten_tomatoes: {
        name: "Rotten Tomatoes",
        icon: "video",
        prefix: "",
        color: "red",
    },
};

export const personas = {
    mixed: {
        name: "Mixed",
    },
    bernard: {
        name: "Bernard",
    },
    einsten: {
        name: "Einstein",
    },
    orac: {
        name: "Orac",
    },
    gandalf: {
        name: "Gandalf",
    },
    indiana: {
        name: "Indiana",
    },
    teddy: {
        name: "Teddy",
    },
    dolores: {
        name: "Dolores",
    },
    hawking: {
        name: "Hawking",
    },
};
