import Promise from "bluebird";
import request from "superagent-bluebird-promise";
import moment from "moment";
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
                    message: "API key not configured"
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
                let {
                    state,
                    target_num_containers: targetContainers,
                    current_num_containers: currentContainers,
                    synchronized,
                    started_datetime: startedAt
                } = response.body;

                if (state === "Redeploying") {
                    status = "info";
                    message = "Redeploying";

                } else if (state === "Scaling") {
                    status = "info";
                    message = "Scaling from " + currentContainers + " containers to " + targetContainers;

                } else if (state === "Running") {
                    if (!synchronized) {
                        status = "warning";
                        message = "Service definition not synchronized with containers";
                    } else {
                        status = "success";
                        // E.g. Mon, 13 Oct 2014 11:01:43 +0000
                        message = "Started " + moment(startedAt, "ddd, D MMMM YYYY HH:mm:ss ZZ").fromNow();
                    }
                } else {
                    status = "danger";
                    message = state;
                }
            }

            return {
                title: this.title,
                link: "https://cloud.docker.com/container/service/" + this.id + "/show",
                status: status,
                messages: [{
                    message: message
                }]
            };
        });
    }
}

DockerCloudService.type = "docker-cloud-service";