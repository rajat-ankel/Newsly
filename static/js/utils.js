import {
    NAV_COMMANDS,
    SEARCH_COMMANDS,
    DISAMBIGUATION_COMMANDS,
    WIKI_COMMANDS,
    LITERAL_COMMANDS,
    WELCOME_HELLOS,
    WELCOME_PROMPTS,
    WELCOME_INFOS,
    CHALLENGE_WORDS,
    BLOCKED_SITES,
} from "./constants";

export function isQuestion(query) {
    const questionWords = [
        "who ",
        "what ",
        "what's ",
        "when ",
        "when's ",
        "where ",
        "where's ",
        "why ",
        "why's ",
        "how ",
        "how's ",
        "is ",
        "can ",
        "does ",
        "do ",
        "which ",
        "am ",
        "are ",
        "was ",
        "were ",
        "may ",
        "might ",
        "could ",
        "will ",
        "shall ",
        "would ",
        "should ",
        "has ",
        "have ",
        "had ",
        "did ",
        "didn't ",
        "doesn't ",
        "haven't ",
        "isn't ",
        "aren't ",
        "can't ",
        "couldn't ",
        "wouldn't ",
        "won't ",
        "shouldn't ",
    ];

    

    if (
        // questionWords.some((term) => query.toLowerCase().startsWith(term)) ||
        questionWords.some((term) => query.toLowerCase().includes(term)) ||
        query.includes("?")
    ) {
        return true;
    }
    return false;
}

export function isNav(query) {
    if (
        NAV_COMMANDS.some((term) => query.toLowerCase().startsWith(term)) ||
        query.startsWith("!")
    ) {
        return true;
    }
    return false;
}

export function isSearch(query) {
    if (SEARCH_COMMANDS.some((term) => query.toLowerCase().startsWith(term))) {
        return true;
    }
    return false;
}


export function isTextGeneration(string) {
    // Function to determine if a string contains words indicating an intent to write generated content

    // Array of words indicating an intent to write generated content
    const words = [
        "write",
        "create",
        "generate",
        "brainstorm",
        "list",
        "report",
        "ideate",
        "suggest",
        "compose",
        "draft",
        "formulate",
        "outline",
        "prepare",
        "propose",
        "put together",
        "spin",
        "synthesize",
    ];

    // Loop through the array of words
    for (let i = 0; i < words.length; i++) {
        // Check if the string contains the current word
        if (string.includes(words[i])) {
            // If the string contains the current word, return true
            return true;
        }
    }

    // If the string does not contain any of the words, return false
    return false;
}


export function isHTML(str) {
    var a = document.createElement("div");
    a.innerHTML = str;

    for (var c = a.childNodes, i = c.length; i--; ) {
        if (c[i].nodeType === 1) return true;
    }

    return false;
}

export function isValidURL(url) {
    // Check if the URL is valid - no localhost or IP addresses or relative paths
    if (url.startsWith("/")) {
        return false;
    }
    const regex =
        /^(https?:\/\/)(?!localhost|\d+\.\d+\.\d+\.\d+)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return regex.test(url);
}

// Function to check if any of a list of challenge words are in the text using regular expressions with a word boundary
export function isChallenge(text) {
    // Check if a challenge word is in the text
    if (
        CHALLENGE_WORDS.some((term) =>
            text.toLowerCase().match("\\b" + term + "\\b")
        )
    ) {
        return true;
    }
    return false;
}

export function isDividedText(text) {
    // Check if there are pipes, dividers or parentheses in the text
    const punctuationDividers = [
        " | ",
        // "(",
        // ")",
        ":",
        " - ",
        " -- ",
        " – ",
        " — ",
        " > ",
    ];
    if (punctuationDividers.some((term) => text.includes(term))) {
        return true;
    }
    return false;
}

export function extractTitle(url) {
    // Function to extract the title from the url
    let title = "";
    if (url) {
        // Remove the protocol
        title = url.split("//")[1];
        // Remove the query strings
        if (title.includes("?")) {
            title = title.split("?")[0];
        }
        // Remove the hash
        if (title.includes("#")) {
            title = title.split("#")[0];
        }
        // Remove the trailing slash
        if (title.endsWith("/")) {
            title = title.slice(0, -1);
        }
        // Remove the path
        title = title.split("/").pop();
        // Remove the file extension
        title = title.split(".").shift();
        // Replace dashes and underscores with spaces
        title = title.replace(/[-_]/g, " ");
    }
    return title;
}

