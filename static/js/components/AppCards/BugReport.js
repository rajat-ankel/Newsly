import React, { useRef, useState } from "react";
import {
    Card,
    Form,
    Progress,
    Icon,
    Message,
    Dropdown,
} from "semantic-ui-react";
import { Storage, Auth } from "aws-amplify";
// import BugHeader from "../../assets/bug-circuit-board.jpeg";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { BUG_REPORT_WEBHOOK, LAZYWEB_STORAGE } from "../../constants";

const BugReport = (props) => {
    const [file, setFile] = useState("");
    const [name, setName] = useState("");
    const [response, setResponse] = useState("");
    const [percent, setPercent] = useState(0);
    const [submitStatus, setSubmitStatus] = useState(false);
    const [description, setDescription] = useState("");
    const [email, setEmail] = useState("");
    const [debugInfo, setDebugInfo] = useState(false);
    const [bugSeverity, setBugSeverity] = useState("Minor");

    // Create a reference to the hidden file input element
    const hiddenFileInput = useRef(null);

    // Programatically click the hidden file input element
    // when the Button component is clicked
    const handleFileClick = (event) => {
        hiddenFileInput.current.click();
    };
    // Call a function (passed as a prop from the parent component)
    // to handle the user-selected file
    const handleFileChange = (event) => {
        event.preventDefault();
        if (event.target.files[0] !== null) {
            setFile(event.target.files[0]);
            setName(event.target.files[0].name);
        }
        setResponse(`${event.target.files[0].name}`);
    };

    const handleDescription = (event) => {
        setDescription(event.target.value);
    };

    const handleEmail = (event) => {
        setEmail(event.target.value);
    };

    const handleDebugInfo = (event) => {
        setDebugInfo(!debugInfo);
    };
    const handleSeverity = (event, { value }) => {
        setBugSeverity(value);
    };

    const handleSubmit = (event) => {
        //console.log("Submitted:", event);
        Auth.currentUserInfo()
            .then((data) => {
                // this data has user details in accessToken
                console.log("Auth data:", data);
            })
            .catch((err) => console.log(err));
        setSubmitStatus(true);
        event.preventDefault();
        const utc = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
        const sessionUUID = uuidv4();
        const attachmentNameForS3 = `bug-reports/${utc}/${sessionUUID}-${name}`;
        const debugNameForS3 = `bug-reports/${utc}/${sessionUUID}-debug.json`;
        if (file) {
            Storage.put(attachmentNameForS3, file, {
                /* level: 'protected', */
                contentType: file.type,
                progressCallback(progress) {
                    setPercent((100 * progress.loaded) / progress.total);
                },
            })
                .then((result) => {
                    console.log(result);
                    setResponse(`Screenshot uploaded: ${name}`);
                })
                .then(() => {
                    //document.getElementById("file-input").value = null;
                    setFile(null);
                })
                .catch((err) => {
                    console.log(err);
                    setResponse(
                        `There was a problem uploading the file sorry: ${err}`
                    );
                });
        }
        //console.log("Debug info:", debugInfo);
        let sysInfo = "";
        if (debugInfo) {
            sysInfo = `${LAZYWEB_STORAGE}public/${debugNameForS3}`;
            const debugFile = {
                system: {
                    platform: navigator.platform,
                    product: navigator.product,
                    appVersion: navigator.appVersion,
                    vendor: navigator.vendor,
                    user_agent: navigator.userAgent,
                },
                session: props.sessionAttributes,
            };
            Storage.put(debugNameForS3, debugFile, {
                /* level: 'protected', */
                contentType: "application/json",
            })
                .then((result) => {
                    console.log("Debug info uploaded:", result);
                })
                .catch((err) => {
                    console.log("Error:", err);
                });
        }
        const bugTitle = `[chat] Bug report ${
            email ? "from " + email.substr(0, email.indexOf("@")) : ''
        }`;
        const report = {
            title: encodeURIComponent(bugTitle),
            description: encodeURIComponent(description),
            severity: bugSeverity,
            email: encodeURIComponent(email),
            attachment: name ? `${LAZYWEB_STORAGE}public/${attachmentNameForS3}` : "",
            sysinfo: sysInfo,
        };
        /* const report = {
            title: "[chat] Bug report",
            description: description,
            email: email,
            attachment: `${LAZYWEB_STORAGE}public/${attachmentNameForS3}`,
            sysinfo: `${LAZYWEB_STORAGE}public/${debugNameForS3}`,
        }; */
        let queryString = Object.keys(report)
            .map((key) => key + "=" + report[key])
            .join("&");
        //console.log("content to submit:", report);
        axios.post(`${BUG_REPORT_WEBHOOK}?${queryString}`).then((res) => {
            //console.log(res);
            //console.log(res.data);
        });
    };

    const severityOptions = [
        {
            key: "Severe",
            text: "Severe",
            value: "red",
            color: "red",
        },
        {
            key: "High",
            text: "High",
            value: "orange",
            color: "orange",
        },
        {
            key: "Medium",
            text: "Medium",
            value: "yellow",
            color: "yellow",
        },
        {
            key: "Minor",
            text: "Minor",
            value: "green",
            color: "green",
        },
    ];

    return (
        <div id={props.id} className="lw-results">
            <Card className="lw-command-card" style={{ borderRadius: "16px", marginBottom: "1rem", marginTop: "1rem" }}>
                <Card.Content>
                    <Card.Header
                        style={{
                            textAlign: "center",
                            margin: "0.5rem auto 1.5rem auto",
                        }}
                    >
                        <Icon name="bug" /> Report a Problem 😭
                    </Card.Header>
                    {submitStatus ? (
                        <Message
                            success
                            header="Report submitted"
                            content="Thank you for telling us about that!"
                        />
                    ) : (
                        <Form>
                            <Form.TextArea
                                placeholder="Please tell us a little about what went wrong and what
                                you expected..."
                                onChange={handleDescription}
                            />
                            <Dropdown
                                placeholder="How serious is this problem?"
                                selection
                                options={severityOptions}
                                onChange={handleSeverity}
                                style={{ marginBottom: "1rem" }}
                            />
                            <Form.Input
                                fluid
                                placeholder="Enter your email (optional)"
                                onChange={handleEmail}
                            />
                            <Form.Checkbox
                                label="Include search and tech details so we can debug the problem"
                                onChange={handleDebugInfo}
                                checked={debugInfo}
                            />

                            <Form.Button
                                content="Attach a screenshot"
                                labelPosition="left"
                                icon="photo"
                                onClick={handleFileClick}
                                basic
                                compact
                            />
                            <input
                                id="file-input"
                                type="file"
                                ref={hiddenFileInput}
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                                accept="image/*, video/*"
                            />
                            {response && <Message content={response} />}
                            {percent > 0 ? (
                                <Progress
                                    percent={percent}
                                    indicating
                                    success={percent === 100}
                                />
                            ) : null}
                            <Form.Button
                                basic
                                compact
                                content="Submit"
                                onClick={handleSubmit}
                                style={{
                                    margin: "0 auto",
                                    display: "block",
                                    width: "95%",
                                    padding: "10px 20px",
                                }}
                                disabled={
                                    !(file || name || email || description)
                                }
                            />
                        </Form>
                    )}
                </Card.Content>
            </Card>
        </div>
    );
};
export default BugReport;

