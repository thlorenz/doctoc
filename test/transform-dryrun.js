'use strict';
/*jshint asi: true */

var test = require('tap').test,
    fs = require('fs'),
    exec = require("child_process").exec;

test('\nshould exit with a error code due to --dryrun option', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-out_of_date_toc.md --dryrun', function (error, stdout, stderr) {
      if (error) {
        t.deepEqual(error.code, 1, 'process exited with error code 1 as expected');
        t.end('process did have an error');
      } else {
        t.fail('process did not produce an error: ' + error);
        t.end();
      }
    })
})

test('\nshould exit with no error code with --dryrun option', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-custom-title.md --dryrun', function (error, stdout, stderr) {
      if (error) {
        t.fail('process produced an unexpected error: ' + error);
        t.end()
      } else {
        t.end('process did not have an error');
      }
    })
})

test('\nshould exit no error code due to no --dryrun option for out of date toc', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-out_of_date_toc.md --stdout', function (error, stdout, stderr) {
      if (error) {
        t.fail('process produced an unexpected error: ' + error);
        t.end()
      } else {
        t.end('process did not have an error');
      }
    })
})

test('\nshould exit with no error code', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-custom-title.md', function (error, stdout, stderr) {
      if (error) {
        t.fail('process produced an unexpected error: ' + error);
        t.end()
      } else {
        t.end('process did not have an error');
      }
    })
})
