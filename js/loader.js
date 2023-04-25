if (window.splusLoaded) {
    throw new Error(`Already loaded loader.js`);
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
    * Creates a Schoology Plus themed button element
    * @param {string} id The ID for the button element
    * @param {string} text The text to show on the button
    * @param {(e: Event)=>void} callback A function to be called when the button is clicked
    */
function createButton(id, text, callback) {
    return createElement("span", ["submit-span-wrapper", "splus-modal-button"], {
        onclick: callback
    }, [createElement("input", ["form-submit", "splus-track-clicks"], {
        type: "button",
        value: text,
        id: id,
        dataset: {
            splusTrackingContext: "S+ Button"
        }
    })]);
}

window.splus = {};
/**
 * Wrapper for various `console` functions. Each adds a custom prefix to the start of the log message.
 */
window.splus.Logger = {
    /**
     * Logs each argument to the console. Provides identical functionality to `console.log`, but WITHOUT format specifiers. 
     * @type {(...args)=>void}
     */
    log: (() => console.log.bind(window.console, `%c+`, createLogPrefix("#81D4FA")))(),
    /**
     * Logs each argument to the console ("error" log level). Provides identical functionality to `console.error`, but WITHOUT format specifiers. 
     * @type {(...args)=>void}
     */
    error: (() => console.error.bind(window.console, `%c+`, createLogPrefix("#FF6961")))(),
    /**
     * Logs each argument to the console ("info" log level). Provides identical functionality to `console.info`, but WITHOUT format specifiers. 
     * @type {(...args)=>void}
     */
    info: (() => console.info.bind(window.console, `%c+`, createLogPrefix("white")))(),
    /**
     * Logs each argument to the console ("warning" log level). Provides identical functionality to `console.warn`, but WITHOUT format specifiers. 
     * @type {(...args)=>void}
     */
    warn: (() => console.warn.bind(window.console, `%c+`, createLogPrefix("#FDFD96")))(),
    /**
     * Logs each argument to the console ("info" log level). Provides identical functionality to `console.trace`, but WITHOUT format specifiers. 
     * @type {(...args)=>void}
     */
    trace: (() => console.trace.bind(window.console, `%c+`, createLogPrefix("orange")))(),
    /**
     * Logs each argument to the console ("debug" log level). Provides identical functionality to `console.debug`, but WITHOUT format specifiers. 
     * @type {(...args)=>void}
     */
    debug: (() => console.debug.bind(window.console, `%c+`, createLogPrefix("lightgreen")))(),
}

function createLogPrefix(color) {
    return `color:${color};border:1px solid #2A2A2A;border-radius:100%;font-size:14px;font-weight:bold;padding: 0 4px 0 4px;background-color:#2A2A2A`;
}

window.splusLoaded = new Set(["loader"]);

async function loadDependencies(name, dependencies) {
    if (window.splusLoaded.has(name)) {
        throw new Error(`Already loaded ${name}`);
    }

    while (!dependencies.every(d => window.splusLoaded.has(d))) {
        window.splus.Logger.debug(`Waiting to load ${name}: some of ${dependencies} not in ${Array.from(window.splusLoaded)}`);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    window.splus.Logger.debug(`Starting loading ${name}.js`);
}

window.splus.Logger.debug(`Loaded loader.js`);
