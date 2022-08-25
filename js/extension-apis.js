// IMPORTANT!!!! SET THIS TO WHERE YOU ARE HOSTING THIS!!!!!
let SPlusStubs_hosting_url = 'https://splus-bookmarklet.vercel.app/' /*'http://localhost:8080/'*/ /*'https://8080-r58playz-splusbookmarkl-0tqywk20cc2.ws-us63.gitpod.io/'*/;

// non-extension impl of chrome.storage and chrome.runtime
const c_storage = {
}

let SPLUS_EXT_API_localStorage = window.localStorage;
const c_s_sync = {
    get(toGet, callback) {
        console.debug("SPlusStubs: Redirected chrome.storage.sync.get");
        var archive = {},
            keys = Object.keys(SPLUS_EXT_API_localStorage),
            i = keys.length;

        while ( i-- ) {
            let item = SPLUS_EXT_API_localStorage.getItem( keys[i] )
            var parsedItem;
            try {
                parsedItem = JSON.parse(item);
            } catch (error) {
                parsedItem = item;
            }
            archive[ keys[i] ] = parsedItem;
        }
        callback(archive);
    },
    set(toSet, callback) {
        console.debug("SPlusStubs: Redirected chrome.storage.sync.set");
        for (const [key, value] of Object.entries(toSet)) {
          console.debug("SPlusStubs: setting key " + key + "to value: "+value);
            SPLUS_EXT_API_localStorage.setItem(key, JSON.stringify(value));
        }
    },
    remove(toSet, callback) {
        console.debug("SPlusStubs: Redirected chrome.storage.sync.remove");
        if (typeof toSet === 'string' || toSet instanceof String) {
            SPLUS_EXT_API_localStorage.removeItem(toSet);
        } else {
            for (const toRemove of toSet) {
                SPLUS_EXT_API_localStorage.removeItem(toRemove);
            }
        }
    }
}
function c_r_getManifest() {
    return {'version_name': '3.0 (Bookmarklet) [S+ version 7.4.2]', 'version': '7.4.2'}
}
function c_r_getURL(ext_url) {
    console.debug("SPlusStubs: Redirected chrome.runtime.getURL");
    return SPlusStubs_hosting_url + ext_url
}
chrome.storage = c_storage;
chrome.storage.sync = c_s_sync;
chrome.runtime.getManifest = c_r_getManifest;
chrome.runtime.getURL = c_r_getURL;

createElement = document.createElement;
