/*global global*/
import _ from "lodash";
import jsdom from "jsdom";
import expect from "unexpected";
import unexpectedSinon from "unexpected-sinon";
import sinon from "sinon";

// Set up expected browser globals.
global.document = jsdom.jsdom("<!doctype html><html><head></head><body></body></html>");
global.window = document.defaultView;
global.navigator = {
    userAgent: ""
};

// Set up Unexpected plugins (on the actual unexpected instance, so they show up when it is imported by other modules).
expect.installPlugin(unexpectedSinon);

// Automatically restore Sinon stubs after tests end.
var oldWrap = sinon.wrapMethod;
var wrappeds = [];
var afterSetup = false;
sinon.wrapMethod = function (...args) {
    var out = oldWrap.apply(sinon, args);
    wrappeds.push(out);
    if (!afterSetup) {
        // Delay setting up afterEach since it is not yet defined when this module is run.
        afterEach(() => {
            _.forEach(wrappeds, wrapped => {
                wrapped.restore();
            });
            wrappeds = [];
        });
        afterSetup = true;
    }
    return out;
};
