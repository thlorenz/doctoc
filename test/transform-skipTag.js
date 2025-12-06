'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform');

test('\nskip tag non first line transform', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-skipTag.md', 'utf8');
  var transformedContent = transform(content);

  t.deepEqual(
    transformedContent.toc
    , undefined
    , 'skip correct file'
  )
  t.end()
});

test('\nskip tag first line transform', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-firstline-skipTag.md', 'utf8');
  var transformedContent = transform(content);

  t.deepEqual(
    transformedContent.toc
    , undefined
    , 'skip correct file'
  )
  t.end()
});

test('\nskip tag invalid nested transform', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-invalidskipTag.md', 'utf8');
  var transformedContent = transform(content);

  t.deepEqual(
    transformedContent.transformed
    , true
    , 'don\'t skip file as skipTag is invalid'
  )
  t.end()
});
