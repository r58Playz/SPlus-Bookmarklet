const schoologyPlusLogoImageUrl = chrome.runtime.getURL("/imgs/schoology-plus-wide.svg");
const schoologyLogoImageUrl = "https://ui.schoology.com/design-system/assets/schoology-logo-horizontal-white.884fbe559c66e06d28c5cfcbd4044f0e.svg";
const lausdLegacyImageUrl = chrome.runtime.getURL("/imgs/lausd-legacy.png");
const lausdNewImageUrl = chrome.runtime.getURL("/imgs/lausd-2019.png");
const CURRENT_VERSION = SchoologyTheme.CURRENT_VERSION;
const placeholderUrl = "https://via.placeholder.com/200x50?text=School+Logo";
const LAUSD_THEMES = ["LAUSD Orange", "LAUSD Dark Blue"];
const CLASSIC_THEMES = ["Schoology Plus", "Rainbow"]

var defaultDomain = "app.schoology.com";

chrome.storage.sync.get({ defaultDomain: "app.schoology.com" }, s => {
    defaultDomain = s.defaultDomain;

    if (isLAUSD()) {
        setCSSVariable("lausd-visible", "block");
        setCSSVariable("lausd-hidden", "none");
    } else {
        setCSSVariable("lausd-visible", "none");
        setCSSVariable("lausd-hidden", "block");
    }
});

__storage = {};
chrome.storage.sync.get(null, storageContents => {
    __storage = storageContents;
});

/**
 * Returns `true` if current domain is `lms.lausd.net`
 * @returns {boolean}
 */
function isLAUSD() {
    return defaultDomain === "lms.lausd.net";
}

var allThemes = {};
var defaultThemes = [];
var rainbowInterval = null;
var themeName = document.getElementById("theme-name");
var themeHue = document.getElementById("theme-hue");
var themePrimaryColor = document.getElementById("theme-primary-color");
var themeSecondaryColor = document.getElementById("theme-secondary-color");
var themeBackgroundColor = document.getElementById("theme-background-color");
var themeBorderColor = document.getElementById("theme-border-color");
var themeLinkColor = document.getElementById("theme-link-color");
var themeSchoologyPlusLogo = document.getElementById("theme-schoology-plus-logo");
var themeSchoologyLogo = document.getElementById("theme-schoology-logo");
var themeNewLAUSDLogo = document.getElementById("theme-new-lausd-logo");
var themeLAUSDLogo = document.getElementById("theme-lausd-logo");
var themeDefaultLogo = document.getElementById("theme-default-logo");
var themeCustomLogo = document.getElementById("theme-custom-logo");
var themeLogo = document.getElementById("theme-logo");
var themeCursor = document.getElementById("theme-cursor");
var themeColorHue = document.getElementById("theme-color-hue");
var themeColorCustom = document.getElementById("theme-color-custom");
var themeColorRainbow = document.getElementById("theme-color-rainbow");
var themeColorCustomWrapper = document.getElementById("theme-color-custom-wrapper");
var themeColorRainbowWrapper = document.getElementById("theme-color-rainbow-wrapper");
var colorRainbowHueAnimate = document.getElementById("color-rainbow-hue-animate");
var colorRainbowSaturationAnimate = document.getElementById("color-rainbow-saturation-animate");
var colorRainbowLightnessAnimate = document.getElementById("color-rainbow-lightness-animate");
var colorRainbowHueAnimateWrapper = document.getElementById("color-rainbow-hue-animate-wrapper");
var colorRainbowSaturationAnimateWrapper = document.getElementById("color-rainbow-saturation-animate-wrapper");
var colorRainbowLightnessAnimateWrapper = document.getElementById("color-rainbow-lightness-animate-wrapper");
var colorRainbowHueSpeed = document.getElementById("color-rainbow-hue-speed");
var colorRainbowHueValue = document.getElementById("color-rainbow-hue-value");
var colorRainbowHuePreview = document.getElementById("color-rainbow-hue-preview");
var colorRainbowSaturationSpeed = document.getElementById("color-rainbow-saturation-speed");
var colorRainbowSaturationValue = document.getElementById("color-rainbow-saturation-value");
var colorRainbowLightnessSpeed = document.getElementById("color-rainbow-lightness-speed");
var colorRainbowLightnessValue = document.getElementById("color-rainbow-lightness-value");
var colorRainbowHueAlternate = document.getElementById("color-rainbow-hue-alternate");
var colorRainbowSaturationAlternate = document.getElementById("color-rainbow-saturation-alternate");
var colorRainbowLightnessAlternate = document.getElementById("color-rainbow-lightness-alternate");
var colorRainbowHueRange = document.getElementById("color-rainbow-hue-range");
var colorRainbowSaturationRange = document.getElementById("color-rainbow-saturation-range");
var colorRainbowLightnessRange = document.getElementById("color-rainbow-lightness-range");
var themeHueWrapper = document.getElementById("theme-hue-wrapper");
var themeLogoWrapper = document.getElementById("theme-logo-wrapper");
var previewSection = document.getElementById("preview-section");
var themesList = document.getElementById("themes-list");
var themesListSection = document.getElementById("themes-list-section");
var themeEditorSection = document.getElementById("theme-editor-section");
var testIcon = document.getElementById("test-icon");
var iconList = document.getElementById("icon-list");
var tabIcons = document.getElementById("tab-icons");
/** @type {HTMLTableElement} */
var iconListTable = document.getElementById("icon-list-table");
var newIcon = document.getElementById("new-icon");
newIcon.addEventListener("click", addIcon);
var iconTestText = document.getElementById("icon-test-text");
iconTestText.addEventListener("input", iconPreview);
var saveButton = document.getElementById("save-button");
saveButton.addEventListener("click", e => trySaveTheme());
var saveCloseButton = document.getElementById("save-close-button");
saveCloseButton.addEventListener("click", e => trySaveTheme(true));
var discardButton = document.getElementById("discard-button");
discardButton.addEventListener("click", e => ConfirmModal.open("Discard Changes?", "Are you sure you want to discard changes? All unsaved edits will be permanently lost.", ["Discard", "Cancel"], b => b === "Discard" && location.reload()));
var importButton = document.getElementById("import-button");
importButton.addEventListener("click", e => importTheme());
var createPresetDarkTheme = document.getElementById("create-preset-dark-theme");
createPresetDarkTheme.addEventListener("click", e => editTheme("Schoology Plus Modern Dark", "My Dark Theme"));
var createPresetLightTheme = document.getElementById("create-preset-light-theme");
createPresetLightTheme.addEventListener("click", e => editTheme("Schoology Plus Modern Light", "My Light Theme"));
var createPresetRainbowTheme = document.getElementById("create-preset-rainbow-theme");
createPresetRainbowTheme.addEventListener("click", e => editTheme("Rainbow Modern", "My Rainbow Theme"));
var createPresetClassicTheme = document.getElementById("create-preset-classic-theme");
createPresetClassicTheme.addEventListener("click", e => editTheme("Schoology Plus", "My Classic Theme"));
var previewNavbar = document.getElementById("preview-navbar");
var previewLogo = document.getElementById("preview-logo");
var previewPage = document.getElementById("preview-page");

var modernEnable = document.getElementById("modern-enable");
modernEnable.addEventListener("click", e => trackEvent("modern-enable", modernEnable.checked.toString(), "Theme Editor"));
var modernWrapper = document.getElementById("modern-wrapper");
var modernBorderRadiusValue = document.getElementById("modern-border-radius-value");
var modernBorderSizeValue = document.getElementById("modern-border-size-value");
var modernPaddingValue = document.getElementById("modern-padding-value");

