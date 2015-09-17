import _ from "lodash";
import Store from "./Store";

/**
 * Specialized store that saves its state in localstorage as JSON between sessions.
 */
export default class CachingStore extends Store {
    /**
     * @param {String} storageKey The key to save data under in localstorage.
     * @param {Window} [win]
     */
    constructor(storageKey, win) {
        super();
        this.storageKey = storageKey;
        this.window = win || window;

        this.window.addEventListener("unload", () => this.saveToLocalStorage());
    }

    saveToLocalStorage() {
        this.window.localStorage.setItem(this.storageKey, JSON.stringify(this.marshalState()));
    }

    /**
     * Get the cached state.
     * Use this when assigning state in your subclass constructor.
     * @returns {Object}
     */
    getCachedState() {
        var rawData = this.window.localStorage.getItem(this.storageKey);
        if (rawData) {
            var data = JSON.parse(rawData);
            return this.unmarshalState(data);
        } else {
            return null;
        }
    }

    marshalState() {
        return this.state;
    }

    /**
     * Optionally modify data after retrieving it (e.g. to replace raw objects with classes).
     * @param {Object} data
     * @returns {Object}
     */
    unmarshalState(data) {
        return data;
    }

    /**
     * Transforms a list of untyped objects into a list of class instances, created with the objects.
     * @param {Object[]} list
     * @param {*} Klass
     * @returns {*[]}
     */
    static listOf(list, Klass) {
        if (!list) {
            return [];
        }
        return _.map(list, item => {
            return new Klass(item);
        });
    }

    /**
     * Transforms a map with untyped object values into a map with class instance values, created with the objects.
     * @param {Object} obj
     * @param {*} Klass
     * @returns {Object}
     */
    static mapOf(obj, Klass) {
        if (!obj) {
            return {};
        }
        return _.reduce(obj, (result, value, key) => {
            result[key] = new Klass(value);
            return result;
        }, {});
    }
}
