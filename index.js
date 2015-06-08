var Base = require('mocha').reporters.Base,
    Allure = require('allure-js-commons'),
    allureReporter = new Allure(),
    Runtime = require('allure-js-commons/runtime'),
    log = console.log;

global.allure = new Runtime(allureReporter);
module.exports = AllureReporter;


function AllureReporter(runner, opts) {
    Base.call(this, runner);
    allureReporter.setOptions(opts.reporterOptions);

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


    runner.on('test', function(test) {
        allureReporter.startCase(test.title);
        log("##teamcity[testStarted name='" + escape(test.title) + "' captureStandardOutput='true']");
    });

    runner.on('pending', function(test) {
        allureReporter.pendingCase(test.title);
        log("##teamcity[testIgnored name='" + escape(test.title) + "' message='pending']");
    });

    runner.on('pass', function(test) {
        allureReporter.endCase('passed');
        log("##teamcity[testFinished name='" + escape(test.title) + "' duration='" + test.duration + "']");
    });

    runner.on('fail', function(test, err) {
        var status = err.name === 'AssertionError' ? 'failed' : 'broken';
        if(global.onError) {
            global.onError(err);
        }
        allureReporter.endCase(status, err);
        log("##teamcity[testFailed name='" + escape(test.title) + "' message='" + escape(err.message) + "' captureStandardOutput='true']");
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

AllureReporter.prototype.__proto__ = Base.prototype;
