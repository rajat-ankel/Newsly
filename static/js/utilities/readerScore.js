// Scores how likely content is readable in a Reader View
// A score over 20 is probably good for reader mode.
// Based on mozilla readability.js

export default function readerScore(html, minContentLength = 140) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    var nodes = doc.querySelectorAll(["p", "pre"]);

    var brNodes = doc.querySelectorAll(["div > br"]);
    if (brNodes.length) {
        var set = new Set();
        [].forEach.call(brNodes, function (node) {
            set.add(node.parentNode);
        });
        nodes = [].concat.apply(Array.from(set), nodes);
    }

    var score = 0;
    var idx;
    for (idx = 0; idx < nodes.length; idx++) {
        var textContentLength = nodes[idx].textContent.trim().length;
        if (textContentLength > minContentLength) {
            score += Math.sqrt(textContentLength - minContentLength);
        }
        else if (textContentLength > 25) {
            // A large number of smaller lines may be verse or code but we only want significant content to count
            score += textContentLength / (minContentLength * 0.5);
        }
    }
    // console.log("Score is: ", score);
    return score;
}
