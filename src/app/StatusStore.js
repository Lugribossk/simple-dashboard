import _ from "lodash";
import moment from "moment";
import {OrderedMap, Set} from "immutable";
import Store from "../flux/Store";
import Logger from "../util/Logger";

var log = new Logger(__filename);

export default class StatusStore extends Store {
    constructor(configStore) {
        super();
        this.configStore = configStore;
        this.timeoutIds = [];
        this.state = {
            sources: this.configStore.getSources(),
            panels: this.configStore.getPanels(), // Maps panel index to obj with sources
            statuses: new OrderedMap(), // Maps source to statuses
            timeoutIds: new Set()
        };

        this.configStore.onChanged(() => {
            this.setState({
                sources: this.configStore.getSources(),
                panels: this.configStore.getPanels(),
                statuses: this._createInitialStatuses(this.configStore.getSources())
            });
            this._setupStatusFetching();
        });
    }

    onStatusChanged(listener) {
        return this._registerListener("statuses", listener);
    }

    getStatuses() {
        return _.flatten(this.state.statuses.toArray());
    }

    getPanelsWithStatuses() {
        var withStatuses = [];
        _.forEach(this.state.panels, panel => {
            var withStatus = {
                title: panel.title,
                statuses: _.flatten(_.map(panel.sources, source => this.state.statuses.get(source)))
            };
            withStatuses.push(withStatus);
        });
        return withStatuses;
    }

    _createInitialStatuses(sources) {
        return new OrderedMap().withMutations(map => {
            _.forEach(sources, source => {
                map.set(source, [{
                    title: source.title,
                    status: "info",
                    messages: [{
                        message: "Waiting for first status..."
                    }]
                }]);
            });
        });
    }

    _setupStatusFetching() {
        _.forEach(this.state.timeoutIds.toArray(), timeoutId => window.clearTimeout(timeoutId));

        _.forEach(this.state.sources, source => {
            var lastTimeoutId;
            var fetchStatus = () => {
                return source.getStatus()
                    .timeout(10000)
                    .catch(e => {
                        log.error("Error while getting status:", e);
                        return {
                            title: source.title,
                            status: "danger",
                            messages: [{
                                message: "Unable to determine status"
                            }]
                        };
                    })
                    .then(statuses => {
                        if (!this.state.statuses.get(source)) {
                            // This must have been in progress when the source was removed.
                            return;
                        }
                        if (!_.isArray(statuses)) {
                            statuses = [statuses];
                        }

                        var timeoutId = window.setTimeout(fetchStatus, source.getInterval(moment()) * 1000);

                        this.setState({
                            statuses: this.state.statuses.set(source, statuses),
                            timeoutIds: this.state.timeoutIds.delete(lastTimeoutId).add(timeoutId)
                        });
                        lastTimeoutId = timeoutId;
                    });
            };

            fetchStatus();
        });
    }
}