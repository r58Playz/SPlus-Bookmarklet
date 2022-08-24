// non-extension impl of chrome.storage and chrome.runtime
const c_storage = {
}

let SPLUS_EXT_API_localStorage = window.localStorage;
const c_s_sync = {
    get(toGet, callback) {
        console.log("Redirected chrome.storage.get");
        var archive = {},
            keys = Object.keys(SPLUS_EXT_API_localStorage),
            i = keys.length;

        while ( i-- ) {
            archive[ keys[i] ] = SPLUS_EXT_API_localStorage.getItem( keys[i] );
        }
        callback(archive);
    },
    set(toSet, callback) {
        console.log("Redirected chrome.storage.set");
        f
    }
}
function c_r_getManifest() {
    return {'version_name': 'Bookmarklet (7.4.2)'}
}
function c_r_getURL() {
    console.log("Redirected chrome.runtime.getURL");
}
chrome.storage = c_storage;
chrome.storage.sync = c_s_sync;
chrome.runtime.getManifest = c_r_getManifest;
chrome.runtime.getURL = c_r_getURL;

createElement = document.createElement;
