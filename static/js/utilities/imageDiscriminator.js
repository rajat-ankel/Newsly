/***
 * 
 * Image discriminator
 * 
 
    Determine the image type and how to display it optimally on the card
    Returns:

    imgType: "mediaImg" | "cardImg" | "sideImg" | "borderImg" | "noImg" - future: logoImg" | "diagramImg" 
    imgHeight: 630
    imgWidth: 1200
    aspectRatio: 1.9047619047619047
    cardPaddingHeightRelative: 23vw
    
    Notes:
    
    Recommended OG image size is 1200 x 630px
    Recommended OG image ratio is 1.91:1
    Min size is 200 x 200
    Under 600 display to the side
    Padding for media image: (1/1.91) x 44 x vw 
    Approx: 23vw for a 1200x630 image

    Universal approach:
    - aspectRatio = width / height
    - hero padding height: (1/aspectRatio) x 44 x vw

    - No images - display card content with border background using favicon color or black
    - Small images - remove the image and display the card content with border background. under 200px
    - Media images have horizontal aspect ratio and hi-res (over 600px) - maximise image displays
    - Portrait images have vertical aspect ratio - display as inline image on the card to right of content if under 600px. Over 600px display as card hero image.
    - Square images have equal width and height - display as inline image in content with faded background if under 600px. Over 600px display as card hero image.
    - Logos need to be displayed in full - display as inline image in content with faded background or white background
    - Transparent images need the background to be set to white if dark or black if light - use color luminance detection. If the image is transparent and the background is dark, set the background to white. If the image is transparent and the background is light, set the background to black.
    - Diagrams and card images should be displayed in full - display as inline image on the card in content if under 600px. Over 600px display as card hero image.

    4 types of rendering:
    - full width background displaying hero image (mediaImg)
    - image card above content card with dark reflected background (cardImg)
    - right hand image on card inline with content with border using image as background with blur/fade (sideImg)
    - render card with no image but border color from image (borderImg)
    - render card with no image but border color from favicon or black (noImg)

***/

import axios from "axios";

// Function to detect the width and height of an image on the page
function getImageDimensions(image) {
    return {
        width: image.naturalWidth,
        height: image.naturalHeight,
    };
}

function isPhoto(
    imageFileSize,
    imgWidth,
    imgHeight,
    fileType,
    cardWidthEstimate = 1200
) {
    if (imgWidth && imgHeight && imageFileSize) {
        // Adjust the threshold based on different file types
        let threshold = 0.05; // Default threshold for file types other than JPEG, PNG, and WebP
        // let modifier = imgWidth < 1200 ? 100000 : Math.min(100000, (imgWidth - 1200) * 20);
        // let modifier = imgWidth >= 1200 ? 0 : 100000;
        let modifier = 100000;
        // let modifier = imageFileSize * 0.5;

        if (fileType.includes("jpeg") || fileType.includes("jpg")) {
            threshold = 0.07; // Threshold for JPEG files
            // modifier = imageFileSize * 0.5;
            modifier = 20000;
        } else if (fileType.includes("png")) {
            threshold = 0.1; // Threshold for PNG files
            // modifier = imageFileSize * 0.5;
            modifier = 100000;
        } else if (fileType.includes("webp")) {
            threshold = 0.05; // Threshold for WebP files
            // modifier = imageFileSize * 0.5;
            modifier = 20000;
        }

        modifier =
            modifier -
            // Math.round(
            //     Math.min(modifier, (imgWidth - 1200) * (modifier / 1200))
            // );
            Math.round(
                Math.min(
                    modifier,
                    (imgWidth - cardWidthEstimate) *
                        (modifier / cardWidthEstimate)
                )
            );

        const ratio =
            Math.max(imageFileSize - modifier, 0) / (imgWidth * imgHeight);

        // console.log("\n\nFile size: ", imageFileSize);
        // console.log("Modifier: ", modifier);
        // console.log("Width: ", imgWidth);
        // console.log("Height: ", imgHeight);
        // console.log("Image ratio: ", ratio, "\n\n");

        return ratio >= threshold;
    }

    return false;
}

async function getImageFileInfo(imageUrl) {
    try {
        const response = await axios.head(imageUrl, {
            timeout: 20000,
            maxContentLength: 100000000,
            maxBodyLength: 1000000000,
        });
        // console.log(response)
        const contentLength =
            "content-length" in response.headers
                ? response.headers["content-length"]
                : null;

        const contentType =
            "content-type" in response.headers
                ? response.headers["content-type"]
                : null;
        const fileInfo = {
            contentLength: contentLength ? Number(contentLength) : null,
            contentType: contentType || null,
        };

        return fileInfo;
    } catch (error) {
        // console.error(error);
        return null;
    }
}

