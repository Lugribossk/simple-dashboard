import expect from "unexpected";
import sinon from "sinon";
import Store from "../../src/flux/Store";

class TestStore extends Store {
    constructor() {
        super();
        this.state = {
            data: "test"
        };
    }

    onDataChanged(listener) {
        return this._registerListener("data", listener);
    }

    getData() {
        return this.state.data;
    }
}

describe("Store", () => {
    var store;
    beforeEach(() => {
        store = new TestStore();
    });

    describe("state", () => {
        it("should be set synchronously.", () => {
            store.setState({data: "test2"});

            expect(store.state.data, "to be", "test2");
        });

        it("should shallowly merge new data with old data.", () => {
            store.setState({data2: "test2"});

            expect(store.state, "to equal", {
                data: "test",
                data2: "test2"
            });
        });
    });

    describe("event listener", () => {
        it("should be triggered based on name.", () => {
            var listener = sinon.spy();
            store.onDataChanged(listener);

            store._trigger("data");

            expect(listener, "was called once");
        });

        it("should trigger multiple listeners.", () => {
            var listener1 = sinon.spy();
            var listener2 = sinon.spy();
            store.onDataChanged(listener1);
            store.onDataChanged(listener2);

            store._trigger("data");

            expect(listener1, "was called once");
            expect(listener2, "was called once");
        });

        it("should automatically be triggered from setState() with same name.", () => {
            var listener = sinon.spy();
            store.onDataChanged(listener);

            store.setState({data: "test2"});

            expect(listener, "was called once");
        });

        it("should not include new data when triggered automatically.", () => {
            var listener = sinon.spy();
            store.onDataChanged(listener);

            store.setState({data: "test2"});

            expect(listener, "was called with exactly");
        });

        it("should pass arguments from _trigger().", () => {
            var listener = sinon.spy();
            store.onDataChanged(listener);

            store._trigger("data", 12345);

            expect(listener, "was called with", 12345);
        });

        describe("unsubscription", () => {
            it("should make that listener not get called.", () => {
                var listener = sinon.spy();
                var unsubscribe = store.onDataChanged(listener);

                unsubscribe();
                store._trigger("data");

                expect(listener, "was not called");
            });

            it("should only remove that listener.", () => {
                var listener1 = sinon.spy();
                var listener2 = sinon.spy();
                store.onDataChanged(listener1);
                var unsubscribe2 = store.onDataChanged(listener2);

                unsubscribe2();
                store._trigger("data");

                expect(listener1, "was called once");
                expect(listener2, "was not called");
            });
        });
    });
});
