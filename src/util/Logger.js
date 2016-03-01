/*eslint no-console: 0*/
import _ from "lodash";

var loggers = {};
var defaultLogLevel = (process.env.NODE_ENV === "production") ? 4 : 2;

function noop() {}

/**
 * Named logger that can be used instead of console.log().
 */
export default class Logger {
    /**
     * @param {String} name The name of the logger, if passing __filename it will be extracted automatically.
     */
    constructor(name) {
        name = Logger._extractFilename(name);
        if (loggers[name]) {
            return loggers[name];
        }
        this.name = name;
        this.setLogLevel(defaultLogLevel);
        loggers[name] = this;
        return this;
    }

    setLogLevel(level) {
        _.forEach(["error", "warn", "info", "debug", "trace"], method => {
            // Binding their context to console ensures that they work just like calling directly on console, including correct line number reference.
            // Node.js doesn't have debug() and trace().
            var methodExists = typeof console !== "undefined" && console[method];
            if (methodExists && Logger.LogLevel[method.toLocaleUpperCase()] >= level) {
                this[method] = Function.prototype.bind.call(console[method], console, "[" + this.name + "]");
            } else {
                this[method] = noop;
            }
        });
    }

    static _extractFilename(filename) {
        if (_.endsWith(filename, ".js")) {
            var sep;
            if (_.includes(filename, "/")) {
                sep = "/";
            } else {
                sep = "\\";
            }
            var start = filename.lastIndexOf(sep) + 1;
            var end = filename.lastIndexOf(".");
            return filename.substr(start, end - start);
        } else {
            return filename;
        }
    }

    static setLogLevelAll(level) {
        defaultLogLevel = level;
        _.forEach(loggers, logger => {
            logger.setLogLevel(level);
        });
    }
}

Logger.LogLevel = {
    TRACE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5,
    OFF: 6
};