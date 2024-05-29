import {
    TIPS_LIST,
    SUGGESTED_QUESTIONS_LIST,
    SUGGESTED_SEARCHES_LIST,
    SUGGESTED_GENERATIONS_LIST,
    SUGGESTED_COMMANDS_LIST,
} from "../content/tips";
import { getRandomItem, getRandomItems } from "../utils";

export function searchSuggestions(maxNum = 8, includeTips = false) {
    // Optimal tip selection
    // 2-3 short example searches depending on the length of the text of the examples
    // 1 question
    // 1 generation
    // 1 command

    let items = [];

    // Get a pool of 4 example searches
    let exampleSearchesPool = getRandomItems(SUGGESTED_SEARCHES_LIST, 5);

    // Sort to get the shortest example search first
    // exampleSearchesPool.sort((a, b) => {
    //     if (
    //         "title" in a &&
    //         a.title !== null &&
    //         "title" in b &&
    //         b.title !== null
    //     ) {
    //         return a.title.length - b.title.length;
    //     } else {
    //         return 0;
    //     }
    // });

    // Add the first example search to the items array
    items.push(exampleSearchesPool[0]);

    // Get one tip - the tip must have a value in the command field
    if (includeTips) {
        while (items.length < 1) {
            let tip = getRandomItem(TIPS_LIST);
            if (tip.command) {
                items.push(tip);
            }
        }
    }

    // Add one question
    let question = getRandomItem(SUGGESTED_QUESTIONS_LIST);
    items.push(question);

    // Add one generation
    let generation = getRandomItem(SUGGESTED_GENERATIONS_LIST);
    items.push(generation);

    // Add one command
    let command = getRandomItem(SUGGESTED_COMMANDS_LIST);
    items.push(command);

    // Add the remaining example searches
    items = items.concat(exampleSearchesPool.slice(1));

    return items;
}
