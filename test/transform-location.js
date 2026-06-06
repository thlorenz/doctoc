'use strict';
/*jshint asi: true */

var test = require('tap').test,
    fs = require('fs'),
    transform = require('../lib/transform');

test('\nTOC at Top', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-location.md', 'utf8');
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
  var content = fs.readFileSync(__dirname + '/fixtures/readme-location.md', 'utf8');
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

test('\nTOC before h1 in empty', function (t) {
  var content = [
      "preface",
      "",
      "Hello, world!",
      "",
      "a",
      ""
    ].join('\n')
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { 
      location: 'before'
    } 
  });

  t.same(
    transformedContent.data,
    [
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "preface",
      "",
      "Hello, world!",
      "",
      "a",
      ""
    ].join('\n'),
    'TOC is not inserted at correct location'
  )
  t.end()
});

test('\nTOC before h2 ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-location.md', 'utf8');
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
      "- [Installation](#installation)",
      "- [API](#api)",
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

test('\nTOC at Top of doc with hTags', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-location-hTags.md', 'utf8');
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
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "preface",
      "",
      "<h1>Hello, world!</h1>",
      "",
      "a",
      "",
      "<h2>Installation</h2>",
      "",
      "b",
      "",
      "<h2>API</h2>",
      "",
      "c",
      ""
    ].join('\n'),
    'TOC is not inserted at correct location'
  )
  t.end()
});

test('\nTOC before h1 via hX tags ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-location-hTags.md', 'utf8');
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
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "<h1>Hello, world!</h1>",
      "",
      "a",
      "",
      "<h2>Installation</h2>",
      "",
      "b",
      "",
      "<h2>API</h2>",
      "",
      "c",
      ""
    ].join('\n'),
    'TOC is not inserted at correct location'
  )
  t.end()
});

test('\nTOC before h1 in empty markdown', function (t) {
  var content = [
      "preface",
      "",
      "Hello, world!",
      "",
      "a",
      ""
    ].join('\n')
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    toc: { 
      location: 'before'
    } 
  });

  t.same(
    transformedContent.data,
    [
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "preface",
      "",
      "Hello, world!",
      "",
      "a",
      ""
    ].join('\n'),
    'TOC is not inserted at correct location'
  )
  t.end()
});

test('\nTOC before h2 via hX tags ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-location-hTags.md', 'utf8');
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
      "<h1>Hello, world!</h1>",
      "",
      "a",
      "",
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Installation](#installation)",
      "- [API](#api)",
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "<h2>Installation</h2>",
      "",
      "b",
      "",
      "<h2>API</h2>",
      "",
      "c",
      ""
    ].join('\n'),
    'TOC is not inserted at correct location'
  )
  t.end()
});

test('\nREADME recipe: stylized HTML <h1> + intro + sections, --toc-location before --minlevel 2', function (t) {
  var content = [
    '<h1 align="center">My Project</h1>',
    '',
    '<p align="center">A short tagline goes here.</p>',
    '',
    'My Project is a tool for doing the thing. Read on for setup instructions',
    'and an API reference.',
    '',
    '## Installation',
    '',
    'Run `npm install my-project`.',
    '',
    '## API',
    '',
    'See [docs](./docs).',
    ''
  ].join('\n')

  var transformedContent = transform(content, undefined, undefined, 2, undefined, undefined, undefined,
 undefined, undefined, undefined, undefined, {
    toc: {
      location: 'before'
    }
  });

  t.same(
    transformedContent.data,
    [
      '<h1 align="center">My Project</h1>',
      "",
      '<p align="center">A short tagline goes here.</p>',
      "",
      "My Project is a tool for doing the thing. Read on for setup instructions",
      "and an API reference.",
      "",
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Installation](#installation)",
      "- [API](#api)",
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "## Installation",
      "",
      "Run `npm install my-project`.",
      "",
      "## API",
      "",
      "See [docs](./docs).",
      ""
    ].join('\n'),
    'TOC must land between intro and first H2; HTML <h1> stays at top so the file remains MD041-compliant'
  )
  t.end()
});

test('\nTOC before h2 — mixed markdown # H1 and HTML <h1> stay above; TOC lands before first ## ', function (t) {
  var content = [
    '# Project',
    '',
    'intro',
    '',
    '<h1>Stylized Subtitle</h1>',
    '',
    'more intro',
    '',
    '## Section',
    '',
    'body',
    ''
  ].join('\n')

  var transformedContent = transform(content, undefined, undefined, 2, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
    toc: {
      location: 'before'
    }
  });

  t.same(
    transformedContent.data,
    [
      "# Project",
      "",
      "intro",
      "",
      "<h1>Stylized Subtitle</h1>",
      "",
      "more intro",
      "",
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Section](#section)",
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
      "",
      "## Section",
      "",
      "body",
      ""
    ].join('\n'),
    'TOC must land before the first ## Section; HTML <h1> below the markdown # Project must not anchor insertion'
  )
  t.end()
});
