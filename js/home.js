(async function () {
    // Wait for loader.js to finish running
    while (!window.splusLoaded) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    await loadDependencies("home", ["all"]);
})();
 
 function indicateSubmittedAssignments() {
     let upcomingList = document.querySelector(".upcoming-events .upcoming-list");
     const completionOverridesSetting = "assignmentCompletionOverrides";
     const assignCompleteClass = "splus-assignment-complete";
     const assignIncompleteClass = "splus-assignment-notcomplete";

     // checks on the backend if an assignment is complete (submitted)
     // does not check user overrides
     async function isAssignmentCompleteAsync(assignmentId) {
         if (assignmentId == null) {
             return false;
         }
         try {
             let revisionData = await fetchApiJson(`dropbox/${assignmentId}/${getUserId()}`);
             let revisions = revisionData.revision;

             return !!(revisions && revisions.length && !revisions[revisions.length - 1].draft);
         } catch (err) {
             Logger.warn(`Couldn't determine if assignment ${assignmentId} was complete. This is likely not a normal assignment.`);
             return false;
         }
     }

     // checks user override for assignment completion
     function isAssignmentMarkedComplete(assignmentId) {
         return !!Setting.getNestedValue(completionOverridesSetting, assignmentId);
     }

     function setAssignmentCompleteOverride(assignmentId, isComplete) {
         isComplete = !!isComplete;

         let overrides = Setting.getValue(completionOverridesSetting);

         if (!overrides && !isComplete) return;
         else if (!overrides) overrides = {};

         if (!isComplete) {
             delete overrides[assignmentId];
         } else {
             overrides[assignmentId] = isComplete;
         }

         Setting.setValue(completionOverridesSetting, overrides);
     }

     function createAssignmentSubmittedCheckmarkIndicator(eventElement, assignmentId) {
         let elem = document.createElement("button");
         elem.classList.add("splus-completed-check-indicator");
         elem.addEventListener("click", function () {
             // if we're "faux-complete" and clicked, unmark the forced state
             if (eventElement.classList.contains(assignCompleteClass) && isAssignmentMarkedComplete(assignmentId)) {
                 eventElement.classList.remove(assignCompleteClass);
                 setAssignmentCompleteOverride(assignmentId, false);
                 trackEvent("splus-completed-check-indicator", "uncheck", "Checkmarks");
                 // TODO handle async nicely
                 processAssignmentUpcomingAsync(eventElement);
                 // if we're incomplete and click, force the completed state
             } else if (eventElement.classList.contains(assignIncompleteClass)) {
                 eventElement.classList.remove(assignIncompleteClass);
                 trackEvent("splus-completed-check-indicator", "check", "Checkmarks");
                 setAssignmentCompleteOverride(assignmentId, true);
                 // TODO handle async nicely
                 processAssignmentUpcomingAsync(eventElement);
             }
         });
         return elem;
     }

     // returns assignment ID for convenience
     async function processAssignmentUpcomingAsync(eventElement) {
         let infotipElement = eventElement.querySelector(".infotip, .singleday");
         let assignmentElement = infotipElement.querySelector("a[href]");

         // TODO errorcheck the assignmentId match
         let assignmentId = null;
         if (assignmentElement.href.includes("/assignment/")) {
             assignmentId = assignmentElement.href.match(/assignment\/(\d+)/)[1];
         } else if (assignmentElement.href.includes("/course/")) {
             // Discussion boards, maybe other assignments as well
             assignmentId = assignmentElement.href.match(/course\/\d+\/.*\/(\d+)/)[1];
         } else if (assignmentElement.href.includes("/event/")) {
             // Calendar events
             assignmentId = assignmentElement.href.match(/event\/(\d+)/)[1];
         } else if (assignmentElement.href.includes("/external_tool/")) {
             // External tools
             assignmentId = assignmentElement.href.match(/external_tool\/(\d+)/)[1];
         }

         // add a CSS class for both states, so we can distinguish 'loading' from known-(in)complete
         let isMarkedComplete = isAssignmentMarkedComplete(assignmentId);
         if (isMarkedComplete || await isAssignmentCompleteAsync(assignmentId)) {
             Logger.log(`Marking assignment ${assignmentId} as complete ✔ (is force-marked complete? ${isMarkedComplete})`);
             eventElement.classList.add(assignCompleteClass);
         } else {
             eventElement.classList.add(assignIncompleteClass);
             Logger.log(`Assignment ${assignmentId} is not submitted`);
         }

         if (!eventElement.querySelector(".splus-completed-check-indicator")) {
             infotipElement.insertAdjacentElement(infotipElement.classList.contains("singleday") ? "afterbegin" : "afterend", createAssignmentSubmittedCheckmarkIndicator(eventElement, assignmentId));
         }

         return assignmentId;
     }

     // Indicate submitted assignments in Upcoming
     async function indicateSubmitted() {
         Logger.log("Checking to see if upcoming assignments are submitted");
         let idSet = new Set();
         for (let upcomingList of document.querySelectorAll(".upcoming-list")) {
             switch (Setting.getValue("indicateSubmission")) {
                 case "disabled":
                     break;
                 case "strikethrough":
                     upcomingList.classList.add("splus-mark-completed-strikethrough");
                     break;
                 case "hide":
                     upcomingList.classList.add("splus-mark-completed-hide");
                     break;
                 case "check":
                 default:
                     upcomingList.classList.add("splus-mark-completed-check");
                     break;
             }

             let upcomingEventElements = upcomingList.querySelectorAll(".upcoming-event:not(.upcoming-subevents-block)");

             for (let eventElement of upcomingEventElements) {
                 try {
                     idSet.add(await processAssignmentUpcomingAsync(eventElement));
                 }
                 catch (err) {
                     Logger.error(`Failed checking assignment '${eventElement.querySelector(".infotip a[href]")?.href}' : `, err);
                 }
             }
         }

         // check if reload is present and visible on page
         let reloadButton = upcomingList.querySelector("button.button-reset.refresh-button");
         if (reloadButton && reloadButton.offsetParent !== null) {
             reloadButton.addEventListener("click", () => setTimeout(indicateSubmitted, 500));
         } else {
             // loaded properly
             // clear out old assignments from local cache which aren't relevant anymore
             let overrides = Setting.getValue(completionOverridesSetting);

             if (overrides) {
                 for (var key in overrides) {
                     if (overrides.hasOwnProperty(key) && !idSet.has(key)) {
                         delete overrides[key];
                     }
                 }
                 Setting.setValue(completionOverridesSetting, overrides);
                 Logger.info("Done clearing old overrides");
             }
         }
     }

     setTimeout(indicateSubmitted, 1000);
 }

