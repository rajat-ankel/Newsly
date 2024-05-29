/*
Uses tldextract to get the domain name and subdomain from a url, with a fallback to get them using regex if tldextract throws an error due to not recognizing the tld
Returns an object with the domain and subdomain
*/

import tldExtract from "tld-extract";
import { isValidURL } from "../utils";

export default function getDomainNameAndSubdomain(url) {
    if (!isValidURL(url)) {
      return { domain: null, sub: null, tld: null };
    }
    try {
      const { domain, sub, tld } = tldExtract(url);
      return { domain, sub, tld };
    } catch (err) {
      const regex = /^(?:https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/?\n]+)/;
      const matches = url.match(regex);
      const domain = matches[1];
      const sub = domain.split('.').slice(0, -2).join('.');
      const tld = null
      return { domain, sub, tld};
    }
  }