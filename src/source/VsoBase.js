import _ from "lodash";
import moment from "moment";
import request from "superagent-bluebird-promise";
import Source from "./Source";
import BuildUtils from "../util/BuildUtils";

export default class VsoBase extends Source {
    constructor(data, util) {
        super(data);
        this.account = data.account;
        this.project = data.project;
        this.username = data.username;
        this.password = util.decrypt(data.password);
    }

    getStatus() {
        throw new Error("Not implemented.");
    }

    getBaseUrl() {
        return "https://" + this.account + ".visualstudio.com/DefaultCollection/";
    }

    fetchBuilds() {
        return request.get(this.getBaseUrl() + this.project + "/_apis/build/builds")
            .auth(this.username, this.password)
            .promise()
            .then(response => response.body.value);
    }

    fetchGitData(path) {
        return request.get(this.getBaseUrl() + "_apis/git/repositories/" + this.repoId + path)
            .auth(this.username, this.password)
            .query("api-version=1.0");
    }

    createStatus(builds, branchName) {
        var link;
        var status;
        var message;
        var progress;

        var branchBuilds = _.filter(builds, {sourceBranch: "refs/heads/" + branchName});

        if (branchBuilds.length === 0) {
            status = "warning";
            message = "No builds found for branch '" + branchName + "'";
        } else {
            var build = branchBuilds[0];
            link = build._links.web.href;

            var finishTime = moment(build.finishTime).fromNow();
            if (build.status !== "completed") {
                status = "info";
                message = "Build in progress";

                var start = moment(build.startTime);
                var avg = BuildUtils.getAverageDuration(this.getDurations(builds, branchName));
                progress = {
                    percent: now => BuildUtils.getEstimatedPercentComplete(now, start, avg),
                    remaining: now => BuildUtils.getEstimatedTimeRemaining(now, start, avg)
                };
            } else {
                if (build.result === "partiallySucceeded") {
                    status = "warning";
                    message = "Partially succeeded " + finishTime;
                } else if (build.result === "succeeded") {
                    status = "success";
                    message = "Built " + finishTime;
                } else if (build.result === "canceled") {
                    status = "danger";
                    message = "Canceled " + finishTime;
                } else {
                    status = "danger";
                    message = "Failed " + finishTime;
                }
            }
        }

        return {
            title: this.title,
            link: link,
            status: status,
            messages: [{
                message: message
            }],
            progress: progress
        };
    }

    getDurations(builds, branchName) {
        // If there are any builds with the target branch then only use those.
        var branchBuilds = _.filter(builds, {sourceBranch: "refs/heads/" + branchName});
        if (branchBuilds.length === 0) {
            branchBuilds = builds;
        }

        return _.filter(_.map(branchBuilds, build => {
            if (!build.startTime || !build.finishTime) {
                return null;
            }

            var start = moment(build.startTime);
            var finish = moment(build.finishTime);
            return moment.duration(finish.diff(start));
        }));
    }
}