var previewModal = document.getElementById("preview-modal");
var splusModalClose = document.getElementById("splus-modal-close");
splusModalClose.addEventListener("click", e => {
    e.stopPropagation();
    previewModal.classList.add("hidden");
    previewPage.classList.remove("hidden");
    trackEvent("splus-modal-close", "click", "Theme Editor");
});
var previewSPlusButton = document.getElementById("preview-splus-button");
previewSPlusButton.addEventListener("click", e => {
    e.stopPropagation();
    previewModal.classList.toggle("hidden");
    previewPage.classList.toggle("hidden");
    trackEvent("preview-splus-button", "click", "Theme Editor");
});

class Modal {
    static get ELEMENT() {
        return document.getElementById("modal");
    }

    static get CONTENT_CONTAINER() {
        return document.getElementById("modal-content");
    }

    static get BUTTONS_CONTAINER() {
        return document.getElementById("modal-buttons");
    }

    /**
     * Displays a modal with the given content and buttons, calling callback on close
     * @param {Node} content The content of the modal
     * @param {string[]} buttons Buttons to show in the modal footer
     * @param {(button:string)=>void} callback Called on close with the selected button (or `null` if none selected)
     */
    static open(content, buttons = ["OK"], callback) {
        Modal.CONTENT_CONTAINER.innerHTML = "";
        Modal.BUTTONS_CONTAINER.innerHTML = "";

        var selected = null;

        Modal.CONTENT_CONTAINER.appendChild(content);
        for (let b of buttons) {
            Modal.BUTTONS_CONTAINER.appendChild(createElement("a", ["modal-close", "waves-effect", "waves-dark", "btn-flat"], {
                textContent: b,
                onclick: e => {
                    trackEvent("Modal Button", b, "Theme Editor");
                    selected = b;
                }
            }));
        }

        let controller = M.Modal.init(Modal.ELEMENT, { onCloseEnd: () => callback && callback(selected) });
        controller.open();
    }
}

class PromptModal extends Modal {
    /**
     * Opens a modal requesting user input
     * @param {string} title The title of the modal
     * @param {string} placeholder Text displayed as a placeholder in the textbox
     * @param {string[]} buttons Buttons to display in the modal footer
     * @param {(button:string,text:string)=>void} callback Called on close with the selected button (or `null` if none selected) and the text in the textbox
     */
    static open(title, placeholder, buttons, callback) {
        let content = htmlToElement(`
        <div>
            <h4>${title}</h4>
            <div class="input-field">
                <textarea id="prompt-modal-textarea" class="materialize-textarea"></textarea>
                <label for="prompt-modal-textarea">${placeholder}</label>
            </div>
        </div>
        `);

        Modal.open(content, buttons, (button) => callback(button, document.getElementById("prompt-modal-textarea").value));
    }
}

class ConfirmModal extends Modal {
    /**
     * Opens a modal requesting user confirmation
     * @param {string} title The title of the modal
     * @param {string} text Informative text detailing the question
     * @param {string[]} buttons Buttons to display in the modal footer
     * @param {(button:string)=>void} callback Called on close with the selected button (or `null` if none selected)
     */
    static open(title, text, buttons, callback) {
        let content = htmlToElement(`
        <div>
            <h4>${title}</h4>
            <p>${text}</p>
        </div>
        `);

        Modal.open(content, buttons, callback);
    }
}

class SettingsModal extends Modal {
    /**
     * Opens the settings modal
     */
    static open() {
        let content = htmlToElement(`
        <div>
            <h4>Settings</h4>
            <p>
                Nothing to see here yet! Theme editor settings coming soon&trade;.
            </p>
        </div>
        `);

        Modal.open(content, ["Cancel", "Save"], button => {
            switch (button) {
                case "Save":
                    break;
                case "Cancel":
                default:
                    break;
            }
        });
    }
}

var origThemeName;
let warnings = [];
let errors = [];
let theme = null;

var output = document.getElementById("json-output");
output.addEventListener("input", importThemeFromOutput);
output.addEventListener("paste", e => {
    if (inEditMode()) {
        e.preventDefault();
        e.stopPropagation();
        let t = e.clipboardData.getData("text");
        output.value = t;
        importThemeFromOutput();
    }
});

for (let e of document.querySelectorAll("#theme-editor-section input")) {
    e.addEventListener("input", function (event) {
        updateOutput();
    });
}
var mTabs = M.Tabs.init(document.querySelector(".tabs"), {
    onShow: function (newtab) {
        if (newtab.id == "tab-preview") {
            previewSection.classList.add("fixed-on-large-and-up");
        } else {
            previewSection.classList.remove("fixed-on-large-and-up");
        }
    }
});

var elems = document.querySelectorAll('.dropdown-trigger');
var instances = M.Dropdown.init(elems, { constrainWidth: false });

/**
 * Returns a list of errors for the given theme
 * @param {*} j Theme JSON object
 */
function generateErrors(j) {
    let w = [];
    switch (j.version) {
        case 2:
            if (!j.name) w.push("Theme must have a name");
            break;
        default:
            if (!j.name) w.push("Theme must have a name")
            if (j.hue && Number.isNaN(Number.parseFloat(j.hue))) w.push("Value of 'hue' must be a number");
            if (j.colors && j.colors.length != 4) w.push("There must be four colors in 'colors'");
            if (j.colors && j.colors.map(x => !!validateColor(x)).includes(false)) w.push("One or more values of 'colors' is not a valid color");
            break;
    }
    return w;
}

/**
 * Loads a theme from the JSON text displayed in the output textarea element
 */
function importThemeFromOutput() {
    importAndRender(parseJSONObject(output.value));
}

/**
 * Loads a theme from an object and renders it
 * @param {*} object JSON object representation of a theme
 */
function importAndRender(object) {
    errors = [];
    warnings = [];
    renderTheme(importThemeFromObject(object));
}

/**
 * Migrates a theme to the newest version of the theme specification
 * @param {*} t Theme JSON object
 */
function migrateTheme(t) {
    switch (t.version) {
        case 2:
            break;
        default:
            t.version = 2;
            if (t.colors) {
                t.color = {
                    custom: {
                        primary: t.colors[0],
                        background: t.colors[1],
                        hover: t.colors[2],
                        border: t.colors[3]
                    }
                };
                delete t.colors;
                delete t.hue;
            } else if (t.hue) {
                t.color = {
                    hue: t.hue
                };
                delete t.hue;
            }
            if (t.logo) {
                switch (t.logo) {
                    case "schoology":
                        t.logo = { preset: "schoology_logo" };
                        break;
                    case "lausd":
                        t.logo = { preset: "lausd_legacy" };
                        break;
                    case "lausd_new":
                        t.logo = { preset: "lausd_2019" };
                        break;
                    default:
                        t.logo = { url: t.logo };
                        break;
                }
            }
            if (t.cursor) {
                t.cursor = { primary: t.cursor };
            }
            if (t.icons) {
                let newIconsArray = [];
                for (let icon of t.icons) {
                    newIconsArray.push({
                        regex: icon[0],
                        url: icon[1]
                    });
                }
                t.icons = newIconsArray;
            }
            break;
    }
    return t.version == CURRENT_VERSION ? t : migrateTheme(t);
}

/**
 * Fills out form elements with the data contained in the provided Theme object
 * @param {SchoologyTheme} j A SchoologyPlus theme object
 */
function importThemeFromObject(j) {
    if (!j) {
        errors.push("The JSON you have entered is not valid");
        updatePreview(false);
        return;
    }

    errors = generateErrors(j);
    if (errors.length > 0) {
        updatePreview(false);
        return;
    }

    j = migrateTheme(j);

    return SchoologyTheme.loadFromObject(j);
}

