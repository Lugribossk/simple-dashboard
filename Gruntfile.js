/*global module, require, process*/
var webpack = require("webpack");
var HtmlPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CompressionPlugin = require("compression-webpack-plugin");

module.exports = function (grunt) {
    grunt.initConfig({});

    var staticPath = "static/";
    grunt.loadNpmTasks("grunt-webpack");
    grunt.config.set("webpack", {
        build: {
            context: "src",
            entry: {
                main: "./main.js",
                vendor: ["bluebird", "lodash", "react", "react-bootstrap", "superagent-bluebird-promise", "immutable", "moment"]
            },
            output: {
                path: "target/dist",
                filename: staticPath + "main-[chunkhash].min.js",
                // This is needed for the css file to have the right path to the fonts.
                publicPath: "../"
            },
            module: {
                loaders: [
                    { test: /\.js$/, exclude: /node_modules/, loader: "babel?cacheDirectory&optional[]=runtime"},
                    { test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css")},
                    { test: /\.less$/, loader: ExtractTextPlugin.extract("style", "css!less")},
                    { test: /\.(png|jpg|woff2?|ttf|eot|svg)$/, loader: "file?name=" + staticPath + "[name]-[hash].[ext]" }
                ]
            },
            plugins: [
                // Keep the same module order between builds so the output file stays the same if there are no changes.
                new webpack.optimize.OccurenceOrderPlugin(),
                new webpack.optimize.CommonsChunkPlugin("vendor", staticPath + "vendor-[chunkhash].min.js"),
                new HtmlPlugin({
                    template: "src/index-build.html"
                }),
                new webpack.DefinePlugin({
                    "process.env": {
                        // Disable React's development checks.
                        NODE_ENV: JSON.stringify("production")
                    }
                }),
                new ExtractTextPlugin(staticPath + "main-[contenthash].css"),
                new webpack.optimize.UglifyJsPlugin({
                    minimize: true,
                    // Remove all comments.
                    comments: /a^/g,
                    compress: {
                        warnings: false
                    }
                }),
                new CompressionPlugin()
            ],
            node: {
                __filename: true
            },
            progress: false
        }
    });

    grunt.config.set("webpack-dev-server", {
        options: {
            webpack: {
                context: "src",
                entry: [
                    "webpack-dev-server/client?http://localhost:8080",
                    "webpack/hot/only-dev-server",
                    "./main.js"
                ],
                output: {
                    path: "target",
                    filename: "main.js"
                },
                module: {
                    loaders: [
                        { test: /\.js$/, exclude: /node_modules/, loaders: ["react-hot", "babel?cacheDirectory&optional[]=runtime"]},
                        { test: /\.css$/, loader: "style!css"},
                        { test: /\.less$/, loader: "style!css!less"},
                        { test: /\.(png|jpg|woff2?|ttf|eot|svg)$/, loader: "file?name=[name]-[hash].[ext]" }
                    ]
                },
                plugins: [
                    new HtmlPlugin({
                        template: "src/index.html"
                    }),
                    new webpack.HotModuleReplacementPlugin()
                ],
                node: {
                    __filename: true
                },
                watch: true,
                keepalive: true
            },
            publicPath: "/",
            hot: true
        },
        start: {
            keepAlive: true,
            webpack: {
                devtool: "cheap-module-source-map"
                //debug: true
            }
        }
    });

    grunt.loadNpmTasks("grunt-jscs");
    var src = ["src/**/*.js", "test/**/*.js", "Gruntfile.js"];
    grunt.config.set("jscs", {
        options: {
            config: ".jscsrc"
        },
        dev: {
            src: src
        },
        fix: {
            options: {
                fix: true
            },
            src: src
        },
        ci: {
            options: {
                reporter: "junit",
                reporterOutput: "target/style.xml"
            },
            src: src
        }
    });

    grunt.loadNpmTasks("grunt-eslint");
    grunt.config.set("eslint", {
        options: {
            configFile: ".eslintrc"
        },
        dev: {
            src: src
        },
        ci: {
            options: {
                format: "junit",
                outputFile: "target/lint.xml"
            },
            src: src
        }
    });

    grunt.loadNpmTasks("grunt-mocha-test");
    var testSrc = ["test/**/*Test.js"];
    grunt.config.set("mochaTest", {
        options: {
            require: [
                "babel-core/register",
                "test/testSetup"
            ]
        },
        dev: {
            src: testSrc
        },
        ci: {
            options: {
                reporter: "xunit",
                captureFile: "target/tests.xml",
                quiet: true
            },
            src: testSrc
        }
    });

    grunt.registerTask("coverage", "Generate test coverage report.", function () {
        var istanbulOptions = ["cover", "--root", "./src", "--dir", "./target/coverage", "./node_modules/mocha/bin/_mocha"];
        var mochaOptions = ["--require", "babel-core/register", "--require", "test/testSetup", "--require", "test/loadUntestedFiles", "--recursive", "./test"];

        var done = this.async();
        grunt.util.spawn({
            cmd: "node",
            args: ["./node_modules/istanbul/lib/cli"].concat(istanbulOptions).concat(["--"]).concat(mochaOptions),
            opts: {
                env: process.env,
                cwd: process.cwd(),
                stdio: "inherit"
            }
        }, function (err) {
            if (err) {
                grunt.fail.warn(err);
                return;
            }
            done();
        });
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.config.set("clean", {
        dist: ["target/dist/*"]
    });

    grunt.registerTask("dev", ["webpack-dev-server:start"]);
    grunt.registerTask("test", ["eslint:dev", "jscs:dev", "mochaTest:dev"]);
    grunt.registerTask("build", ["clean:dist", "webpack:build"]);

    grunt.registerTask("ci", ["eslint:ci", "jscs:ci", "mochaTest:ci", "build"]);
};
