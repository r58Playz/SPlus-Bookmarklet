(async ()=>{
  const contentScripts = [
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
  ];

  if(window.splusLoaded) return;
  if (window.location.pathname.includes("ReaderControl.html") ||
    window.location.pathname.includes("session-tracker.html")
  ) return;

  const baseUrl = (new URL(window.sPlusBookmarkletSourcePath)).origin + "/";
  const extApisFile = "js/extension-apis.js"

  const glob = (pattern, input) => {
    var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|\/-])/g, "\\$1").replace(/\*/g, '.*'));
    return re.test(input);
  }

  async function cachingFetch(url) {
    let data = JSON.parse(localStorage.getItem("splus-loader")) || {cache: {}};
    if (btoa(url) in data.cache) {
      const updatedDate = Date.parse(data.cache[btoa(url)].lastUpdated);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if(updatedDate > sevenDaysAgo) {
        return data.cache[btoa(url)].data;
      }
    }
    const resp = await fetch(url, {cache: "no-store"}).then(r=>r.text());
    data.cache[btoa(url)] = {data: resp, lastUpdated: (new Date()).toISOString()};
    localStorage.setItem("splus-loader", JSON.stringify(data));
    return resp;
  }

  const log = (str) => {console.debug(str)}

  let injectedScripts = [];
  let cssToInject = [];
  let jsToDefer = [];
  let parsingFinished = false;
  let domContentLoaded = false;
  let startedInjecting = false;
  let deferredInjected = false;
  let injectHtml = false;

  function injectDeferred(cssArr, jsArr) {
    for (const css of cssArr) {
      const el = document.createElement("style");
      el.setAttribute("splus-bookmarket", ":3");
      el.innerHTML = css;
      document.head.appendChild(el);
    }
    for (const js of jsArr) {
      eval?.(js);
    }
  }

  async function themeEditorHack() {
    if(injectHtml) {
      document.write(await cachingFetch(baseUrl+injectHtml.injectHtml));
      await injectContentScript(injectHtml);
    }
  }

  async function injectContentScript(contentScript) {
    if(contentScript.js) {
      for(const js of contentScript.js) {
        if(!injectedScripts.includes(js)) {
          injectedScripts.push(js);
          const code = await cachingFetch(baseUrl+js)
          if(contentScript.run_at === "document_start") {
            eval?.(code);
          } else {
            jsToDefer.push(code);
          }
        }
      }
    }
    if(contentScript.css) {
      for(const css of contentScript.css) {
        cssToInject.push(await cachingFetch(baseUrl+css));
      }
    }
  }

  window.addEventListener("DOMContentLoaded", async ()=>{
    domContentLoaded = true;
    startedInjecting = true;
    if(parsingFinished) {
      await themeEditorHack();
      injectDeferred(cssToInject, jsToDefer);
      deferredInjected = true;
    }
  })

  eval?.(await cachingFetch(baseUrl+extApisFile));

  for (const contentScript of contentScripts) {
    // matches
    const matches = contentScript.matches;
    if(!matches) {
      console.error("Malformed content script.");
      continue;
    }
    const excludes = contentScript.exclude_matches;
    let urlMatches = false;
    let urlExcludes = false;
    for (const match of matches) {
      const matchMatches = glob(match, window.location.href);
      urlMatches = matchMatches ? true : urlMatches;
      log(`urlMatches? ${urlMatches} glob = ${match}`);
    }
    if(excludes) {
      for (const exclude of excludes) {
        const excludeMatches = glob(exclude, window.location.href); 
        urlExcludes = excludeMatches ? true : urlExcludes;
        log(`urlExcludes? ${urlExcludes} glob = ${exclude}`);
      }
    }
    if(urlMatches && !urlExcludes) {
      if(contentScript.injectHtml) {
        injectHtml = contentScript;
        break;
      }
      await injectContentScript(contentScript);
    }
  }
  parsingFinished = true;
  if(domContentLoaded && !startedInjecting && !deferredInjected) {
    await themeEditorHack();
    injectDeferred(cssToInject, jsToDefer);
  }
})();
