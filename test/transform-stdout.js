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

test('\nshould be a dry run even though the --stdout option provided due to being a directory', function (t) {

    exec('node doctoc.js test/fixtures/invalid_stdout --stdout', function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        return;
      }
      t.deepEqual(stdout
        , fs.readFileSync(__dirname + '/fixtures/stdout_run_on_directory.log', 'utf8')
        , 'spits out the correct logs for stdout on directory')

      t.end()
    })
})
