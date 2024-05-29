/* Takes a result item and returns a natural Site Name*/
import getDomainNameAndSubdomain from "./getDomainNameAndSubdomain";
import SiteLookup from "./SiteLookup";

export default function extractSiteSource(result) {
    const { domain, sub } =
        result.link &&
        getDomainNameAndSubdomain(result.link.replace("www.", ""));

    const fullSourceString = result.link
        ? `${sub ? `${sub}.` : ""}${domain}`
        : "";

    let cardSource = result.source ? result.source : domain;
    if (cardSource.includes(".") || cardSource.includes("http")) {
        let siteName = SiteLookup(result.link);
        if (
            siteName &&
            !(siteName.includes("http") || siteName.includes("."))
        ) {
            cardSource = siteName;
        } else if (result.link.includes("wikipedia")) {
            cardSource = "Wikipedia";
        } else if (fullSourceString.length <= 42) {
            cardSource = fullSourceString;
        } else {
            cardSource = domain;
        }
    }

    return cardSource;
}
