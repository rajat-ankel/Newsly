import React from "react";
import { LOCATION_DATA_PLACEHOLDER } from "./constants";

const userContextPlaceholder = {
    allowLocation: false,
    userSettings: {
        useDeepAnswers: true,
        allowFilters: true,
        persona: "mixed",
    },
    locationData: LOCATION_DATA_PLACEHOLDER,
    mode: null,
    heroMode: true,
    setHeroMode: null,
    theme: "light",
    toggleTheme: null,
    currentPanelResultId: null,
    browserPopupNoticeDisplayed: false,
    setBrowserPopupNoticeDisplayed: null,
    showResults: false,
    setShowResults: null,
    resultsContent: null,
    setResultsContent: null,
    view: null,
    setView: null,
    
};
const UserContext = React.createContext(userContextPlaceholder); // Create a context object

export {
    UserContext, // Export it so it can be used by other Components
};
