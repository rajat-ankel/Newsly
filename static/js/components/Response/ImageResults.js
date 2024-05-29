import React, { useState, useCallback, useEffect } from "react";
import camoUrl from "camo-url";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import { getReader } from "../../utilities/getReader";
import { IMAGE_PROXY, IMAGE_KEY } from "../../constants";

const camoImageProxy = camoUrl({
    host: IMAGE_PROXY,
    key: IMAGE_KEY,
    type: "path",
});

export default function ImageResults(props) {
    const { result } = props;

    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [imageRetrievalComplete, setImageRetrievalComplete] = useState(false);
    const [imagesProcessed, setImagesProcessed] = useState(false);

    const openLightbox = useCallback((event, { photo, index }) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    const imageDimensions = (url) =>
        new Promise((resolve, reject) => {
            const img = new Image();

            // the following handler will fire after the successful loading of the image
            img.onload = () => {
                const { naturalWidth: width, naturalHeight: height } = img;
                resolve({ width, height });
            };

            // and this handler will fire if there was an error with the image (like if it's not really an image or a corrupted one)
            img.onerror = () => {
                reject("There was some problem with the image.");
            };

            img.src = url;
        });

    const getImages = useCallback(async (images) => {
        const getReaderImage = async (item) => {
            const readerLookup = await getReader(item);

            let populatedImage = "";
            if (readerLookup) {
                // Update empty image after loading reader if they have content
                if (
                    !item.image &&
                    readerLookup.lead_image_url &&
                    readerLookup.lead_image_url.startsWith("http")
                ) {
                    populatedImage = readerLookup.lead_image_url.includes("%20")
                        ? readerLookup.lead_image_url.substring(
                              0,
                              readerLookup.lead_image_url.indexOf("%20")
                          )
                        : readerLookup.lead_image_url;
                }
            }
            return populatedImage;
        };

        // let seenImages = images.map((item) => {
        //     return item.image;
        // });
        let seenImages = [];
        let photosToAdd = [];
        let imagesToProcess = images;

        imagesToProcess.forEach(async (item, index) => {
            try {
                // If there is no image, see if we can find one
            let itemImage = item["image"];
            if (!itemImage) {
                let imageFromReader = await getReaderImage(item);
                if (imageFromReader) {
                    itemImage = imageFromReader;
                }
            }

            if (itemImage && !seenImages.includes(itemImage)) {
                seenImages.push(itemImage);
                //const thumbnailImage = item["t"] ? item["t"] : itemImage;
                const thumbnailImage = itemImage;

                let width = 0;
                let height = 0;

                if (
                    typeof item["w"] === "string" ||
                    item["w"] instanceof String
                ) {
                    width = parseInt(item["w"]);
                    height = parseInt(item["h"]);
                } else {
                    width = item["w"];
                    height = item["h"];
                }

                // Get dimensions for images without
                if (!width) {
                    let imgDimensions = await imageDimensions(
                        camoImageProxy(thumbnailImage)
                    );

                    if (imgDimensions) {
                        width = imgDimensions["width"];
                        height = imgDimensions["height"];
                    }
                }

                const photoToAdd = {
                    src: camoImageProxy(itemImage),
                    srcSet: [`${camoImageProxy(thumbnailImage)} ${width}w`],
                    title: item["title"],
                    width: width,
                    height: height,
                    onError: (i) => (i.target.style.display = "none"),
                };
                if (width && !(!(width > 0) || !(height > 0))) {
                    photosToAdd.push(photoToAdd);
                }
            }
            } catch (error) {
                // console.log(error);
            }
            
            if (index === imagesToProcess.length - 1) {
                setImageRetrievalComplete(true);
            }
        });

        return photosToAdd;
    }, []);

    useEffect(() => {
        if (imagesProcessed) {
            //console.log("Current processed images:", photos)
        } else if (photos.length === 0) {
            // Add in items for search results and news
            let combinedResults = result.images;
            let seenLinks = combinedResults.map((item) => {
                return item.link;
            });

            result.results.forEach((item) => {
                if (!seenLinks.includes(item.link)) {
                    const imageToAdd = {
                        h: "",
                        image: item.image,
                        link: item.link,
                        t: "",
                        title: item.title,
                        w: "",
                    };
                    combinedResults.push(imageToAdd);
                    seenLinks.push(item.link);
                }
            });
            result.news.forEach((item) => {
                if (!seenLinks.includes(item.link)) {
                    const imageToAdd = {
                        h: "",
                        image: item.image,
                        link: item.link,
                        t: "",
                        title: item.title,
                        w: "",
                    };
                    combinedResults.push(imageToAdd);
                    seenLinks.push(item.link);
                }
            });

            async function fetchData() {
                const populatedImages = await getImages(combinedResults);
                setPhotos(populatedImages);
                setImagesProcessed(true);
            }
            fetchData();
        }
    }, [getImages, photos, imageRetrievalComplete, result, imagesProcessed]);

    return (
        <div>
            {imagesProcessed ? (
                <div className="lw-image-gallery">
                    <Gallery
                        photos={photos}
                        //rowHeight="400"
                        onClick={openLightbox}
                        autoSize={true}
                    />
                    <ModalGateway>
                        {viewerIsOpen ? (
                            <Modal onClose={closeLightbox}>
                                <Carousel
                                    currentIndex={currentImage}
                                    views={photos.map((x) => ({
                                        ...x,
                                        srcset: x.srcSet,
                                        caption: x.title,
                                    }))}
                                />
                            </Modal>
                        ) : null}
                    </ModalGateway>
                </div>
            ) : (
                <div>Loading</div>
            )}
        </div>
    );
}
