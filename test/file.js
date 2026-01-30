'use strict';
/*jshint asi: true */

var test = require('tap').test
  , findMarkdownFiles = require('../lib/file').findMarkdownFiles
  ,  _   =  require('underscore');
const fixturesDir = __dirname + "/fixtures"
test('\nmatch mdx files only with syntax=mdx', function (t) {
  t.deepEqual(
    _(findMarkdownFiles(fixturesDir, 'mdx')).every((file) => file.path.endsWith(".mdx"))
    , true
    , 'match mdx files only with syntax=mdx'
  )
  t.end()
});

test('\nmatch md files only with syntax=md', function (t) {
  t.deepEqual(
    _(findMarkdownFiles(fixturesDir, 'md')).every((file) => file.path.endsWith(".md"))
    , true
    , 'match md files only with syntax=md'
  )
  t.end()
});

test('\nmatch md files only with undefined syntax', function (t) {
  t.deepEqual(
    _(findMarkdownFiles(fixturesDir, 'md')).every((file) => file.path.endsWith(".md"))
    , true
    , 'match md files only with undefined syntax'
  )
  t.end()
});
