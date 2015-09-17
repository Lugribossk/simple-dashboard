import Promise from "bluebird";
import moment from "moment";

export default class Source {
    constructor(data) {
        this.title = data.title;
        this.interval = data.interval || 60;
    }

    getInterval() {
        return this.interval;
    }

    getStatus() {
        return Promise.resolve({
            title: this.title,
            link: "http://example.com",
            status: "success",
            messages: [{
                name: "Example",
                link: "http://example.com",
                detailName: "Example",
                message: "Example"
            }],
            progress: {
                percent: () => 50,
                remaining: () => moment.duration(5, "minutes")
            }
        });
    }
}

Source.type = "";