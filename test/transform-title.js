'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform');

test('\noverwrite existing title', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-custom-title.md', 'utf8');
  var headers = transform(content, {
    title: '## Table of Contents',
    notitle: false
  });

  t.deepEqual(
      headers.toc.split('\n')
    , [ '## Table of Contents',
        '',
        '- [Installation](#installation)',
        '- [API](#api)',
        '- [License](#license)',
        '' ]
    , 'generates correct toc for when custom --title was passed'
  )
  t.end()
});

test('\ndo not overwrite existing title', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-custom-title.md', 'utf8');
  var headers = transform(content, {
    notitle: false
  });

  t.deepEqual(
      headers.toc.split('\n')
    , [ '## Table of Contents',
        '',
        '- [Installation](#installation)',
        '- [API](#api)',
        '- [License](#license)',
        '' ]
    , 'generates correct toc for when custom title exists in README already'
  )
  t.end()
});

test('\nclobber existing title', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-custom-title.md', 'utf8');
  var headers = transform(content, {
    notitle: true
  });

  t.deepEqual(
      headers.toc.split('\n')
    , [ '',
        '',
        '- [Installation](#installation)',
        '- [API](#api)',
        '- [License](#license)',
        '' ]
    , 'generates correct toc for when --notitle was passed'
  )
  t.end()
});