/**
 * Updates form elements with values from the provided theme
 * @param {SchoologyTheme} t The theme to render
 */
function renderTheme(t) {
    themeName.value = t.name;
    themeLogo.value = "";
    switch (t.logo.preset) {
        case "schoology_plus":
            themeSchoologyPlusLogo.click();
            break;
        case "schoology_logo":
            themeSchoologyLogo.click();
            break;
        case "lausd_legacy":
            themeLAUSDLogo.click();
            break;
        case "lausd_2019":
            themeNewLAUSDLogo.click();
            break;
        case "default":
            themeDefaultLogo.click();
            break;
        default:
            themeLogo.value = t.logo.url;
            themeCustomLogo.click();
            break;
    }
    $(themeHue).slider("value", t.color.hue);
    colorRainbowHueAnimate.checked = false;
    colorRainbowHueSpeed.value = 50;
    $(colorRainbowHueRange).roundSlider("setValue", "0,359");
    colorRainbowHueAlternate.checked = false;
    $(colorRainbowHueValue).slider("value", 180);
    colorRainbowSaturationAnimate.checked = false;
    colorRainbowSaturationSpeed.value = 50;
    $(colorRainbowSaturationRange).slider("values", [0, 100]);
    colorRainbowSaturationAlternate.checked = false;
    colorRainbowSaturationValue.value = 50;
    colorRainbowLightnessAnimate.checked = false;
    colorRainbowLightnessSpeed.value = 50;
    $(colorRainbowLightnessRange).slider("values", [0, 100]);
    colorRainbowLightnessAlternate.checked = false;
    colorRainbowLightnessValue.value = 50;
    if (t.color.hue || t.color.hue === 0) {
        themeColorHue.click();
    }
    else if (t.color.custom) {
        let map = {
            "#theme-primary-color": "primary",
            "#theme-background-color": "background",
            "#theme-secondary-color": "hover",
            "#theme-border-color": "border",
            "#theme-link-color": "link"
        };
        Object.keys(map).map(x => $(x).spectrum("set", t.color.custom[map[x]]));
        themeColorCustom.click();
    }
    else if (t.color.rainbow) {
        themeColorRainbow.click();
        if (!!t.color.rainbow.hue.animate !== colorRainbowHueAnimate.checked) {
            colorRainbowHueAnimate.click();
        }
        if (t.color.rainbow.hue.animate) {
            colorRainbowHueSpeed.value = t.color.rainbow.hue.animate.speed;
            $(colorRainbowHueValue).slider("value", t.color.rainbow.hue.animate.offset);
            if (!!t.color.rainbow.hue.animate.alternate !== colorRainbowHueAlternate.checked) {
                colorRainbowHueAlternate.click();
            }
            let l = t.color.rainbow.hue.animate.min || 0
                && t.color.rainbow.hue.animate.min >= 0
                && t.color.rainbow.hue.animate.min <= 359
                ? t.color.rainbow.hue.animate.min
                : 0;
            let u = t.color.rainbow.hue.animate.max
                && t.color.rainbow.hue.animate.max >= 0
                && t.color.rainbow.hue.animate.max <= 359
                ? t.color.rainbow.hue.animate.max
                : 359;
            $(colorRainbowHueRange).roundSlider("setValue", `${l},${u}`);
        }
        else {
            $(colorRainbowHueValue).slider("value", t.color.rainbow.hue.value);
        }
        if (!!t.color.rainbow.saturation.animate !== colorRainbowSaturationAnimate.checked) {
            colorRainbowSaturationAnimate.click();
        }
        if (t.color.rainbow.saturation.animate) {
            colorRainbowSaturationSpeed.value = t.color.rainbow.saturation.animate.speed;
            colorRainbowSaturationValue.value = t.color.rainbow.saturation.animate.offset;
            if (!!t.color.rainbow.saturation.animate.alternate !== colorRainbowSaturationAlternate.checked) {
                colorRainbowSaturationAlternate.click();
            }
            $(colorRainbowSaturationRange).slider("values", [
                t.color.rainbow.saturation.animate.min
                    && t.color.rainbow.saturation.animate.min < t.color.rainbow.saturation.animate.max
                    && t.color.rainbow.saturation.animate.min >= 0
                    && t.color.rainbow.saturation.animate.min <= 100
                    ? t.color.rainbow.saturation.animate.min
                    : 0,
                t.color.rainbow.saturation.animate.max
                    && t.color.rainbow.saturation.animate.max > t.color.rainbow.saturation.animate.min
                    && t.color.rainbow.saturation.animate.max >= 0
                    && t.color.rainbow.saturation.animate.max <= 100
                    ? t.color.rainbow.saturation.animate.max
                    : 100
            ]);
        }
        else {
            colorRainbowSaturationValue.value = t.color.rainbow.saturation.value;
        }
        if (!!t.color.rainbow.lightness.animate !== colorRainbowLightnessAnimate.checked) {
            colorRainbowLightnessAnimate.click();
        }
        if (t.color.rainbow.lightness.animate) {
            colorRainbowLightnessSpeed.value = t.color.rainbow.lightness.animate.speed;
            colorRainbowLightnessValue.value = t.color.rainbow.lightness.animate.offset;
            if (!!t.color.rainbow.lightness.animate.alternate !== colorRainbowLightnessAlternate.checked) {
                colorRainbowLightnessAlternate.click();
            }
            $(colorRainbowLightnessRange).slider("values", [
                t.color.rainbow.lightness.animate.min
                    && t.color.rainbow.lightness.animate.min < t.color.rainbow.lightness.animate.max
                    && t.color.rainbow.lightness.animate.min >= 0
                    && t.color.rainbow.lightness.animate.min <= 100
                    ? t.color.rainbow.lightness.animate.min
                    : 0,
                t.color.rainbow.lightness.animate.max
                    && t.color.rainbow.lightness.animate.max > t.color.rainbow.lightness.animate.min
                    && t.color.rainbow.lightness.animate.max >= 0
                    && t.color.rainbow.lightness.animate.max <= 100
                    ? t.color.rainbow.lightness.animate.max
                    : 100
            ]);
        }
        else {
            colorRainbowLightnessValue.value = t.color.rainbow.lightness.value;
        }
    }

    if (t.color.modern) {
        modernEnable.checked = true;
        Object.keys(modernColorMap).map(x => $(x).spectrum("set", t.color.modern[modernColorMap[x][0]][modernColorMap[x][1]]));

        modernBorderRadiusValue.value = t.color.modern.options.borderRadius;
        modernBorderSizeValue.value = t.color.modern.options.borderSize;
        modernPaddingValue.value = t.color.modern.options.padding;
    } else {
        modernEnable.checked = false;
    }

    for (let el of document.querySelectorAll("input[type=range][data-label]")) {
        document.getElementById(el.dataset.label).textContent = el.value;
    }
    for (let el of [colorRainbowSaturationRange, colorRainbowLightnessRange]) {
        document.getElementById(el.id + "-display").textContent = `${$(el).slider("values")[0]} - ${$(el).slider("values")[1]}`;
    }
    iconList.innerHTML = "";
    if (t.icons) {
        for (let i of t.icons) {
            let row = addIcon();
            row.querySelector(".class-name").textContent = i.regex;
            row.querySelector(".icon-url").textContent = i.url;
            row.querySelector(".small-icon-preview").src = i.url;
        }
    }
    themeCursor.value = "";
    if (t.cursor && t.cursor.primary) {
        themeCursor.value = t.cursor.primary;
    }
    M.updateTextFields();
    updateOutput();
}

