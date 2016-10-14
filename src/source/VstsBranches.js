import _ from "lodash";
import moment from "moment";
import Promise from "bluebird";
import VstsBase from "./VstsBase";
import Logger from "../util/Logger";

let log = new Logger(__filename);

let textToDuration = text => {
    let match = /(\d+) ?(\w+)/.exec(text);
    return moment.duration(_.parseInt(match[1]), match[2]);
};

export default class VstsBranches extends VstsBase {
    constructor(data, util) {
        super(data, util);
        this.repoId = data.repoId;
        this.newerThan = data.newerThan;
    }

    fetchBranches() {
        return this.fetchGitData("/stats/branches")
            .promise()
            .then(response => response.body.value);
    }

    fetchPullRequests() {
        return this.fetchGitData("/pullrequests")
            .query({
                status: "Active",
                targetRefName: "refs/heads/master"
            })
            .promise()
            .then(response => response.body.value);
    }

    getStatus() {
        let defaultStatus = super.getStatus();
        if (defaultStatus) {
            return defaultStatus;
        }

        return Promise.all([this.fetchBranches(), this.fetchBuilds(), this.fetchPullRequests()])
            .spread((branches, builds, prs) => {
                let interestingBranches = branches;
                if (this.newerThan) {
                    interestingBranches = _.filter(branches, branch => {
                        return moment(branch.commit.author.date).isAfter(moment().subtract(textToDuration(this.newerThan)));
                    });
                }

                return _.map(interestingBranches, branch => {
                    let status = this.createStatus(builds, {sourceBranch: "refs/heads/" + branch.name});
                    status.title = branch.name;

                    let branchPr = _.find(prs, {sourceRefName: "refs/heads/" + branch.name});
                    if (branchPr) {
                        status.messages.push({
                            name: "Pull request: " + branchPr.title,
                            link: this.getBaseUrl() + "_git/" + this.project + "/pullrequest/" + branchPr.pullRequestId,
                            message: "Created by " + branchPr.createdBy.displayName + " " + moment(branchPr.creationDate).fromNow()
                        });
                    }

                    return status;
                });
            })
            .catch(e => {
                log.error(e);
                return {
                    title: this.title,
                    link: this.getBaseUrl() + this.project + "/_build",
                    status: "danger",
                    messages: [{
                        message: "No response from API"
                    }]
                };
            });
    }
}

VstsBranches.type = "vsts-branches";
