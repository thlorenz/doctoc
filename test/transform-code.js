'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform');

test('\ngiven a file with headers embedded in code', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-code.md', 'utf8');
  var headers = transform(content);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '## Table of Contents',
        '',
        '- [Single Backticks](#single-backticks)',
        '- [Multiple Backticks](#multiple-backticks)',
        '- [code tag](#code-tag)',
        '- [pre tag](#pre-tag)',
        '' ]
    , 'generates a correct toc when headers are embedded in code blocks'
  )

  t.end()
})
