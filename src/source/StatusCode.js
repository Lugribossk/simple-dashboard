import request from "superagent-bluebird-promise";
import Source from "./Source";

export default class StatusCode extends Source {
    constructor(data) {
        super(data);
        this.url = data.url;
        this.link = data.link || data.url;
    }

    fetchData() {
        return request.get(this.url)
            .promise();
    }

    getStatus() {
        return this.fetchData()
            .catch(response => {
                return response
            })
            .then(response => {
                if (response.status === 200) {
                    return {
                        title: this.title,
                        link: this.link,
                        status: "success",
                        messages: []
                    };
                }
                return {
                    title: this.title,
                    link: this.link,
                    status: "danger",
                    messages: [{
                        message: "Request failed: " + response.message || 'unknown'
                    }]
                };
            });
    }
}

StatusCode.type = "status-code";
