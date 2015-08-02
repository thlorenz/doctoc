'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform');

test('\nhandle inline links and images', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-nested-markdown.md', 'utf8');
  var headers = transform(content, null, null, '', false);

  t.deepEqual(
      headers.toc.split('\n')
    , [
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [CNN](#cnn)',
        '- [Get Involved *](#get-involved-)',
        '- [Translation Status *](#translation-status-)',
        '- [Building *](#building-)',
        '',
      ]
    , 'generates correct toc for nested markdown (links and images)'
  )
  t.end()
});



