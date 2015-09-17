import _ from "lodash";
import RssBase from "./RssBase";

export default class RssAws extends RssBase {
    constructor(data) {
        super(data);
        this.id = data.id;
    }

    getStatus() {
        return this.fetchFeed("http://status.aws.amazon.com/rss/" + this.id + ".rss")
            .then(data => {
                var status;
                var message = "";

                var latestEntry = data.responseData.feed.entries[0];

                if (_.contains(latestEntry.title, "Service is operating normally") ||
                    _.contains(latestEntry.content, "service is operating normally")) {
                    status = "success";
                } else {
                    if (_.contains(latestEntry.title, "Informational message")) {
                        status = "warning";
                    } else {
                        status = "danger";
                    }
                    message = latestEntry.content;
                }

                return {
                    title: this.title,
                    link: "http://status.aws.amazon.com/",
                    status: status,
                    messages: [{
                        message: message
                    }]
                };
            });
    }
}

RssAws.type = "rss-aws";