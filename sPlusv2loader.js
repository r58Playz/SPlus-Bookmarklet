(async function () {
    // +++++++++++++++++++++++++++++++++++++++++++++ CONFIG +++++++++++++++++++++++++++++++++++++++++++++++++
    // Where this script is hosted. used to properly inject extension's files
    var SPLUSbase_url = 'https://splus.r58playz.ml/' /*'http://localhost:8080/'*/ /*'https://8080-r58playz-splusbookmarkl-0tqywk20cc2.ws-us63.gitpod.io/'*/;
    // Where extension API stubs are defined.
    var SPLUSext_apis_file = "js/extension-apis.js"

    var notifdiv = document.createElement('div');
    notifdiv.style.setProperty("z-index", "99999");
    notifdiv.style.setProperty("position", "absolute");
    notifdiv.style.setProperty("bottom", "0.5em");
    notifdiv.style.setProperty("left", "1em");
    notifdiv.style.setProperty("background-color", "#ffffff");
    notifdiv.style.setProperty("color", "#000000");
    notifdiv.style.setProperty("transform", "translate(0%, -100%);");
    notifdiv.innerHTML = "Loading Schoology Plus...";
    notifdiv.id = "SPLUS_NOTIF_DIV";
    document.body.appendChild(notifdiv);

    function SPLUSglob(pattern, input) {
        var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|\/-])/g, "\\$1").replace(/\*/g, '.*'));
        return re.test(input);
    }

    function logInjectStatus(toLog) {
        console.log(toLog);
        notifdiv.innerHTML = toLog;
    }


    var SPLUScontent_scripts = [
        {
            "matches": [
                "https://lms.lausd.net/*",
                "https://*.schoology.com/*"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "css/all.css",
                "css/modern/all.css"
            ],
            "js": [
                "js/predefs.js",
                "js/loader.js",
                "js/icons.js",
                "js/default-themes.js",
                "js/theme.js",
                "js/preload.js"
            ],
            "run_at": "document_start"
        },
        {
            "matches": [
                "https://lms.lausd.net/*",
                "https://*.schoology.com/*"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "lib/css/contextmenu.css",
                "lib/css/iziToast.min.css"
            ],
            "js": [
                "lib/js/jquery-3.3.1.min.js",
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
                "https://lms.lausd.net/grades/grades*",
                "https://lms.lausd.net/course/*/student_grades",
                "https://*.schoology.com/grades/grades*",
                "https://*.schoology.com/course/*/student_grades"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "https://lms.lausd.net/course/*/materials*",
                "https://*.schoology.com/course/*/materials*"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "https://lms.lausd.net/",
                "https://lms.lausd.net/home",
                "https://lms.lausd.net/home#*",
                "https://lms.lausd.net/home/recent-activity*",
                "https://lms.lausd.net/home/course-dashboard*",
                "https://*.schoology.com/",
                "https://*.schoology.com/home",
                "https://*.schoology.com/home#*",
                "https://*.schoology.com/home/recent-activity*",
                "https://*.schoology.com/home/course-dashboard*"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "js/home.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "https://lms.lausd.net/course/*",
                "https://*.schoology.com/course/*"
            ],
            "js": [
                "js/course.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "https://lms.lausd.net/api",
                "https://lms.lausd.net/api/*",
                "https://*.schoology.com/api",
                "https://*.schoology.com/api/*"
            ],
            "js": [
                "js/api-key.js"
            ],
            "run_at": "document_end"
        },
        {
            "matches": [
                "https://lms.lausd.net/user/*",
                "https://*.schoology.com/user/*"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "https://lms.lausd.net/assignment/*/assessment",
                "https://*.schoology.com/assignment/*/assessment"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "https://lms.lausd.net/page/*",
                "https://*.schoology.com/page/*"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "https://lms.lausd.net/courses*",
                "https://lms.lausd.net/courses/*",
                "https://*.schoology.com/courses*",
                "https://*.schoology.com/courses/*"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "https://lms.lausd.net/*",
                "https://*.schoology.com/*"
            ],
            "exclude_matches": [
                "https://*.schoology.com/login*",
                "https://*.schoology.com/register*",
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
                "js/all-idle.js"
            ],
            "run_at": "document_idle"
        }
    ];
    // ext apis
    var SPLUSextApijsUrl = SPLUSbase_url + SPLUSext_apis_file;
    // inject
    var SPLUSextApiscriptTag = document.createElement('script');
    logInjectStatus("SPLUSLoader: Downloading extension apis");
    var SPLUSextApifetchResponse = await fetch(SPLUSextApijsUrl);
    SPLUSextApifetchText = await SPLUSextApifetchResponse.text();
    SPLUSextApiscriptTag.innerHTML = SPLUSextApifetchText;
    document.querySelector('head').appendChild(SPLUSextApiscriptTag);
    logInjectStatus("SPLUSLoader: Injected extension apis");

    var SPLUSscripts_injected = [];

    for (const SPLUScontent_script of SPLUScontent_scripts) {
        // matches
        let SPLUSmatches = SPLUScontent_script.matches;
        if (SPLUSmatches == undefined) {
            alert("Malformed content script.");
            continue;
        }
        // exclude_matches
        let SPLUSexclude_matches = SPLUScontent_script.exclude_matches;
        var SPLUScurrentAddress = window.location.href;
        if (typeof SPLUSloaderAddressOverride != 'undefined') {
            SPLUScurrentAddress = SPLUSloaderAddressOverride;
        }
        let SPLUScurrentAddressMatches = false;
        let SPLUScurrentAddressIsExcluded = false;
        // check matches
        for (const SPLUSaddress of SPLUSmatches) {
            let SPLUSaddressMatches = SPLUSglob(SPLUSaddress, SPLUScurrentAddress);
            console.debug("SPLUSLoader: current address (" + SPLUScurrentAddress + ") " + (SPLUSaddressMatches ? "matches" : "does not match") + " the glob " + SPLUSaddress);
            if (!SPLUScurrentAddressMatches) {
                SPLUScurrentAddressMatches = SPLUSaddressMatches;
            }
        }
        if (SPLUSexclude_matches != undefined) {
            for (const SPLUSaddress of SPLUSexclude_matches) {
                let SPLUSaddressMatches = SPLUSglob(SPLUSaddress, SPLUScurrentAddress);
                console.debug("SPLUSLoader: current address (" + SPLUScurrentAddress + ") " + (SPLUSaddressMatches ? "is excluded by" : "is not excluded by") + " the glob " + SPLUSaddress);
                if (!SPLUScurrentAddressIsExcluded) {
                    SPLUScurrentAddressIsExcluded = SPLUSaddressMatches;
                }
            }
        }
        if (!SPLUScurrentAddressMatches || SPLUScurrentAddressIsExcluded) {
            console.debug("SPLUSLoader: current address matches: " + SPLUScurrentAddressMatches + " is excluded: " + SPLUScurrentAddressIsExcluded);
            continue;
        }
        // js
        let SPLUSjsFiles = SPLUScontent_script.js;
        if (SPLUSjsFiles != undefined) {
            for (const SPLUSjsFile of SPLUSjsFiles) {
                if (!SPLUSscripts_injected.includes(SPLUSjsFile)) {
                    SPLUSscripts_injected.push(SPLUSjsFile);
                    var SPLUSjsUrl = SPLUSbase_url + SPLUSjsFile;
                    // inject
                    var SPLUSscriptTag = document.createElement('script');
                    console.debug("SPLUSLoader: Downloading file at " + SPLUSjsUrl);
                    notifdiv.innerHTML = "SPLUSLoader: DLing " + SPLUSjsFile
                    var SPLUSfetchResponse = await fetch(SPLUSjsUrl);
                    SPLUSfetchText = await SPLUSfetchResponse.text();
                    SPLUSscriptTag.innerHTML = SPLUSfetchText;
                    document.querySelector('head').appendChild(SPLUSscriptTag);
                    console.log("SPLUSLoader: Injected file at " + SPLUSjsUrl);
                    notifdiv.innerHTML = "SPLUSLoader: Injected " + SPLUSjsFile
                } else {
                    console.log("SPLUSLoader: Skipped file at " + SPLUSjsUrl + " because it is already loaded");
                    notifdiv.innerHTML = "SPLUSLoader: Skipped " + SPLUSjsFile
                }
            }
        }
        // css
        let SPLUScssFiles = SPLUScontent_script.css;
        if (SPLUScssFiles != undefined) {
            for (const SPLUScssFile of SPLUScssFiles) {
                var SPLUScssUrl = SPLUSbase_url + SPLUScssFile
                // inject
                var SPLUSstyleTag = document.createElement('style');
                console.debug("SPLUSLoader: Downloading file at " + SPLUScssUrl);
                notifdiv.innerHTML = "SPLUSLoader: DLing " + SPLUScssFile
                var SPLUSfetchResponse = await fetch(SPLUScssUrl);
                SPLUSfetchText = await SPLUSfetchResponse.text();
                SPLUSstyleTag.innerHTML = SPLUSfetchText;
                document.querySelector('head').appendChild(SPLUSstyleTag);
                console.log("SPLUSLoader: Injected file at " + SPLUScssUrl);
                notifdiv.innerHTML = "SPLUSLoader: Injected " + SPLUScssFile
            }
        }
        notifdiv.innerHTML = "Loaded S+! bye bye";
        setTimeout(function () {
            notifdiv.remove();
        }, (1000));
    }
})();
