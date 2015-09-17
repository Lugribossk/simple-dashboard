import Promise from "bluebird";
import request from "superagent-bluebird-promise";
import Source from "./Source";

// https://docs.tutum.co/v2/api/?http#service
export default class TutumService extends Source {
    constructor(data, util) {
        super(data);
        this.id = data.id;
        this.username = data.username;
        this.apiKey = util.decrypt(data.apiKey);
    }

    fetchData() {
        return request.get("https://dashboard.tutum.co/api/v1/service/" + this.id + "/")
            .set("Authorization", "ApiKey " + this.username + ":" + this.apiKey)
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
            var status = null;
            var message = "";

            if (!response || !response.body) {
                status = "danger";
                message = "No response from API";
            } else {
                var data = response.body;
                var state = data.state;

                if (state === "Redeploying") {
                    status = "info";
                    message = "Redeploying"; // TODO get tag info from image_tag endpoint

                } else if (state === "Scaling") {
                    status = "info";
                    var target = data.target_num_containers;
                    var current = data.current_num_containers;
                    message = "Scaling from " + current + " containers to " + target + ".";

                } else if (state === "Running") {
                    if (!data.synchronized) {
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
                link: "https://dashboard.tutum.co/container/service/show/" + this.id + "/",
                status: status,
                messages: [{
                    message: message
                }]
            };
        });
    }
}

TutumService.type = "tutum-service";