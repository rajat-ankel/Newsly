import React from "react";
import { Card, Image } from "semantic-ui-react";
//import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function PlacesResults(props) {
    const { results } = props;

    const PlacesList = results.map((item, index) => {
        return (
            <Card
                key={index}
                fluid
                style={{
                    boxShadow: "0 4px 10px 0 rgb(34 36 38 / 25%)",
                    border: "none",
                    margin: "1rem auto 0 auto",
                    width: "60%",
                    maxWidth: "800px",
                }}
            >
                <Card.Content>
                    <Image
                        as="a"
                        onClick={(e) => e.stopPropagation()}
                        href={item.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        src={item.image}
                        floated="right"
                        size="tiny"
                        style={{ borderRadius: "4px" }}
                    />
                    <Card.Header
                        className="placesHeader"
                        as="a"
                        onClick={(e) => e.stopPropagation()}
                        href={item.link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                    >
                        {item.title}
                    </Card.Header>
                    <Card.Meta style={{ color: "#000000" }}>
                        {item.type}
                    </Card.Meta>
                    <Card.Description
                        style={{ margin: "0 0 0 0", color: "#000000" }}
                    >{`${item.address.addressLocality} ${item.address.addressRegion} ${item.address.postalCode}`}</Card.Description>
                    <a className="phoneNumber" href={`tel:${item.phone}`}>
                        <Card.Meta style={{ color: "#A6AABF" }}>
                            {item.phone}
                        </Card.Meta>
                    </a>
                </Card.Content>
            </Card>
        );
    });

    return (
        <div className="lw-image-gallery">
            <Card.Group>{PlacesList}</Card.Group>
        </div>
    );
}
