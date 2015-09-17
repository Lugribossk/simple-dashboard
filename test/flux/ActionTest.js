import expect from "unexpected";
import sinon from "sinon";
import Action from "../../src/flux/Action";

describe("Action", () => {
    it("should call listeners when triggered.", () => {
        var action = new Action("test1");
        var listener = sinon.spy();

        action.onDispatch(listener);

        action("test");

        expect(listener, "was called once");
    });

    it("should not call listeners that have been removed.", () => {
        var action = new Action("test2");
        var listener = sinon.spy();

        var remove = action.onDispatch(listener);
        remove();

        action();

        expect(listener, "was not called");
    });

    it("should share dispatching across different instances with the same name.", () => {
        var action1 = new Action("test3");
        var action2 = new Action("test3");
        var listener = sinon.spy();

        action1.onDispatch(listener);

        action2("test");

        expect(listener, "was called with", "test");
    });
});