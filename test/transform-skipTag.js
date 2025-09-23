'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform');

test('\nskip file transform', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-skipTag.md', 'utf8');
  var transformedContent = transform(content);

  t.same(
    transformedContent.toc
    , undefined
    , 'skip correct file'
  )
  t.end()
});
