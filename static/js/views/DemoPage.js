import React, {useContext} from "react";
import { Container } from "semantic-ui-react";
import ReactPlayer from "react-player";
import LeftPanel from "../components/LeftPanel";
import { UserContext } from "../UserContext";
// import TopNav from "../components/TopNav";

const DemoPage = () => {
    const tutorialLink = "/demo/lazyweb_demo_mobile_04_mid.mov";
    const { mode } = useContext(UserContext);
    return (
        <div>
            {mode === "desktop" && <LeftPanel />}
            <Container
                style={{
                    //background: "white",
                    // margin: "56px 5% 2rem 5%",
                    //marginTop: "56px",
                    padding: "1rem 0 6rem 0",
                    // height: "100vh",
                    height: "calc(var(--vh) + 32px)",
                    overflow: "auto",
                    borderRadius: "8px",
                }}
            >
                <ReactPlayer
                    //className="react-player"
                    url={tutorialLink}
                    width="100%"
                    height="100%"
                    style={{ backgroundColor: "#31465f" }}
                    controls={true}
                    data-Newsly-event="Support"
                    data-Newsly-action="Watch"
                    data-Newsly-channel="Demo"
                />
            </Container>
        </div>
    );
};

export default DemoPage;
