import { SUMMARIZER } from "../constants";
import axios from "axios";
import { Auth, Cache } from "aws-amplify";
import { aws4Interceptor } from "aws4-axios";

export const getSummary = async (link) => {
    if (link) {
        try {
            const summary = await Cache.getItem(`summarize-${link}`, {
                callback: async () => {
                    let timeout = 29000;
                    let url = SUMMARIZER + link;

                    // axios.defaults.headers.put['Content-Type'] = "application/json";

                    const credentials = Auth.essentialCredentials(
                        await Auth.currentCredentials()
                    );

                    axios.interceptors.request.handlers.length = 0;

                    const interceptor = aws4Interceptor({
                        options: {
                            region: "us-west-2",
                            service: "execute-api",
                            // expirationMarginSec: 0,
                        },
                        credentials: {
                            accessKeyId: credentials.accessKeyId,
                            secretAccessKey: credentials.secretAccessKey,
                            sessionToken: credentials.sessionToken,
                        },
                    });

                    axios.interceptors.request.use(interceptor);

                    const summarizeAPIResponse = await axios.get(url, {
                        timeout: timeout,
                        // headers: {"Content-Type": "application/json"},
                    });

                    if (summarizeAPIResponse.data) {
                        const summary = summarizeAPIResponse.data.summary;
                        return summary;
                    } else {
                        return "";
                    }
                },
            });
            if (summary) {
                Cache.setItem(`summarize-${link}`, summary);
                return summary;
            } else {
                Cache.removeItem(`summarize-${link}`);
                return "";
            }
        } catch (error) {
            console.log("error", error);
            return "";
        }
    } else {
        return "";
    }
};
