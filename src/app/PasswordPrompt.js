import React from "react";
import PureRenderMixin from "react-addons-pure-render-mixin";
import LinkedStateMixin from "react-addons-linked-state-mixin";
import {Glyphicon, Modal, Input, Button, Panel} from "react-bootstrap";
import Mixins from "../util/Mixins";

export default class PasswordPrompt extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            password: ""
        };

        this.props.configStore.onChanged(() => this.forceUpdate());
    }

    savePassword(e) {
        e.preventDefault();
        this.props.configStore.setPassword(this.state.password);
        this.setState({
            showModal: false
        });
    }

    deletePassword() {
        this.props.configStore.setPassword(null);
        this.setState({
            showModal: false
        });
    }

    renderModalBody() {
        if (this.props.configStore.getPassword()) {
            return (
                <Modal.Body>
                    <p>A password for unlocking the configuration file has been saved.</p>
                    <Button bsStyle="warning" onClick={() => this.deletePassword()}>Delete password</Button>
                </Modal.Body>
            );
        }

        return (
            <Modal.Body>
                <p>The configuration file contains sensitive keys or passwords that have been encrypted.</p>
                <p>Entering the password will unlock them, and save the password on this computer for the future.</p>
                <form onSubmit={e => this.savePassword(e)}>
                    <Input type="password" valueLink={this.linkState("password")} autoFocus />
                    <Button bsStyle="primary" type="submit">Unlock</Button>
                </form>
            </Modal.Body>
        );
    }

    render() {
        if (!this.props.configStore.isPasswordNeeded() && !this.props.configStore.getPassword()) {
            return null;
        }

        return (
            <div>
                <Panel style={{position: "absolute", bottom: 0, right: 0, marginBottom: 0, cursor: "pointer"}}
                       onClick={() => this.setState({showModal: true})}>
                    <Glyphicon glyph="cog" />
                </Panel>

                <Modal show={this.state.showModal}
                       onHide={() => this.setState({showModal: false, password: ""})}
                       animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Configuration</Modal.Title>
                    </Modal.Header>
                    {this.renderModalBody()}
                </Modal>
            </div>
        );
    }
}

Mixins.add(PasswordPrompt.prototype, [PureRenderMixin, LinkedStateMixin]);