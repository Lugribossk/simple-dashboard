/*global require*/
"use strict";
require("babel-register")({
    retainLines: true
});

require("babel-runtime/core-js/promise").default = require("bluebird");