let init = 0;
/**
 * Creates a Spectrum.js color picker
 * @param {string} id Element ID of the input element 
 * @param {(tinycolor)=>void} onupdate Callback called when color is changed
 */
function initPicker(id, color = undefined, onupdate = updateOutput, showAlpha = false) {
    $(`#${id}`).spectrum({
        showInput: true,
        containerClassName: "full-spectrum",
        showInitial: true,
        showPalette: true,
        showSelectionPalette: true,
        maxPaletteSize: 10,
        preferredFormat: "hex",
        showAlpha: showAlpha,
        color: color || ["red", "blue", "yellow", "green", "magenta"][init++ % 5],
        move: function (color) {
            onupdate(color);
        },
        hide: function (color) {
            onupdate(color);
        },

        palette: [
            ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", /*"rgb(153, 153, 153)","rgb(183, 183, 183)",*/
                "rgb(204, 204, 204)", "rgb(217, 217, 217)", /*"rgb(239, 239, 239)", "rgb(243, 243, 243)",*/ "rgb(255, 255, 255)"],
            ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
                "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
            ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
                "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)"],
            ["rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
                "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)"],
            ["rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
                "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)"],
            ["rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
                "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)"],
            ["rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)",
                "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)"],
            ["rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
                "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
        ]
    });
}

initPicker("theme-primary-color");
initPicker("theme-secondary-color");
initPicker("theme-background-color");
initPicker("theme-border-color");
initPicker("theme-link-color");

initPicker("modern-color-primary", "#EAEAEA");
initPicker("modern-color-accent", "#F7F7F7");
initPicker("modern-color-secondary", "#DDD");
initPicker("modern-color-input", "#D0D0D0");
initPicker("modern-color-border", "#BABABA");
initPicker("modern-color-highlight", "rgba(255, 183, 2, 0.2)", updateOutput, true);
initPicker("modern-color-active", "#98d4e4", updateOutput, true);
initPicker("modern-color-grades", "#009400");
initPicker("modern-color-error", "#F44336");

initPicker("modern-color-text-primary", "#2A2A2A");
initPicker("modern-color-text-muted", "#677583");
initPicker("modern-color-text-contrast", "white");

var modernColorMap = {
    "#modern-color-primary": ["interface", "primary", "modern-primary"],
    "#modern-color-accent": ["interface", "accent", "modern-accent"],
    "#modern-color-secondary": ["interface", "secondary", "modern-secondary"],
    "#modern-color-input": ["interface", "input", "modern-input"],
    "#modern-color-border": ["interface", "border", "modern-contrast-border"],
    "#modern-color-highlight": ["interface", "highlight", "modern-highlight"],
    "#modern-color-active": ["interface", "active", "modern-active"],
    "#modern-color-grades": ["interface", "grades", "modern-grades"],
    "#modern-color-error": ["interface", "error", "modern-error"],
    "#modern-color-text-primary": ["text", "primary", "modern-text"],
    "#modern-color-text-muted": ["text", "muted", "modern-muted-text"],
    "#modern-color-text-contrast": ["text", "contrast", "modern-contrast-text"],
}

