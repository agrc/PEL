/*jshint unused:false*/
/* global JasmineFaviconReporter */
var dojoConfig = {
    isDebug: false,
    isJasmineTestRunner: true, // prevents parser in main.js from running
    has: {
        'dojo-undef-api': true
    }
};

jasmine.getEnv().addReporter(new JasmineFaviconReporter());