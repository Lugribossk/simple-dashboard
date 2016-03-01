import expect from "unexpected";
import sinon from "sinon";
import request from "superagent-bluebird-promise";
import DropwizardHealthcheck from "../../src/source/DropwizardHealthcheck";

let mockRequestGet = value => {
    sinon.stub(request, "get").returns({
        promise() {
            return value;
        }
    });
};

describe("DropwizardHealthcheck", () => {
    it("should use adminPath to construct healthcheck URL.", () => {
        mockRequestGet(Promise.resolve({}));

        new DropwizardHealthcheck({adminPath: "http://example.com:8081"}).fetchData();

        expect(request.get, "was called with", "http://example.com:8081/healthcheck");
    });

    it("should have danger status when response has unhealthy check.", done => {
        mockRequestGet(Promise.reject({
            body: {
                db: {
                    healthy: true
                },
                ponies: {
                    healthy: false,
                    message: "blah"
                }
            }
        }));

        new DropwizardHealthcheck({adminPath: ""})
            .getStatus()
            .then(status => {
                expect(status, "to satisfy", {
                    status: "danger",
                    messages: [{
                        message: "blah"
                    }]
                });
                done();
            });

    });

    it("should have danger status when healthcheck does not respond.", done => {
        mockRequestGet(Promise.reject({}));

        new DropwizardHealthcheck({adminPath: ""})
            .getStatus()
            .then(status => {
                expect(status, "to satisfy", {
                    status: "danger"
                });
                done();
            });
    });

    it("should have success status when response has only healthy checks.", done => {
        mockRequestGet(Promise.resolve({
            body: {
                db: {
                    healthy: true
                },
                ponies: {
                    healthy: true
                }
            }
        }));

        new DropwizardHealthcheck({adminPath: ""})
            .getStatus()
            .then(status => {
                expect(status, "to satisfy", {
                    status: "success"
                });
                done();
            });
    });
});