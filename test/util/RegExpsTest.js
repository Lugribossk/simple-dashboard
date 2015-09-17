import expect from "unexpected";
import RegExps from "../../src/util/RegExps";

describe("RegExps", () => {
    it("should extract multiple regex matches.", () => {
        var matches = RegExps.getAllMatches(/(test)/g, "test, test");

        expect(matches, "to equal", ["test", "test"]);
    });

    it("should throw an error on non-global regexes.", () => {
        var invalidInput = () => {
            return RegExps.getAllMatches(/(test)/, "test, test");
        };

        expect(invalidInput, "to throw error");
    });
});