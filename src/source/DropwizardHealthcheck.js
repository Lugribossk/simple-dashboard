import _ from "lodash";
import request from "superagent-bluebird-promise";
import Source from "./Source";

// Cross-Origin-Resource-Sharing must be set up for the healthcheck endpoint
export default class DropwizardHealthCheck extends Source {
    constructor(data) {
        super(data);
        this.adminPath = data.adminPath;
    }

    fetchData() {
        return request.get(this.adminPath + "/healthcheck")
            .promise()
            .catch(e => e); // The healthcheck returns an error status code if anything is unhealthy.
    }

    getStatus() {
        return this.fetchData()
            .then(response => {
                var status = "success";
                var messages = [];

                if (!response || !response.body) {
                    status = "danger";
                    messages.push({
                        message: "No response from healthcheck"
                    });
                } else {
                    _.forEach(response.body, (data, name) => {
                        if (_.isBoolean(data.healthy) && data.healthy) {
                            return;
                        }

                        status = "danger";
                        messages.push({
                            name: name,
                            message: data.message || (data.error && data.error.stack && data.error.stack[0])
                        });
                    });
                }

                return {
                    title: this.title,
                    link: this.adminPath + "/healthcheck?pretty=true",
                    status: status,
                    messages: messages
                };
            });
    }
}

DropwizardHealthCheck.type = "dropwizard";