import React from "react";
import VideoItem from "./VideoItem";
// import VideoItemNew from "./VideoItemNew";

export default function VideoResults(props) {
    const { results } = props;

    const ResultList = results.map((item, index) => {
        return (
            <div className="lw-image-gallery" key={index}>
                <VideoItem
                    result={item}
                    videoKey={index}
                    size="medium"
                    fluid={true}
                />
            </div>
        );
    });

    return <div>{ResultList}</div>;
}