function updateOutput() {
    clearInterval(rainbowInterval);
    warnings = [];
    errors = [];
    theme = new SchoologyTheme(themeName.value || undefined, SchoologyTheme.CURRENT_VERSION);

    // Name
    if (!theme.name) {
        errors.push("Theme must have a name");
    } else if (defaultThemes.includes(theme.name)) {
        errors.push("Theme can't use the same name as a default theme. Please choose a different name.");
    } else if (theme.name != origThemeName && allThemes[theme.name]) {
        errors.push(`A theme with the name "${theme.name}" already exists. Delete that theme or choose a different name before saving.`);
    }

    // Color
    theme.color = new ThemeColor();
    if (themeColorHue.checked) {
        themeColorCustomWrapper.classList.add("hidden");
        themeHueWrapper.classList.remove("hidden");
        themeColorRainbowWrapper.classList.add("hidden");
        theme.color.hue = $(themeHue).slider("value");

        setCSSVariable("color-hue", theme.color.hue);
        setCSSVariable("primary-color", "hsl(var(--color-hue), 50%, 50%)");
        setCSSVariable("background-color", "hsl(var(--color-hue), 60%, 30%)");
        setCSSVariable("hover-color", "hsl(var(--color-hue), 55%, 40%)");
        setCSSVariable("border-color", "hsl(var(--color-hue), 60%, 25%)");
        setCSSVariable("link-color", "hsl(var(--color-hue), 55%, 40%)");
    } else if (themeColorCustom.checked) {
        themeColorCustomWrapper.classList.remove("hidden");
        themeHueWrapper.classList.add("hidden");
        themeColorRainbowWrapper.classList.add("hidden");
        theme.color.custom = new CustomColorDefinition(
            $("#theme-primary-color").spectrum("get").toHexString(),
            $("#theme-secondary-color").spectrum("get").toHexString(),
            $("#theme-background-color").spectrum("get").toHexString(),
            $("#theme-border-color").spectrum("get").toHexString(),
            $("#theme-link-color").spectrum("get").toHexString()
        );
        setCSSVariable("primary-color", theme.color.custom.primary);
        setCSSVariable("background-color", theme.color.custom.background);
        setCSSVariable("hover-color", theme.color.custom.hover);
        setCSSVariable("border-color", theme.color.custom.border);
        setCSSVariable("link-color", theme.color.custom.link);
    } else if (themeColorRainbow.checked) {
        themeColorCustomWrapper.classList.add("hidden");
        themeHueWrapper.classList.add("hidden");
        themeColorRainbowWrapper.classList.remove("hidden");
        theme.color.rainbow = new RainbowColorDefinition(new RainbowColorComponentDefinition(), new RainbowColorComponentDefinition(), new RainbowColorComponentDefinition());

        if (colorRainbowHueAnimate.checked) {
            colorRainbowHueAnimateWrapper.classList.remove("hidden");
            document.querySelector("label[for=color-rainbow-hue-value]").firstElementChild.textContent = "Hue Offset";
            colorRainbowHueValue.classList.remove("hue-slider");
            theme.color.rainbow.hue.animate = new RainbowColorComponentAnimation(
                +colorRainbowHueSpeed.value,
                +$(colorRainbowHueValue).slider("value"),
                +$(colorRainbowHueRange).roundSlider("getValue").split(',')[0],
                +$(colorRainbowHueRange).roundSlider("getValue").split(',')[1],
                colorRainbowHueAlternate.checked
            );

            let steps = [];
            let max = theme.color.rainbow.hue.animate.min > theme.color.rainbow.hue.animate.max ? theme.color.rainbow.hue.animate.max + 360 : theme.color.rainbow.hue.animate.max;
            for (let i = 0; i <= 1; i += 0.05) {
                steps.push(`hsl(${theme.color.rainbow.hue.animate.min * (1 - i) + max * i}, 50%, 50%)`);
            }
            if (theme.color.rainbow.hue.animate.alternate) {
                steps.push(...steps.slice(0, steps.length - 1).reverse());
            }
            colorRainbowHuePreview.style.background = `linear-gradient(to right, ${steps.join()})`;
        } else {
            colorRainbowHueAnimateWrapper.classList.add("hidden");
            document.querySelector("label[for=color-rainbow-hue-value]").firstElementChild.textContent = "Hue Value";
            colorRainbowHueValue.classList.add("hue-slider");
            theme.color.rainbow.hue.value = $(colorRainbowHueValue).slider("value");
        }

        if (colorRainbowSaturationAnimate.checked) {
            colorRainbowSaturationAnimateWrapper.classList.remove("hidden");
            document.querySelector("label[for=color-rainbow-saturation-value]").firstElementChild.textContent = "Saturation Offset";
            theme.color.rainbow.saturation.animate = new RainbowColorComponentAnimation(
                +colorRainbowSaturationSpeed.value,
                +colorRainbowSaturationValue.value,
                $(colorRainbowSaturationRange).slider("values")[0],
                $(colorRainbowSaturationRange).slider("values")[1],
                colorRainbowSaturationAlternate.checked
            );
        } else {
            colorRainbowSaturationAnimateWrapper.classList.add("hidden");
            document.querySelector("label[for=color-rainbow-saturation-value]").firstElementChild.textContent = "Saturation Value";
            theme.color.rainbow.saturation.value = colorRainbowSaturationValue.value;
        }

        if (colorRainbowLightnessAnimate.checked) {
            colorRainbowLightnessAnimateWrapper.classList.remove("hidden");
            document.querySelector("label[for=color-rainbow-lightness-value]").firstElementChild.textContent = "Lightness Offset";
            theme.color.rainbow.lightness.animate = new RainbowColorComponentAnimation(
                +colorRainbowLightnessSpeed.value,
                +colorRainbowLightnessValue.value,
                $(colorRainbowLightnessRange).slider("values")[0],
                $(colorRainbowLightnessRange).slider("values")[1],
                colorRainbowLightnessAlternate.checked
            );
        } else {
            colorRainbowLightnessAnimateWrapper.classList.add("hidden");
            document.querySelector("label[for=color-rainbow-lightness-value]").firstElementChild.textContent = "Lightness Value";
            theme.color.rainbow.lightness.value = colorRainbowLightnessValue.value;
        }

        let f = generateRainbowFunction(theme);
        if (f) {
            f();
            rainbowInterval = setInterval(f, 100);
        }
    }

    if (modernEnable.checked) {
        document.documentElement.setAttribute("modern", "true");
        modernWrapper.classList.remove("hidden");
        theme.color.modern = new ModernColorDefinition();
        theme.color.modern.interface = new ModernInterfaceColorDefinition();
        theme.color.modern.text = new ModernTextColorDefinition();
        theme.color.modern.options = new ModernOptionsDefinition();
        theme.color.modern.dark = $("#modern-color-primary").spectrum("get").isDark();
        document.documentElement.setAttribute("dark", theme.color.modern.dark);

        for (let id in modernColorMap) {
            key = modernColorMap[id]
            theme.color.modern[key[0]][key[1]] = $(id).spectrum("get").toString()
            setCSSVariable(key[2], $(id).spectrum("get").toString());
        }

        theme.color.modern.options.borderSize = +modernBorderSizeValue.value;
        theme.color.modern.options.borderRadius = +modernBorderRadiusValue.value;
        theme.color.modern.options.padding = +modernPaddingValue.value;

        setCSSVariable("modern-border-size", `${modernBorderSizeValue.value}px`);
        setCSSVariable("modern-border-radius", `${modernBorderRadiusValue.value}px`);
        setCSSVariable("modern-padding", `${modernPaddingValue.value}px`);

        if (theme.color.modern.dark) {
            theme.color.modern.calendar = [
                "#457da5",
                "#547c41",
                "#926c37",
                "#7c3d6b",
                "#0b4c9c",
                "#00209c",
                "#004a09",
                "#72721a",
                "#44233e",
                "#683131",
                "#770a0a",
                "#a72413",
                "#E0024C",
                "#188C16",
                "#bd7304",
                "#80168C",
                "#164152",
                "#00543f",
                "#633e11",
                "#461b2d"
            ];
        } else {
            theme.color.modern.calendar = [
                "#d6e7f4",
                "#d7e8cf",
                "#f9e9d4",
                "#e7e0e5",
                "#e6b5c9",
                "#f9f1cf",
                "#daf0f9",
                "#f9ddea",
                "#fbd7d8",
                "#f1f2d1",
                "#e0e8f5",
                "#fbd7e4",
                "#fcddd3",
                "#e7f2d5",
                "#e6e0ee",
                "#f0e5db",
                "#fce8d1",
                "#e1f1e7",
                "#f0dfed",
                "#e9e9ea"
            ];
        }
    } else {
        document.documentElement.setAttribute("modern", "false");
        modernWrapper.classList.add("hidden");
    }

    // Logo
    themeLogoWrapper.classList.add("hidden");
    if (themeSchoologyPlusLogo.checked) {
        theme.logo = new ThemeLogo(undefined, "schoology_plus");
        setCSSVariable("background-url", `url(${schoologyPlusLogoImageUrl})`);
    } else if (themeSchoologyLogo.checked) {
        theme.logo = new ThemeLogo(undefined, "schoology_logo");
        setCSSVariable("background-url", `url(${schoologyLogoImageUrl})`);
    } else if (themeNewLAUSDLogo.checked) {
        theme.logo = new ThemeLogo(undefined, "lausd_2019");
        setCSSVariable("background-url", `url(${lausdNewImageUrl})`);
    } else if (themeLAUSDLogo.checked) {
        theme.logo = new ThemeLogo(undefined, "lausd_legacy");
        setCSSVariable("background-url", `url(${lausdLegacyImageUrl})`);
    } else if (themeDefaultLogo.checked) {
        theme.logo = new ThemeLogo(undefined, "default");
        setCSSVariable("background-url", `url(${placeholderUrl})`);
    } else if (themeCustomLogo.checked) {
        themeLogoWrapper.classList.remove("hidden");
        if (themeLogo.value) {
            theme.logo = new ThemeLogo(themeLogo.value);
            checkImage(themeLogo.value, x => {
                if (x.target.width != 160 || x.target.height < 36 || x.target.height > 60) {
                    warnings.push("Logo image is not between the recommended sizes of 160x36 and 160x60");
                }
                setCSSVariable("background-url", `url(${themeLogo.value})`);
            }, () => errors.push("Logo URL does not point to a valid image"));
        }
    }

    // Cursor
    if (themeCursor.value) {
        theme.cursor = new ThemeCursor(themeCursor.value);
        checkImage(themeCursor.value, x => {
            if (x.target.width > 128 || x.target.height > 128) {
                errors.push("Cursor images must be smaller than 128x128 to appear");
            }
            setCSSVariable("cursor", `url(${themeCursor.value}), auto`);
        }, () => errors.push("Cursor URL does not point to a valid image"));
    } else {
        setCSSVariable("cursor", "auto");
    }

    // Icons
    if (iconListTable.rows.length > 1) {
        let customIcons = [];
        let first = true;
        for (let row of iconListTable.rows) {
            if (first || !row.cells[1].textContent || !row.cells[2].textContent) {
                first = false;
                continue;
            }
            let pattern = row.cells[1].textContent;
            let url = row.cells[2].textContent;
            checkImage(url, undefined, () => errors.push(url + " is not a valid image URL (Course Icons)"));
            try {
                RegExp(pattern);
            } catch {
                errors.push(pattern + " is not a valid regular expression (Course Icons)");
            }
            customIcons.push(new ThemeIcon(pattern, url));
        }
        theme.icons = customIcons;
    }

    updatePreview();
}

/**
 * Update the theme preview and optionally the theme JSON
 * @param {boolean} updateJSON Whether or not to replace the JSON output with form values
 */
function updatePreview(updateJSON = true) {
    if (updateJSON) output.value = JSON.stringify(theme, null, 4);
    let warningCard = document.getElementById("warning-card");
    if (warnings.length > 0) {
        warningCard.style.display = "block";
        document.getElementById("warning-content").innerHTML = warnings.join("<br/>");
    }
    else {
        warningCard.style.display = "none";
    }
    let errorCard = document.getElementById("error-card");
    if (errors.length > 0 && inEditMode()) {
        errorCard.style.display = "block";
        document.getElementById("error-content").innerHTML = errors.join("<br/>");
    }
    else {
        errorCard.style.display = "none";
    }
    M.updateTextFields();
    M.textareaAutoResize(output);
    iconPreview();
}

