import VstsBase from "./VstsBase";

export default class VstsBuild extends VstsBase {
    constructor(data, util) {
        super(data, util);
        this.branch = data.branch || "refs/heads/master";
    }

    getStatus() {
        let defaultStatus = super.getStatus();
        if (defaultStatus) {
            return defaultStatus;
        }

        return this.fetchBuilds()
            .then(builds => this.createStatus(builds, this.branch))
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

VstsBuild.type = "vsts-build";
