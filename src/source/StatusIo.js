import _ from "lodash";
import request from "superagent-bluebird-promise";
import Source from "./Source";

export default class StatusIo extends Source {
    constructor(data) {
        super(data);
        this.link = data.link;
        this.id = data.id;
    }

    fetchData() {
        return request.get("https://api.status.io/1.0/status/" + this.id)
            .promise()
            .catch(e => e);
    }

    getStatus() {
        return this.fetchData().then(response => {
            var status = "success";
            var messages = [];

            if (!response || !response.body || !response.body.result) {
                status = "danger";
                messages.push({
                    name: "No response from Status.io API"
                });
            } else {
                var worstStatusCode = 0;
                _.forEach(response.body.result.status, s => {
                    _.forEach(s.containers, c => {
                        if (c.status_code > 100) {
                            messages.push({
                                name: s.name,
                                detailName: c.name,
                                message: c.status
                            });

                            if (c.status_code > worstStatusCode) {
                                worstStatusCode = c.status_code;
                            }
                        }
                    });
                });

                // http://kb.status.io/developers/status-codes
                if (worstStatusCode >= 500) {
                    status = "danger";
                } else if (worstStatusCode >= 300) {
                    status = "warning";
                }
            }

            return {
                title: this.title,
                link: this.link,
                status: status,
                messages: messages
            };
        });
    }
}

StatusIo.type = "statusio";