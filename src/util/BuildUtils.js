import _ from "lodash";
import moment from "moment";

export default {
    getEstimatedTimeRemaining(now, startTime, average) {
        if (!average) {
            return null;
        }

        return moment.duration(average.asMilliseconds()).subtract(now.diff(startTime));
    },

    getEstimatedPercentComplete(now, startTime, average) {
        if (!average) {
            return 100;
        }

        var timeSpent = moment.duration(now.diff(startTime));
        return Math.min(Math.ceil(timeSpent.asSeconds() / average.asSeconds() * 100), 100);
    },

    getEstimatedDuration(durations) {
        let count = 0;
        let sum = 0;
        _.forEach(durations, duration => {
            if (duration.asSeconds() > 5) {
                count++;
                sum += duration.asSeconds();
            }
        });

        if (count === 0) {
            return null;
        }
        return moment.duration(Math.round(sum / count * 1.1), "seconds");
    }
};
