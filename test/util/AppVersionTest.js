import expect from "unexpected";
import sinon from "sinon";
import Promise from "bluebird";
import request from "superagent-bluebird-promise";
import AppVersion from "../../src/util/AppVersion";

function mockRequestGet(name) {
    return sinon.stub(request, "get").withArgs("")
        .returns(Promise.resolve({text:
        "<html>" +
            "<head><link href=\"static/main-12345.css\"></head>" +
            "<body>" +
                "<script src=\"static/vendor-" + name + ".js\"></script>" +
                "<script src=\"static/main-12345.js\"></script>" +
            "</body>" +
        "</html>"}));
}

describe("AppVersion", () => {
    var mockWindow;
    beforeEach(() => {
        mockWindow = {
            document: {
                querySelectorAll: sinon.stub()
            },
            setInterval: sinon.spy(),
            location: {
                reload: sinon.spy()
            }
        };

        mockWindow.document.querySelectorAll.withArgs("link")
            .returns([{href: "static/main-12345.css"}]);
        mockWindow.document.querySelectorAll.withArgs("script")
            .returns([{src: "static/main-12345.js"}, {src: "static/vendor-12345.js"}]);
    });

    it("should get current version from elements in document when created.", () => {
        var version = new AppVersion(mockWindow);

        expect(version.linkSrcs, "to contain", "main-12345.css");
        expect(version.scriptSrcs, "to contain", "main-12345.js", "vendor-12345.js");
    });

    describe("checkVersion() should get potential new version from AJAX loading the page again,", () => {
        it("and resolve with true if it is different.", done => {
            mockRequestGet("NEW");

            var version = new AppVersion(mockWindow);

            version.checkVersion()
                .then(changed => {
                    expect(changed, "to be true");
                    done();
                });
        });

        it("and resolve with false if it is the same.", done => {
            mockRequestGet("12345");

            var version = new AppVersion(mockWindow);

            version.checkVersion()
                .then(changed => {
                    expect(changed, "to be false");
                    done();
                });
        });
    });

    describe("reloadRoutedOnChange()", () => {
        it("should reload on route change after version change.", done => {
            mockRequestGet("NEW");
            var mockRouter = {
                onRouteChange: sinon.spy()
            };
            var version = AppVersion.reloadRoutedOnChange(mockRouter, mockWindow);

            version.checkVersion()
                .then(() => {
                    mockRouter.onRouteChange.getCall(0).args[0]();

                    expect(mockWindow.location.reload, "was called once");
                    done();
                });
        });
    });
});