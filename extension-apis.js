// non-extension impl of chrome.storage and chrome.runtime
const c_storage = {
}
const c_s_sync = {
    get() {
         console.log("Redirected chrome.storage.get");
    },
    set() {
        console.log("Redirected chrome.storage.get");
    }
}
function c_r_getManifest() {
    return {'version_name': 'Bookmarklet (7.4.2)'};
}
function c_r_getURL() {
    console.log("Redirected chrome.runtime.getURL");
}
chrome.storage = c_storage;
chrome.storage.sync = c_s_sync;
chrome.runtime.getManifest = c_r_getManifest;
chrome.runtime.getURL = c_r_getURL;

createElement = document.createElement;
