import camoUrl from "camo-url";
import {
    IMAGE_PROXY,
    IMAGE_KEY,
    LAZYWEB_ROTATING_PROXY,
} from "../../../../constants";

const camoImageProxy = camoUrl({
    host: IMAGE_PROXY,
    key: IMAGE_KEY,
    type: "path",
});

const getLeadImage = (html, resultImage, readerImage, proxyType) => {
    // Return a lead image to use. HTML already goes through proxy. We had proxy to result or reader image if used.

    //console.log(html);

    // Check if there is a first image in the body or else use the link one if available
    const getImages = (html) => {
        const htmlDoc = new DOMParser().parseFromString(html, "text/html");
        let imgs = htmlDoc.querySelectorAll("img");
        let imageFromContent = "";
        let imagesList = [];

        if (imgs) {
            for (let img of imgs) {
                if (img && img.getAttribute("src")) {
                    imageFromContent = img.getAttribute("src");
                    imagesList.push(imageFromContent);
                }
            }
        }

        return imagesList;
    };
    const readerImagesList = getImages(html);
    const leadImage =
        readerImagesList.length === 0 && resultImage
            ? resultImage
            : readerImagesList.length === 0 && readerImage
            ? readerImage
            : null;

    const imageToReturn =
        leadImage && proxyType === "direct"
            ? leadImage
            : leadImage && proxyType === "camo"
            ? camoImageProxy(leadImage)
            : leadImage
            ? `${LAZYWEB_ROTATING_PROXY}${decodeURIComponent(leadImage)}`
            : null;

    return imageToReturn;
};

export default getLeadImage;
