import _ from "lodash";
import moment from "moment";
import Promise from "bluebird";
import VstsBase from "./VstsBase";

let sanitize = name => name.replace(/refs\/heads\//g, "");

export default class VstsBranches extends VstsBase {
    constructor(data, util) {
        super(data, util);
        this.repoId = data.repoId;
    }

    fetchBranches() {
        return this.fetchGitData("/refs/heads")
            .promise()
            .then(response => _.map(response.body.value, value => value.name));
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
                return _.map(branches, branch => {
                    let status = this.createStatus(builds, branch);
                    status.title = sanitize(branch);

                    let branchPr = _.find(prs, {sourceRefName: branch});
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
            .catch(() => {
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
