import VsoBase from "./VsoBase";

export default class VsoBuild extends VsoBase {
    constructor(data, util) {
        super(data, util);
        this.branch = data.branch || "master";
    }

    getStatus() {
        return this.fetchBuilds()
            .catch(() => {
                return {
                    title: this.title,
                    link: this.getBaseUrl() + this.project + "/_build",
                    status: "danger",
                    messages: [{
                        message: "No response from API"
                    }]
                };
            })
            .then(builds => this.createStatus(builds, this.branch));
    }
}

VsoBuild.type = "vso-build";
