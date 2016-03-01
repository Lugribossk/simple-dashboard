import React from "react";
import PureRenderMixin from "react-addons-pure-render-mixin";
import _ from "lodash";
import moment from "moment";
import Mixins from "../util/Mixins";
import {Alert, ProgressBar} from "react-bootstrap";

export default class StatusIndicator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            now: moment()
        };

        this.interval = setInterval(() => this.setState({now: moment()}), 5000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    renderMessage(message) {
        if (!message.message) {
            return null;
        }

        var name = message.name;
        if (message.link) {
            name = (
                <a href={message.link} target="_blank">{message.name}</a>
            );
        }
        return (
            <div key={message.name + message.detailName} className="text-center">
                {message.name &&
                    <h4>{name} <small>{message.detailName}</small></h4>}
                <p>{message.message}</p>
            </div>
        );
    }

    renderProgress() {
        if (!this.props.progress) {
            return null;
        }

        var percent = this.props.progress.percent(this.state.now);
        var label = "";

        var remaining = this.props.progress.remaining(this.state.now);
        if (remaining) {
            var positiveRemaining = Math.ceil(Math.max(remaining.asMinutes(), 1));
            label = positiveRemaining + " minute" + (positiveRemaining === 1 ? "" : "s") + " remaining";
        }
        return (
            <ProgressBar now={percent} label={label} striped={!remaining}/>
        );
    }

    render() {
        return (
            <Alert bsStyle={this.props.status} className="status-item" >
                <div>
                    <h1 className="text-center">
                        <a href={this.props.link} target="_blank">
                            {this.props.title}
                        </a>
                    </h1>
                </div>

                {_.map(this.props.messages, message => this.renderMessage(message))}
                {this.renderProgress()}
            </Alert>
        );
    }
}

Mixins.add(StatusIndicator.prototype, [PureRenderMixin]);
