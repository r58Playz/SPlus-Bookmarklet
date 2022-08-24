(async function () {
    // Wait for loader.js to finish running
    while (!window.splusLoaded) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    await loadDependencies("preload", ["loader"]);
})();
 
// Process options
Logger.log(`Loaded Schoology Plus.`);
var firstLoad = true;
document.documentElement.setAttribute("page", location.pathname);

updateSettings();

var beta_tests = {
    // "darktheme": "https://schoologypl.us/docs/beta/darktheme",
    "newgrades": "https://schoologypl.us"
};

var defaultCourseIconUrlRegex = /\/sites\/[a-zA-Z0-9_-]+\/themes\/[%a-zA-Z0-9_-]+\/images\/course-default.(?:svg|png|jpe?g|gif)(\?[a-zA-Z0-9_%-]+(=[a-zA-Z0-9_%-]+)?(&[a-zA-Z0-9_%-]+(=[a-zA-Z0-9_%-]+)?)*)?$/;

// Functions

/** @type {HTMLDivElement} */
var modalContents = undefined;

function getModalContents() {
    return modalContents || createElement("p", [], { textContent: "Error loading settings" });
}

function backgroundPageFetch(url, init, bodyReadType) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "fetch", url: url, params: init, bodyReadType: bodyReadType }, function (response) {
            if (response === undefined || response === null) {
                Logger.error("[backgroundPageFetch] Response is undefined or null", response, chrome.runtime.lastError);
                reject("Response is undefined or null. Last error: " + chrome.runtime.lastError);
            }
            response = JSON.parse(response);
            if (!response.success) {
                reject(response.error);
                return;
            }

            delete response.success;

            let bodyReadError = response.bodyReadError;
            delete response.bodyReadError;

            let bodyContent = response[bodyReadType];
            let readBodyTask = new Promise((readBodyResolve, readBodyReject) => {
                if (bodyReadError) {
                    if (bodyReadError === true) {
                        readBodyReject();
                    } else {
                        readBodyReject({ status: response.status, bodyReadError: bodyReadError });
                    }
                } else {
                    readBodyResolve(bodyContent);
                }
            });
            response[bodyReadType] = () => readBodyTask;

            resolve(response);
        });
    });
}

/**
 * Creates a fetch function wrapper which honors a rate limit.
 * 
 * @returns {(input: RequestInfo, init?: RequestInit)=>Promise<Response>} A function following the fetch contract.
 * @example
 * // 10 requests per 3 seconds
 * var rateLimitedFetch = createFetchRateLimitWrapper(10, 3000);
 * rateLimitedFetch("https://www.google.com/").then(x => Logger.log(x))
 * @param {number} requestsPerInterval The number of requests per time interval permitted by the rate limit.
 * @param {number} interval The amount of time, in milliseconds, that the rate limit is delineated in.
 */
function createFetchRateLimitWrapper(requestsPerInterval, interval) {
    let callsThisCycle = 0;

    // array of resolve callbacks which trigger the request to be reenqueued
    let queue = [];

    function onIntervalReset() {
        callsThisCycle = 0;
        let countToDequeue = queue.length;
        if (countToDequeue) {
            Logger.log("Processing " + countToDequeue + " ratelimit-delayed queued requests");
        }
        for (let i = 0; i < countToDequeue; i++) {
            // note that this resolution might trigger stuff to be added to the queue again
            // that's why we store length before we iterate
            queue[i]();
        }
        // remove everything we just dequeued and executed
        queue.splice(0, countToDequeue);
    }

    function rateLimitedFetch() {
        if (callsThisCycle == 0) {
            setTimeout(onIntervalReset, interval);
        }

        if (callsThisCycle < requestsPerInterval) {
            callsThisCycle++;
            return backgroundPageFetch.apply(this, arguments);
        } else {
            // enqueue the request
            // basically try again later
            let resolvePromiseFunc;

            let realThis = this;
            let realArgs = arguments;

            let returnPromise = new Promise((resolve, reject) => {
                resolvePromiseFunc = resolve;
            }).then(() => rateLimitedFetch.apply(realThis, realArgs));

            queue.push(resolvePromiseFunc);

            return returnPromise;
        }
    }

    return rateLimitedFetch;
}

