// Function to look up a site by name from quick_site_lookups local file
// The file contains websites objects, where for each "d" is the domain and "site_name" is the site name

// import tldExtract from "tld-extract";
import getDomainNameAndSubdomain from "./getDomainNameAndSubdomain";
import { isValidURL } from "../utils";

function lookupKey(obj, key) {
    if (obj.hasOwnProperty(key)) {
        return obj[key];
    }
    return null;
}

export default function SiteLookup(link) {
    // Get the domain name including the subdomain from the link using tldExtract
    if (link && isValidURL(link)) {
        try {
            // const { domain, sub } = tldExtract(link);
            const { domain, sub } = getDomainNameAndSubdomain(
                link.replace("www.", "")
            );
            const domainName = sub ? sub + "." + domain : domain;

            if (domain.includes("stackoverflow")) {
                return "Stack Overflow";
            } else if (domain.includes("wikipedia")) {
                return "Wikipedia";
            } else if (domain.includes("microsoft") && sub.includes("azure")) {
                return "Azure";
            } else if (domain.includes("w3schools")) {
                return "W3Schools";
            } else if (domain.includes("google")) {
                return "Google";
            } else if (domain.includes("reddit")) {
                return "Reddit";
            } else if (domain.includes("amazon")) {
                return "Amazon";
            } else if (domain === "ibm") {
                return "IBM";
            } else if (domain === "apple") {
                return "Apple";
            } else if (domain === "microsoft") {
                return "Microsoft";
            } else if (domain === "github") {
                return "GitHub";
            } else if (domain === "youtube") {
                return "YouTube";
            } else if (domain === "twitter") {
                return "Twitter";
            } else if (domain === "facebook") {
                return "Facebook";
            } else if (domain === "instagram") {
                return "Instagram";
            } else if (domain === "linkedin") {
                return "LinkedIn";
            } else if (domain === "quora") {
                return "Quora";
            } else if (domain === "pinterest") {
                return "Pinterest";
            } else if (domain === "tumblr") {
                return "Tumblr";
            } else if (domain === "flickr") {
                return "Flickr";
            } else if (domain === "vimeo") {
                return "Vimeo";
            }

            // Read the quick sites file
            const sites = require("../data/quick_site_lookups.json");

            // Lookup the domain name in the quick sites file
            const siteData = lookupKey(sites, domainName);
            if (siteData) {
                return siteData['site_name'];
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    } else {
        return null;
    }
}
