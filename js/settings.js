(async function() {
    // Wait for loader.js to finish running
    while (!window.splusLoaded) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    await loadDependencies("settings", []);


    /**
     * Opens the modal with the given ID
     * @param {string} id The ID of the modal to open
     * @param {Object} [options] An optional options argument to be passed to the modal's open event
     */
    window.splus.openModal = function(id, options) {

        for (let m of window.splus.modals) {
            window.splus.modalClose(m.element);
        }

        trackEvent("perform_action", {
            id: "open",
            context: "Modal",
            value: id,
            legacyTarget: id,
            legacyAction: "open",
            legacyLabel: "Modal"
        });

        let mm = window.splus.modals.find(m => m.id == id);
        if (mm.onopen) mm.onopen(mm, options);
        mm.element.style.display = "block";
        document.documentElement.classList.add("splus-modal-open");
    }

    window.splus.modalClose = function(element) {
        element = element.target ? document.getElementById(element.target.dataset.parent) : element;

        if (element.id === "settings-modal" && element.style.display !== "none" && window.splus.Setting.anyModified()) {
            if (!confirm("You have unsaved settings.\nAre you sure you want to exit?")) return;
            window.splus.updateSettings();
        } else if (element.id === "choose-theme-modal" && element.style.display === "block" && !localStorage.getItem("splus-temp-theme-chosen")) {
            alert("Please use the 'Select' button to confirm your choice.");
            return;
        }

        element.style.display = "none";
        document.documentElement.classList.remove("splus-modal-open");
    }

    /**
     * Creates a Schoology Plus modal element
     * @param {string} id
     * @param {string} title
     * @param {HTMLElement} contentElement
     * @param {string} footerHTML
     * @param {(Modal,Object?)=>void} openCallback
     */
    window.splus.Modal = function(id, title, contentElement, footerHTML, openCallback) {
        let modalHTML = `<div id="${id}" class="splus-modal"><div class="splus-modal-content"><div class="splus-modal-header"><span class="close" data-parent="${id}">&times;</span>` +
            `<p class="splus-modal-title">${title}</p></div><div class="splus-modal-body"></div><div class="splus-modal-footer"><p class="splus-modal-footer-text">` +
            `${footerHTML}</p></div></div></div>`;

        document.body.appendChild(document.createElement("div")).innerHTML = modalHTML;

        this.id = id;
        this.element = document.getElementById(id);
        this.body = document.getElementById(id).querySelector(".splus-modal-body");
        this.onopen = openCallback;

        this.body.appendChild(contentElement);
    }

        /**
     * Returns the name of the current browser
     * @returns {"Chrome"|"Firefox"|"Other"} Name of the current browser
     */
    window.splus.getBrowser = function() {
        return "SPlus-Bookmarklet";
    }
     /**
     * @type {Object.<string,Setting>}
     */
    window.splus.__settings = {};

    window.splus.__storage = {};
    chrome.storage.sync.get(null, storageContents => {
        window.splus.__storage = storageContents;
    });

    /**
     * Creates a setting, appends it to the settings list
     * @param {string} name - The name of the setting, to be stored in extension settings
     * @param {string} friendlyName - The display name of the setting
     * @param {string} description - A description of the setting and appropriate values
     * @param {any} defaultValue - The default value of the setting
     * @param {string} type - Setting control type, one of ["number", "text", "button", "select"]
     * @param {Object|Object[]} options Additional options, format dependent on setting **type**
     * - **number, text, button**: Directly applied as element properties
     * - **select**: *options* property on `options` object should be an array of objects containing *text* and *value* properties
     * @param {function(any):any} onload Called with the setting's current value when the page is loaded and when the setting is changed
     * - *This function should return `undefined` or `null` when the setting's default value should be used*
     * @param {function(Event):void} onmodify Function called with the UI modification event when setting value is changed
     * - *Should be used to show how changing the setting affects the page if applicable*
     * @param {function(HTMLElement):any} onsave Function called when setting is saved
     * - First argument is the HTML element containing the setting value set by the user
     * - Must return the value to be saved to extension settings
     * - Will only be called if user saves settings and setting was modified
     * @param {function():any} onshown Function called when the setting element is shown on screen
     */
    window.splus.Setting = function(name, friendlyName, description, defaultValue, type, options, onload, onmodify, onsave, onshown) {
        this.name = name;
        this.getElement = () => document.getElementById(`setting-input-${this.name}`);
        this.onmodify = onmodify;
        this.onsave = onsave;
        this.onload = onload;
        this.onshown = onshown;
        this.modified = false;
        this.default = defaultValue;
        /**
         * Returns the element control to be used to edit the setting's value by the user
         * @returns {HTMLElement} A setting element
         */
        this.control = (() => {
            let setting = createElement("div", ["setting-entry"]);
            let title = createElement("h2", ["setting-title"], {
                textContent: friendlyName + ": "
            });
            let helpText = createElement("p", ["setting-description"], {
                innerHTML: description
            });

            switch (type) {
                case "number":
                case "text":
                case "button":
                    let inputElement = createElement("input", undefined, Object.assign({
                        type: type
                    }, options));
                    title.appendChild(inputElement);
                    if (type == "button") inputElement.onclick = window.splus.Setting.onModify;
                    else inputElement.oninput = window.splus.Setting.onModify;
                    break;
                case "select":
                    let selectElement = createElement("select");
                    for (let option of options.options) {
                        selectElement.appendChild(createElement("option", undefined, {
                            textContent: option.text,
                            value: option.value
                        }));
                    }
                    title.appendChild(selectElement);
                    selectElement.onchange = window.splus.Setting.onModify;
                    break;
                case "custom":
                    title.appendChild(options.element);
                    break;
            }

            setting.appendChild(title);
            setting.appendChild(helpText);

            title.firstElementChild.dataset.settingName = name;
            title.firstElementChild.id = `setting-input-${name}`

            if (!window.splus.__storage[name]) {
                window.splus.__storage[name] = defaultValue;
            }

            if (onload) {
                title.firstElementChild.value = this.onload(window.splus.__storage[name], title.firstElementChild) || this.default;
            } else {
                title.firstElementChild.value = window.splus.__storage[name] || this.default;
            }

            return setting;
        })();
        window.splus.__settings[name] = this;
    }

    /**
     * Saves modified settings to the Chrome Sync Storage
     * @param {Object.<string,any>} modifiedValues An object containing modified setting keys and values
     * @param {boolean} [updateButtonText=true] Change the value of the "Save Settings" button to "Saved!" temporarily
     * @param {()=>any} [callback=null] A function called after settings have been saved and updated
     * @param {boolean} [saveUiSettings=true] Whether or not to save modified settings from the UI as well as the passed dictionary.
     */
    window.splus.Setting.saveModified = function(modifiedValues, updateButtonText = true, callback = undefined, saveUiSettings = true) {
        let newValues = {};
        if (modifiedValues) {
            Object.assign(newValues, modifiedValues);
        }
        if (saveUiSettings) {
            for (let setting in window.splus.__settings) {
                let v = window.splus.__settings[setting];
                if (v.modified) {
                    let value = v.onsave(v.getElement());
                    newValues[setting] = value;
                    window.splus.__storage[setting] = value;
                    v.onload(value, v.getElement());
                    v.modified = false;
                }
            }
        }
        chrome.storage.sync.set(newValues, () => {
            for (let settingName in newValues) {
                let setting = window.splus.__settings[settingName];
                if (!setting) {
                    continue;
                }
                trackEvent(settingName, `set value: ${newValues[settingName]}`, "Setting");
                if (!setting.getElement()) {
                    continue;
                }
                let settingModifiedIndicator = setting.getElement().parentElement.querySelector(".setting-modified");
                if (settingModifiedIndicator) {
                    settingModifiedIndicator.remove();
                }
            }

            window.splus.updateSettings(callback);
        });

        if (updateButtonText) {
            let settingsSaved = document.getElementById("save-settings");
            settingsSaved.value = "Saved!";
            setTimeout(() => {
                settingsSaved.value = "Save Settings";
            }, 2000);
        }
    }

    /**
     * Deletes all settings from Chrome Sync Storage and the local `storage` object and reloads the page
     */
    window.splus.Setting.restoreDefaults = function() {
        if (confirm("Are you sure you want to delete all settings?\nTHIS CANNOT BE UNDONE")) {
            trackEvent("restore-defaults", "restore default values", "Setting");
            for (let setting in window.splus.__settings) {
                delete window.splus.__storage[setting];
                chrome.storage.sync.remove(setting);
                window.splus.__settings[setting].onload(undefined, window.splus.__settings[setting].getElement());
            }
            location.reload();
        }
    }

    /**
     * Exports settings to the clipboard in JSON format
     */
    window.splus.Setting.export = function() {
        trackEvent("button_click", {
            id: "export-settings",
            context: "Settings",
            legacyTarget: "export-settings",
            legacyAction: "export settings",
            legacyLabel: "Setting"
        });

        navigator.clipboard.writeText(JSON.stringify(window.splus.__storage, null, 2))
            .then(() => alert("Copied settings to clipboard!"))
            .catch(err => alert("Exporting settings failed!"));
    }

    /**
     * Import settings from clipboard in JSON format
     */
    window.splus.Setting.import = function() {
        trackEvent("button_click", {
            id: "import-settings-attempt",
            context: "Settings",
            legacyTarget: "import-settings",
            legacyAction: "attempt import settings",
            legacyLabel: "Setting"
        });
        if (confirm("Are you sure you want to import settings? Importing invalid or malformed settings will most likely break Schoology Plus.")) {
            let importedSettings = prompt("Please paste settings to import below:");

            try {
                let importedSettingsObj = JSON.parse(importedSettings);
                window.splus.Setting.setValues(importedSettingsObj, () => {
                    trackEvent("button_click", {
                        id: "import-settings-success",
                        context: "Settings",
                        legacyTarget: "import-settings",
                        legacyAction: "successfully imported settings",
                        legacyLabel: "Setting"
                    });
                    alert("Successfully imported settings. If Schoology Plus breaks, please restore defaults or reinstall. Reloading page.")
                    location.reload();
                });
            } catch (err) {
                alert("Failed to import settings! They were probably malformed. Make sure the settings are valid JSON.");
                return;
            }
        }
    }


    /**
     * Callback function called when any setting is changed in the settings menu
     * @param {Event} event Contains a `target` setting element
     */
    window.splus.Setting.onModify = function(event) {
        let element = event.target || event;
        let parent = element.parentElement;
        if (parent && !parent.querySelector(".setting-modified")) {
            parent.appendChild(createElement("span", ["setting-modified"], {
                textContent: " *",
                title: "This setting has been modified from its saved value"
            }));
        }
        let setting = window.splus.__settings[element.dataset.settingName];
        setting.modified = true;
        if (setting.onmodify) {
            setting.onmodify(event);
        }
    }

    window.splus.Setting.onShown = function() {
        for (let setting in window.splus.__settings) {
            if (window.splus.__settings[setting].onshown) {
                window.splus.__settings[setting].onshown();
            }
        }
    }

    /**
     * @returns {boolean} `true` if any setting has been modified
     */
    window.splus.Setting.anyModified = function() {
        for (let setting in window.splus.__settings) {
            if (window.splus.__settings[setting].modified) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the value of a setting in the cached copy of the
     * extension's synced storage. If `name` is the name of a `Setting`
     * and the cached storage has no value for that setting, the
     * default value of that setting will be returned instead (unless `defaultValue` is passed)
     * @param {string} name The name of the setting to retrieve
     * @param {any} defaultValue The default value to return if no value is specifically set
     * @returns {any} The setting's cached value, default value, or `defaultValue`
     */
    window.splus.Setting.getValue = function(name, defaultValue = undefined) {
        if (window.splus.__storage[name]) {
            return window.splus.__storage[name];
        } else if (window.splus.__settings[name] && !defaultValue) {
            return window.splus.__settings[name].default;
        }
        return defaultValue;
    }

    /**
     * Gets the value of a nested property in the cached copy of the
     * extension's synced storage.
     * @param {string} parent The name of the object in which to search for `key`
     * @param {string} key The key within `parent` containing the value
     * @param {any} defaultValue The default value to return if no value is found
     * @returns {any} The setting's cached value, default value, or `defaultValue`
     */
    window.splus.Setting.getNestedValue = function(parent, key, defaultValue = undefined) {
        if (window.splus.__storage[parent] && key in window.splus.__storage[parent]) {
            return window.splus.__storage[parent][key];
        }
        return defaultValue;
    }

    /**
     * Sets the value of a setting in the extension's synced storage
     * Even if `name` is the name of a `Setting`, that `Setting`'s `onmodify`
     * function will NOT be called.
     * @param {string} name The name of the setting to set the value of
     * @param {any} value The value to set
     * @param {()=>any} callback Function called after new value is saved
     */
    window.splus.Setting.setValue = function(name, value, callback = undefined) {
        window.splus.Setting.saveModified({
            [name]: value
        }, false, callback, false);

        if (name === "defaultDomain") {
            chrome.runtime.sendMessage({
                type: "updateDefaultDomain",
                domain: value
            });
        }
    }

    /**
     * Sets the value of a nested property in the extension's synced storage.
     * @param {string} parent The name of the object in which to place `key`
     * @param {string} key The key within `parent` in which to store the value
     * @param {any} value The value to set
     * @param {()=>any} callback Function called after new value is saved
     */
    window.splus.Setting.setNestedValue = function(parent, key, value, callback = undefined) {
        var currentValue = window.splus.Setting.getValue(parent, {});
        currentValue[key] = value;
        window.splus.Setting.saveModified({
            [parent]: currentValue
        }, false, callback, false);
    }

    /**
     * Sets the value of multiple settings in the extension's synced storage
     * Even if a dictionary key is the name of a `Setting`, that `Setting`'s `onmodify`
     * function will NOT be called.
     * @param {Object.<string,any>} dictionary Dictionary of setting names to values
     * @param {()=>any} callback Function called after new values are saved
     */
    window.splus.Setting.setValues = function(dictionary, callback = undefined) {
        window.splus.Setting.saveModified(dictionary, false, callback, false);
    }

    /**
     * Sets the value of a CSS variable on the document
     * @param {string} name Variable name
     * @param {string} val New variable value
     */
    window.splus.setCSSVariable = function(name, val) {
        document.documentElement.style.setProperty(`--${name}`, val);
    }

    window.splus.createSvgLogo = function(...classes) {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", 250);
        circle.setAttribute("cy", 250);
        circle.setAttribute("r", 230);
        circle.setAttribute("style", "fill: none; stroke-width: 35px; stroke: currentColor;");
        let line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line1.setAttribute("x1", 250);
        line1.setAttribute("y1", 125);
        line1.setAttribute("x2", 250);
        line1.setAttribute("y2", 375);
        line1.setAttribute("style", "stroke-linecap: round; stroke-width: 35px; stroke: currentColor;");
        let line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line2.setAttribute("x1", 125);
        line2.setAttribute("y1", 250);
        line2.setAttribute("x2", 375);
        line2.setAttribute("y2", 250);
        line2.setAttribute("style", "stroke-linecap: round; stroke-width: 35px; stroke: currentColor;");

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 500 500");

        svg.append(circle, line1, line2);

        if (classes) {
            svg.classList.add(...classes);
        }

        return svg;
    }

    /**
     * Returns `true` if current domain is `lms.lausd.net`
     * @returns {boolean}
     */
    window.splus.isLAUSD = function() {
        return window.splus.Setting.getValue("defaultDomain") === "lms.lausd.net";
    }

    var firstLoad = true;

    /**
     * Updates the contents of the settings modal to reflect changes made by the user to all settings
     * @param {()=>any} callback Called after settings are updated
     */
    window.splus.updateSettings = (callback) => {
        chrome.storage.sync.get(null, storageContents => {
            window.splus.__storage = storageContents;

            // wrapper functions for e.g. defaults
            window.splus.__storage.getGradingScale = function(courseId) {
                let defaultGradingScale = {
                    "90": "A",
                    "80": "B",
                    "70": "C",
                    "60": "D",
                    "0": "F"
                };

                if (window.splus.__storage.defaultGradingScale) {
                    defaultGradingScale = window.splus.__storage.defaultGradingScale;
                }

                if (courseId !== null && window.splus.__storage.gradingScales && window.splus.__storage.gradingScales[courseId]) {
                    return window.splus.__storage.gradingScales[courseId];
                }

                return defaultGradingScale;
            }

            if (firstLoad) {
                if (storageContents.themes) {
                    for (let t of storageContents.themes) {
                        window.splus.themes.push(window.splus.Theme.loadFromObject(t));
                    }
                }

                window.splus.Theme.apply(window.splus.Theme.active);
                firstLoad = false;
            }

            let noControl = document.createElement("div");

            window.splus.modalContents = createElement("div", [], undefined, [
                createElement("div", ["splus-modal-contents", "splus-settings-tabs"], {}, [
                    createElement("ul", [], {}, [
                        createElement("li", [], {}, [createElement("a", [], {href: "#splus-settings-section-appearance", textContent: "Appearance"})]),
                        createElement("li", [], {}, [createElement("a", [], {href: "#splus-settings-section-sidebar", textContent: "Homepage/Sidebar"})]),
                        createElement("li", [], {}, [createElement("a", [], {href: "#splus-settings-section-grades", textContent: "Grades"})]),
                        createElement("li", [], {}, [createElement("a", [], {href: "#splus-settings-section-utilities", textContent: "Utilities"})]),
                    ]),
                    createElement("div", [], {id: "splus-settings-section-appearance"}, [
                        new window.splus.Setting(
                            "clearSPlusV3Cache",
                            "Clear V3 Loader cache",
                            "Click to clear the Schoology Plus Bookmarklet v3 loader cache.",
                            "Clear",
                            "button",
                            {},
                            value => "Clear Cache",
                            event => {localStorage.removeItem("splus-loader"); location.reload()}
                        ).control,
                        new window.splus.Setting(
                            "themeEditor",
                            "Theme Editor",
                            "Click to open the theme editor to create, edit, or select a theme",
                            "Theme Editor",
                            "button",
                            {},
                            value => "Theme Editor",
                            event => location.href = "/sPlusBookmarkletTricksUserForThemeEditorChromeLocalStorage" 
                        ).control,
                        new window.splus.Setting(
                            "theme",
                            "Theme",
                            "Change the theme of Schoology Plus",
                            "Schoology Plus",
                            "select",
                            {
                                options: [
                                    ...window.splus.__defaultThemes.filter(
                                        t => window.splus.LAUSD_THEMES.includes(t.name) ? window.splus.isLAUSD() : true
                                    ).map(t => {return {text: t.name, value: t.name}}),
                                    ...(window.splus.__storage.themes || []).map(
                                        t => {return {text: t.name, value: t.name}}
                                    )
                                ]
                            },
                            value => {
                                tempTheme = undefined;
                                window.splus.Theme.apply(window.splus.Theme.active);
                                return value;
                            },
                            event => {
                                tempTheme = event.target.value;
                                window.splus.Theme.apply(window.splus.Theme.byName(event.target.value));
                            },
                            element => element.value
                        ).control,
                        new window.splus.Setting(
                            "courseIcons",
                            "Override Course Icons",
                            "[Refresh required to disable] Replace the course icons with the selected theme's icons",
                            window.splus.isLAUSD() ? "enabled" : "defaultOnly",
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
                        new window.splus.Setting(
                            "useDefaultIconSet",
                            "Use Built-In Icon Set",
                            `[Refresh required] Use Schoology Plus's <a href="${chrome.runtime.getURL("/default-icons.html")}" target="_blank">default course icons</a> as a fallback when a custom icon has not been specified. NOTE: these icons were meant for schools in Los Angeles Unified School District and may not work correctly for other schools.`,
                            window.splus.isLAUSD() ? "enabled" : "disabled",
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
                        new window.splus.Setting(
                            "courseIconFavicons",
                            "Use Course Icons as Favicons When Possible",
                            "[Refresh required] Use the course's icon as the favicon (the icon next to the tab's title) on most course pages. This will not work in all cases.",
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
                        new window.splus.Setting(
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
                        new window.splus.Setting(
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
                        new window.splus.Setting(
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
                                window.splus.setCSSVariable("help-center-fab-visibility", value);
                                return value;
                            },
                            function (event) { this.onload(event.target.value) },
                            element => element.value
                        ).control,
                    ]),
                    createElement("div", [], {id: "splus-settings-section-sidebar"}, [
                        new window.splus.Setting(
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
                        new window.splus.Setting(
                            "toDoIconVisibility",
                            '"Overdue" and "Due Tomorrow" Icon Visibility',
                            'Controls the visibility of the "Overdue" exclamation point icon and the "Due Tomorrow" clock icon in the Upcoming and Overdue lists on the sidebar of the homepage',
                            "visible",
                            "select",
                            {
                                options: [
                                    {
                                        text: "Show Icons",
                                        value: "visible"
                                    },
                                    {
                                        text: "Hide Icons",
                                        value: "hidden"
                                    }
                                ]
                            },
                            value => {
                                window.splus.setCSSVariable("to-do-list-icons-display", "block");
                                switch (value) {
                                    case "hidden":
                                        window.splus.setCSSVariable("to-do-list-icons-display", "none");
                                        break;
                                }
                                return value;
                            },
                            function (event) { this.onload(event.target.value) },
                            element => element.value
                        ).control,
                        new window.splus.Setting(
                            "sidebarSectionOrder",
                            "Customize Sidebar",
                            "",
                            {
                                include: [],
                                exclude: []
                            },
                            "custom",
                            {
                                element: createElement("div", [], {}, [
                                    createElement("p", [], {style: {fontWeight: "normal"}, textContent: "Drag items between the sections to control which sections of the sidebar are visible and the order in which they are shown."}),
                                    createElement("div", ["sortable-container"], {}, [
                                        createElement("div", ["sortable-list"], {}, [
                                            createElement("h3", ["splus-underline-heading"], {textContent: "Sections to Hide"}),
                                            createElement("ul", ["sidebar-sortable", "splus-modern-border-radius", "splus-modern-padding"], {id: "sidebar-excluded-sortable"})
                                        ]),
                                        createElement("div", ["sortable-list"], {}, [
                                            createElement("h3", ["splus-underline-heading"], {textContent: "Sections to Show"}),
                                            createElement("ul", ["sidebar-sortable", "splus-modern-border-radius", "splus-modern-padding"], {id: "sidebar-included-sortable"})
                                        ]),
                                    ])
                                ]),
                            },
                            function (value, element) {
                                let includeList = element.querySelector("#sidebar-included-sortable");
                                let excludeList = element.querySelector("#sidebar-excluded-sortable");

                                includeList.innerHTML = "";
                                excludeList.innerHTML = "";
                                
                                if (!value || !value.include || !value.exclude) {
                                    value = {include: [], exclude: []};
                                }
                                
                                for (let section of value.include) {
                                    includeList.appendChild(createElement("p", ["sortable-item", "splus-modern-border-radius", "splus-modern-padding"], {textContent: section}))
                                }

                                for (let section of value.exclude) {
                                    excludeList.appendChild(createElement("p", ["sortable-item", "splus-modern-border-radius", "splus-modern-padding"], {textContent: section}))
                                }

                                for (let section of window.splus.SIDEBAR_SECTIONS) {
                                    if (!value.include.includes(section.name) && !value.exclude.includes(section.name)) {
                                        includeList.appendChild(createElement("p", ["sortable-item", "splus-modern-border-radius", "splus-modern-padding"], {textContent: section.name}))
                                    }
                                }
                            },
                            function (event) { console.log(event); },
                            element => {
                                let includeList = element.querySelector("#sidebar-included-sortable");
                                let excludeList = element.querySelector("#sidebar-excluded-sortable");

                                return {
                                    include: Array.from(includeList.children).map(e => e.textContent),
                                    exclude: Array.from(excludeList.children).map(e => e.textContent)
                                }
                            },
                            function () {
                                $(".sidebar-sortable").sortable({
                                    connectWith: ".sidebar-sortable",
                                    stop: () => window.splus.Setting.onModify(this.getElement())
                                }).disableSelection();
                            }
                        ).control,
                    ]),
                    createElement("div", [], {id: "splus-settings-section-grades"}, [
                        new window.splus.Setting(
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
                        new window.splus.Setting(
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
                        new window.splus.Setting(
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
                                window.splus.setCSSVariable("weighted-gradebook-indicator-display", value == "enabled" ? "inline" : "none")
                                return value;
                            },
                            function (event) { this.onload(event.target.value) },
                            element => element.value
                        ).control,
                    ]),
                    createElement("div", [], {id: "splus-settings-section-utilities"}, [
                        new window.splus.Setting(
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
                        new window.splus.Setting(
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
                        new window.splus.Setting(
                            "autoBypassLinkRedirects",
                            "Automatically Bypass Link Redirects",
                            "Automatically skip the external link redirection page, clicking 'Continue' by default",
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
                        new window.splus.Setting(
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
                        window.splus.getBrowser() !== "Firefox" ? createElement("div", ["setting-entry"], {}, [
                            createElement("h2", ["setting-title"], {}, [
                                createElement("a", [], { href: "#", textContent: "Anonymous Usage Statistics", onclick: () => window.splus.openModal("analytics-modal"), style: { fontSize: "" } })
                            ]),
                            createElement("p", ["setting-description"], { textContent: "[Reload required] Allow Schoology Plus to collect anonymous information about how you use the extension. We don't collect any personal information per our privacy policy." })
                        ]) : noControl,
                    ]),
                ]),
                createElement("div", ["settings-buttons-wrapper"], undefined, [
                    createButton("save-settings", "Save Settings", () => window.splus.Setting.saveModified()),
                    createElement("div", ["settings-actions-wrapper"], {}, [
                        createElement("a", [], { textContent: "View Debug Info", onclick: () => window.splus.openModal("debug-modal"), href: "#" }),
                        createElement("a", [], { textContent: "Export Settings", onclick: window.splus.Setting.export, href: "#" }),
                        createElement("a", [], { textContent: "Import Settings", onclick: window.splus.Setting.import, href: "#" }),
                        createElement("a", ["restore-defaults"], { textContent: "Restore Defaults", onclick: window.splus.Setting.restoreDefaults, href: "#" })
                    ]),
                ])
            ]);

            window.splus.getModalContents = () => {
                return window.splus.modalContents || createElement("p", [], {
                    textContent: "Error loading settings"
                });
            }

            if (callback && typeof callback == "function") {
                callback();
            }
        });
    }

    window.splus.Logger.debug("Finished loading settings.js");
    window.splusLoaded.add("settings");
})();
