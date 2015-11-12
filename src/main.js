import React from "react";
import ReactDOM from "react-dom";
import StatusDashboard from "./app/StatusDashboard";
import "./style.less";

import "./favicon.png";
import "./touch-icon.png";

ReactDOM.render(
    <StatusDashboard/>,
    document.getElementById("main")
);