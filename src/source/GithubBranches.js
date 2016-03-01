import _ from "lodash";
import moment from "moment";
import Promise from "bluebird";
import request from "superagent-bluebird-promise";
import Source from "./Source";
import BuildUtils from "../util/BuildUtils";

var shortName = ref => ref.substr("refs/heads/".length);

export default class GithubBranches extends Source {
    constructor(data, util) {
        super(data);
        this.owner = data.owner;
        this.repo = data.repo;
        this.token = util.decrypt(data.token);
        this.showStatus = data.showStatus;
    }

    fetchData(path) {
        return request("https://api.github.com/repos/" + this.owner + "/" + this.repo + path)
            .set("Authorization", "token " + this.token);
    }

    fetchBranches() {
        return this.fetchData("/git/refs/heads")
            .promise()
            .then(response => response.body);
    }

    fetchPullRequests() {
        return this.fetchData("/pulls")
            .query("state=open")
            .query("base=master")
            .promise()
            .then(response => response.body);
    }

    fetchStatuses(ref) {
        return this.fetchData("/commits/" + ref + "/statuses")
            .promise()
            .then(response => response.body);
    }

    createStatus(branch) {
        var status = {
            title: shortName(branch.ref),
            link: branch.url,
            status: "info",
            messages: []
        };

        if (!this.showStatus) {
            return Promise.resolve(status);
        }

        return this.fetchStatuses(branch.ref)
            .then(statuses => {
                if (statuses.length === 0) {
                    return status;
                }

                // TODO Support multiple contexts
                var latestStatus = statuses[0];
                if (latestStatus.state === "success") {
                    status.status = "success";
                } else if (latestStatus.state === "pending") {
                    status.status = "info";
                    var start = moment(latestStatus.created_at);
                    var avg = BuildUtils.getEstimatedDuration(this.getDurations(statuses));
                    status.progress = {
                        percent: now => BuildUtils.getEstimatedPercentComplete(now, start, avg),
                        remaining: now => BuildUtils.getEstimatedTimeRemaining(now, start, avg)
                    };
                } else {
                    status.status = "danger";
                }

                status.messages.push({
                    name: latestStatus.context,
                    link: latestStatus.target_url,
                    message: latestStatus.description
                });

                return status;
            });
    }

    getDurations(statuses) {
        var durations = [];
        var lookingForPending = false;
        var finish;

        _.forEach(statuses, status => {
            if (lookingForPending) {
                if (status.state === "pending") {
                    lookingForPending = false;
                    var start = moment(status.created_at);
                    var duration = moment.duration(finish.diff(start));
                    durations.push(duration);
                }
            } else {
                if (status.state !== "pending") {
                    lookingForPending = true;
                    finish = moment(status.created_at);
                }
            }
        });

        return durations;
    }

    getStatus() {
        return Promise.all([this.fetchBranches(), this.fetchPullRequests()])
            .catch(() => {
                return {
                    title: this.title,
                    link: "https://github.com/" + this.owner + "/" + this.repo,
                    status: "danger",
                    messages: [{
                        message: "No response from API"
                    }]
                };
            })
            .spread((branches, prs) => {
                return Promise.all(_.map(branches, branch => {
                    return this.createStatus(branch)
                        .then(status => {
                            var name = shortName(branch.ref);
                            var branchPr = _.find(prs, pr => pr.head.ref === name);
                            if (branchPr) {
                                status.messages.push({
                                    name: "Pull request: " + branchPr.title,
                                    link: branchPr.html_url,
                                    message: "Created by " + branchPr.user.login + " " + moment(branchPr.created_at).fromNow()
                                });
                            }

                            return status;
                        });
                }));
            });
    }
}

GithubBranches.type = "github-branches";
