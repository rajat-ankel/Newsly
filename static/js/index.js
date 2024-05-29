import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import ServiceWorkerWrapper from "./components/ServiceWorkerWrapper";
import posthog from "posthog-js";
import reportWebVitals from "./reportWebVitals";
import { appStructuredData } from "./constants";
import "./styles/fonts/GT-Eesti/GT-Eesti-Display-Regular-2.woff2";
import "./styles/fonts/GT-Eesti/GT-Eesti-Display-Regular-2.woff";
import "./styles/fonts/GT-Eesti/GT-Eesti-Display-Medium-2.woff2";
import "./styles/fonts/GT-Eesti/GT-Eesti-Display-Medium-2.woff";
import "./styles/fonts/GT-Eesti/GT-Eesti-Display-Bold-2.woff2";
import "./styles/fonts/GT-Eesti/GT-Eesti-Display-Bold-2.woff";

import "./styles/index.css";

// Modified semantic-ui css to remove Google Lato web font
//import 'semantic-ui-css/semantic.min.css'
import "./styles/semantic-mod/semantic-mod.min.css";

// Analytics
posthog.init("phc_qfFo1buj0GIw2nUN1SGAYMJK0xOBAgmWDNCU4HgzeME", {
    api_host: "https://analytics.Newslysearch.com",
    //api_host: "https://app.posthog.com",
    autocapture: false,
    capture_pageview: false,
    persistence: "localStorage",
    secure_cookie: true,
});

const root = createRoot(document.querySelector("#root"));

root.render(
    <React.StrictMode>
        <script type="application/ld+json">
            {JSON.stringify(appStructuredData)}
        </script>
        <App />
        <ServiceWorkerWrapper />
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
//serviceWorkerRegistration.unregister();
//serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

function sendToAnalytics({ id, name, value }) {
    window.sessionStorage.setItem("Newsly-web-vitals", {
        eventCategory: "Web Vitals",
        eventAction: name,
        eventValue: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
        eventLabel: id, // id unique to current page load
    });
}

reportWebVitals(sendToAnalytics);
