'use strict';
/*jshint asi: true */

var test = require('tap').test,
    fs = require('fs'),
    exec = require("child_process").exec;

test('\nshould print to stdout with --stdout option', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-custom-title.md --stdout', function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        return;
      }
      t.deepEqual(stdout
        , fs.readFileSync(__dirname + '/fixtures/stdout.log', 'utf8')
        , 'spits out the correct table of contents')

      t.end()
    })
})

test('\nshould print to stdout with -s option', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-custom-title.md -s', function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        return;
      }
      t.deepEqual(stdout
        , fs.readFileSync(__dirname + '/fixtures/stdout.log', 'utf8')
        , 'spits out the correct table of contents')

      t.end()
    })
})

test('\nshould exit with error code as --stdout option is not supported on a directory', function (t) {

    exec('node doctoc.js test/fixtures/invalid_stdout --stdout', function (error, stdout, stderr) {
      if (error) {
        t.deepEqual(error.code, 2, 'process exited with error code 2 as expected');
        t.end();
      } else {
        t.fail('process did not produce an error: ' + error);
        t.end();
      }
    })
})

test('\nshould exit with error code as --stdout option is not supported on multiple files', function (t) {

    exec('node doctoc.js test/fixtures/first.md text/fixtures/second.md --stdout', function (error, stdout, stderr) {
      if (error) {
        t.deepEqual(error.code, 2, 'process exited with error code 2 as expected');
        t.end();
      } else {
        t.fail('process did not produce an error: ' + error);
        t.end();
      }
    })
  })