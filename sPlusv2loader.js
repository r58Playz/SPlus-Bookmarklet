(async function () {
    if(window.splusLoaded) return;
    if (window.location.pathname.includes("ReaderControl.html") ||
        window.location.pathname.includes("session-tracker.html")
    ) return;
    var scriptUrl = new URL(document.currentScript.src);
    var base_url = scriptUrl.origin + '/';
    window.sPlusBookmarkletSourcePath = base_url;
    // Where extension API stubs are defined
    var ext_apis_file = "js/extension-apis.js"
    
    // skid detection code used to be here but eh anyone can use it now
    function setupNotifDiv() {
        var notifdiv = document.createElement('div');
        notifdiv.style.setProperty("z-index", "99999");
        notifdiv.style.setProperty("position", "fixed");
        notifdiv.style.setProperty("bottom", "0.5em");
        notifdiv.style.setProperty("right", "1em");
        notifdiv.style.setProperty("background-color", "#ffffff");
        notifdiv.style.setProperty("color", "#000000");
        notifdiv.style.setProperty("transform", "translate(0%, -100%);");
        notifdiv.innerHTML = "Loading Schoology Plus...";
        notifdiv.id = "SPLUS_NOTIF_DIV";
        document.body.appendChild(notifdiv);
        return notifdiv;
    }
    var notifdiv = setupNotifDiv();
    var cLog = console.log.bind(window.console, "%c+", lp());
    var cDebug = console.debug.bind(window.console, "%c+", lp());
    function lp() {
        return `color:#FFA500;border:1px solid #2A2A2A;border-radius:100%;font-size:14px;font-weight:bold;padding: 0 4px 0 4px;background-color:#2A2A2A`;
    }

    function glob(pattern, input) {
        var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|\/-])/g, "\\$1").replace(/\*/g, '.*'));
        return re.test(input);
    }

    function logInjectStatus(toLog) {
        cLog(toLog);
        notifdiv.innerHTML = toLog;
    }


    var content_scripts = [
        {
            "matches": [
                "*://lms.lausd.net/*",
                "*://*.schoology.com/*"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*",
                "*://*.schoology.com/sPlusBookmarklet*",
                "*://lms.lausd.net/sPlusBookmarklet*",
            ],
            "css": [
                "css/all.css",
                "css/modern/all.css"
            ],
            "js": [
                "js/loader.js",
                "js/settings.js",
                "js/icons.js",
                "js/default-themes.js",
                "js/theme.js",
                "js/preload.js"
            ],
            "run_at": "document_start"
        },
        {
            "matches": [
                "*://lms.lausd.net/*",
                "*://*.schoology.com/*"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*",
                "*://*.schoology.com/sPlusBookmarklet*",
                "*://lms.lausd.net/sPlusBookmarklet*",
            ],
            "css": [
                "lib/css/contextmenu.css",
                "lib/css/iziToast.min.css",
                "lib/css/jquery-ui.min.css"
            ],
            "js": [
                "lib/js/jquery-3.3.1.min.js",
                "lib/js/jquery-ui.min.js",
                "lib/js/contextmenu.js",
                "lib/js/iziToast.min.js",
                "js/version-specific.js",
                "js/all.js",
                "lib/js/findAndReplaceDOMText.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/grades/grades*",
                "*://lms.lausd.net/course/*/student_grades",
                "*://*.schoology.com/grades/grades*",
                "*://*.schoology.com/course/*/student_grades"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*"
            ],
            "css": [
                "css/grades.css"
            ],
            "js": [
                "js/grades.js",
                "js/course.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/course/*/materials*",
                "*://*.schoology.com/course/*/materials*"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*"
            ],
            "css": [
                "css/materials.css"
            ],
            "js": [
                "lib/js/pdf.js",
                "lib/js/jquery-3.3.1.min.js",
                "lib/js/jquery-migrate-3.0.1.js",
                "lib/js/jquery.tipsy.js",
                "js/materials.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/",
                "*://lms.lausd.net/home",
                "*://lms.lausd.net/home#*",
                "*://lms.lausd.net/home/recent-activity*",
                "*://lms.lausd.net/home/course-dashboard*",
                "*://*.schoology.com/",
                "*://*.schoology.com/home",
                "*://*.schoology.com/home#*",
                "*://*.schoology.com/home/recent-activity*",
                "*://*.schoology.com/home/course-dashboard*"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*",
                "*://*.schoology.com/sPlusBookmarklet*",
                "*://lms.lausd.net/sPlusBookmarklet*",
            ],
            "js": [
                "js/course.js",
                "js/home.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/course/*",
                "*://*.schoology.com/course/*"
            ],
            "js": [
                "js/course.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/api",
                "*://lms.lausd.net/api/*",
                "*://*.schoology.com/api",
                "*://*.schoology.com/api/*"
            ],
            "js": [
                "js/api-key.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/user/*",
                "*://*.schoology.com/user/*"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*"
            ],
            "js": [
                "js/user.js"
            ],
            "css": [
                "css/user.css"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/assignment/*/assessment",
                "*://*.schoology.com/assignment/*/assessment"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*"
            ],
            "js": [
                "js/assessment.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/page/*",
                "*://*.schoology.com/page/*"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*"
            ],
            "js": [
                "js/page.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/courses*",
                "*://lms.lausd.net/courses/*",
                "*://*.schoology.com/courses*",
                "*://*.schoology.com/courses/*"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*"
            ],
            "js": [
                "js/course.js",
                "js/courses.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "*://lms.lausd.net/*",
                "*://*.schoology.com/*"
            ],
            "exclude_matches": [
                "*://*.schoology.com/login*",
                "*://*.schoology.com/register*",
                "*://asset-cdn.schoology.com/*",
                "*://developer.schoology.com/*",
                "*://support.schoology.com/*",
                "*://info.schoology.com/*",
                "*://files-cdn.schoology.com/*",
                "*://status.schoology.com/*",
                "*://ui.schoology.com/*",
                "*://www.schoology.com/*",
                "*://api.schoology.com/*",
                "*://developers.schoology.com/*",
                "*://schoology.com/*",
                "*://support.schoology.com/*",
                "*://*.schoology.com/sPlusBookmarklet*",
                "*://lms.lausd.net/sPlusBookmarklet*",
            ],
            "js": [
                "js/all-idle.js"
            ],
            "run_at": "document_idle"
        },
        {
            "matches": [
                "*://*.schoology.com/sPlusBookmarklet*",
                "*://lms.lausd.net/sPlusBookmarklet*",
            ],
            "js": [
                "lib/js/jquery-3.3.1.min.js",
                "lib/js/spectrum.js",
                "lib/js/materialize.min.js",
                "lib/js/jquery-ui.min.js",
                "lib/js/roundslider.min.js",
                "js/loader.js",
                "js/settings.js",
                "js/icons.js",
                "js/theme-model.js",
                "js/default-themes.js",
                "js/theme-editor.js"
            ],
            "css": [
                "lib/css/material-icons.css",
                "lib/css/materialize.min.css",
                "lib/css/jquery-ui.min.css",
                "lib/css/spectrum.css",
                "lib/css/roundslider.min.css",
                "css/theme-editor.css",
                "css/modern/theme-editor.css"
            ],
            "injectHtml": "theme-editor.html"
        }
    ];
    // ext apis
    var extApijsUrl = base_url + ext_apis_file;
    // inject
    var extApiscriptTag = document.createElement('script');
    logInjectStatus("Downloading extension apis");
    var extApifetchResponse = await fetch(extApijsUrl);
    extApifetchText = await extApifetchResponse.text();
    extApiscriptTag.innerHTML = extApifetchText;
    document.querySelector('head').appendChild(extApiscriptTag);
    logInjectStatus("Injected extension apis");

    var scripts_injected = [];

    for (const content_script of content_scripts) {
        // matches
        let matches = content_script.matches;
        if (matches == undefined) {
            alert("Malformed content script.");
            continue;
        }
        // exclude_matches
        let exclude_matches = content_script.exclude_matches;
        var currentAddress = window.location.href;
        if (typeof loaderAddressOverride != 'undefined') {
            currentAddress = loaderAddressOverride;
        }
        let currentAddressMatches = false;
        let currentAddressIsExcluded = false;
        // check matches
        for (const address of matches) {
            let addressMatches = glob(address, currentAddress);
            cDebug("current address: '" + currentAddress + "' matches: " + addressMatches + " glob: " + address);
            if (!currentAddressMatches) {
                currentAddressMatches = addressMatches;
            }
        }
        if (exclude_matches != undefined) {
            for (const address of exclude_matches) {
                let addressMatches = glob(address, currentAddress);
                cDebug("current address: '" + currentAddress + "' excludes: " + addressMatches + " glob: "  + address);
                if (!currentAddressIsExcluded) {
                    currentAddressIsExcluded = addressMatches;
                }
            }
        }
        if (!currentAddressMatches || currentAddressIsExcluded) {
            cDebug("current address matches: " + currentAddressMatches + " is excluded: " + currentAddressIsExcluded);
            continue;
        }
        // replace html
        let htmlFile = content_script.injectHtml;
        if (htmlFile != undefined) {
            var htmlUrl = base_url + htmlFile;
            cDebug("downloading file at " + htmlUrl);
            notifdiv.innerHTML = "DLing " + htmlUrl;
            var fetchResponse = await fetch(htmlUrl);
            var fetchText = await fetchResponse.text();
            document.write(fetchText);
            cLog("Replaced HTML of page");
            notifdiv = setupNotifDiv();
            notifdiv.innerHTML = "Replaced content of page";
        }
        // js
        let jsFiles = content_script.js;
        if (jsFiles != undefined) {
            for (const jsFile of jsFiles) {
                if (!scripts_injected.includes(jsFile)) {
                    scripts_injected.push(jsFile);
                    var jsUrl = base_url + jsFile;
                    // inject
                    var scriptTag = document.createElement('script');
                    cDebug("Downloading file at " + jsUrl);
                    notifdiv.innerHTML = "DLing " + jsFile
                    var fetchResponse = await fetch(jsUrl);
                    fetchText = await fetchResponse.text();
                    scriptTag.innerHTML = fetchText;
                    document.querySelector('head').appendChild(scriptTag);
                    cLog("Injected file at " + jsUrl);
                    notifdiv.innerHTML = "Injected " + jsFile
                } else {
                    cLog("Skipped file at " + jsUrl + " because it is already loaded");
                    notifdiv.innerHTML = "Skipped " + jsFile
                }
            }
        }
        // css
        let cssFiles = content_script.css;
        if (cssFiles != undefined) {
            for (const cssFile of cssFiles) {
                var cssUrl = base_url + cssFile
                // inject
                var styleTag = document.createElement('style');
                cDebug("Downloading file at " + cssUrl);
                notifdiv.innerHTML = "DLing " + cssFile
                var fetchResponse = await fetch(cssUrl);
                fetchText = await fetchResponse.text();
                styleTag.innerHTML = fetchText;
                document.querySelector('head').appendChild(styleTag);
                cLog("Injected file at " + cssUrl);
                notifdiv.innerHTML = "Injected " + cssFile
            }
        }
        notifdiv.innerHTML = "Loaded S+! bye bye";
        setTimeout(function () {
            notifdiv.remove();
        }, (5000));
    }
})();
