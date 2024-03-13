// IMPORTANT!!!! SET THIS TO WHERE YOU ARE HOSTING THIS!!!!!
let SPlusStubs_hosting_url = window.sPlusBookmarkletSourcePath;

// non-extension impl of chrome.storage and chrome.runtime
const c_storage = {}

let SPLUS_EXT_API_localStorage = window.localStorage;
const c_s_sync = {
    get(toGet, callback) {
        console.debug("ExtAPIStubs: Redirected chrome.storage.sync.get");
        var archive = {},
            keys = Object.keys(SPLUS_EXT_API_localStorage),
            i = keys.length;

        while (i--) {
            let item = SPLUS_EXT_API_localStorage.getItem(keys[i])
            var parsedItem;
            try {
                parsedItem = JSON.parse(item);
            } catch (error) {
                parsedItem = item;
            }
            archive[keys[i]] = parsedItem;
        }
        if (toGet) {
            if (toGet.constructor == Object) {
                for (const [key, value] of Object.entries(toGet)) {
                    if (!(key in archive)) {
                        console.debug("ExtAPIStubs: chrome.storage.sync.get: Set provided default value for " + key + "to value: " + value);
                        archive[key] = value;
                    }
                }
            }
        }
        if (callback) callback(archive);
    },
    set(toSet, callback) {
        console.debug("ExtAPIStubs: Redirected chrome.storage.sync.set");
        for (const [key, value] of Object.entries(toSet)) {
            console.debug("ExtAPIStubs: setting key " + key + " to value: " + value);
            SPLUS_EXT_API_localStorage.setItem(key, JSON.stringify(value));
        }
        if (callback) callback();
    },
    remove(toSet, callback) {
        console.debug("ExtAPIStubs: Redirected chrome.storage.sync.remove");
        if (typeof toSet === 'string' || toSet instanceof String) {
            SPLUS_EXT_API_localStorage.removeItem(toSet);
        } else {
            for (const toRemove of toSet) {
                SPLUS_EXT_API_localStorage.removeItem(toRemove);
            }
        }
        if (callback) callback();
    }
}
// SET YOUR MANIFEST DATA HERE!
function c_r_getManifest() {
    return {
        'version_name': '6.0 (Bookmarklet) [S+ version 7.10]',
        'version': '7.10'
    }
}

function c_r_getURL(ext_url) {
    console.debug("ExtAPIStubs: Redirected chrome.runtime.getURL");
    return SPlusStubs_hosting_url + ext_url
}
chrome.storage = c_storage;
chrome.storage.sync = c_s_sync;
if (typeof chrome.runtime === 'undefined') {
    chrome.runtime = {};
}
chrome.runtime.getManifest = c_r_getManifest;
chrome.runtime.getURL = c_r_getURL;

function SPLUS_EXT_API_CALLBACK(request, sender, sendResponse) {
    if (request.type == "fetch" && request.url !== undefined) {
        window.splus.Logger.debug("Received fetch request for " + request.url);

        (async function() {
            let finalResponse = {};
            let responseObj;
            try {
                responseObj = await fetch(request.url, request.params);
            } catch (e) {
                finalResponse.success = false;
                finalResponse.error = e;
                return finalResponse;
            }

            finalResponse.success = true;

            finalResponse.headers = responseObj.headers;
            finalResponse.ok = responseObj.ok;
            finalResponse.redirected = responseObj.redirected;
            finalResponse.status = responseObj.status;
            finalResponse.statusText = responseObj.statusText;
            finalResponse.type = responseObj.type;
            finalResponse.url = responseObj.url;
            finalResponse.useFinalURL = responseObj.useFinalURL;

            try {
                switch (request.bodyReadType) {
                    case "json":
                        finalResponse.json = await responseObj.json();
                        break;
                    case "text":
                        finalResponse.text = await responseObj.text();
                        break;
                }
            } catch (e) {
                finalResponse.bodyReadError = e || true;
            }

            return finalResponse;
        })().then(x => sendResponse(JSON.stringify(x))).catch(err => sendResponse(JSON.stringify({
            success: false,
            error: err
        })));

        return true;
    }
}

function c_r_sendMessage(request, callback) {
    SPLUS_EXT_API_CALLBACK(request, 'ExtAPIStubs', callback);
}

chrome.runtime.sendMessage = c_r_sendMessage;


/**
 * Tracks an event using Google Analytics if the user did not opt out
 * NOTE: The Firefox version of the extension has no support for Google Analytics
 * @param {string} target (Event Category) The target of the event
 * @param {string} action (Event Action) The action of the event
 * @param {string} [label] (Event Label) Used to group related events
 * @param {number} [value] Numeric value associated with the event
 */
var trackEvent = function(target, action, label = undefined, value = undefined) {
    console.debug("[S+] Tracking disabled by user", {
        target,
        action,
        label,
        value
    });
};
