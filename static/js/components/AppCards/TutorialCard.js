import React from "react";
import { Card } from "semantic-ui-react";
import ReactPlayer from "react-player";

const TutorialCard = (props) => {
    const tutorialLink = "/demo/lazyweb_demo_mobile_04_mid.mov";
    // local hosting for demo video
    return (
        <div className="lw-results">
            <Card fluid style={{ margin: "0px", padding: "0px" }}>
                <div className="lw-image-gallery">
                    <div className="player-wrapper">
                        <ReactPlayer
                            className="react-player"
                            url={tutorialLink}
                            width="100%"
                            height="100%"
                            style={{ backgroundColor: "#31465f"}}
                            controls={true}
                            data-Newsly-event="Support"
                            data-Newsly-action="Watch"
                            data-Newsly-channel="Demo"
                        />
                    </div>
                </div>
                <Card.Content>
                    <Card.Header className="lw-card-header">
                        Getting Started Tour
                    </Card.Header>
                    <Card.Description>
                        A quick walkthrough of a day in the life of Newsly.
                    </Card.Description>
                </Card.Content>
            </Card>
        </div>
    );
};

export default TutorialCard;
