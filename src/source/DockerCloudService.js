import Promise from "bluebird";
import request from "superagent-bluebird-promise";
import Source from "./Source";

// https://docs.docker.com/apidocs/docker-cloud/
export default class DockerCloudService extends Source {
    constructor(data, util) {
        super(data);
        this.id = data.id;
        this.username = data.username;
        this.apiKey = util.decrypt(data.apiKey);
    }

    fetchData() {
        return request.get("https://cloud.docker.com/api/app/v1/service/" + this.id + "/")
            .auth(this.username, this.apiKey)
            .promise()
            .catch(() => null);
    }

    getStatus() {
        if (!this.apiKey) {
            return Promise.resolve({
                title: this.title,
                status: "warning",
                messages: [{
                    message: "API key not configured."
                }]
            });
        }

        return this.fetchData().then(response => {
            let status = null;
            let message = "";

            if (!response || !response.body) {
                status = "danger";
                message = "No response from API";
            } else {
                let {state, target_num_containers: target, current_num_containers: current, synchronized} = response.body;

                if (state === "Redeploying") {
                    status = "info";
                    message = "Redeploying";

                } else if (state === "Scaling") {
                    status = "info";
                    message = "Scaling from " + current + " containers to " + target + ".";

                } else if (state === "Running") {
                    if (!synchronized) {
                        status = "warning";
                        message = "Service definition not synchronized with containers.";
                    } else {
                        status = "success";
                    }
                } else {
                    status = "danger";
                    message = state;
                }
            }

            return {
                title: this.title,
                link: "https://cloud.docker.com/container/service/show/" + this.id + "/",
                status: status,
                messages: [{
                    message: message
                }]
            };
        });
    }
}

DockerCloudService.type = "docker-cloud-service";