import expect from "unexpected";
import sinon from "sinon";
import SubscribeMixin from "../../src/flux/SubscribeMixin";
import Mixins from "../../src/util/Mixins";

class TestObj {}

Mixins.add(TestObj.prototype, [SubscribeMixin]);

describe("SubscribeMixin", () => {
    it("should call unsubscribers on component unmount.", () => {
        var obj = new TestObj();
        var unsubscriber = sinon.spy();

        obj.subscribe(unsubscriber);
        obj.componentWillUnmount();

        expect(unsubscriber, "was called once");
    });
});
