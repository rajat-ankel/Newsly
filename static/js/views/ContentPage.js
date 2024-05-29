import React, { useState, useEffect, useRef, useContext } from "react";
import posthog from "posthog-js";
import { Container } from "semantic-ui-react";
import { Link, useParams, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { UserContext } from "../UserContext";
import { VERSION } from "../constants";
// import "../styles/Content.css";
// import styles from "../styles/Content.module.css";
import LeftPanel from "../components/LeftPanel";
import MobileTopNav from "../components/MobileTopNav";
//import { replace } from "node-emoji";

import { contentBody } from "../styles/Content.module.css";

const ContentPage = (props) => {
    const params = useParams();
    const { article } = params;
    const { mode } = useContext(UserContext);
    const [content, setContent] = useState("");
    const [forceUpdate, setForceUpdate] = useState(false);
    const validArticles = [
        "about",
        "privacy",
        "bot",
        "help",
        "default",
        "commands",
        "tips",
        "start",
        "problems",
        "releases",
        "contact",
        "benefits",
        "contact",
        "mission",
        "team",
        "summaries",
        "answers",
        "business",
    ];
    const [articleExists] = useState(validArticles.includes(article));

    const ArticleFile = articleExists
        ? require(`../content/${article}.md`)
        : require(`../content/404.md`);

    const components = {
        a: ({ node, ...props }) => {
            if (props.href.startsWith("/")) {
                return <Link to={props.href}>{props.children}</Link>;
            } else {
                return (
                    <a
                        href={props.href}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                    >
                        {props.children}
                    </a>
                );
            }
        },
    };

    const topContentRef = useRef(null);

    useEffect(() => {
        if (articleExists) {
            const scrollContentToTop = () => {
                topContentRef.current.scrollIntoView({ behavior: "smooth" });
            };
            fetch(ArticleFile.default)
                .then((response) => {
                    return response.text();
                })
                .then((text) => {
                    const markdownText =
                        article === "releases"
                            ? text.replace("{VERSION}", VERSION)
                            : text;
                    setContent(markdownText);
                });
            const currentPath = window.location.pathname.toString();
            if (currentPath.indexOf(article) > 0) {
                setForceUpdate(true);
            }
            scrollContentToTop();
        }
    }, [ArticleFile, article, forceUpdate, articleExists]);

    useEffect(() => {
        // Analytics
        posthog.capture("$pageview");
    }, []);

    if (articleExists) {
        return (
            <div>
                { mode === "desktop" ? (
                    <LeftPanel />
                ) : <MobileTopNav />}
                <Container
                    style={{
                        background: "white",
                        // height: "calc(var(--vh) + 32px)",
                        height: "100vh",
                        overflow: "auto",
                        //marginTop: "56px",
                        borderRadius: "8px",
                        width: "100%",
                    }}
                >
                    <Container
                        text
                        style={{ marginBottom: "4rem" }}
                        className={contentBody}
                    >
                        <div
                            ref={topContentRef}
                            style={{ paddingTop: "2rem" }}
                        />
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            children={content}
                            components={components}
                        />
                    </Container>
                </Container>
                {/* <Menu
                    fixed="bottom"
                    secondary
                    // widths={3}
                    size="huge"
                    borderless
                    className={contentBottomMenu}
                >
                </Menu> */}
            </div>
        );
    } else {
        return <Navigate to="/" replace />;
    }
};

export default ContentPage;