export default async function imageDiscriminator(imageRef, result) {
    // Default image handling is card with border
    let imgType = "noImg";
    let imgQuality = "none";
    let imgHeight = 0;
    let imgWidth = 0;
    let imgAspectRatio = 0;
    let cardPaddingHeightRelative = 1;
    let imgFileType = "";
    let imgFileSize = 0;

    // Breakpoint for hi-res images in full screen
    const cardWidthEstimate = window.innerWidth * 0.44;
    let hiresBreakpoint = cardWidthEstimate / 2;
    // console.log("Hi-res breakpoint: ", hiresBreakpoint);

    // console.log("\n\nStarting image discriminator for", result.source);

    if (imageRef && imageRef.current) {
        // console.log("Image ref exists for", result.source);
        // console.log("Checking: ", imageRef.current.src);
        // console.log("cardWidthEstimate: ", cardWidthEstimate);

        let dimensions = null;

        dimensions = getImageDimensions(imageRef.current);
        imgHeight = dimensions.height;
        imgWidth = dimensions.width;

        imgAspectRatio = imgWidth / imgHeight;

        imgQuality =
            imgWidth < 200 || imgHeight < 200
                ? "small"
                : imgWidth > 600 || imgHeight > 600
                ? "large"
                : "medium";
        cardPaddingHeightRelative = Math.round((1 / imgAspectRatio) * 44);

        if (imgQuality === "small") {
            // Small image
            if (imgAspectRatio > 1) {
                // Landscape image
                // Border image
                imgType = "borderImg";
            } else if (imgAspectRatio <= 1) {
                // Portrait image
                if (imgHeight > 200) {
                    // Side image
                    imgType = "sideImg";
                } else if (imgWidth > 200) {
                    // Card image
                    imgType = "cardImg";
                } else {
                    // Border image
                    imgType = "borderImg";
                }
            }

            // imgType = "sideImg";
        } else if (imgQuality === "large") {
            // Large image
            if (imgHeight > 2 * imgWidth && imgWidth >= hiresBreakpoint) {
                // Very tall image
                // Side image
                imgType = "sideImg";
            } else if (imgWidth >= hiresBreakpoint) {
                // Media image
                imgType = "mediaImg";
            } else {
                // Card image
                imgType = "cardImg";
            }
        } else {
            // Medium image
            if (imgAspectRatio > 1) {
                // Landscape image
                if (imgWidth > 600) {
                    // Media image
                    imgType = "mediaImg";
                } else {
                    // Card image
                    imgType = "cardImg";
                }
            } else if (imgAspectRatio <= 1) {
                // Portrait or square image
                if (imgHeight > 600) {
                    // Media image
                    imgType = "mediaImg";
                } else {
                    // Side image
                    imgType = "sideImg";
                }
            }
        }

        // Switch media images with smaller file sizes compared to dimesions to card images (e.g. non-photos)
        if (
            imageRef.current &&
            imageRef.current.src &&
            imgType === "mediaImg"
        ) {
            // console.log("Getting image file info:", result.source);

            const fileInfo = await getImageFileInfo(imageRef.current.src);

            // console.log("\n\n****\nSource:", result.source);
            // console.log("Image URL:", imageRef.current?.src);
            // console.log("File info:", fileInfo);

            if (fileInfo) {
                const { contentLength, contentType } = fileInfo;
                // Update the image file size and type in your logic as needed

                // console.log(
                //     "Successfully retrieved image file size and type:",
                //     result.source
                // );
                // console.log("Image file size:", contentLength);
                // console.log("Image file type:", contentType);
                // console.log("Image type:", imgType);

                imgFileType = contentType;
                imgFileSize = contentLength;
                if (
                    !isPhoto(
                        imgFileSize,
                        imgWidth,
                        imgHeight,
                        imgFileType,
                        cardWidthEstimate
                    )
                ) {
                    imgType = "cardImg";
                    // console.log("Changed to card image");
                }
            } else {
                // console.log(
                //     "Failed to retrieve image file size and type:",
                //     result.source
                // );
                if (
                    imgType === "mediaImg" &&
                    !(imgWidth >= 1200 && imgWidth > cardWidthEstimate * 1.1)
                ) {
                    imgType = "cardImg";
                    // console.log(
                    //     "Changed to card image as no file size detected"
                    // );
                }
            }
        }

        // console.log(
        //     "\n\nImage detals:\nImage type: ",
        //     imgType,
        //     "Image quality: ",
        //     imgQuality,
        //     "Image aspect ratio: ",
        //     imgAspectRatio,
        //     "Image height: ",
        //     imgHeight,
        //     "Image width: ",
        //     imgWidth,
        //     "Card padding height relative: ",
        //     cardPaddingHeightRelative
        // );

        return {
            imgType,
            cardPaddingHeightRelative,
            imageDimensions: {
                imgHeight,
                imgWidth,
                imgAspectRatio,
            },
        };
    } else {
        // console.log("No image ref:", result.source, imageRef);
        return {
            imgType,
            cardPaddingHeightRelative,
            imageDimensions: {
                imgHeight,
                imgWidth,
                imgAspectRatio,
            },
        };
    }
}
