import React from "react";
import { Button } from "semantic-ui-react";
import CardReadSummarizeExplainCollector from "./CardReadSummarizeExplainCollector";

const CardActionButtons = (props) => {
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
        cardIconColor,
        readerLoaded,
        setReaderLoaded,
        feed,
    } = props;

    return (
        <React.Fragment>
            <Button
                className="lw-feedcard-actions"
                as="a"
                href={result.link}
                target="_blank"
                rel="nofollow noopener noreferrer"
                data-Newsly-event="Engagement"
                data-Newsly-action="Click"
                data-Newsly-channel="Result Link Button"
                compact
                onClick={(e) => e.stopPropagation()}
            >
                Visit
            </Button>
            <CardReadSummarizeExplainCollector
                buttonSize="tiny"
                result={result}
                cardImage={cardImage}
                setCardImage={setCardImage}
                cardDescription={cardDescription}
                setCardDescription={setCardDescription}
                cardDate={cardDate}
                setCardDate={setCardDate}
                cardTitle={cardTitle}
                setCardTitle={setCardTitle}
                cardIconColor={cardIconColor}
                readerLoaded={readerLoaded}
                setReaderLoaded={setReaderLoaded}
                feed={feed}
            />
        </React.Fragment>
    );
};

export default CardActionButtons;
