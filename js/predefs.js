/**
 * Creates a DOM element
 * @returns {HTMLElement} A DOM element
 * @param {string} tag - The HTML tag name of the type of DOM element to create
 * @param {string[]} classList - CSS classes to apply to the DOM element
 * @param {Object.<string,any>} properties - Properties to apply to the DOM element
 * @param {HTMLElement[]} children - Elements to append as children to the created element
 */
function createElement(tag, classList, properties, children) {
    let element = document.createElement(tag);
    if (classList) {
        for (let c of classList) {
            element.classList.add(c);
        }
    }
    if (properties) {
        for (let property in properties) {
            if (properties[property] instanceof Object && !(properties[property] instanceof Function)) {
                for (let subproperty in properties[property]) {
                    element[property][subproperty] = properties[property][subproperty];
                }
            } else if (property !== undefined && properties[property] !== undefined) {
                element[property] = properties[property];
            }
        }
    }
    if (children) {
        for (let child of children) {
            element.appendChild(child);
        }
    }
    return element;
}

/**
 * @type {Object.<string,Setting>}
 */
let __settings = {};

__storage = {};
chrome.storage.sync.get(null, storageContents => {
    __storage = storageContents;
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
 */
function Setting(name, friendlyName, description, defaultValue, type, options, onload, onmodify, onsave) {
    this.name = name;
    this.getElement = () => document.getElementById(`setting-input-${this.name}`);
    this.onmodify = onmodify;
    this.onsave = onsave;
    this.onload = onload;
    this.modified = false;
    this.default = defaultValue;
    /**
     * Returns the element control to be used to edit the setting's value by the user
     * @returns {HTMLElement} A setting element
     */
    this.control = (() => {
        let setting = createElement("div", ["setting-entry"]);
        let title = createElement("h2", ["setting-title"], { textContent: friendlyName + ": " });
        let helpText = createElement("p", ["setting-description"], { innerHTML: description });

        switch (type) {
            case "number":
            case "text":
            case "button":
                let inputElement = createElement("input", undefined, Object.assign({ type: type }, options));
                title.appendChild(inputElement);
                if (type == "button") inputElement.onclick = Setting.onModify;
                else inputElement.oninput = Setting.onModify;
                break;
            case "select":
                let selectElement = createElement("select");
                for (let option of options.options) {
                    selectElement.appendChild(createElement("option", undefined, { textContent: option.text, value: option.value }));
                }
                title.appendChild(selectElement);
                selectElement.onchange = Setting.onModify;
                break;
        }

        setting.appendChild(title);
        setting.appendChild(helpText);

        title.firstElementChild.dataset.settingName = name;
        title.firstElementChild.id = `setting-input-${name}`

        if (!__storage[name]) {
            __storage[name] = defaultValue;
        }

        if (onload) {
            title.firstElementChild.value = onload(__storage[name]) || this.default;
        } else {
            title.firstElementChild.value = __storage[name] || this.default;
        }

        return setting;
    })();
    __settings[name] = this;
}

/**
 * Saves modified settings to the Chrome Sync Storage
 * @param {Object.<string,any>} modifiedValues An object containing modified setting keys and values
 * @param {boolean} [updateButtonText=true] Change the value of the "Save Settings" button to "Saved!" temporarily
 * @param {()=>any} [callback=null] A function called after settings have been saved and updated
 * @param {boolean} [saveUiSettings=true] Whether or not to save modified settings from the UI as well as the passed dictionary.
 */
Setting.saveModified = function (modifiedValues, updateButtonText = true, callback = undefined, saveUiSettings = true) {
    let newValues = {};
    if (modifiedValues) {
        Object.assign(newValues, modifiedValues);
    }
    if (saveUiSettings) {
        for (let setting in __settings) {
            let v = __settings[setting];
            if (v.modified) {
                let value = v.onsave(v.getElement());
                newValues[setting] = value;
                __storage[setting] = value;
                v.onload(value, v.getElement());
                v.modified = false;
            }
        }
    }
    chrome.storage.sync.set(newValues, () => {
        for (let settingName in newValues) {
            let setting = __settings[settingName];
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
Setting.restoreDefaults = function () {
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
 * Callback function called when any setting is changed in the settings menu
 * @param {Event} event Contains a `target` setting element
 */
Setting.onModify = function (event) {
    let element = event.target || event;
    let parent = element.parentElement;
    if (parent && !parent.querySelector(".setting-modified")) {
        parent.appendChild(createElement("span", ["setting-modified"], { textContent: " *", title: "This setting has been modified from its saved value" }));
    }
    let setting = __settings[element.dataset.settingName];
    setting.modified = true;
    if (setting.onmodify) {
        setting.onmodify(event);
    }
}

/**
 * @returns {boolean} `true` if any setting has been modified
 */
Setting.anyModified = function () {
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
Setting.getValue = function (name, defaultValue = undefined) {
    if (__storage[name]) {
        return __storage[name];
    } else if (__settings[name] && !defaultValue) {
        return __settings[name].default;
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
Setting.getNestedValue = function (parent, key, defaultValue = undefined) {
    if (__storage[parent] && key in __storage[parent]) {
        return __storage[parent][key];
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
Setting.setValue = function (name, value, callback = undefined) {
    Setting.saveModified({ [name]: value }, false, callback, false);

    if (name === "defaultDomain") {
        chrome.runtime.sendMessage({ type: "updateDefaultDomain", domain: value });
    }
}

/**
 * Sets the value of a nested property in the extension's synced storage.
 * @param {string} parent The name of the object in which to place `key`
 * @param {string} key The key within `parent` in which to store the value
 * @param {any} value The value to set
 * @param {()=>any} callback Function called after new value is saved
 */
Setting.setNestedValue = function (parent, key, value, callback = undefined) {
    var currentValue = Setting.getValue(parent, {});
    currentValue[key] = value;
    Setting.saveModified({ [parent]: currentValue }, false, callback, false);
}

/**
 * Sets the value of multiple settings in the extension's synced storage
 * Even if a dictionary key is the name of a `Setting`, that `Setting`'s `onmodify`
 * function will NOT be called.
 * @param {Object.<string,any>} dictionary Dictionary of setting names to values
 * @param {()=>any} callback Function called after new values are saved
 */
Setting.setValues = function (dictionary, callback = undefined) {
    Setting.saveModified(dictionary, false, callback, false);
}

/**
 * Sets the value of a CSS variable on the document
 * @param {string} name Variable name
 * @param {string} val New variable value
 */
function setCSSVariable(name, val) {
    document.documentElement.style.setProperty(`--${name}`, val);
}

function createSvgLogo(...classes) {
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

new Setting(
    "defaultDomain",
    "Default Schoology Domain",
    "The website on which Schoology Plus runs. Cannot be changed here.",
    "app.schoology.com",
    "text",
    {
        disabled: true
    },
    value => value,
    undefined,
    element => element.value
);
