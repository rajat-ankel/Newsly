import React from "react";
import { Link } from "react-router-dom";
import { Menu, Dropdown, Image } from "semantic-ui-react";

import logo from "../assets/Newsly-logo-name-transparent-320x114.png";
import Newslybot from "../assets/Newsly-avatar-transparent-500px.png";

const MobileTopNav = () => {
    return (
        <Menu
            style={{
                background: "var(--color-grey-1) !important",
                border: "none !important",
                boxShadow: "none !important",
                height: "90px !important",
                borderRadius: "0 !important",
                margin: "0 !important",
                padding: "0 !important",
            }}
            borderless
        >
            <Menu.Item name="Home" to="/" as={Link}>
                <Image
                    src={Newslybot}
                    alt="Bot"
                    size="mini"
                    style={{
                        height: "36px",
                        width: "36px",
                        marginLeft: "12px",
                        marginRight: "8px",
                    }}
                />
                <Image src={logo} alt="Home" size="tiny" />
            </Menu.Item>
            <Menu.Menu position="right">
                <Dropdown icon="bars" item direction="left">
                    <Dropdown.Menu>
                        <div
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                        ></div>

                        <Dropdown.Item
                            to="/"
                            as={Link}
                            alt="Home"
                            icon="home"
                            text="Home"
                        />
                        <Dropdown.Item
                            to="/about/"
                            as={Link}
                            alt="About"
                            icon="info circle"
                            text="About Newsly"
                        />
                        <Dropdown.Item
                            to="/contact/"
                            as={Link}
                            alt="Contact Us"
                            icon="send"
                            text="Contact Us"
                        />
                        <Dropdown.Item
                            to="/team/"
                            as={Link}
                            alt="Team"
                            icon="group"
                            text="Team"
                        />
                        <Dropdown.Item
                            to="/privacy/"
                            as={Link}
                            alt="Privacy"
                            icon="privacy"
                            text="Privacy"
                        />
                        <Dropdown.Divider />
                        <Dropdown.Item
                            to="/settings/"
                            as={Link}
                            alt="Settings"
                            icon="settings"
                            text="Settings"
                        />
                        <Dropdown.Item
                            to="/help/"
                            as={Link}
                            alt="Help"
                            icon="help circle"
                            text="Help"
                        />
                        <Dropdown.Item
                            to="/releases/"
                            as={Link}
                            alt="Releases"
                            icon="sticky note outline"
                            text="Release Status"
                        />
                    </Dropdown.Menu>
                </Dropdown>
            </Menu.Menu>
        </Menu>
    );
};
export default MobileTopNav;
