'use strict';
/*jshint asi: true */

var test = require('tap').test,
    fs = require('fs'),
    exec = require("child_process").exec;

test('\nshould ignore file with --minlines', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-custom-title.md --minlines 20', function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        return;
      }

      t.deepEqual(stdout
        , fs.readFileSync(__dirname + '/fixtures/minlines-ignore-output.md', 'utf8')
        , 'spits out the correct output');

      t.end();
    })
})

test('\nshould update file with --minlines', function (t) {
    var copy = fs.readFileSync(__dirname + '/fixtures/readme-benign-backticks.md', 'utf8');
    exec('node doctoc.js test/fixtures/readme-benign-backticks.md --minlines 14', function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        return;
      }

      t.deepEqual(fs.readFileSync(__dirname + '/fixtures/readme-benign-backticks.md', 'utf8')
        , fs.readFileSync(__dirname + '/fixtures/minlines-update-result.md', 'utf8')
        , 'spits out the correct table of contents');
    
      t.deepEqual(stdout
        , fs.readFileSync(__dirname + '/fixtures/minlines-update-output.md', 'utf8')
        , 'spits out the correct output');

      fs.writeFileSync(__dirname + '/fixtures/readme-benign-backticks.md', copy)

      t.end();
    })
    
})