var preload_globallyCachedApiKeys = null;
// real limit is 15/5s but we want to be conservative
var preload_schoologyPlusApiRateLimitedFetch = createFetchRateLimitWrapper(13, 5000);

/**
 * Fetches data from the Schoology API (v1).
 * @returns {Promise<Response>} The response object from the Schoology API.
 * @param {string} path The API path, e.g. "/sections/12345/assignments/12"
 */
function fetchApi(path) {
    return fetchWithApiAuthentication(`https://api.schoology.com/v1/${path}`);
}

/**
 * Fetches a URL with Schoology API authentication headers for the current user.
 * @returns {Promise<Response>}
 * @param {string} url The URL to fetch.
 * @param {Object.<string, string>} [baseObj] The base set of headers. 
 * @param {boolean} [useRateLimit=true] Whether or not to use the internal Schoology API rate limit tracker. Defaults to true.
 * @param {string} [bodyReadType="json"] The method with which the body should be read.
 */
async function fetchWithApiAuthentication(url, baseObj, useRateLimit = true, bodyReadType = "json") {
    return await (useRateLimit ? preload_schoologyPlusApiRateLimitedFetch : backgroundPageFetch)(url, {
        headers: createApiAuthenticationHeaders(await getApiKeysInternal(), baseObj)
    }, bodyReadType);
}

/**
 * Fetches and parses JSON data from the Schoology API (v1).
 * @returns {Promise<object>} The parsed response from the Schoology API.
 * @param {string} path The API path, e.g. "/sections/12345/assignments/12"
 */
async function fetchApiJson(path) {
    let response;
    try {
        response = await fetchApi(path);
    }
    catch (err) {
        throw err;
    }
    if (!response.ok) {
        throw response;
    }
    return await response.json();
}

/**
 * Creates a DOM element
 * @returns {HTMLElement} A DOM element
 * @param {string} tag - The HTML tag name of the type of DOM element to create
 * @param {string[]} classList - CSS classes to apply to the DOM element
 * @param {Object.<string,any>} properties - Properties to apply to the DOM element
 * @param {HTMLElement[]} children - Elements to append as children to the created element
 */
function createElement(tag, classList, properties, children) {
    let element = document.createElement(tag);
    if (classList) {
        for (let c of classList) {
            element.classList.add(c);
        }
    }
    if (properties) {
        for (let property in properties) {
            if (properties[property] instanceof Object && !(properties[property] instanceof Function)) {
                for (let subproperty in properties[property]) {
                    element[property][subproperty] = properties[property][subproperty];
                }
            } else if (property !== undefined && properties[property] !== undefined) {
                element[property] = properties[property];
            }
        }
    }
    if (children) {
        for (let child of children) {
            element.appendChild(child);
        }
    }
    return element;
}

/**
 * Creates a Schoology Plus themed button element
 * @param {string} id The ID for the button element
 * @param {string} text The text to show on the button
 * @param {(e: Event)=>void} callback A function to be called when the button is clicked
 */
function createButton(id, text, callback) {
    return createElement("span", ["submit-span-wrapper", "splus-modal-button"], { onclick: callback }, [createElement("input", ["form-submit", "splus-track-clicks"], { type: "button", value: text, id: id, dataset: { splusTrackingLabel: "S+ Button" } })]);
}

/**
 * Returns the name of the current browser
 * @returns {"Chrome"|"Firefox"|"Other"} Name of the current browser
 */
function getBrowser() {
    return "Other";
}

/**
 * Returns `true` if current domain is `lms.lausd.net`
 * @returns {boolean}
 */
function isLAUSD() {
    return Setting.getValue("defaultDomain") === "lms.lausd.net";
}

/**
 * Returns `true` if an element is visible to the user
 * @param {HTMLElement} elem The element to check for visibility
 * @returns {boolean} `true` if element is visible
 */
function isVisible(elem) {
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}