// Function to extract the date from the url if it exists in the formats YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD, YYYY_MM_DD, YYYYMMDD, YYYY-M-D, YYYY/M/D, YYYY.M.D, YYYY_M_D
export function extractDate(url) {
    let date = "";
    if (url) {
        const dateRegex = /(\d{4}[-_/.]\d{1,2}[-_/.]\d{1,2})/g;
        const dateMatch = url.match(dateRegex);
        if (dateMatch) {
            date = dateMatch[0];
            // Remove the dashes and underscores
            date = date.replace(/[-_]/g, "-");
            // Remove the slashes and dots
            date = date.replace(/[/.]/g, "-");
        }
    }
    return date;
}

export function containsDate(text) {
    // Check if a string contains a date in the formats YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD, YYYY_MM_DD, YYYYMMDD, YYYY-M-D, YYYY/M/D, YYYY.M.D, YYYY_M_D
    const dateRegex = /(\d{4}[-_/.]\d{1,2}[-_/.]\d{1,2})/g;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
        return true;
    }
    // Check if a string contains a date in plain language (e.g. "on January 1st, 2020", "February 8, 2023", "February, 2021")
    const plainLanguageDateRegex = /((on )?\b(January|February|March|April|May|June|July|August|September|October|November|December)\b( \d{1,2}(st|nd|rd|th)?,? \d{4})?)/g;
    const plainLanguageDateMatch = text.match(plainLanguageDateRegex);
    if (plainLanguageDateMatch) {
        return true;
    }
    return false;
}

export function escapeCodeAdvanced(string) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
    };
    return String(string).replace(/[&<>"'`=/]/g, function fromEntityMap(s) {
        return entityMap[s];
    });
}

