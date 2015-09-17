/*eslint no-console: 0*/
import expect from "unexpected";
import sinon from "sinon";
import Logger from "../../src/util/Logger";

describe("Logger", () => {
    afterEach(() => {
        Logger.setLogLevelAll(Logger.LogLevel.DEBUG);
    });

    describe("info()", () => {
        it("should print name and arguments with console.info by default.", () => {
            sinon.stub(console, "info");
            var log = new Logger("test1");
            var obj = {};

            log.info("blah", obj);

            expect(console.info, "was called with", "[test1]", "blah", obj);
        });

        it("should not print anything when level is WARN.", () => {
            sinon.stub(console, "info");
            var log = new Logger("test2");

            log.setLogLevel(Logger.LogLevel.WARN);
            log.info("blah");

            expect(console.info, "was not called");
        });
    });

    describe("warn()", () => {
        it("should print name and arguments with console.warn by default.", () => {
            sinon.stub(console, "warn");
            var log = new Logger("test3");
            var obj = {};

            log.warn("blah", obj);

            expect(console.warn, "was called with", "[test3]", "blah", obj);
        });

        it("should not print anything when level is ERROR.", () => {
            sinon.stub(console, "warn");
            var log = new Logger("test4");

            log.setLogLevel(Logger.LogLevel.ERROR);
            log.warn("blah");

            expect(console.warn, "was not called");
        });
    });

    describe("error()", () => {
        it("error should print name and arguments with console.error by default.", () => {
            sinon.stub(console, "error");
            var log = new Logger("test5");
            var obj = {};

            log.error("blah", obj);

            expect(console.error, "was called with", "[test5]", "blah", obj);
        });

        it("should not print anything when level is OFF.", () => {
            sinon.stub(console, "error");
            var log = new Logger("test6");

            log.setLogLevel(Logger.LogLevel.OFF);
            log.error("blah");

            expect(console.error, "was not called");
        });
    });

    describe("debug()", () => {
        beforeEach(() => {
            console.debug = sinon.spy();
        });
        afterEach(() => {
            delete console.debug;
        });

        it("debug should print name and arguments with console.debug by default.", () => {
            var log = new Logger("test7");
            var obj = {};

            log.debug("blah", obj);

            expect(console.debug, "was called with", "[test7]", "blah", obj);
        });

        it("should not print anything when level is INFO.", () => {
            var log = new Logger("test8");

            log.setLogLevel(Logger.LogLevel.INFO);
            log.debug("blah");

            expect(console.debug, "was not called");
        });
    });

    describe("trace()", () => {
        beforeEach(() => {
            console.trace = sinon.spy();
        });
        afterEach(() => {
            delete console.trace;
        });

        it("should not print anything by default.", () => {
            var log = new Logger("test9");

            log.trace("blah");

            expect(console.trace, "was not called");
        });

        it("should print name and arguments with console.trace when level is TRACE.", () => {
            var log = new Logger("test10");
            var obj = {};

            log.setLogLevel(Logger.LogLevel.TRACE);
            log.trace("blah", obj);

            expect(console.trace, "was called with", "[test10]", "blah", obj);
        });
    });

    describe("default log level", () => {
        it("change should affect new loggers.", () => {
            sinon.stub(console, "warn");
            Logger.setLogLevelAll(Logger.LogLevel.ERROR);
            var log = new Logger("test12");

            log.warn("blah");

            expect(console.warn, "was not called");
        });

        it("change should affect existing loggers.", () => {
            sinon.stub(console, "warn");
            var log = new Logger("test13");
            Logger.setLogLevelAll(Logger.LogLevel.ERROR);

            log.warn("blah");

            expect(console.warn, "was not called");
        });
    });

    describe("extracting name from __filename", () => {
        it("should work with Windows names.", () => {
            var log = new Logger("C:\\Code\\react-experiment\\src\\util\\MyClass.js");

            expect(log.name, "to be", "MyClass");
        });

        it("should work with Linux names.", () => {
            var log = new Logger("/blah/blah/react-experiment/src/util/MyClass.js");

            expect(log.name, "to be", "MyClass");
        });
    });

    it("constructor should return previously created instance with same name.", () => {
        var log1 = new Logger("test11");
        var log2 = new Logger("test11");

        expect(log1, "to be", log2);
    });
});