/**
 * Returns all parent elements matching the provided selector.
 * Essentially works like a reverse `document.querySelectorAll`.
 * @param {HTMLElement} elem The target element 
 * @param {string} selector A CSS selector
 * @returns {HTMLElement[]} An array of matching parent elements
 */
function getParents(elem, selector) {
    var parents = [];
    var firstChar;
    if (selector) {
        firstChar = selector.charAt(0);
    }
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (selector) {
            if (firstChar === '.') {
                if (elem.classList.contains(selector.substr(1))) {
                    parents.push(elem);
                }
            }
            if (firstChar === '#') {
                if (elem.id === selector.substr(1)) {
                    parents.push(elem);
                }
            }
            if (firstChar === '[') {
                if (elem.hasAttribute(selector.substr(1, selector.length - 1))) {
                    parents.push(elem);
                }
            }
            if (elem.tagName.toLowerCase() === selector) {
                parents.push(elem);
            }
        } else {
            parents.push(elem);
        }

    }

    return parents;
};

/** Attempts to return the reference to the cached API key data.
 * Otherwise, asynchronously pulls the requisite data from the DOM to retrieve this user's Schoology API key, reloading the page if need be.
 * @returns {Promise<string[]>} an array of 3 elements: the key, the secret, and the user ID.
 */
async function getApiKeysInternal() {
    if (preload_globallyCachedApiKeys && preload_globallyCachedApiKeys.length !== undefined) {
        // API key object exists (truthy) and is an array (load completed)
        return preload_globallyCachedApiKeys;
    } else if (preload_globallyCachedApiKeys && preload_globallyCachedApiKeys.then !== undefined) {
        // API key variable is a promise, which will resolve to have API keys
        // await it
        // we don't have to worry about variable reassignment because the callbacks set up when the fetch was started will do that
        return await preload_globallyCachedApiKeys;
    } else {
        // API keys not yet retrieved
        // retrieve them
        preload_globallyCachedApiKeys = getApiKeysDirect();
        let retrievedApiKeys = await preload_globallyCachedApiKeys;
        // add to cache
        preload_globallyCachedApiKeys = retrievedApiKeys;
        return preload_globallyCachedApiKeys;
    }
}

/**
 * Attempts to return a defensive copy of cached API key data.
 * Otherwise, asynchronously pulls the requisite data from the DOM to retrieve this user's Schoology API key, reloading the page if need be.
 * @returns {Promise<string[]>} an array of 3 elements: the key, the secret, and the user ID.
 */
async function getApiKeys() {
    return (await getApiKeysInternal()).splice(0);
}

/**
 * Gets the current user's ID.
 */
function getUserId() {
    try {
        return Number.parseInt(new URLSearchParams(document.querySelector("iframe[src*=session-tracker]").src.split("?")[1]).get("id"));
    } catch (e) {
        Logger.warn("Failed to get user ID from session tracker, using backup", e);
        try {
            return JSON.parse(document.querySelector("script:not([type]):not([src])").textContent.split("=")[1]).props.user.uid;
        } catch (e2) {
            Logger.error("Failed to get user ID from backup method", e2);
            throw new Error("Failed to get user ID from backup method: " + e2.toString());
        }
    }
}

/**
 * Gets the user's API credentials from the Schoology API key webpage, bypassing the cache.
 */
async function getApiKeysDirect() {
    let apiKey = Setting.getValue("apikey");
    let apiSecret = Setting.getValue("apisecret");
    let apiUserId = Setting.getValue("apiuser");
    let currentUser = getUserId();
    let apiStatus = Setting.getValue("apistatus");

    if (apiStatus === "denied" && apiUserId === currentUser) {
        throw "apidenied";
    }

    if (apiKey && apiSecret && apiUserId === currentUser) {
        // API keys already exist
        return [apiKey, apiSecret, apiUserId];
    }

    // API keys do not exist
    throw "noapikey";
}

