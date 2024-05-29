import { useState, useEffect } from "react";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height,
    };
}

export default function useWindowDimensions() {
    // Update custom css variable for use on mobile devices
    const [windowDimensions, setWindowDimensions] = useState(
        getWindowDimensions()
    );

    // 103px offset for large top menu
    useEffect(() => {
        let vhToSet = getWindowDimensions().height - 92;
        //console.log("vhToSet: ", vhToSet);
        setWindowDimensions(getWindowDimensions());
        document.documentElement.style.setProperty("--vh", `${vhToSet}px`);

        function handleResize() {
            let vhToSet = getWindowDimensions().height - 92;
            //console.log("vhToSet: ", vhToSet);
            setWindowDimensions(getWindowDimensions());
            document.documentElement.style.setProperty("--vh", `${vhToSet}px`);
        }
        function handleOrientationChange() {
            let vhToSet = getWindowDimensions().height - 92;
            //console.log("vhToSet: ", vhToSet);
            setWindowDimensions(getWindowDimensions());
            document.documentElement.style.setProperty("--vh", `${vhToSet}px`);
        }

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleOrientationChange);
        return () => {window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleOrientationChange);};
    }, []);

    return windowDimensions;
}
