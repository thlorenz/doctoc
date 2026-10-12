'use strict';
/*jshint asi: true */

var test = require('tap').test,
  findMarkdownFiles = require('../lib/file').findMarkdownFiles;

const fixturesDir = __dirname + "/fixtures"
test('\nmatch mdx files only with syntax=mdx', function (t) {
  var files = findMarkdownFiles(fixturesDir, 'mdx');
  t.same(
    files.length > 0 && files.every((file) => file.path.endsWith(".mdx")),
    true,
    'match mdx files only with syntax=mdx'
  );
  t.end();
});

test('\nmatch md files only with syntax=md', function (t) {
  var files = findMarkdownFiles(fixturesDir, 'md');
  t.same(
    files.length > 0 && files.every((file) => file.path.endsWith(".md")),
    true,
    'match md files only with syntax=md'
  );
  t.end();
});

test('\nmatch md, mdx etc files when undefined syntax', function (t) {
  var files = findMarkdownFiles(fixturesDir);
  t.same(
    files.length > 0 && files.every((file) => file.path.endsWith(".md") ||
      file.path.endsWith(".mdx") ||
      file.path.endsWith(".markdown")
    ),
    true,
    'match multiple file types when undefined syntax'
  );
  t.same(
    files.every((file) => file.path.endsWith(".md")),
    false,
    'not all files are md files when undefined syntax'
  );
  t.same(
    files.every((file) => file.path.endsWith(".mdx")),
    false,
    'not all files are mdx files when undefined syntax'
  );
  t.end();
});
