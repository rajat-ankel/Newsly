import camoUrl from "camo-url";
import DOMPurify from "dompurify";
import {
    LAZYWEB_ROTATING_PROXY,
    IMAGE_PROXY,
    IMAGE_KEY,
} from "../../../../constants";
import { escapeCode } from "../../../../utils";

const camoImageProxy = camoUrl({
    host: IMAGE_PROXY,
    key: IMAGE_KEY,
    type: "path",
});

function removeEmpty(el) {
    let checkText = el.innerText;
    if (checkText) {
        checkText = checkText.replace(/(\r\n|\n|\r)/gm, "").trim();
    }
    if (!checkText) {
        let mediaChildren = el.querySelectorAll("img, iframe, picture, figure");

        if (mediaChildren.length === 0) {
            el.parentNode.removeChild(el);
        }
    }
}

const cleanHtml = async (html) => {
    // Convert the html string to a html object, then remove any sequence of elements comprised of a div, a h4 tag and then div with id of "mw-content-text"
    if (html.includes('<div id="mw-content-text"')) {
        // Handle Wikipedia
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");

        let elementsToRemove = doc.querySelectorAll(
            "hr + h4 + div > div#mw-content-text"
        );
        elementsToRemove.forEach((el) => {
            el.parentNode.removeChild(el);
        });

        // Now remove the hr tags and the following h4 tags that contain the word "Page"
        let hrTags = doc.querySelectorAll("hr");
        hrTags.forEach((el) => {
            let nextSibling = el.nextElementSibling;
            if (nextSibling && nextSibling.tagName === "H4") {
                if (nextSibling.innerText.includes("Page")) {
                    el.parentNode.removeChild(el);
                    nextSibling.parentNode.removeChild(nextSibling);
                }
            }
        });

        

        // Remove the following headlines and sections from the "mw-content-text" div of the Wikipedia article retrieved from postlight parser API: References, External links, Further reading, See also, Notes, Bibliography, Sources, Citations, Footnotes, and Notes
        let mwContentTextDiv = doc.querySelector("div#mw-content-text");
        if (mwContentTextDiv) {
            // Find all divs with a class of 'reflist' and remove them
            let reflistDivs = mwContentTextDiv.querySelectorAll("div.reflist");
            reflistDivs.forEach((el) => {
                el.parentNode.removeChild(el);
            });

            // Remove wikipedia vcard figure
            let infoboxBiographyVcardDivs =
                mwContentTextDiv.querySelectorAll("figure");
            infoboxBiographyVcardDivs.forEach((el) => {
                el.parentNode.removeChild(el);
            });

            // Remove wikipedia infobox vcard table
            let infoboxBiographyVcardTables =
                mwContentTextDiv.querySelectorAll("table");
            infoboxBiographyVcardTables.forEach((el) => {
                el.parentNode.removeChild(el);
            });

            // Remove all divs with class 'navbox'
            let navboxDivs = mwContentTextDiv.querySelectorAll("div.navbox");
            navboxDivs.forEach((el) => {
                el.parentNode.removeChild(el);
            });

            let portalBarDivs = mwContentTextDiv.querySelectorAll("div.portal-bar");
            portalBarDivs.forEach((el) => {
                el.parentNode.removeChild(el);
            });
            

            let headlinesToRemove =
                mwContentTextDiv.querySelectorAll("h2, h3, h4, h5, h6");
            headlinesToRemove.forEach((el) => {
                if (
                    el.innerText.includes("References") ||
                    el.innerText.includes("Further reading") ||
                    el.innerText.includes("See also") ||
                    el.innerText.includes("Notes") ||
                    el.innerText.includes("Bibliography") ||
                    el.innerText.includes("Sources") ||
                    el.innerText.includes("Citations") ||
                    el.innerText.includes("Footnotes") ||
                    el.innerText.includes("Portals") ||
                    el.innerText.includes("External links")
                ) {
                    let nextSibling = el.nextElementSibling;
                    if (nextSibling) {
                        nextSibling.parentNode.removeChild(nextSibling);
                    }
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }
            });
        }

        // Now convert the html back into a string
        html = doc.documentElement.innerHTML;
    }

    DOMPurify.addHook("uponSanitizeElement", (node, data) => {
        // whitelist iframes from credible known embed sources
        // Doc viewer info at https://gist.github.com/tzmartin/1cf85dc3d975f94cfddc04bc0dd399be

        if (data.tagName === "iframe") {
            const src = node.getAttribute("src") || "";
            if (
                !(
                    // Video players
                    (
                        src.startsWith("https://www.youtube.com/embed/") ||
                        src.startsWith("https://youtube.com/embed/") ||
                        src.startsWith("https://player.vimeo.com/") ||
                        src.startsWith("https://open.spotify.com/embed/") ||
                        src.startsWith("https://video-api.wsj.com/") ||
                        // Social media
                        src.startsWith("https://twitter.com/") ||
                        // Code github gist
                        src.startsWith("https://gist.github.com") ||
                        // Document viewers
                        src.startsWith("http://view.officeapps.live.com/") ||
                        src.startsWith("https://onedrive.live.com/embed") ||
                        src.startsWith("https://docs.google.com/viewer?url=") ||
                        src.startsWith(
                            "https://drive.google.com/viewerng/viewer?url="
                        ) ||
                        (src.startsWith("https://docs.google.com/a/") &&
                            src.includes("/viewer?url="))
                    )
                )
            ) {
                return node.parentNode?.removeChild(node);
            }
        }
        // Remove any spans with class name "tooltiptext" - Geeks for Geeks
        if (data.tagName === "span" && node.className === "tooltiptext") {
            return node.parentNode?.removeChild(node);
        }

        // Remove any span tags with classes created by hljs and other syntax highlighting with a class starting "hljs-", "shcb-language" etc, and replace with the text content of the span tag
        // if (
        //     (data.tagName === "span" || data.tagName === "small") &&
        //     node.className &&
        //     (node.className.startsWith("hljs-") ||
        //         node.className.startsWith("shcb-language"))
        // ) {
        //     let newNodeText = node.innerText;
        //     if (newNodeText.startsWith("Code language:")) {
        //         newNodeText = "```See the full article for more code.```";
        //     }
        //     const nodeText = document.createTextNode(newNodeText);

        //     return node.parentNode?.replaceChild(nodeText, node);
        // }

        // Remove any links with class names "nav_tab" or "nav_link" - Geeks for Geeks
        if (
            data.tagName === "a" &&
            (node.className.includes("nav_tab") ||
                node.className.includes("nav_link"))
        ) {
            return node.parentNode?.removeChild(node);
        }
        // Convert any divs with class name "code-block" to pre tags - Geeks for Geeks
        if (
            html.includes(
                '<div class="code-block"><div class="code-container">'
            ) &&
            data.tagName === "p" &&
            node.className === "line"
        ) {
            const pre = document.createElement("pre");
            pre.innerHTML = node.innerHTML;
            return node.parentNode?.replaceChild(pre, node);
        }
        // Convert any divs with class name "code-container" to code tags - Geeks for Geeks
        // if (data.tagName === "div" && node.className === "code-container") {
        //     const code = document.createElement("p");
        //     code.innerHTML = node.innerHTML;
        //     return node.parentNode?.replaceChild(code, node);
        // }

        // Remove any images where the alt tag is "Loading..." or the image width is 1px
        if (data.tagName === "img") {
            if (node.alt === "Loading...") {
                return node.parentNode?.removeChild(node);
            }
        }

        // If the only text content of a p is "Load Error" then remove the p
        if (data.tagName === "p") {
            if (node.textContent === "Load Error") {
                return node.parentNode?.removeChild(node);
            }
        }
    });

    let clean = DOMPurify.sanitize(html, {
        IN_PLACE: true,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ["style", "source", "button", "input", "form", "script"],
        FORBID_ATTR: ["style", "class", "id"],
        ADD_TAGS: ["iframe"],
    });

    const htmlDoc = new DOMParser().parseFromString(clean, "text/html");

    // Redirect images through camo / cloudfront to strip identifiers and cookies
    let imgs = htmlDoc.querySelectorAll("img");

    if (imgs) {
        imgs.forEach(function (img) {
            if (img) {
                let originalSrc = decodeURIComponent(img.getAttribute("src"));
                if (img.getAttribute("src")) {
                    if (originalSrc.startsWith("data:image")) {
                        // Data source for image
                        img.parentNode.removeChild(img);
                    } else if (originalSrc.includes(", ") && !img.srcset) {
                        // Mercury srcset bug puts in src sometimes. Get first item for src and populate srcset in list
                        let originalSrcSetList = originalSrc.split(", ");
                        img.setAttribute(
                            "src",
                            camoImageProxy(originalSrcSetList[0].split(" ")[0])
                        );
                        let srcSetList = [];
                        for (let item of originalSrcSetList) {
                            // Need to use node rotating proxy for responsive images on medium
                            let proxyItem = `${LAZYWEB_ROTATING_PROXY}${decodeURIComponent(
                                item
                            )}`;
                            srcSetList.push(proxyItem);
                        }
                        img.removeAttribute("class");
                        img.setAttribute("srcset", srcSetList.join(", "));
                        img.removeAttribute("class");
                    } else if (img.src && !img.srcset) {
                        // img src present but no srcset

                        img.removeAttribute("class");

                        // Special handling for Mercury bug with medium.com
                        if (originalSrc.includes(".com/max/") && !img.srcset) {
                            originalSrc = originalSrc.replace(
                                /\/max\/.*\//,
                                "/max/1094/"
                            );
                        }

                        img.setAttribute("src", camoImageProxy(originalSrc));
                    } else if (img.src && img.srcset) {
                        // Both src and srcset present then use src only and remove srcset
                        img.removeAttribute("class");
                        img.setAttribute("src", camoImageProxy(originalSrc));
                        img.removeAttribute("srcset");
                    }
                    // Check if the image will load and remove from the dom if not to hide errors
                    img.setAttribute("onerror", 'this.style.display = "none"');
                } else {
                    img.parentNode.removeChild(img);
                }
            }
        });
    }

    // Replace any textarea elements with pre elements
    let textAreas = htmlDoc.querySelectorAll("textarea");
    if (textAreas) {
        textAreas.forEach(function (textArea) {
            let pre = document.createElement("pre");
            pre.innerHTML = textArea.innerHTML;
            textArea.parentNode?.replaceChild(pre, textArea);
        });
    }

    // Add a code element to any pre elements that do not already contain it
    let preElements = htmlDoc.querySelectorAll("pre");
    preElements.forEach((node) => {
        if (!node.querySelector("code")) {
            let codeElement = document.createElement("code");
            codeElement.textContent = node.textContent;
            // codeElement.innerText = node.innerText;
            node.innerHTML = "";
            node.appendChild(codeElement);
        }
    });

    // Remove any child nodes from code tags and just include the text of the code
    let codeTags = htmlDoc.querySelectorAll("code");
    if (codeTags) {
        codeTags.forEach(function (code) {
            if (
                code.hasChildNodes() &&
                (code.childNodes.length > 1 ||
                    code.childNodes[0].nodeName.toLowerCase() !== "#text" ||
                    code.textContent.includes("<") ||
                    code.innerText.includes("<"))
            ) {
                // let codeText = code.innerText;
                let codeText = code.textContent;

                // check for spans inside the text and remove them
                if (
                    codeText.includes("span") &&
                    !(
                        codeText.includes("<p") ||
                        codeText.includes("<div") ||
                        codeText.includes("<html") ||
                        codeText.includes("<body")
                    )
                ) {
                    codeText = codeText.replace(
                        /<span.*?>(.*?)<\/span>/g,
                        "$1"
                    );
                }

                let newCodeTag = document.createElement("code");
                // newCodeTag.innerText = codeText;
                newCodeTag.textContent = codeText;

                if (
                    (codeText.includes("\n") || codeText.length > 60) &&
                    code.parentNode?.nodeName.toLowerCase() !== "pre"
                ) {
                    let preTag = document.createElement("pre");
                    preTag.appendChild(newCodeTag);
                    code.parentNode?.replaceChild(preTag, code);
                } else {
                    code.parentNode?.replaceChild(newCodeTag, code);
                }
            } else if (
                (code.textContent.includes("\n") ||
                    code.textContent.length > 60) &&
                code.parentNode?.nodeName.toLowerCase() !== "pre"
            ) {
                // Add a pre tag wrapping the code tag if the code tag text has a line break or is longer than 60 characters
                let preTag = document.createElement("pre");
                let newCodeTag = document.createElement("code");
                // newCodeTag.innerText = code.innerText;
                newCodeTag.textContent = code.textContent;
                preTag.appendChild(newCodeTag);

                // replace the code tag with the pre tag
                code.parentNode?.replaceChild(preTag, code);
            }
        });
    }

    // Escape code elements using the escapeCode function
    let codeElements = htmlDoc.querySelectorAll("code");
    codeElements.forEach((node) => {
        node.innerHTML = escapeCode(node.innerHTML);
    });

    // Add 'nofollow noopener noreferrer' and target='_blank' to links
    let links = htmlDoc.querySelectorAll("a");
    if (links) {
        links.forEach(function (link) {
            if (link) {
                link.setAttribute("rel", "nofollow noopener noreferrer");
                link.setAttribute("target", "_blank");
                link.setAttribute("data-Newsly-event", "Engagement");
                link.setAttribute("data-Newsly-action", "Click");
                link.setAttribute("data-Newsly-channel", "Reader View Link");
                link.removeAttribute("class");
            }
            // Special handlers for links
            if (
                ((link.textContent || link.innerText) ===
                    "Continue reading the main story" ||
                    (link.textContent || link.innerText) ===
                        "阅读简体中文版閱讀繁體中文版Leer en español" ||
                    (link.textContent || link.innerText) ===
                        "Skip to content" ||
                    (link.textContent || link.innerText) ===
                        "Skip to site index") &&
                link.href.includes("nytimes.com")
            ) {
                link.parentNode.removeChild(link);
            }
        });
    }

    // Sandbox any iframe with support for playing media - e.g. youtube
    let iframeContentElements = htmlDoc.querySelectorAll("iframe");
    iframeContentElements.forEach((node) => {
        node.setAttribute(
            "sandbox",
            "allow-scripts allow-forms allow-same-origin allow-presentation"
        );
        node.setAttribute("data-Newsly-event", "Engagement");
        node.setAttribute("data-Newsly-action", "Watch");
        node.setAttribute("data-Newsly-channel", "Reader View Player");

        node.setAttribute("allow", "fullscreen");
        if (node.src.includes("youtube.com/embed")) {
            node.setAttribute(
                "src",
                node.src.replace(
                    "youtube.com/embed",
                    "youtube-nocookie.com/embed"
                )
            );
        }
    });

    // Add a class name of "lw-reader-code" to any table elements that have pre and code elements as a child
    // tableElements.forEach((node) => {
    //     if (node.querySelector("pre code")) {
    //         node.classList.add("lw-reader-code");
    //     }
    // });

    // Add a wrapping div with a class name of "lw-reader-code" to any table elements that have pre and code elements as a child
    // let tableElements = htmlDoc.querySelectorAll("table");
    // tableElements.forEach((node) => {
    //     if (node.querySelector("pre code") || node.querySelector("code")) {
    //         let wrapperDiv = document.createElement("div");
    //         wrapperDiv.classList.add("lw-reader-code");
    //         node.parentNode.insertBefore(wrapperDiv, node);
    //         wrapperDiv.appendChild(node);
    //     }
    // });

    // Find any tables that have multiple pre and code blocks - mangled syntax highlighting from Geeks for Geeks etc.
    let tablesToCheck = htmlDoc.querySelectorAll("table");
    tablesToCheck.forEach((node) => {
        // Find a list of pre blocks inside a table that have more than one code tag inside them
        let preBlocks = node.querySelectorAll("pre");
        if (preBlocks.length > 0) {
            // Create a new pre code block to replace the existing one
            let newPreCodeBlock = document.createElement("pre");
            let newCodeBlock = document.createElement("code");
            newPreCodeBlock.appendChild(newCodeBlock);
            // Loop through each pre block and find the code blocks inside it, remove the code tags and convert the pre tags to newlines
            preBlocks.forEach((preBlock) => {
                let codeBlocks = preBlock.querySelectorAll("code");
                if (codeBlocks.length > 1) {
                    // Get the string content from the pre block to use for the new code block
                    newCodeBlock.innerHTML += preBlock.innerText + "\n";
                }
            });
            // Replace the existing pre code blocks with the new pre code block
            node.innerHTML = "";
            node.appendChild(newPreCodeBlock);
        }
    });

    // Add a wrapping div with a class name of "lw-reader-code" to any table elements that have pre and code elements as a child
    let tableElements = htmlDoc.querySelectorAll("table");
    tableElements.forEach((node) => {
        if (node.querySelector("pre code") || node.querySelector("code")) {
            let wrapperDiv = document.createElement("div");
            wrapperDiv.classList.add("lw-reader-code");
            node.parentNode.insertBefore(wrapperDiv, node);
            wrapperDiv.appendChild(node);
        }
    });

    // Find any empty pre code blocks and insert the message "See the full article for this code example"
    let emptyPreCodeBlocks = htmlDoc.querySelectorAll("pre code");
    emptyPreCodeBlocks.forEach((node) => {
        if (node.innerText.trim() === "") {
            node.innerText = "```See the full article for more code.```";
        }
    });

    // Remove any remaining empty content elements
    let elements = htmlDoc.querySelectorAll(
        "p, a, ul, strong, li, div, span, ol, table, svg"
    );
    elements.forEach(removeEmpty);

    let cleanedHtml = htmlDoc.documentElement.innerHTML;
    return cleanedHtml;
};

export default cleanHtml;
