import expect from "unexpected";
import moment from "moment";
import BuildUtils from "../../src/util/BuildUtils";

describe("BuildUtils", () => {
    it("should calculate remaining time.", () => {
        let remaining = BuildUtils.getEstimatedTimeRemaining(moment(100), moment(0), moment.duration(150));

        expect(remaining.asMilliseconds(), "to be", 50);
    });

    it("should calculate percent complete.", () => {
        let percent = BuildUtils.getEstimatedPercentComplete(moment(100), moment(0), moment.duration(150));

        expect(percent, "to be", 67);
    });

    it("should estimate duration as slightly higher than the average of the previous durations.", () => {
        let avg = BuildUtils.getEstimatedDuration([moment.duration(50000), moment.duration(150000)]);

        expect(avg.asSeconds(), "to be", 110);
    });
});