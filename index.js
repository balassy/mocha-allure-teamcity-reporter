"use strict";
var Base = require("mocha").reporters.Base;
var Allure = require("allure-js-commons");
var allureReporter = new Allure();
var Runtime = require("allure-js-commons/runtime");
var log = console.log;

global.allure = new Runtime(allureReporter);

/**
 * Initialize a new `Allure` test reporter.
 *
 * @param {Runner} runner
 * @param {Object} opts mocha options
 * @api public
 */
function AllureReporter(runner, opts) {
    Base.call(this, runner);
    allureReporter.setOptions(opts.reporterOptions || {});

    runner.on('suite', function (suite) {
        allureReporter.startSuite(suite.fullTitle());

        if (suite.root) return;
        suite.startDate = Date.now();
        log("##teamcity[testSuiteStarted name='" + escape(suite.title) + "']");
    });

    runner.on('suite end', function (suite) {
        allureReporter.endSuite();

        if (suite.root) return;
        log("##teamcity[testSuiteFinished name='" + escape(suite.title) + "' duration='" + (Date.now() - suite.startDate) + "']");
    });

    runner.on('test', function (test) {
        allureReporter.startCase(test.title);
        log("##teamcity[testStarted name='" + escape(test.title) + "' captureStandardOutput='true']");
    });

    runner.on('pending', function (test) {
        allureReporter.pendingCase(test.title);
        log("##teamcity[testIgnored name='" + escape(test.title) + "' message='pending']");
    });

    runner.on('pass', function (test) {
        allureReporter.endCase('passed');
        log("##teamcity[testFinished name='" + escape(test.title) + "' duration='" + test.duration + "']");
    });

    runner.on('fail', function (test, err) {
        if(!allureReporter.getCurrentTest()) {
            allureReporter.startCase(test.title);
        }
        var status = err.name === 'AssertionError' ? 'failed' : 'broken';
        if (global.onError) {
            global.onError(err);
        }
        allureReporter.endCase(status, err);
        log("##teamcity[testFailed name='" + escape(test.title) + "' message='" + escape(err.message) + "' captureStandardOutput='true']");
    });

    runner.on("hook end", function(hook) {
        if(hook.title.indexOf('"after each" hook') === 0) {
            allureReporter.endCase("passed");
        }
    });
}


function escape(str) {
    if (!str) return '';
    return str
        .toString()
        .replace(/\|/g, "||")
        .replace(/\n/g, "|n")
        .replace(/\r/g, "|r")
        .replace(/\[/g, "|[")
        .replace(/\]/g, "|]")
        .replace(/\u0085/g, "|x")
        .replace(/\u2028/g, "|l")
        .replace(/\u2029/g, "|p")
        .replace(/'/g, "|'");
}

module.exports = AllureReporter;
