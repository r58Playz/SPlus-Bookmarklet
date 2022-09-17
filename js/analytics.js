(async function() {
    // Wait for loader.js to finish running
    while (!window.splusLoaded) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    await loadDependencies("analytics", []);
})();

/**
 * Tracks an event using Google Analytics if the user did not opt out
 * NOTE: The Firefox version of the extension has no support for Google Analytics
 * @param {string} target (Event Category) The target of the event
 * @param {string} action (Event Action) The action of the event
 * @param {string} [label] (Event Label) Used to group related events
 * @param {number} [value] Numeric value associated with the event
 */
var trackEvent = function (target, action, label = undefined, value = undefined) {
    console.debug("[S+] Tracking disabled by user", { target, action, label, value });
};

(function () {
    function getBrowser() {
        if (typeof chrome !== "undefined") {
            if (typeof browser !== "undefined") {
                return "Firefox";
            } else {
                return "Chrome";
            }
        } else {
            // Does not actually differentiate Chrome and Edge, since new Edge is Chromium
            return "Other";
        }
    }
})();
