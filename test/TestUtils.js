import ReactTestUtils from "react-addons-test-utils";
import _ from "lodash";

export default {
    React: ReactTestUtils,

    shallowRender(content) {
        let renderer = ReactTestUtils.createRenderer();
        renderer.render(content);
        return renderer;
    },

    shallowRenderUntilDom(content) {
        let renderer = ReactTestUtils.createRenderer();
        renderer.render(content);
        let output = renderer.getRenderOutput();
        // Type for components is their constructor, for DOM elements their name.
        if (_.isFunction(output.type)) {
            return this.shallowRenderUntilDom(output);
        }
        return renderer;
    }
};