export function escapeCode(s) {
    // Check if s is already escaped
    if (
        s.includes("&amp;") ||
        s.includes("&#") ||
        s.includes("&quot;") ||
        s.includes("&apos;") ||
        s.includes("&lt;") ||
        s.includes("&gt;") ||
        s.includes("&nbsp;")
    ) {
        return s;
    } else {
        let lookup = {
            "&": "&amp;",
            '"': "&quot;",
            "'": "&apos;",
            "<": "&lt;",
            ">": "&gt;",
        };
        return s.replace(/[&"'<>]/g, (c) => lookup[c]);
    }
}

export function escapePreCodeBlocks(htmlString) {
    const preCodeRegex =
        /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>|<pre[^>]*>([\s\S]*?)<\/pre>|<code[^>]*>([\s\S]*?)<\/code>/g;
    // const preCodeRegex = /<code[^>]*>([\s\S]*?)<\/code>/g;
    return htmlString.replace(
        preCodeRegex,
        (match, preCodeContent, preContent, codeContent) => {
            const content = preCodeContent || preContent || codeContent || "";
            return match.replace(
                content,
                content.replace(
                    /[&<>"']/g,
                    (match) => `&#${match.charCodeAt(0)};`
                )
            );
        }
    );
}

export function isBlocked(url) {
    // Check if a site is excluded from parser checks
    if (BLOCKED_SITES.some((term) => url.toLowerCase().includes(term))) {
        return true;
    }
    return false;
}

export function stripOperators(text) {
    let allOperators = NAV_COMMANDS.concat(SEARCH_COMMANDS)
        .concat(DISAMBIGUATION_COMMANDS)
        .concat(WIKI_COMMANDS)
        .concat(LITERAL_COMMANDS);

    allOperators.every((operator) => {
        if (text.toLowerCase().startsWith(operator)) {
            text = text.replace(operator, "");
            return false;
        }
        return true;
    });
    return text;
}

export function isOperation(query) {
    let allOperators = NAV_COMMANDS.concat(SEARCH_COMMANDS)
        .concat(DISAMBIGUATION_COMMANDS)
        .concat(WIKI_COMMANDS)
        .concat(LITERAL_COMMANDS);
    if (allOperators.some((term) => query.toLowerCase().startsWith(term))) {
        return true;
    }
    return false;
}

export function swapNewsLead(originalResult) {
    let result = JSON.parse(JSON.stringify(originalResult));
    try {
        if (result.news.length > 0) {
            const leadWebResult = {
                title: result.title,
                desc: result.description,
                link: result.link,
                image: result.image,
                source: result.source,
                type: result.type,
            };
            result["title"] = result.news[0].title;
            result["description"] = result.news[0].desc;
            result["image"] = result.news[0].image;
            result["link"] = result.news[0].link;
            result["answer"] = result.news[0].desc;
            result["source"] = result.news[0].source;
            const newResults = [leadWebResult].concat(result["results"]);
            result["results"] = newResults;
        }
        return result;
    } catch {
        return result;
    }
}

export function stateNameToAbbreviation(stateName) {
    let states = {
        arizona: "AZ",
        alabama: "AL",
        alaska: "AK",
        arkansas: "AR",
        california: "CA",
        colorado: "CO",
        connecticut: "CT",
        "district of columbia": "DC",
        delaware: "DE",
        florida: "FL",
        georgia: "GA",
        hawaii: "HI",
        idaho: "ID",
        illinois: "IL",
        indiana: "IN",
        iowa: "IA",
        kansas: "KS",
        kentucky: "KY",
        louisiana: "LA",
        maine: "ME",
        maryland: "MD",
        massachusetts: "MA",
        michigan: "MI",
        minnesota: "MN",
        mississippi: "MS",
        missouri: "MO",
        montana: "MT",
        nebraska: "NE",
        nevada: "NV",
        "new hampshire": "NH",
        "new jersey": "NJ",
        "new mexico": "NM",
        "new york": "NY",
        "north carolina": "NC",
        "north dakota": "ND",
        ohio: "OH",
        oklahoma: "OK",
        oregon: "OR",
        pennsylvania: "PA",
        "rhode island": "RI",
        "south carolina": "SC",
        "south dakota": "SD",
        tennessee: "TN",
        texas: "TX",
        utah: "UT",
        vermont: "VT",
        virginia: "VA",
        washington: "WA",
        "west virginia": "WV",
        wisconsin: "WI",
        wyoming: "WY",
        "american samoa": "AS",
        guam: "GU",
        "northern mariana islands": "MP",
        "puerto rico": "PR",
        "us virgin islands": "VI",
        "us minor outlying islands": "UM",
    };

    let a = stateName
        .trim()
        .replace(/[^\w ]/g, "")
        .toLowerCase(); //Trim, remove all non-word characters with the exception of spaces, and convert to lowercase
    if (states[a] !== null) {
        return states[a];
    }

    return null;
}

export function isMobileDevice() {
    if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        )
    ) {
        return true;
    } else {
        return false;
    }
}

export function getRandomItem(arr) {
    // get a random item from an array

    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);

    // get random item
    const item = arr[randomIndex];

    return item;
}

export function getRandomItems(arr, num) {
    // get num random items from an array and return them in an array

    let items = [];
    let randomIndexes = [];
    while (randomIndexes.length < num && randomIndexes.length < arr.length) {
        let randomIndex = Math.floor(Math.random() * arr.length);
        if (!randomIndexes.includes(randomIndex)) {
            randomIndexes.push(randomIndex);
            items.push(arr[randomIndex]);
        }
    }
    return items;
}

export const welcomeMessages = (isReturningClient) => {
    let welcomeMessage = isReturningClient
        ? "What are you looking for?"
        : {
              messages: [
                  {
                      type: "PlainText",
                      group: 1,
                      value: getRandomItem(WELCOME_HELLOS),
                  },
                  {
                      type: "PlainText",
                      group: 3,
                      value: getRandomItem(WELCOME_INFOS),
                  },
                  {
                      type: "PlainText",
                      group: 7,
                      value: getRandomItem(WELCOME_PROMPTS),
                  },
              ],
          };
    return welcomeMessage;
};
