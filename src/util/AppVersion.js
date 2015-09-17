import _ from "lodash";
import request from "superagent-bluebird-promise";
import Logger from "./Logger";
import RegExps from "./RegExps";

var log = new Logger(__filename);

/**
 * Utility for checking if the application has been updated on the server while running.
 * Periodically loads the app's HTML and checks if it links to new versions of the css and js files.
 */
export default class AppVersion {
    constructor(win=window) {
        this.window = win;
        this.listeners = [];
        this.linkSrcs = [];
        this.scriptSrcs = [];

        _.forEach(this.window.document.querySelectorAll("link"), link => {
            if (link.href) {
                this.linkSrcs.push(link.href.substr(link.href.lastIndexOf("/") + 1));
            }
        });
        _.forEach(this.window.document.querySelectorAll("script"), script => {
            if (script.src) {
                this.scriptSrcs.push(script.src.substr(script.src.lastIndexOf("/") + 1));
            }
        });

        if (this.linkSrcs.length > 0 && this.scriptSrcs.length > 0) {
            this.window.setInterval(this.checkVersion.bind(this), 30 * 60 * 1000);
        } else {
            log.info("Not production, version checking disabled.");
        }
    }

    onVersionChange(listener) {
        this.listeners.push(listener);
    }

    checkVersion() {
        return request.get("")
            .then(data => {
                var changed = false;

                _.forEach(RegExps.getAllMatches(/<link href=".*?\/(.*?)"/g, data.text), name => {
                    if (!_.contains(this.linkSrcs, name)) {
                        changed = true;
                    }
                });
                _.forEach(RegExps.getAllMatches(/<script src=".*?\/(.*?)"/g, data.text), name => {
                    if (!_.contains(this.scriptSrcs, name)) {
                        changed = true;
                    }
                });

                if (changed) {
                    log.info("Version change detected.");
                    _.forEach(this.listeners, listener => {
                        listener();
                    });
                }
                return changed;
            })
            .catch(() => {});
    }

    static reloadImmediatelyOnChange(win) {
        var version = new AppVersion(win);
        version.onVersionChange(() => {
            version.window.location.reload();
        });
        return version;
    }

    static reloadRoutedOnChange(router, win) {
        var version = new AppVersion(win);
        version.onVersionChange(() => {
            router.onRouteChange(() => {
                version.window.location.reload();
            });
        });
        return version;
    }
}