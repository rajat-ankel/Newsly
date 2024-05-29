import React, { useContext } from "react";
import { Segment, Button } from "semantic-ui-react";
import * as emoji from 'node-emoji';
import ReactMarkdown from "react-markdown";
import { UserContext } from "../../UserContext";
import Suggestions from "./Suggestions";

const PermissionResponse = (props) => {
    const { changeLocationAllowed, suggestions, query, handleNewUserMessage } = props;
    const { allowLocation, locationData } = useContext(UserContext);

    return (
        <div id={props.id} className="lw-response">
            <Segment secondary size="large" className="lw-message-simple">
                <ReactMarkdown
                    children={emoji.emojify(props.message)}
                    style={{ whiteSpace: "pre-wrap" }}
                />
                <p>Your search session will reload with the new settings.</p>
                <p>
                    For a more accurate location, agree to the location prompt
                    in your web browser if it appears after Newsly reloads.
                </p>

                <p>
                    {locationData.city
                        ? `Current location: ${locationData.city}, ${locationData.region}, ${locationData.country}`
                        : null}
                </p>
                <Button
                    icon="map marker alternate"
                    //positive
                    basic
                    size="small"
                    compact
                    //color="blue"
                    content={
                        allowLocation
                            ? "Location allowed"
                            : "Use device location: session restarts"
                    }
                    //toggle
                    active={!allowLocation}
                    loading={allowLocation && !locationData.city}
                    disabled={allowLocation}
                    onClick={(e) => {
                        changeLocationAllowed(true, e);
                    }}
                />
                <Button
                    icon="dont"
                    basic
                    size="small"
                    compact
                    //color="red"
                    //negative
                    //toggle
                    active={allowLocation}
                    loading={allowLocation && !locationData.city}
                    disabled={!allowLocation}
                    content={
                        !allowLocation
                            ? "Exact location disabled"
                            : "Don't use exact location"
                    }
                    onClick={(e) => {
                        changeLocationAllowed(false, e);
                    }}
                />
            </Segment>
            {suggestions && suggestions.length > 0 ? (
                <Suggestions
                    suggestions={suggestions}
                    query={query}
                    handleNewUserMessage={handleNewUserMessage}
                />
            ) : null}
        </div>
    );
};
export default PermissionResponse;
