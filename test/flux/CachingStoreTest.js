import _ from "lodash";
import expect from "unexpected";
import sinon from "sinon";
import CachingStore from "../../src/flux/CachingStore";

class TestStore extends CachingStore {
    constructor(window) {
        super("teststore", window);

        this.state = this.getCachedState() || {
            data: "default"
        };
    }
}

class TestObj {
    constructor(data) {
        _.assign(this, data);
    }
}

describe("CachingStore", () => {
    var mockWindow;
    beforeEach(() => {
        mockWindow = {
            addEventListener: sinon.spy(),
            localStorage: {
                getItem: sinon.spy(),
                setItem: sinon.spy()
            }
        };
    });

    describe("instantiation", () => {
        it("should load state from localstorage, and use defaults if it was not found.", () => {
            var store = new TestStore(mockWindow);

            expect(mockWindow.localStorage.getItem, "was called with", "teststore");
            expect(store.state.data, "to be", "default");
        });

        it("should load state from localstorage.", () => {
            mockWindow.localStorage.getItem = sinon.stub()
                .withArgs("teststore")
                .returns(JSON.stringify({
                    data: "test"
                }));

            var store = new TestStore(mockWindow);

            expect(store.state.data, "to be", "test");
        });
    });

    describe("on window unload", () => {
        it("should save state to localstorage.", () => {
            new TestStore(mockWindow);

            var unloadHandler = mockWindow.addEventListener.getCall(0).args[1];
            unloadHandler();

            expect(mockWindow.localStorage.setItem, "was called with", "teststore", JSON.stringify({data: "default"}));
        });
    });

    describe("transformation utilities", () => {
        it("should transform list of untyped objects.", () => {
            var items = [{data: "test1"}, {data: "test2"}];

            var transformed = CachingStore.listOf(items, TestObj);

            expect(transformed, "to have length", 2);
            expect(transformed[0], "to be a", TestObj);
            expect(transformed[0].data, "to be", "test1");
            expect(transformed[1], "to be a", TestObj);
            expect(transformed[1].data, "to be", "test2");
        });

        it("should transform map of untyped objects.", () => {
            var map = {
                a: {data: "test1"},
                b: {data: "test2"}
            };

            var transformed = CachingStore.mapOf(map, TestObj);

            expect(transformed, "to be a", Object);
            expect(transformed, "to have keys", "a", "b");
            expect(transformed.a, "to be a", TestObj);
            expect(transformed.a.data, "to be", "test1");
            expect(transformed.b, "to be a", TestObj);
            expect(transformed.b.data, "to be", "test2");
        });
    });
});