/** @typedef {{id:number,title:string,message:string,timestamp?:Date,icon?:string}} Broadcast */

let homeFeedContainer = document.getElementById("home-feed-container");
let feed = homeFeedContainer && homeFeedContainer.querySelector(".feed .item-list .s-edge-feed");

/**
 * Creates a post from a broadcast
 * @param {Broadcast} broadcast 
 */
function postFromBroadcast(broadcast) {
    let element = createElement("li", ["splus-broadcast-post"], { id: `broadcast${broadcast.id}`, timestamp: (broadcast.timestamp ? new Date(broadcast.timestamp).getTime() : Date.now()) / 1000 }, [
        createElement("div", ["s-edge-type-update-post", "sUpdate-processed"], {}, [
            createElement("div", ["edge-item"], {}, [
                createElement("div", ["edge-left"], {}, [
                    createElement("div", ["picture"], {}, [
                        createElement("a", ["sExtlink-processed"], { href: "", title: "Schoology Plus Broadcast" }, [
                            createElement("div", ["profile-picture-wrapper"], {}, [
                                createElement("div", ["profile-picture"], {}, [
                                    createElement("img", ["imagecache", "imagecache-profile_sm"], { src: chrome.runtime.getURL("imgs/icon@128.png"), alt: "Schoology Plus Logo" })
                                ])
                            ])
                        ])
                    ])
                ]),
                createElement("div", ["edge-main-wrapper"], {}, [
                    createElement("span", ["edge-sentence"], {}, [
                        createElement("div", ["update-sentence-inner"], {}, [
                            createElement("a", ["sExtlink-processed"], { textContent: "SCHOOLOGY PLUS" }),
                            createElement("span", ["blue-arrow-right"], {}, [
                                createElement("span", ["visually-hidden"], { textContent: "posted to" })
                            ]),
                            createElement("a", ["sExtlink-processed"], { textContent: "Schoology Plus Announcements" }),
                            createElement("span", ["splus-broadcast-close"], { textContent: "×", title: "Dismiss notification", onclick: () => trackEvent(`broadcast${broadcast.id}`, "close", "Broadcast") }),
                            createElement("span", ["update-body", "s-rte"], {}, [
                                createElement("p", ["no-margins"], {}, [
                                    createElement("strong", ["splus-broadcast-title"], { innerHTML: broadcast.title })
                                ]),
                                createElement("p", ["small-top-margin"], { innerHTML: broadcast.message })
                            ])
                        ])
                    ]),
                    createElement("span", ["edge-main"], {}, [
                        createElement("div", ["post-body"])
                    ]),
                    createElement("div", ["edge-footer"], {}, [
                        createElement("div", ["created"], {}, [
                            createElement("span", ["small", "gray"], { textContent: `${formatDateAsString(new Date(broadcast.timestamp || undefined))} | This post is pinned to the top` })
                        ])
                    ])
                ])
            ])
        ])
    ]);

    let arrow = element.querySelector(".blue-arrow-right");
    arrow.insertAdjacentText("beforebegin", " ");
    arrow.insertAdjacentText("afterend", " ");

    let closeButton = element.querySelector(".splus-broadcast-close");
    closeButton.dataset.broadcastId = broadcast.id;
    closeButton.addEventListener("click", dismissNotification);

    return element;
}

function dismissNotification(event) {
    let id = event.target.dataset.broadcastId;
    let unreadBroadcasts = Setting.getValue("unreadBroadcasts");
    unreadBroadcasts.splice(unreadBroadcasts.findIndex(x => x.id == id), 1);
    Setting.setValue("unreadBroadcasts", unreadBroadcasts);
    document.getElementById(`broadcast${id}`).outerHTML = "";
}

function formatDateAsString(date) {
    return `${date.toLocaleString("en-US", { weekday: "short" })} ${date.toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${date.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()}`;
}

if (homeFeedContainer && Setting.getValue("broadcasts") !== "disabled") {
    (function () {
        let observer = new MutationObserver(function (mutations) {
            if (mutations.length == 0) {
                return;
            }

            // we Should only be observing changes to style on homeFeedContainer
            // style is set on homeFeedContainer whenever Schoology decides to unhide it (static CSS sets display: none), i.e. when it's finished loading
            // once this happens, we can do our thing

            for (let broadcast of Setting.getValue("unreadBroadcasts") || []) {
                feed.insertAdjacentElement("afterbegin", postFromBroadcast(broadcast));
            }

            // then disconnect
            observer.disconnect();
        });

        observer.observe(homeFeedContainer, {
            attributes: true,
            attributeFilter: ["style"]
        });
    })();
}

(function () {
    indicateSubmittedAssignments();
    createQuickAccess();
})();

Logger.debug("Finished loading home.js");
