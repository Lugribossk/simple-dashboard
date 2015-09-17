/*global require, __dirname*/
import fs from "fs";
import path from "path";
import _ from "lodash";

function getFiles(dir) {
    var results = [];
    _.forEach(fs.readdirSync(dir), file => {
        file = path.join(dir, file);
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

var srcDir = path.join(process.cwd(), "src");
var testDir = path.join(process.cwd(), "test");

var srcFiles = _.filter(getFiles(srcDir), file => {
    return _.endsWith(file, ".js") && !_.contains(file, "main.js") && !_.contains(file, "Application.js");
});

var untestedFiles = _.forEach(srcFiles, file => {
    var testName = file.substr(srcDir.length, file.length - srcDir.length - 3) + "Test.js";
    return !fs.existsSync(path.join(testDir, testName));
});

_.forEach(untestedFiles, file => {
    require(path.relative(__dirname, file));
});