/**
 * Given an apiKeys array, generate the authentication headers for an API request.
 * 
 * @param {string[]} apiKeys The apiKeys array, consisting of at least the key and the secret, returned from getApiKeys.
 * @param {Object.<string,any>} baseObj Optional: the base object from which to copy existing properties.
 * @returns {Object.<string,string>} A dictionary of HTTP headers, including a properly-constructed Authorization header for the given API user.
 */
function createApiAuthenticationHeaders(apiKeys, baseObj) {
    let retObj = {};
    if (baseObj) {
        Object.assign(retObj, baseObj);
    }

    let userAPIKey = apiKeys[0];
    let userAPISecret = apiKeys[1];

    retObj["Authorization"] = `OAuth realm="Schoology%20API",oauth_consumer_key="${userAPIKey}",oauth_signature_method="PLAINTEXT",oauth_timestamp="${Math.floor(Date.now() / 1000)}",oauth_nonce="${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}",oauth_version="1.0",oauth_signature="${userAPISecret}%26"`;

    if (!retObj["Content-Type"]) {
        retObj["Content-Type"] = "application/json";
    }

    return retObj;
}


/**
 * Updates the contents of the settings modal to reflect changes made by the user to all settings
 * @param {()=>any} callback Called after settings are updated
 */
function updateSettings(callback) {
    chrome.storage.sync.get(null, storageContents => {
        __storage = storageContents;

        // wrapper functions for e.g. defaults
        __storage.getGradingScale = function (courseId) {
            let defaultGradingScale = { "90": "A", "80": "B", "70": "C", "60": "D", "0": "F" };
            if (__storage.gradingScales && __storage.gradingScales[courseId]) {
                return __storage.gradingScales[courseId];
            }

            return defaultGradingScale;
        }

        if (firstLoad) {
            if (storageContents.themes) {
                for (let t of storageContents.themes) {
                    themes.push(Theme.loadFromObject(t));
                }
            }

            Theme.apply(Theme.active);
            firstLoad = false;
        }

        let noControl = document.createElement("div");

        modalContents = createElement("div", [], undefined, [
            createElement("div", ["splus-modal-contents"], {}, [
                new Setting(
                    "theme",
                    "Theme",
                    "Click to open the theme editor to create, edit, or select a theme",
                    "Schoology Plus",
                    "button",
                    {},
                    value => value || "Schoology Plus",
                    event => location.href = chrome.runtime.getURL("/theme-editor.html"),
                    element => element.value
                ).control,
                new Setting(
                    "notifications",
                    "Desktop Notifications",
                    "Displays desktop notifications and a number badge on the extension button when new grades are entered",
                    "enabled",
                    "select",
                    {
                        options: [
                            {
                                text: "Enable All Notifications",
                                value: "enabled"
                            },
                            {
                                text: "Number Badge Only (No Pop-Ups)",
                                value: "badge"
                            },
                            {
                                text: "Pop-Ups Only (No Badge)",
                                value: "popup"
                            },
                            {
                                text: "Disable All Notifications",
                                value: "disabled"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                new Setting(
                    "indicateSubmission",
                    "Submitted Assignments Checklist",
                    '[Reload required] Shows a checkmark, shows a strikethrough, or hides items in "Upcoming Assignments" that have been submitted. If "Show Check Mark" is selected, a checklist function will be enabled allowing you to manually mark assignments as complete.',
                    "check",
                    "select",
                    {
                        options: [
                            {
                                text: "Show Check Mark ✔ (Enables manual checklist)",
                                value: "check"
                            },
                            {
                                text: "Show Strikethrough (Doesn't allow manual checklist)",
                                value: "strikethrough"
                            },
                            {
                                text: "Hide Assignment (Not recommended)",
                                value: "hide"
                            },
                            {
                                text: "Do Nothing",
                                value: "disabled"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                new Setting(
                    "quickAccessVisibility",
                    "Quick Access",
                    "[Reload Required to Reposition] Changes the visibility of the Quick Access panel on the homepage",
                    "enabled",
                    "select",
                    {
                        options: [
                            {
                                text: "Top of Right Sidebar",
                                value: "enabled"
                            },
                            {
                                text: "Between Overdue and Upcoming",
                                value: "belowOverdue"
                            },
                            {
                                text: "Bottom of Right Sidebar",
                                value: "bottom"
                            },
                            {
                                text: "Disabled",
                                value: "disabled"
                            }
                        ]
                    },
                    value => {
                        setCSSVariable("quick-access-display", value === "disabled" ? "none" : "block");
                        return value;
                    },
                    function (event) { this.onload(event.target.value) },
                    element => element.value
                ).control,
                new Setting(
                    "upcomingOverdueVisibility",
                    "Hide Upcoming and Overdue Assignments",
                    'Hides the "Upcoming" and "Overdue" sidebars on the homepage',
                    "showAll",
                    "select",
                    {
                        options: [
                            {
                                text: "Show Both",
                                value: "showAll"
                            },
                            {
                                text: "Hide Upcoming Only",
                                value: "hideUpcoming"
                            },
                            {
                                text: "Hide Overdue Only",
                                value: "hideOverdue"
                            },
                            {
                                text: "Hide Both",
                                value: "hideAll"
                            }
                        ]
                    },
                    value => {
                        setCSSVariable("overdue-assignments-display", "block");
                        setCSSVariable("upcoming-assignments-display", "block");
                        switch (value) {
                            case "hideUpcoming":
                                setCSSVariable("upcoming-assignments-display", "none");
                                break;
                            case "hideOverdue":
                                setCSSVariable("overdue-assignments-display", "none");
                                break;
                            case "hideAll":
                                setCSSVariable("upcoming-assignments-display", "none");
                                setCSSVariable("overdue-assignments-display", "none");
                                break;
                        }
                        return value;
                    },
                    function (event) { this.onload(event.target.value) },
                    element => element.value
                ).control,
                new Setting(
                    "courseIcons",
                    "Override Course Icons",
                    "[Refresh required to disable] Replace the course icons with the selected theme's icons",
                    isLAUSD() ? "enabled" : "defaultOnly",
                    "select",
                    {
                        options: [
                            {
                                text: "All Icons",
                                value: "enabled"
                            },
                            {
                                text: "Default Icons Only",
                                value: "defaultOnly",
                            },
                            {
                                text: "Disabled",
                                value: "disabled"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                new Setting(
                    "useDefaultIconSet",
                    "Use Built-In Icon Set",
                    `[Refresh required] Use Schoology Plus's <a href="${chrome.runtime.getURL("/default-icons.html")}" target="_blank">default course icons</a> as a fallback when a custom icon has not been specified. NOTE: these icons were meant for schools in Los Angeles Unified School District and may not work correctly for other schools.`,
                    isLAUSD() ? "enabled" : "disabled",
                    "select",
                    {
                        options: [
                            {
                                text: "Enabled",
                                value: "enabled"
                            },
                            {
                                text: "Disabled",
                                value: "disabled"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                new Setting(
                    "customScales",
                    "Custom Grading Scales",
                    "[Refresh required] Uses custom grading scales (set per-course in course settings) when courses don't have one defined",
                    "enabled",
                    "select",
                    {
                        options: [
                            {
                                text: "Enabled",
                                value: "enabled"
                            },
                            {
                                text: "Disabled",
                                value: "disabled"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                new Setting(
                    "orderClasses",
                    "Order Classes",
                    "[Refresh required] Changes the order of your classes on the grades and mastery pages (only works if your course names contain PER N or PERIOD N)",
                    "period",
                    "select",
                    {
                        options: [
                            {
                                text: "By Period",
                                value: "period"
                            },
                            {
                                text: "Alphabetically",
                                value: "alpha"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                new Setting(
                    "overrideUserStyles",
                    "Override Styled Text",
                    "Override styled text in homefeed posts and discussion responses when using modern themes. WARNING: This guarantees text is readable on dark theme, but removes colors and other styling that may be important. You can always use the Toggle Theme button on the navigation bar to temporarily disble your theme.",
                    "true",
                    "select",
                    {
                        options: [
                            {
                                text: "Enabled",
                                value: "true"
                            },
                            {
                                text: "Disabled",
                                value: "false"
                            }
                        ]
                    },
                    value => {
                        document.documentElement.setAttribute("style-override", value);
                        return value;
                    },
                    function (event) { this.onload(event.target.value) },
                    element => element.value
                ).control,
                new Setting(
                    "archivedCoursesButton",
                    "Archived Courses Button",
                    'Adds a link to see past/archived courses in the courses dropdown',
                    "show",
                    "select",
                    {
                        options: [
                            {
                                text: "Show",
                                value: "show"
                            },
                            {
                                text: "Hide",
                                value: "hide"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                new Setting(
                    "weightedGradebookIndicator",
                    "Weighted Gradebook Indicator",
                    "Adds an indicator next to gradebooks which are weighted",
                    "enabled",
                    "select",
                    {
                        options: [
                            {
                                text: "Show",
                                value: "enabled"
                            },
                            {
                                text: "Hide",
                                value: "disabled"
                            }
                        ]
                    },
                    value => {
                        setCSSVariable("weighted-gradebook-indicator-display", value == "enabled" ? "inline" : "none")
                        return value;
                    },
                    function (event) { this.onload(event.target.value) },
                    element => element.value
                ).control,
                new Setting(
                    "broadcasts",
                    "Announcement Notifications",
                    "Displays news feed posts for announcements sent to all Schoology Plus users",
                    "enabled",
                    "select",
                    {
                        options: [
                            {
                                text: "Enable Announcements",
                                value: "enabled"
                            },
                            {
                                text: "Disable Announcements",
                                value: "disabled"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                new Setting(
                    "helpCenterFAB",
                    "Schoology Help Button",
                    "Controls the visibility of the S button in the bottom right that shows the Schoology Guide Center",
                    "hidden",
                    "select",
                    {
                        options: [
                            {
                                text: "Show",
                                value: "visible"
                            },
                            {
                                text: "Hide",
                                value: "hidden"
                            }
                        ]
                    },
                    value => {
                        setCSSVariable("help-center-fab-visibility", value);
                        return value;
                    },
                    function (event) { this.onload(event.target.value) },
                    element => element.value
                ).control,
                new Setting(
                    "sessionCookiePersist",
                    "Stay Logged In",
                    "[Logout/login required] Stay logged in to Schoology when you restart your browser",
                    "disabled",
                    "select",
                    {
                        options: [
                            {
                                text: "Enabled",
                                value: "enabled"
                            },
                            {
                                text: "Disabled",
                                value: "disabled"
                            }
                        ]
                    },
                    value => value,
                    undefined,
                    element => element.value
                ).control,
                createElement("div", ["setting-entry"], {}, [
                    createElement("h2", ["setting-title"], {}, [
                        createElement("a", [], { href: "#", textContent: "Change Schoology Account Access", onclick: () => {location.pathname = "/api";}, style: { fontSize: "" } })
                    ]),
                    createElement("p", ["setting-description"], { textContent: "Grant Schoology Plus access to your Schoology API Key so many features can function, or revoke that access." })
                ]),
                getBrowser() !== "Firefox" ? createElement("div", ["setting-entry"], {}, [
                    createElement("h2", ["setting-title"], {}, [
                        createElement("a", [], { href: "#", textContent: "Anonymous Usage Statistics", onclick: () => openModal("analytics-modal"), style: { fontSize: "" } })
                    ]),
                    createElement("p", ["setting-description"], { textContent: "[Reload required] Allow Schoology Plus to collect anonymous information about how you use the extension. We don't collect any personal information per our privacy policy." })
                ]) : noControl,
                
            ]),
            createElement("div", ["settings-buttons-wrapper"], undefined, [
                createButton("save-settings", "Save Settings", () => Setting.saveModified()),
                createElement("a", ["restore-defaults"], { textContent: "Restore Defaults", onclick: Setting.restoreDefaults, href: "#" })
            ])
        ]);

        if (callback && typeof callback == "function") {
            callback();
        }
    });
}

Logger.debug("Finished loading preload.js");
