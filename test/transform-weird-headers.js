'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform');

test('\ngiven a file with edge-case header names', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-weird-headers.md', 'utf8');
  var headers = transform(content);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '## Table of Contents',
        '',
        '- [hasOwnProperty](#hasownproperty)',
        '- [something else](#something-else)',
        '' ]
    , 'generates a correct toc when headers are weird'
  )

  t.end()
})

test('\nnameless table headers', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-nameless-table-headers.md', 'utf8');
  var headers = transform(content);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Heading One](#heading-one)',
        '  - [Subheading 2](#subheading-2)',
        '' ]
    , 'generates a correct toc when readme has nameless table headers'
  )

  t.end()
})

