import React, { useState, useEffect } from "react";
import readerScore from "../../utilities/readerScore";
import ReaderInteractionButtons from "./ReaderInteractionButtons/ReaderInteractionButtons";
import { getReader } from "../../utilities/getReader";
import { cardImageSpecialHandler } from "./utilitiesResponse";
import { extractDate, isBlocked } from "../../utils";
import textDiscriminator from "../../utilities/textDiscriminator";
// import predictSentence from "../../utilities/predictSentence";
// import removeTruncatedLastSentence from "../../utilities/removeTruncatedLastSentence";
import createOptimalDescription from "../../utilities/createOptimalDescription";

function cleanupReaderMetadataText(text) {
    text = text
        .replaceAll("&hellip;", "...")
        .replaceAll("\\xa0", " ")
        .replaceAll("\xa0", " ")
        .replaceAll("\\u00a0", " ")
        .replaceAll("\u00a0", " ");
    return text;
}

const CardReadSummarizeExplainCollector = (props) => {
    const {
        result,
        cardImage,
        setCardImage,
        cardDescription,
        setCardDescription,
        cardDate,
        setCardDate,
        cardTitle,
        setCardTitle,
        type,
        cardIconColor,
        setReaderLoaded,
        readerLoaded,
    } = props;
    const [reader, setReader] = useState({});
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const lookupReader = async (item) => {
            try {
                setLoading(true);
                const readerLookup = await getReader(item);
                if (readerLookup && readerLookup.content) {
                    const itemReaderScore = readerScore(
                        readerLookup.content,
                        140
                    );
                    setScore(itemReaderScore);
                    setReader(readerLookup);
                } else if (readerLookup && readerLookup.error) {
                    setReader(readerLookup);
                }
            } catch (error) {
                setLoading(false);
            }
        };
        if (!isBlocked(result.link) && !reader.content && !reader.error) {
            lookupReader(result);
        } else if (isBlocked(result.link)) {
            if (cardDescription === "pending") {
                setCardDescription(createOptimalDescription(result));
            }
        }
    }, [result, setCardDescription, cardDescription, reader, readerLoaded]);

    useEffect(() => {
        if (reader && (reader.content || reader.error) && loading) {
            setLoading(false);
            setReaderLoaded(true);
        }
    }, [reader, readerLoaded, setReaderLoaded, loading]);

    // Once the ready is loaded, set the card description, title, image, and date
    useEffect(() => {
        if (readerLoaded) {
            if (reader && reader.content) {
                // Set description and title
                let newDescription = createOptimalDescription(
                    result,
                    cleanupReaderMetadataText(reader.excerpt)
                );
                const newTitle = textDiscriminator(
                    cardTitle,
                    cleanupReaderMetadataText(reader.title),
                    result
                );
                // Check that the new description does not start with the same first 50 characters as the new title
                if (
                    newDescription.substring(0, 50) ===
                    newTitle.substring(0, 50)
                ) {
                    newDescription = createOptimalDescription(result);
                }
                if (
                    cardDescription !== newDescription &&
                    (!cardDescription || cardDescription === "pending")
                ) {
                    setCardDescription(newDescription);
                }

                if (cardTitle !== newTitle) {
                    setCardTitle(newTitle);
                }

                // Set date
                if (setCardDate && !cardDate && reader.date_published) {
                    setCardDate(reader.date_published);
                } else if (setCardDate && !cardDate) {
                    const cardDateFromUrl = extractDate(result.link);
                    if (cardDateFromUrl) {
                        setCardDate(cardDateFromUrl);
                    }
                }

                // Set image
                const defaultCardImage = cardImageSpecialHandler(
                    result.image,
                    result.link
                );
                if (
                    !(result.results_type === "Entity" && result.image) &&
                    reader.lead_image_url &&
                    reader.lead_image_url.startsWith("http")
                ) {
                    const newCardImage = cardImageSpecialHandler(
                        reader.lead_image_url.includes("%20")
                            ? reader.lead_image_url.substring(
                                  0,
                                  reader.lead_image_url.indexOf("%20")
                              )
                            : reader.lead_image_url,
                        result.link
                    );
                    newCardImage && setCardImage(newCardImage);
                } else {
                    setCardImage(defaultCardImage);
                }
            } else {
                if (setCardDate && !cardDate) {
                    const cardDateFromUrl = extractDate(result.link);
                    if (cardDateFromUrl) {
                        setCardDate(cardDateFromUrl);
                    }
                }
                if (reader && reader.error) {
                    if (cardDescription === "pending") {
                        setCardDescription(createOptimalDescription(result));
                    }
                }
            }
        }
    }, [
        reader,
        readerLoaded,
        cardDescription,
        setCardDescription,
        result,
        cardImage,
        setCardImage,
        cardDate,
        setCardDate,
        cardTitle,
        setCardTitle,
        score,
    ]);

    useEffect(() => {
        return () => {
            setReader({});
            setLoading(false);
            setScore(0);
        };
    }, []);

    return (
        <ReaderInteractionButtons
            type={type}
            buttonSize="tiny"
            result={result}
            reader={reader}
            score={score}
            loading={loading}
            readerAvailable={score > 20}
            cardIconColor={cardIconColor}
        />
    );
};

export default CardReadSummarizeExplainCollector;
