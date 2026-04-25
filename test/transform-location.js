'use strict';
/*jshint asi: true */

var test = require('tap').test,
    fs = require('fs'),
    transform = require('../lib/transform');

test('\nTOC at Top', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-location.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { 
      location: 'top'
    } 
  });

  t.same(
    transformedContent.data,
    [
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "preface",
      "",
      "# Hello, world!",
      "",
      "a",
      "",
      "## Installation",
      "",
      "b",
      "",
      "## API",
      "",
      "c",
      ""
    ].join('\n'),
    'TOC is not inserted at correct location'
  )
  t.end()
});

test('\nTOC before h1 ', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-location.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { 
      location: 'before'
    } 
  });

  t.same(
    transformedContent.data,
    [
      "preface",
      "",
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "# Hello, world!",
      "",
      "a",
      "",
      "## Installation",
      "",
      "b",
      "",
      "## API",
      "",
      "c",
      ""
    ].join('\n'),
    'TOC is not inserted at correct location'
  )
  t.end()
});


test('\nTOC before h2 ', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-location.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, 2, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { 
      location: 'before'
    } 
  });

  t.same(
    transformedContent.data,
    [
      "preface",
      "",
      "# Hello, world!",
      "",
      "a",
      "",
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "## Installation",
      "",
      "b",
      "",
      "## API",
      "",
      "c",
      ""
    ].join('\n'),
    'TOC is not inserted at correct location'
  )
  t.end()
});
