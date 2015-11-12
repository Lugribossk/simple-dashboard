import _ from "lodash";
import request from "superagent-bluebird-promise";
import Source from "./Source";

request.Request.prototype.jsonp = function (name = "callback") {
    this.callbackQueryName = name;
    this.callbackFunctionName = "superagentCallback" + new Date().valueOf() + _.parseInt(Math.random() * 1000);
    window[this.callbackFunctionName] = data => {
        delete window[this.callbackFunctionName];
        document.getElementsByTagName("head")[0].removeChild(this.scriptElement);

        this.callback(null, {body: data});
    };
    return this;
};

var oldEnd = request.Request.prototype.end;
request.Request.prototype.end = function (callback) {
    if (!this.callbackFunctionName) {
        return oldEnd.call(this, callback);
    }

    this.callback = callback;
    this.query({[this.callbackQueryName]: this.callbackFunctionName});

    var queryString = request.serializeObject(this._query.join("&"));
    var url = this.url + (_.contains(this.url, "?") ? "&" : "?") + queryString;

    this.scriptElement = document.createElement("script");
    this.scriptElement.src = url;
    document.getElementsByTagName("head")[0].appendChild(this.scriptElement);

    return this;
};

export default class RssBase extends Source {
    constructor(data) {
        super(data);
        this.interval = data.interval || 600;
    }

    fetchFeed(url) {
        return request.get("http://ajax.googleapis.com/ajax/services/feed/load")
            .query({
                v: "1.0",
                q: url
            })
            .jsonp("callback")
            .promise()
            .then(response => {
                if (!response || !response.body) {
                    throw new Error("Empty response.");
                }

                return response.body;
            });
    }
}