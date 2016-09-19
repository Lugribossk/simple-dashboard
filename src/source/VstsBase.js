import _ from "lodash";
import moment from "moment";
import request from "superagent-bluebird-promise";
import Source from "./Source";
import BuildUtils from "../util/BuildUtils";

let sanitize = name => name.replace(/refs\/heads\//g, "");

export default class VstsBase extends Source {
    constructor(data, util) {
        super(data);
        this.account = data.account;
        this.project = data.project;
        this.token = util.decrypt(data.token);
    }

    getStatus() {
        if (!this.account || !this.project || !this.token) {
            return Promise.resolve({
                title: this.title,
                status: "warning",
                messages: [{
                    message: "Credentials not configured."
                }]
            });
        }
        return null;
    }

    getBaseUrl() {
        return "https://" + this.account + ".visualstudio.com/DefaultCollection/";
    }

    fetchBuilds() {
        return request.get(this.getBaseUrl() + this.project + "/_apis/build/builds")
            .auth("", this.token)
            .promise()
            .then(response => response.body.value);
    }

    fetchGitData(path) {
        return request.get(this.getBaseUrl() + "_apis/git/repositories/" + this.repoId + path)
            .auth("", this.token)
            .query("api-version=1.0");
    }

    createStatus(builds, branchName) {
        let link;
        let status;
        let message;
        let progress;

        let branchBuilds = _.filter(builds, {sourceBranch: branchName});

        if (branchBuilds.length === 0) {
            status = "info";
            message = "No builds found for branch '" + sanitize(branchName) + "'";
        } else {
            let build = branchBuilds[0];
            link = build._links.web.href;

            let finishedAgo = moment(build.finishTime).fromNow();
            if (build.status !== "completed") {
                status = "info";
                message = "Build in progress";

                let start = moment(build.startTime);
                let avg = BuildUtils.getEstimatedDuration(this.getDurations(builds, branchName));
                progress = {
                    percent: now => BuildUtils.getEstimatedPercentComplete(now, start, avg),
                    remaining: now => BuildUtils.getEstimatedTimeRemaining(now, start, avg)
                };
            } else {
                if (build.result === "partiallySucceeded") {
                    status = "warning";
                    message = "Partially succeeded " + finishedAgo;
                } else if (build.result === "succeeded") {
                    status = "success";
                    message = "Built " + finishedAgo;
                } else if (build.result === "canceled") {
                    status = "danger";
                    message = "Canceled " + finishedAgo;
                } else {
                    status = "danger";
                    message = "Failed " + finishedAgo;
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
        let targetBuilds = builds;
        // If there are any builds with the target branch then only use those.
        let branchBuilds = _.filter(builds, {sourceBranch: branchName});
        if (branchBuilds.length > 0) {
            targetBuilds = branchBuilds;
        }
        let successBuilds = _.filter(targetBuilds, {status: "success"});
        if (successBuilds.length > 0) {
            targetBuilds = successBuilds;
        }

        return _.filter(_.map(targetBuilds, ({startTime, finishTime}) => {
            if (!startTime || !finishTime) {
                return null;
            }

            let start = moment(startTime);
            let finish = moment(finishTime);
            return moment.duration(finish.diff(start));
        }));
    }
}