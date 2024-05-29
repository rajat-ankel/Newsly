import React, { useEffect, useState } from "react";
import * as serviceWorkerRegistration from "../serviceWorkerRegistration";
import { Portal, Button, Segment, Header } from "semantic-ui-react";

const ServiceWorkerWrapper = () => {
    const [showReload, setShowReload] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState(null);

    const onSWUpdate = (registration) => {
        setShowReload(true);
        setWaitingWorker(registration.waiting);
    };

    useEffect(() => {
        serviceWorkerRegistration.register({ onUpdate: onSWUpdate });
    }, []);

    const reloadPage = () => {
        waitingWorker?.postMessage({ type: "SKIP_WAITING" });
        setShowReload(false);
        waitingWorker.addEventListener("statechange", (event) => {
            if (event.target.state === "activated") {
                window.location.reload();
                // Delete all caches and reload
                // if (caches) {
                //     // Service worker cache should be cleared with caches.delete()
                //     caches.keys().then(function (names) {
                //         for (let name of names) caches.delete(name);
                //     });
                // }
                // window.location.reload(true);
            }
        });
        // window.location.reload(true);
    };

    return (
        showReload && (
            <Portal onClose={reloadPage} open>
                <Segment
                    textAlign="center"
                    style={{
                        // background: "var(--color-grey-6)",
                        background: "hsla(235, 83%, 59%)",
                        left: "3rem",
                        position: "fixed",
                        top: "5rem",
                        zIndex: 9999,
                        borderRadius: "24px",
                        border: "none!important",
                        boxShadow: "0px 4px 20px hsla(0, 0%, 0%, 5%)",
                        padding: "32px",
                        width: "300px",
                    }}
                >
                    <Header
                        textAlign="center"
                        style={{
                            color: "var(--color-white)",
                            // fontWeight: "700",
                            fontFamily: `"GTEestiMedium", "GTEesti", "Helvetica Neue", "Helvetica", "Arial", "Droid Sans", "Ubuntu", sans-serif`,
                            fontWeight: "600 !important",
                            fontSize: "20px",
                            lineHeight: "1.2",
                            fontFeatureSettings: "'ss01' on",
                        }}
                    >
                        A new version is available
                    </Header>
                    <p
                        style={{
                            color: "hsla(0, 100%, 100%, 70%)",
                            fontSize: "18px",
                            lineHeight: "120%",
                        }}
                    >
                        A new version of Newsly has been installed. Click Update
                        to get the latest fixes and features.
                    </p>

                    <Button
                        style={{
                            backgroundColor: "hsla(0, 100%, 100%, 95%)",
                            fontSize: "18px",
                            borderRadius: "9999px",
                            height: "48px",
                            color: "hsla(235, 83%, 59%)",
                            lineHeight: "120%",
                            width: "168px",
                        }}
                        onClick={reloadPage}
                        content="Update"
                    />
                </Segment>
            </Portal>
        )
    );
};

export default ServiceWorkerWrapper;
