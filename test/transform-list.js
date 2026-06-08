'use strict';
/*jshint asi: true */

var test = require('tap').test,
    fs = require('fs'),
    transform = require('../lib/transform');
    
test('\nNumerical ToC ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-formatting.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { list: { style: 'number', format: 'ordered' } }
  });

  t.same(
    transformedContent.toc,
    [
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '1. [My Module](#my-module)',
        '  1.1. [API](#api)',
        '    1.1.1. [Method One](#method-one)',
        '    1.1.2. [Method Two](#method-two)',
        '      1.1.2.1. [Main Usage](#main-usage)',
        '  1.2. [Some More](#some-more)',
        ''
    ].join('\n'),
    'TOC is correctly formatted'
  )
  t.end()
});

test('\nUppercase ToC ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-formatting.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { list: { style: 'lowercase', format: 'ordered' } }
  });

  t.same(
    transformedContent.toc,
    [
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        'a. [My Module](#my-module)',
        '  a.a. [API](#api)',
        '    a.a.a. [Method One](#method-one)',
        '    a.a.b. [Method Two](#method-two)',
        '      a.a.b.a. [Main Usage](#main-usage)',
        '  a.b. [Some More](#some-more)',
        ''
    ].join('\n'),
    'TOC is correctly formatted'
  )
  t.end()
});

test('\nLowercase ToC ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-formatting.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { list: { style: 'uppercase', format: 'ordered' } }
  });

  t.same(
    transformedContent.toc,
    [
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        'A. [My Module](#my-module)',
        '  A.A. [API](#api)',
        '    A.A.A. [Method One](#method-one)',
        '    A.A.B. [Method Two](#method-two)',
        '      A.A.B.A. [Main Usage](#main-usage)',
        '  A.B. [Some More](#some-more)',
        ''
    ].join('\n'),
    'TOC is correctly formatted'
  )
  t.end()
});

test('\nRoman ToC ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-formatting.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { list: { style: 'roman', format: 'ordered' } }
  });

  t.same(
    transformedContent.toc,
    [
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        'I. [My Module](#my-module)',
        '  I.I. [API](#api)',
        '    I.I.I. [Method One](#method-one)',
        '    I.I.II. [Method Two](#method-two)',
        '      I.I.II.I. [Main Usage](#main-usage)',
        '  I.II. [Some More](#some-more)',
        ''
    ].join('\n'),
    'TOC is correctly formatted'
  )
  t.end()
});

test('\nUnordered ToC ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-formatting.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { list: { style: 'number', format: 'unordered' } }
  });

  t.same(
    transformedContent.toc,
    [
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [My Module](#my-module)',
        '  - [API](#api)',
        '    - [Method One](#method-one)',
        '    - [Method Two](#method-two)',
        '      - [Main Usage](#main-usage)',
        '  - [Some More](#some-more)',
        ''
    ].join('\n'),
    'TOC is correctly formatted'
  )
  t.end()
});