function trySaveTheme(apply = false) {
    try {
        saveTheme(apply);
    } catch (err) {
        alert(err);
    }
}

/**
 * Saves the theme currently displayed in the preview with the given name.
 * If the querystring parameter `theme` exists, it will rename the theme with that value
 * @param {boolean} [apply=false] If true, applies the theme and returns to defaultDomain
 */
function saveTheme(apply = false) {
    if (errors.length > 0) throw new Error("Please fix all errors before saving the theme:\n" + errors.join("\n"));
    let t = JSON.parse(output.value);
    if (origThemeName && t.name != origThemeName) {
        ConfirmModal.open("Rename Theme?", `Are you sure you want to rename "${origThemeName}" to "${t.name}"?`, ["Rename", "Cancel"], b => b === "Rename" && doSave(t));
    } else {
        doSave(t);
    }

    function doSave(t) {
        chrome.storage.sync.get({ themes: [] }, s => {
            let themes = s.themes.filter(x => x.name != (origThemeName || t.name));
            themes.push(t);
            chrome.storage.sync.set({ themes: themes }, () => {
                if (chrome.runtime.lastError) {
                    if (chrome.runtime.lastError.message.includes("QUOTA_BYTES_PER_ITEM")) {
                        alert("No space remaining to save theme. Please delete another theme or make this theme smaller in order to save.");
                        throw new Error("No space remaining to save theme. Please delete another theme or make this theme smaller in order to save.");
                    }
                }
                ConfirmModal.open("Theme saved successfully", "", ["OK"], () => {
                    origThemeName = t.name;
                    if (apply) chrome.storage.sync.set({ theme: t.name }, () => location.href = `https://${defaultDomain}`);
                    else location.reload();
                });
            });
        });
    }
}

/**
 * Returns a valid CSS color string if input is valid, else returns an empty string
 * @param {string} c A possibly valid CSS color string
 * @returns {string} A valid CSS color string or `""` if input was invalid
 */
function validateColor(c) {
    var ele = document.createElement("div");
    ele.style.color = c;
    return ele.style.color.split(/\s+/).join('').toLowerCase();
}

/**
 * Checks if a URL points to a valid image
 * @param {string} imageSrc An image URL
 * @param {(Event)} validCallback Callback if image is valid
 * @param {(ErrorEvent)} invalidCallback Callback if image is invalid
 */
function checkImage(imageSrc, validCallback, invalidCallback) {
    try {
        var img = new Image();
        img.onload = validCallback;
        img.onerror = invalidCallback;
        img.src = imageSrc;
    } catch {
        invalidCallback();
    }
}

/**
 * Sets the value of a CSS variable on the document
 * @param {string} name Variable name 
 * @param {string} val New variable value
 */
function setCSSVariable(name, val) {
    document.documentElement.style.setProperty(`--${name}`, val);
}

/**
 * Checks if a string is a valid JSON object
 * @param {string} str A JSON string
 * @returns {{}|boolean} The object if it is valid JSON, else false
 */
function parseJSONObject(str) {
    var isObject = (val) => val instanceof Object ? true : false;
    try {
        let o = JSON.parse(str);
        return isObject(o) ? o : false;
    } catch (e) {
        return false;
    }
}

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
            } else {
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
 * Applies the theme with the given name
 * @param {string} t The theme's name
 */
function applyTheme(t) {
    importAndRender(allThemes[t]);
}

/**
 * Deletes a theme with the given name from the Chrome Sync Storage
 * @param {string} name The theme's name
 */
function deleteTheme(name) {
    ConfirmModal.open("Delete Theme?", `Are you sure you want to delete the theme "${name}"?\nThe page will reload when the theme is deleted.`, ["Delete", "Cancel"], b => {
        if (b === "Delete") {
            trackEvent(`Theme: ${name}`, "delete", "Theme List");
            chrome.storage.sync.get(["theme", "themes"], s => {
                chrome.storage.sync.set({ theme: s.theme == name ? null : s.theme, themes: s.themes.filter(x => x.name != name) }, () => window.location.reload());
            });
        }
    });
}

/**
 * Opens the editor interface with the given theme selected, or 
 * none selected if name not provided
 * @param {string} [name] The theme to edit
 */
function editTheme(name, replaceName = undefined) {
    trackEvent(`Theme: ${name}`, "edit", "Theme List");
    clearInterval(rainbowInterval);
    themesListSection.classList.add("hidden");
    themeEditorSection.classList.remove("hidden");
    let themeToLoad = name ? allThemes[name] : { name: "My Theme", hue: 210 };
    if (replaceName) {
        themeToLoad.name = replaceName;
    }
    importAndRender(themeToLoad);
    previewSection.classList.add("show-editor-controls");
    output.removeAttribute("readonly");
    Array.from(iconList.querySelectorAll(".class-name, .icon-url")).map(x => x.setAttribute("contenteditable", "true"));
    origThemeName = replaceName || name;
    document.querySelector("#json-output + label").textContent = "JSON (Paste to import a theme)";
}

/**
 * Opens a modal allowing user to paste a JSON theme string
 * and then saves the provided theme
 */
function importTheme() {
    PromptModal.open("Import Theme", "Paste theme JSON here", ["Import", "Cancel"], (button, text) => {
        if (button === "Import") {
            try {
                let j = JSON.parse(text);
                importAndRender(j);
                saveTheme();
            }
            catch {
                ConfirmModal.open("Error Importing Theme", errors.length > 0 ? errors.join() : "Please provide a valid JSON string", ["OK"]);
            }
        }
    });
}

/**
 * Cycles the color of the interface
 */
function generateRainbowFunction(theme) {
    if (theme.color.rainbow) {
        return () => {
            let hue = 0;
            let saturation = 0;
            let lightness = 0;
            let time = new Date().valueOf();

            // Equation for time-based hue, saturation, lightness:
            // hue = (((time / (150 - speed)) + offset) % (alternate ? range * 2 : range)) + min
            // if alternate and hue > max: hue = max - (hue - max)

            if (theme.color.rainbow.hue.animate) {
                let o = theme.color.rainbow.hue.animate;

                if (o.max < o.min) {
                    o.max += 360;
                }

                hue = getComponentValue(o, time);

            } else {
                hue = theme.color.rainbow.hue.value;
            }
            if (theme.color.rainbow.saturation.animate) {
                saturation = getComponentValue(theme.color.rainbow.saturation.animate, time);
            } else {
                saturation = theme.color.rainbow.saturation.value;
            }
            if (theme.color.rainbow.lightness.animate) {
                lightness = getComponentValue(theme.color.rainbow.lightness.animate, time);
            } else {
                lightness = theme.color.rainbow.lightness.value;
            }

            document.documentElement.style.setProperty("--color-hue", hue);
            setCSSVariable("primary-color", `hsl(var(--color-hue), ${saturation}%, ${lightness}%)`);
            setCSSVariable("background-color", "hsl(var(--color-hue), 60%, 30%)");
            setCSSVariable("hover-color", "hsl(var(--color-hue), 55%, 40%)");
            setCSSVariable("border-color", "hsl(var(--color-hue), 60%, 25%)");
            setCSSVariable("link-color", "hsl(var(--color-hue), 55%, 40%)");
        }
    }
    return undefined;

    function getComponentValue(animateObject, time) {
        let { speed, offset, alternate, min, max } = animateObject;
        let range = max - min;
        let v = (((time / (150 - speed)) + +offset) % (alternate ? range * 2 : range)) + min;
        if (alternate && v > max) {
            v = max - (v - max);
        }
        return v;
    }
}

function addIcon() {
    trackEvent("new-icon", "click", "Theme Editor");
    let template = `<td style=text-align:center><a class="action-button tooltipped arrow-button move-down"data-tooltip="Move Down"><i class=material-icons>arrow_downward</i> </a><a class="action-button tooltipped arrow-button move-up"data-tooltip="Move Up"><i class=material-icons>arrow_upward</i></a><td class=class-name data-text="Class Name Pattern"><td class=icon-url data-text="Icon URL or paste/drop image"><td><img class="small-icon-preview" height=32/></td><td><a class="action-button tooltipped btn-flat delete-icon-button right waves-effect waves-light"data-tooltip=Delete><i class=material-icons>delete</i></a>`;
    let tr = document.createElement("tr");
    tr.innerHTML = template;
    iconList.appendChild(tr);
    let preview = tr.querySelector(".small-icon-preview");
    tr.querySelector(".move-down").addEventListener("click", moveDown);
    tr.querySelector(".move-up").addEventListener("click", moveUp);
    tr.querySelector(".delete-icon-button").addEventListener("click", deleteIcon);

    // Replaces pasted images with data urls
    tr.querySelector(".icon-url").addEventListener("paste", uploadAndPaste);

    initializeDragAndDrop(tr.querySelector(".icon-url"), tr.querySelector(".small-icon-preview"), "textContent");

    // Replaces pasted HTML with plain text
    tr.querySelector(".class-name").addEventListener("paste", plainTextPaste);

    tr.querySelector(".icon-url").addEventListener("input", e => preview.src = e.target.textContent);
    Array.from(tr.querySelectorAll("td")).map(x => x.addEventListener("blur", e => e.target.scrollLeft = 0));
    M.Tooltip.init(tr.querySelectorAll('.tooltipped'), { outDuration: 0, inDuration: 300, enterDelay: 0, exitDelay: 10, transition: 10 });
    if (inEditMode()) {
        let arr = Array.from(tr.querySelectorAll(".class-name, .icon-url"));
        arr.map(x => x.setAttribute("contenteditable", "true"));
        arr.map(x => x.addEventListener("input", updateOutput));
    }
    return tr;
}

function uploadAndPaste(pasteEvent) {
    let items = (pasteEvent.clipboardData || pasteEvent.originalEvent.clipboardData).items;
    let blob = null;
    for (let i of items) {
        if (i.type.indexOf("image") === 0) {
            blob = i.getAsFile();
        }
    }
    if (blob !== null) {
        pasteEvent.preventDefault();
        pasteEvent.stopPropagation();
        var reader = new FileReader();
        reader.onload = function (e) {
            let text = e.target.result;
            pasteEvent.target.dataset.originalText = pasteEvent.target.dataset.text;
            pasteEvent.target.dataset.text = "Uploading..."
            let t = M.toast({ html: `Uploading image...`, displayLength: Number.MAX_SAFE_INTEGER });
            imgurUpload(text, result => {
                t.dismiss();
                let link = result.data.link;
                if (document.queryCommandSupported('insertText')) {
                    document.execCommand('insertText', false, link);
                } else {
                    document.execCommand('paste', false, link);
                }
                trackEvent("icon-image", "paste", "Theme Editor");
                preview.src = link;
                pasteEvent.target.dataset.text = pasteEvent.target.dataset.originalText;
                pasteEvent.target.dataset.originalText = "";
                updateOutput();
            }, error => {
                t.dismiss();
                M.toast({ html: `Uploading image failed: ${error.message || error.toString()}` });
                pasteEvent.target.dataset.text = pasteEvent.target.dataset.originalText;
                pasteEvent.target.dataset.originalText = "";
            });
        };
        reader.readAsDataURL(blob);
    } else {
        plainTextPaste(pasteEvent);
    }
}

function plainTextPaste(e) {
    e.preventDefault();
    var text = '';
    if (e.clipboardData || e.originalEvent.clipboardData) {
        text = (e.originalEvent || e).clipboardData.getData('text/plain');
    } else if (window.clipboardData) {
        text = window.clipboardData.getData('Text');
    }
    if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
    } else {
        document.execCommand('paste', false, text);
    }
}

