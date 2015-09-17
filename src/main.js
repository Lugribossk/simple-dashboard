import React from "react";
import StatusDashboard from "./app/StatusDashboard";
import "./style.less";

import "./favicon.png";
import "./touch-icon.png";

React.render(
    <StatusDashboard/>,
    document.getElementById("main")
);