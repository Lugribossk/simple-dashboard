import VsoBase from "./VsoBase";

export default class VsoBuild extends VsoBase {
    constructor(data, util) {
        super(data, util);
        this.branch = data.branch || "master";
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

VsoBuild.type = "vso-build";