function moveUp(e) {
    let target = e.target;
    while (target.tagName != "TR") target = target.parentElement;
    if (target.previousElementSibling) {
        target.parentNode.insertBefore(target, target.previousElementSibling);
    }
    updateOutput();
}

function moveDown(e) {
    let target = e.target;
    while (target.tagName != "TR") target = target.parentElement;
    if (target.nextElementSibling) {
        target.parentNode.insertBefore(target.nextElementSibling, target);
    }
    updateOutput();
}

function deleteIcon(e) {
    trackEvent("delete-icon-button", "click", "Theme Editor");
    let target = e.target;
    while (target.tagName != "TR") target = target.parentElement;
    M.Tooltip.getInstance(target.querySelector(".delete-icon-button")).destroy();
    target.outerHTML = "";
    updateOutput();
}

function iconPreview(e) {
    testIcon.src = (s => {
        if (!s) {
            return chrome.runtime.getURL("imgs/fallback-course-icon.svg");
        }

        s += " ";

        if (theme && theme.icons) {
            for (let iconPattern of theme.icons) {
                if (s.match(new RegExp(iconPattern.regex, 'i'))) {
                    return iconPattern.url;
                }
            }
        }

        if (isLAUSD() || __storage.useDefaultIconSet === "enabled") {
            for (let iconPattern of icons) {
                if (s.match(new RegExp(iconPattern.regex, 'i'))) {
                    return iconPattern.url;
                }
            }
        }

        return chrome.runtime.getURL("imgs/fallback-course-icon.svg");
    })(iconTestText.value);
}

