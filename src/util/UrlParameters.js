import _ from "lodash";

/**
 * Query or hash fragment parameter parsing.
 * The parameters are placed directly as properties on the object.
 */
export default class UrlParameters {
    constructor(parameterString) {
        if (parameterString !== "") {
            var parameters = parameterString.split("&");
            _.forEach(parameters, parameter => {
                var keyValue = parameter.split("=");
                if (keyValue.length === 2) {
                    this[keyValue[0]] = decodeURIComponent(keyValue[1]);
                } else {
                    this[keyValue[0]] = "";
                }
            });
        }
    }

    /**
     * Returns the parameters as a query string, including the leading ? if applicable.
     *
     * @returns {String}
     */
    toQueryString() {
        return this._join("?");
    }

    /**
     * Returns the parameters as a hash fragment, including the leading # if applicable.
     *
     * @returns {String}
     */
    toHashFragment() {
        return this._join("#");
    }

    _join(prefix) {
        var keys = _.keys(this);

        if (keys.length === 0) {
            return "";
        }

        return prefix + _.map(keys, key => encodeURIComponent(key) + "=" + encodeURIComponent(this[key])).join("&");
    }

    /**
     * Create from query parameters.
     *
     * @param {Window} [frame] The window to parse query parameters for. Optional, defaults to the current frame.
     * @returns {UrlParameters}
     */
    static fromQuery(frame) {
        frame = frame || window;
        var parameters = frame.location.search;
        return new UrlParameters(parameters.length > 0 ? parameters.substr(1) : "");
    }

    /**
     * Create from hash fragment parameters.
     *
     * @param {Window} [frame] The window to parse hash fragment parameters for. Optional, defaults to the current frame.
     * @returns {UrlParameters}
     */
    static fromHash(frame) {
        frame = frame || window;
        // We can't use window.location.hash as a Firefox bug from 2002 (!!!) automatically unescapes it when accessed.
        return new UrlParameters(frame.location.href.split("#")[1] || "");
    }
}

