import expect from "unexpected";
import sinon from "sinon";
import Mixins from "../../src/util/Mixins";

describe("Mixins", () => {
    it("should copy methods from mixin to context.", () => {
        var mixin = {
            test() {}
        };
        var context = {};

        Mixins.add(context, [mixin]);

        expect(context.test, "to be", mixin.test);
    });

    it("should merge React lifecycle methods with context.", () => {
        var mixin = {
            componentWillUnmount: sinon.spy()
        };
        var originalContextUnmount = sinon.spy();
        var context = {
            componentWillUnmount: originalContextUnmount
        };

        Mixins.add(context, [mixin]);
        context.componentWillUnmount();

        expect(mixin.componentWillUnmount, "was called");
        expect(originalContextUnmount, "was called");
    });

    it("should merge React lifecycle methods with multiple mixins.", () => {
        var mixin1 = {
            componentWillUnmount: sinon.spy()
        };
        var mixin2 = {
            componentWillUnmount: sinon.spy()
        };
        var context = {};

        Mixins.add(context, [mixin1, mixin2]);
        context.componentWillUnmount();

        expect(mixin1.componentWillUnmount, "was called");
        expect(mixin2.componentWillUnmount, "was called");
    });
});