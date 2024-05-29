import {
    LexRuntimeServiceClient,
    PostTextCommand,
} from "@aws-sdk/client-lex-runtime-service";

/** Amplify config */
import { botConfig } from "../constants";

import { Credentials, getAmplifyUserAgent } from "@aws-amplify/core";

/**
 * GET AWS SDK CLIENT CREDENTIALS
 */
const getClient = async () => {
    // RETRIEVE CREDENTIALS FROM AMPLIFY
    const credentials = await Credentials.get();
    if (!credentials) {
        return Promise.reject("No credentials");
    }

    // CREATE A CLIENT
    const client = new LexRuntimeServiceClient({
        region: botConfig.region,
        credentials,
        customUserAgent: getAmplifyUserAgent(),
    });

    return { client, credentials, botConfig };
};

/**
 * SENDS A TEXT MESSAGE TO LEX
 */
export const sendMessage = async (
    message,
    sessionAttributes,
    requestAttributes
) => {
    try {
        // GET THE AWS LEX CLIENT
        const { client, credentials, botConfig } = await getClient();

        // MESSAGE REQUEST PARAMS
        const params = {
            botAlias: botConfig.alias,
            botName: botConfig.name,
            inputText: message,
            userId: credentials.identityId,
        };

        // ADDS SESSION ATTRIBUTES TO MESSAGE
        if (sessionAttributes) {
            params.sessionAttributes = sessionAttributes;
        }

        // ADDS REQUEST ATTRIBUTES TO MESSAGE
        if (requestAttributes) {
            params.requestAttributes = requestAttributes;
        }

        // CREATE POST TEXT COMMAND
        const postTextCommand = new PostTextCommand(params);

        // AWS LEX API CALL
        return await client.send(postTextCommand);
    } catch (err) {
        console.error(err);
        return null;
    }
};
