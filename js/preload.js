(async function() {
    // Wait for loader.js to finish running
    while (!window.splusLoaded) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    await loadDependencies("preload", ["loader", "settings"]);

    // Process options
    window.splus.Logger.log(`Loaded Schoology Plus.`);
    document.documentElement.setAttribute("page", location.pathname);

    window.splus.SIDEBAR_SECTIONS = [{
        name: "Quick Access",
        selector: "#right-column-inner div.quick-access-wrapper"
    }, {
        name: "Reminders",
        selector: "#right-column-inner div.reminders-wrapper"
    }, {
        name: "Overdue",
        selector: "#right-column-inner div#overdue-submissions.overdue-submissions-wrapper"
    }, {
        name: "Upcoming",
        selector: "#right-column-inner div.upcoming-submissions-wrapper"
    }, {
        name: "Upcoming Events",
        selector: "#right-column-inner div#upcoming-events.upcoming-events-wrapper"
    }, {
        name: "Recently Completed",
        selector: "#right-column-inner div.recently-completed-wrapper"
    },];
    window.splus.SIDEBAR_SECTIONS_MAP = Object.fromEntries(window.splus.SIDEBAR_SECTIONS.map(s => [s.name, s]));

    window.splus.updateSettings();

    window.splus.beta_tests = {
        // "darktheme": "https://schoologypl.us/docs/beta/darktheme",
        "newgrades": "https://schoologypl.us"
    };

    window.splus.defaultCourseIconUrlRegex = /\/sites\/[a-zA-Z0-9_-]+\/themes\/[%a-zA-Z0-9_-]+\/images\/course-default.(?:svg|png|jpe?g|gif)(\?[a-zA-Z0-9_%-]+(=[a-zA-Z0-9_%-]+)?(&[a-zA-Z0-9_%-]+(=[a-zA-Z0-9_%-]+)?)*)?$/;

    // Functions

    function backgroundPageFetch(url, init, bodyReadType) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: "fetch",
                url: url,
                params: init,
                bodyReadType: bodyReadType
            }, function(response) {
                if (response === undefined || response === null) {
                    window.splus.Logger.error("[backgroundPageFetch] Response is undefined or null", response, chrome.runtime.lastError);
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
                            readBodyReject({
                                status: response.status,
                                bodyReadError: bodyReadError
                            });
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
                window.splus.Logger.log("Processing " + countToDequeue + " ratelimit-delayed queued requests");
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
    window.splus.fetchApi = function(path) {
        return window.splus.fetchWithApiAuthentication(`https://sch-proxy.r58playz.dev/api/v1?apiAddress=${path}`);
    }

    /**
     * Fetches a URL with Schoology API authentication headers for the current user.
     * @returns {Promise<Response>}
     * @param {string} url The URL to fetch.
     * @param {Object.<string, string>} [baseObj] The base set of headers.
     * @param {boolean} [useRateLimit=true] Whether or not to use the internal Schoology API rate limit tracker. Defaults to true.
     * @param {string} [bodyReadType="json"] The method with which the body should be read.
     */
    window.splus.fetchWithApiAuthentication = async (url, baseObj, useRateLimit = true, bodyReadType = "json") => {
        return await (useRateLimit ? preload_schoologyPlusApiRateLimitedFetch : backgroundPageFetch)(url, {
            headers: createApiAuthenticationHeaders(await getApiKeysInternal(), baseObj)
        }, bodyReadType);
    }

    /**
     * Fetches and parses JSON data from the Schoology API (v1).
     * @returns {Promise<object>} The parsed response from the Schoology API.
     * @param {string} path The API path, e.g. "/sections/12345/assignments/12"
     */
    window.splus.fetchApiJson = async function(path) {
        let response;
        try {
            response = await window.splus.fetchApi(path);
        } catch (err) {
            throw err;
        }
        if (!response.ok) {
            throw response;
        }
        return await response.json();
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
    window.splus.getUserId = function() {
        try {
            return Number.parseInt(new URLSearchParams(document.querySelector("iframe[src*=session-tracker]").src.split("?")[1]).get("id"));
        } catch (e) {
            window.splus.Logger.warn("Failed to get user ID from session tracker, using backup", e);
            try {
                return JSON.parse(document.querySelector("script:not([type]):not([src])").textContent.split("=")[1]).props.user.uid;
            } catch (e2) {
                window.splus.Logger.error("Failed to get user ID from backup method", e2);
                throw new Error("Failed to get user ID from backup method: " + e2.toString());
            }
        }
    }

    /**
     * Gets the user's API credentials from the Schoology API key webpage, bypassing the cache.
     */
    async function getApiKeysDirect() {
        let apiKey = window.splus.Setting.getValue("apikey");
        let apiSecret = window.splus.Setting.getValue("apisecret");
        let apiUserId = window.splus.Setting.getValue("apiuser");
        let currentUser = window.splus.getUserId();
        let apiStatus = window.splus.Setting.getValue("apistatus");

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

    new window.splus.Setting(
        "defaultDomain",
        "Default Schoology Domain",
        "The website on which Schoology Plus runs. Cannot be changed here.",
        "app.schoology.com",
        "text", {
        disabled: true
    },
        value => value,
        undefined,
        element => element.value
    );

    window.splus.Logger.debug("Finished loading preload.js");
    window.splusLoaded.add("preload");
})();
