import React, { useContext } from "react";
import { Container } from "semantic-ui-react";
import Feedback from "../components/AppCards/Feedback";
import LeftPanel from "../components/LeftPanel";
import { UserContext } from "../UserContext";
// import TopNav from "../components/TopNav";

const FeedbackPage = () => {
    const { mode } = useContext(UserContext);
    return (
        <div>
            {mode === "desktop" && <LeftPanel />}
            <Container
                style={{
                    background: "white",
                    height: "calc(var(--vh) + 32px)",
                    overflow: "auto",
                    // marginTop: "56px",
                    borderRadius: "8px",
                }}
            >
                <Container text style={{ marginBottom: "2rem" }}>
                    <Feedback />
                </Container>
            </Container>
        </div>
    );
};

export default FeedbackPage;
