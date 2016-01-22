import _ from "lodash";
import request from "superagent-bluebird-promise";
import Source from "./Source";

export default class Loggly extends Source {
    constructor(data, util) {
        super(data);
        this.username = data.username;
        this.password = util.decrypt(data.password);
        this.account = data.account;
        this.tag = data.tag;
        this.from = data.from || "-24h";
    }

    fetchData() {
        return request.get("http://" + this.account + ".loggly.com/apiv2/fields/json.level/")
            .auth(this.username, this.password)
            .query({
                q: "tag:" + this.tag,
                from: this.from
            })
            .promise();
    }

    getStatus() {
        if (!this.username || !this.password || !this.account) {
            return Promise.resolve({
                title: this.title,
                status: "warning",
                messages: [{
                    message: "Credentials not configured."
                }]
            });
        }

        return this.fetchData()
            .then(response => {
                let status;
                let messages = [];
                if (!response || !response.body) {
                    status = "danger";
                    messages.push({
                        message: "No response from Loggly API."
                    });
                } else {
                    let terms = response.body["json.level"];
                    let counts = _.reduce(terms, (result, term) => {
                        result[term.term.toLocaleUpperCase()] = term.count;
                        return result;
                    }, {});

                    let fromLabel = this.from.substr(1);
                    if (counts.WARN > 0) {
                        status = "warning";
                        messages.push({
                            message: "" + counts.WARN + " log messages with WARN level in the last " + fromLabel + "."
                        });
                    }
                    if (counts.ERROR > 0) {
                        status = "danger";
                        messages.push({
                            detailName: "WARN",
                            message: "" + counts.ERROR + " log messages with ERROR level in the last " + fromLabel + "."
                        });
                    }
                    if (!counts.WARN && !counts.ERROR) {
                        status = "success";
                        messages.push({
                            detailName: "ERROR",
                            message: "No log messages with WARN or ERROR level in the last " + fromLabel + "."
                        });
                    }
                }

                let search = encodeURIComponent("tag:" + this.tag + " AND (json.level:warn OR json.level:error)");
                return {
                    title: this.title,
                    link: "https://" + this.account + ".loggly.com/search#terms=" + search + "&from=" + this.from,
                    status: status,
                    messages: messages
                };
            });
    }
}

Loggly.type = "loggly";