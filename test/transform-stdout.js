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

    t.deepEqual(stderr
      , fs.readFileSync(__dirname + '/fixtures/stderr.md', 'utf8')
      , 'spits out extra lines as errors')

    t.deepEqual([
      '- [Installation](#installation)',
      '- [API](#api)',
      '- [License](#license)',
      ''
      ].join('\n')
      , fs.readFileSync(__dirname + '/fixtures/stdout.md', 'utf8')
      , 'logs the correct table of contents'
      )

    t.end()
  })
})

test('\nshould print to stdout with -s option', function (t) {

  exec('node doctoc.js test/fixtures/readme-with-custom-title.md -s', function (error, stdout, stderr) {
    if (error) {
      console.error('exec error: ', error);
      return;
    }

    t.deepEqual(stderr
      , fs.readFileSync(__dirname + '/fixtures/stderr.md', 'utf8')
      , 'spits out extra lines as errors')

    t.deepEqual([
      '- [Installation](#installation)',
      '- [API](#api)',
      '- [License](#license)',
      ''
      ].join('\n')
      , fs.readFileSync(__dirname + '/fixtures/stdout.md', 'utf8')
      , 'logs the correct table of contents'
      )

    t.end()
  })
})

test('\nshould be able to pipe logs from --stdout function to a file', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-custom-title.md --stdout > test/fixtures/stdout.md', function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        return;
      }

      t.deepEqual(stderr
        , fs.readFileSync(__dirname + '/fixtures/stderr.md', 'utf8')
        , 'spits out extra lines as errors')

      t.deepEqual([
        '- [Installation](#installation)',
        '- [API](#api)',
        '- [License](#license)',
        ''
        ].join('\n')
        , fs.readFileSync(__dirname + '/fixtures/stdout.md', 'utf8')
        , 'logs the correct table of contents'
        )

      t.end()
    })
})
