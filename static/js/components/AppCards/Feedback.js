import React, { useState } from "react";
import {
    Card,
    Form,
    // Image,
    Rating,
    Label,
    Button,
    Segment,
    // Divider,
    Icon,
    Message,
    Checkbox,
} from "semantic-ui-react";

// import FeedbackHeader from "../../assets/balance-110850_640.jpg";
import axios from "axios";
import { FEEDBACK_REPORT_WEBHOOK } from "../../constants";

const Feedback = (props) => {
    const [npsScore, setNpsScore] = useState(null);
    const [ratingScore, setRatingScore] = useState(null);
    const [feelRating, setFeelRating] = useState(null);
    const [submitStatus, setSubmitStatus] = useState(false);
    const [description, setDescription] = useState("");
    const [email, setEmail] = useState("");

    const npsButtonsList = [
        {
            value: 1,
            color: "red",
        },
        {
            value: 2,
            color: "red",
        },
        {
            value: 3,
            color: "orange",
        },
        {
            value: 4,
            color: "orange",
        },
        {
            value: 5,
            color: "yellow",
        },
        {
            value: 6,
            color: "yellow",
        },
        {
            value: 7,
            color: "olive",
        },
        {
            value: 8,
            color: "olive",
        },
        {
            value: 9,
            color: "green",
        },
        {
            value: 10,
            color: "green",
        },
    ];

    const handleNPSClick = (event) => {
        console.log(event.target.value);
        setNpsScore(Number(event.target.value));
    };

    const handleRatingClick = (event, { rating }) => {
        console.log(rating);
        setRatingScore(rating);
    };

    const handleDescription = (event) => {
        setDescription(event.target.value);
    };

    const handleFeelRating = (event, { value }) => {
        console.log(value);
        setFeelRating(value);
    };

    const handleEmail = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = (event) => {
        setSubmitStatus(true);
        event.preventDefault();
        const feedbackTitle = `[chat] Feedback ${
            email ? "from " + email.substr(0, email.indexOf("@")) : ""
        } ${npsScore ? "NPS: " + npsScore : ""} ${
            ratingScore ? "CSAT: " + ratingScore * 2 : ""
        }`;
        const report = {
            title: encodeURIComponent(feedbackTitle),
            description: encodeURIComponent(description),
            NPS: npsScore,
            CSAT: ratingScore ? ratingScore * 2 : null,
            feel: feelRating,
            email: encodeURIComponent(email),
        };
        let queryString = Object.keys(report)
            .map((key) => key + "=" + report[key])
            .join("&");
        //console.log("content to submit:", report);
        axios.post(`${FEEDBACK_REPORT_WEBHOOK}?${queryString}`).then((res) => {
            //console.log(res);
            //console.log(res.data);
        });
    };

    return (
        <div
            id={props.id}
            className="lw-results"
            style={{ maxWidth: "200px!important" }}
        >
            <Card
                className="lw-command-card"
                style={{
                    borderRadius: "16px",
                    marginBottom: "1rem",
                    marginTop: "1rem",
                }}
            >
                <Card.Content>
                    <Card.Header
                        style={{
                            textAlign: "center",
                            margin: "0.5rem auto 1rem auto",
                        }}
                    >
                        <Icon name="comment outline" /> Feedback 😊
                    </Card.Header>
                    <Card.Description
                        style={{ color: "#000000", fontSize: "1.125rem" }}
                    >
                        Would you be sad if Newsly shut down and you couldn't chat
                        with me any more?
                    </Card.Description>
                    <Form style={{ marginTop: "1rem" }}>
                        <Form.Field>
                            <Checkbox
                                radio
                                label="Yes - I'd be sad if you went away"
                                value="very"
                                name="checkboxRadioGroup"
                                checked={feelRating === "very"}
                                onChange={handleFeelRating}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                radio
                                label="A little"
                                value="somewhat"
                                name="checkboxRadioGroup"
                                checked={feelRating === "somewhat"}
                                onChange={handleFeelRating}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                radio
                                label="No"
                                value="not"
                                name="checkboxRadioGroup"
                                checked={feelRating === "not"}
                                onChange={handleFeelRating}
                            />
                        </Form.Field>
                    </Form>
                    <Card.Description
                        style={{
                            marginBottom: "0.5rem",
                            padding: "1rem 0 0 0",
                            color: "#000000",
                            fontSize: "1.125rem",
                        }}
                    >
                        How would you rate Newsly so far?
                    </Card.Description>
                    <Rating
                        icon="star"
                        maxRating={5}
                        rating={ratingScore}
                        onRate={handleRatingClick}
                        size="huge"
                    />
                    <Card.Description
                        style={{
                            margin: "1rem 0 0 0",
                            color: "#000000",
                            fontSize: "1.125rem",
                        }}
                    >
                        How likely are you to recommend Newsly to a friend or
                        colleague?
                    </Card.Description>
                    <Segment
                        basic
                        style={{
                            padding: "0.5rem 0 0 0",
                            borderRadius: "16px",
                        }}
                    >
                        <Label
                            basic
                            color="grey"
                            attached="top left"
                            content="Not likely"
                            style={{
                                border: "0px",
                                fontWeight: "normal",
                                padding: "0",
                            }}
                        />
                        <Label
                            basic
                            color="grey"
                            attached="top right"
                            content="Very likely"
                            style={{
                                border: "0px",
                                fontWeight: "normal",
                                padding: "0",
                            }}
                        />
                    </Segment>
                    <Button.Group fluid compact size="mini" attached="bottom">
                        {npsButtonsList.map((item) => (
                            <Button
                                //as="button"
                                basic={Number(item.value) !== Number(npsScore)}
                                onClick={handleNPSClick}
                                key={item.value}
                                value={item.value}
                                content={item.value}
                                color={item.color}
                                //compact
                                active={Number(item.value) === Number(npsScore)}
                                //inverted={Number(item.value) === Number(npsScore)}
                            />
                        ))}
                    </Button.Group>
                    {submitStatus ? (
                        <Message
                            success
                            header="Feedback submitted!"
                            content={`Thank you for letting us know your thoughts. ${
                                (npsScore && npsScore < 7) ||
                                (ratingScore && ratingScore < 4)
                                    ? "We're always trying to do better."
                                    : "We're excited that you like Newsly."
                            }`}
                        />
                    ) : (
                        <Form
                            style={{
                                margin: "1rem 0 0 0",
                                textAlign: "center",
                            }}
                        >
                            <Form.TextArea
                                placeholder="How can we improve Newsly for you?"
                                onChange={handleDescription}
                            />
                            <Form.Input
                                fluid
                                placeholder="Enter your email (optional)"
                                onChange={handleEmail}
                            />
                            <Form.Button
                                style={{ margin: "0 auto", width: "100%" }}
                                basic
                                compact
                                // icon="send"
                                // labelPosition="right"
                                content="Submit"
                                disabled={
                                    !(
                                        npsScore ||
                                        ratingScore ||
                                        email ||
                                        description ||
                                        feelRating
                                    )
                                }
                                onClick={handleSubmit}
                            />
                        </Form>
                    )}
                </Card.Content>
            </Card>
        </div>
    );
};
export default Feedback;

/*    

<Divider />

<Divider />

<Divider />

<Divider />

<Card.Meta>We'd love to know what you think!</Card.Meta>

<Image src={FeedbackHeader} /> 

*/