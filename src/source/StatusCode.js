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
            .then(response => {
                return {
                    title: this.title,
                    link: this.link,
                    status: "success",
                    messages: []
                };
            })
            .catch(response => {
                return {
                    title: this.title,
                    link: this.link,
                    status: "danger",
                    messages: [{
                        message: "Response : " + response.status
                    }]
                };
            });
    }
}

StatusCode.type = "status-code";
