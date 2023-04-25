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
            updateSettings();
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

            updateSettings(callback);
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
            for (let setting in __settings) {
                delete __storage[setting];
                chrome.storage.sync.remove(setting);
                __settings[setting].onload(undefined, __settings[setting].getElement());
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

        navigator.clipboard.writeText(JSON.stringify(__storage, null, 2))
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
            } catch (err) {
                alert("Failed to import settings! They were probably malformed. Make sure the settings are valid JSON.");
                return;
            }

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
        for (let setting in __settings) {
            if (__settings[setting].modified) {
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

    window.splus.Logger.debug("Finished loading settings.js");
    window.splusLoaded.add("settings");
})();
