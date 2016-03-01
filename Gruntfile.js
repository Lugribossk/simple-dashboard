/*global module, require, process*/
/*eslint prefer-arrow-callback: 0, no-invalid-this: 0, object-curly-spacing: 0*/
var webpack = require("webpack");
var _ = require("lodash");
var HtmlPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CompressionPlugin = require("compression-webpack-plugin");

module.exports = function (grunt) {
    grunt.initConfig({});

    var pkg = grunt.file.readJSON("./package.json");

    var staticPath = "static/";
    grunt.loadNpmTasks("grunt-webpack");
    grunt.config.set("webpack", {
        build: {
            context: "src",
            entry: {
                main: "./main.js",
                vendor: _.without(_.keys(pkg.dependencies), "bootstrap", "bootswatch")
            },
            output: {
                path: "target/dist",
                filename: staticPath + "main-[chunkhash].min.js",
                // This is needed for the css file to have the right path to the fonts.
                publicPath: "../"
            },
            module: {
                loaders: [{
                    loader: "babel",
                    test: /\.js$/,
                    exclude: /node_modules/,
                    query: {
                        cacheDirectory: true
                    }
                }, {
                    loader: ExtractTextPlugin.extract("style", "css"),
                    test: /\.css$/
                }, {
                    loader: ExtractTextPlugin.extract("style", "css!less"),
                    test: /\.less$/
                }, {
                    loader: "file",
                    test: /\.(png|jpg|woff2?|ttf|eot|svg)$/,
                    query: {
                        name: staticPath + "[name]-[hash].[ext]"
                    }
                }]
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
                new CompressionPlugin(),
                new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
            ],
            node: {
                __filename: true
            },
            progress: false
        }
    });

    grunt.config.set("webpack-dev-server", {
        start: {
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
                    loaders: [{
                        loader: "babel",
                        test: /\.js$/,
                        exclude: /node_modules/,
                        query: {
                            cacheDirectory: true,
                            plugins: [["react-transform", {
                                transforms: [{
                                    transform: "react-transform-hmr",
                                    imports: ["react"],
                                    locals: ["module"]
                                }, {
                                    transform: "react-transform-catch-errors",
                                    imports: ["react", "redbox-react"]
                                }]
                            }]]
                        }
                    }, {
                        loader: "style!css",
                        test: /\.css$/
                    }, {
                        loader: "style!css!less",
                        test: /\.less$/
                    }, {
                        loader: "file",
                        test: /\.(png|jpg|woff2?|ttf|eot|svg)$/,
                        query: {
                            name: "name=[name]-[hash].[ext]"
                        }
                    }]
                },
                plugins: [
                    new HtmlPlugin({
                        template: "src/index.html"
                    }),
                    new webpack.HotModuleReplacementPlugin(),
                    new webpack.DefinePlugin({
                        "process.env": {
                            NODE_ENV: JSON.stringify("development")
                        }
                    })
                ],
                node: {
                    __filename: true
                },
                watch: true,
                keepalive: true,
                devtool: "cheap-module-eval-source-map"
            },
            publicPath: "/",
            hot: true,
            keepAlive: true
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
                "test/es6Setup",
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

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.config.set("clean", {
        dist: ["target/dist/*"]
    });

    grunt.loadNpmTasks("grunt-aws");
    grunt.config.set("s3", {
        options: {
            accessKeyId: "",
            secretAccessKey: "",
            region: "us-east-1",
            bucket: ""
        },
        upload: {
            files: [{
                cwd: "target/dist/",
                src: "**",
                dest: "status/"
            }, {
                cwd: "src/",
                src: "config.json",
                dest: "status/"
            }]
        }
    });


    grunt.registerTask("dev", ["webpack-dev-server:start"]);
    grunt.registerTask("test", ["eslint:dev", "jscs:dev", "mochaTest:dev"]);
    grunt.registerTask("build", ["clean:dist", "webpack:build"]);
    grunt.registerTask("upload", ["s3:upload"]);

    grunt.registerTask("ci", ["eslint:ci", "jscs:ci", "mochaTest:ci", "build"]);
};