function copyThemeToClipboard(themeName) {
    trackEvent(`Theme: ${themeName}`, "copy", "Theme List");
    let text = JSON.stringify(allThemes[themeName]);
    var copyFrom = $('<textarea/>');
    copyFrom.text(text);
    $('body').append(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    copyFrom.remove();
    M.toast({ html: `Copied theme "${themeName}" to clipboard` });
}

function inEditMode() { return !!document.querySelector(".show-editor-controls"); }

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(region) {
    if (!region.classList.contains("highlight")) {
        region.classList.add("highlight");
        region.dataset.originalText = region.dataset.text;
        region.dataset.text = "Drop to Use Image"
    }
}

function unhighlight(region) {
    if (region.classList.contains("highlight")) {
        region.classList.remove("highlight");
        region.dataset.text = region.dataset.originalText;
        region.dataset.originalText = "";
    }
}

function handleDrop(e, region, preview, property) {
    try {
        if (e.dataTransfer.files.length > 0) {
            let file = e.dataTransfer.files[0];
            let reader = new FileReader();
            reader.onloadend = () => {
                region.dataset.originalText = region.dataset.text;
                region.dataset.text = "Uploading..."
                let t = M.toast({ html: `Uploading image...`, displayLength: Number.MAX_SAFE_INTEGER });

                imgurUpload(reader.result, result => {
                    success(result.data.link, t);
                }, error => {
                    t.dismiss();
                    M.toast({ html: `Uploading image failed: ${error.message || error.toString()}` });
                    region.dataset.text = region.dataset.originalText;
                    region.dataset.originalText = "";
                });
            };
            reader.readAsDataURL(file);
        } else if (e.dataTransfer.items.length >= 3) {
            e.dataTransfer.items[2].getAsString(s => {
                let img = htmlToElement(s);
                success(img.src);
            });
        }
    } catch (err) {
        M.toast({ html: `Error: Invalid image file` });
        Logger.error(err);
    }

    function success(link, toast) {
        trackEvent("icon-image", "drop", "Theme Editor");
        if (toast) {
            toast.dismiss();
        }
        if (preview) {
            preview.src = link;
        }
        region[property] = link;
        region.dataset.text = region.dataset.originalText;
        region.dataset.originalText = "";
        updateOutput();
    }
}

function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function imgurUpload(base64, callback, errorCallback) {
    if (!localStorage.getItem("imgurPromptViewed")) {
        ConfirmModal.open("Imgur Upload Consent", "By clicking 'agree', you consent to have the image you just dropped or pasted uploaded to Imgur. Click cancel to prevent the upload. If you click 'agree' this message will not be shown again.", ["Agree", "Cancel"], b => {
            if (b === "Agree") {
                localStorage.setItem("imgurPromptViewed", true);
                doUpload();
            } else {
                errorCallback(new Error("User did not give consent to upload"));
            }
        })
    } else {
        doUpload();
    }

    function doUpload() {
        const CLIENT_ID = "56755c36eb5772d";
        fetch("https://api.imgur.com/3/image", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Client-ID ${CLIENT_ID}`
            },
            body: JSON.stringify({
                type: "base64",
                image: base64.split(',')[1]
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response;
        }).then(x => x.json()).then(callback).catch(err => Logger.log(err) || errorCallback(err));
    }
}

function initializeDragAndDrop(region, preview, property) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        region.addEventListener(eventName, preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        region.addEventListener(eventName, e => highlight(region), false);
    });
    region.addEventListener("dragleave", e => unhighlight(region), false);
    region.addEventListener('drop', e => {
        unhighlight(region);
        handleDrop(e, region, preview, property);
    }, false);
}

function hueSliderEvent(event, ui) {
    if (event.originalEvent) {
        updateOutput();
        document.getElementById(event.target.dataset.display).textContent = ui.value.toString();
    }
}

function rangeSliderEvent(event, ui) {
    if (event.originalEvent) {
        document.getElementById(event.target.id + "-display").textContent = `${ui.values[0]} - ${ui.values[1]}`;
        updateOutput();
    }
}

function circleRangeSliderEvent(args) {
    updateOutput();
}

$(document).ready(function () {
    $.fn.roundSlider.prototype._invertRange = true;

    $("#theme-hue").slider({
        min: 0,
        max: 359,
        slide: hueSliderEvent,
        stop: hueSliderEvent,
        change: hueSliderEvent
    });

    $(colorRainbowHueValue).slider({
        min: 0,
        max: 359,
        slide: hueSliderEvent,
        stop: hueSliderEvent,
        change: hueSliderEvent
    });

    $("#color-rainbow-hue-range").roundSlider({
        sliderType: "range",
        handleShape: "round",
        width: 15,
        radius: 75,
        value: "0,359",
        max: 359,
        startAngle: 90,
        drag: circleRangeSliderEvent,
        stop: circleRangeSliderEvent,
        change: circleRangeSliderEvent
    });

    document.querySelector(".rs-tooltip").style.margin = "-15.5px 0 0 -33.0547px";

    $("#color-rainbow-saturation-range").slider({
        min: 0,
        max: 100,
        range: true,
        slide: rangeSliderEvent,
        stop: rangeSliderEvent,
        change: rangeSliderEvent,
        values: [0, 100]
    });

    $("#color-rainbow-lightness-range").slider({
        min: 0,
        max: 100,
        range: true,
        slide: rangeSliderEvent,
        stop: rangeSliderEvent,
        change: rangeSliderEvent,
        values: [0, 100]
    });

    initializeDragAndDrop(themeCursor, null, "value");
    initializeDragAndDrop(themeLogo, null, "value");
    themeCursor.addEventListener("paste", uploadAndPaste);
    themeLogo.addEventListener("paste", uploadAndPaste);

    let oninput = e => document.getElementById(e.target.dataset.label).textContent = e.target.value;
    for (let input of document.querySelectorAll("input[type=range][data-label]")) {
        input.addEventListener("input", oninput);
        document.getElementById(input.dataset.label).textContent = input.value;
    }

    for (let t of __defaultThemes) {
        if (!isLAUSD() && LAUSD_THEMES.includes(t.name)) {
            continue;
        }
        allThemes[t.name] = t;
        defaultThemes.push(t.name);
    }

    chrome.storage.sync.get(["theme", "themes"], s => {
        // default theme is "Schoology Plus"
        s.theme = s.theme || "Schoology Plus";

        for (let t of s.themes || []) {
            allThemes[t.name] = t;
        }

        for (let t in allThemes) {
            let themeItem = createElement("a", ["collection-item", "theme-item"], {
                dataset: {
                    theme: t
                },
                onclick: e => {
                    applyTheme(t);
                    for (let elem of themeItem.parentElement.children) {
                        elem.classList.remove("active");
                    }
                    themeItem.classList.add("active");
                }
            }, [createElement("span", ["tooltipped"], {
                textContent: t + (CLASSIC_THEMES.includes(t) ? " (Classic)" : ""),
                dataset: {
                    tooltip: t + (CLASSIC_THEMES.includes(t) ? " (Classic)" : "")
                }
            })]);

            let props = {
                textContent: "check",
                dataset: {
                    tooltip: "Apply Theme"
                },
                onclick: e => {
                    e.stopPropagation();
                    ConfirmModal.open("Apply Theme?", `Are you sure you want to apply the theme ${t}? (You need to reload Schoology Plus afterwards!)`, ["Apply", "Cancel"], b => {
                        if (b === "Apply") {
                            trackEvent(`Theme: ${t}`, "apply", "Theme List");
                            chrome.storage.sync.set({ theme: t }, () => location.href = `https://${defaultDomain}`);
                        }
                    });
                }
            };
            let appliedProps = {
                textContent: "star",
                dataset: {
                    tooltip: "Theme Applied"
                },
                onclick: () => location.href = `https://${defaultDomain}`
            };

            function createActionButton(properties) {
                return createElement("i", ["material-icons", "right", "tooltipped"], properties);
            }

            buttonsDiv = createElement("div", ["right"]);
            buttonsDiv.style.width = "160px";
            themeItem.appendChild(buttonsDiv);

            buttonsDiv.appendChild(createActionButton(t == s.theme ? appliedProps : props));

            let shareButton = createActionButton({
                textContent: "content_copy",
                dataset: {
                    tooltip: "Copy Theme to Clipboard"
                }
            });
            shareButton.addEventListener("click", e => {
                copyThemeToClipboard(t);
            });
            buttonsDiv.appendChild(shareButton);


            if (!defaultThemes.includes(t)) {
                buttonsDiv.appendChild(createActionButton({ textContent: "delete", dataset: { tooltip: "Delete Theme" }, onclick: e => deleteTheme(t) || e.stopPropagation() }));
                buttonsDiv.appendChild(createActionButton({ textContent: "edit", dataset: { tooltip: "Edit Theme" }, onclick: () => editTheme(t) }));
            }

            themesList.appendChild(themeItem);
        }

        let selected = Array.from(themesList.children).find(x => x.dataset.theme == s.theme);
        (selected || themesList.firstElementChild).click();
        M.Tooltip.init(document.querySelectorAll('.tooltipped'), { outDuration: 0, inDuration: 300, enterDelay: 0, exitDelay: 10, transition: 10 });
        var elems = document.querySelectorAll('.fixed-action-btn');
        M.FloatingActionButton.init(elems, { direction: 'left', hoverEnabled: false });
    });
});
