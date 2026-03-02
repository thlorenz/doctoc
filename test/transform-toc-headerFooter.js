'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform');

test('\nRemove md header, no content', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "md", { 
    toc: { 
      header: { 
        remove: true 
      } 
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "<!-- START doctoc -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
    ]
    , 'Header wasn\'t removed correctly'
  )
  t.end()
});

test('\nRemove md footer, no content', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "md", { 
    toc: { 
      footer: { 
        remove: true 
      } 
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "<!-- END doctoc -->",
    ]
    , 'Footer wasn\'t removed correctly'
  )
  t.end()
});

test('\nSet a md header', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "md", { 
    toc: { 
      header: { 
        content: "My custom header content"
      } 
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "My custom header content",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
    ]
    , 'Header wasn\'t set correctly'
  )
  t.end()
});

test('\nSet a md footer', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "md", { 
    toc: { 
      footer: { 
        content: "My custom footer content"
      } 
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "<!-- START doctoc generated TOC please keep comment here to allow auto update -->",
      "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "My custom footer content",
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
    ]
    , 'Footer wasn\'t set correctly'
  )
  t.end()
});

test('\nRemove md header/footer and use existing position', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-custom-title.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "md", { 
    toc: { 
      header: { 
        remove: true 
      },
      footer: {
        remove: true
      }
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "<!-- START doctoc -->",
      "## Table of Contents",
      "",
      "- [Installation](#installation)",
      "- [API](#api)",
      "- [License](#license)",
      "",
      "<!-- END doctoc -->",
    ]
    , 'Header/footer wasn\'t removed correctly and position wasn\'t reused'
  )
  t.end()
});

test('\nRemove mdx header, no content', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.mdx', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "mdx", { 
    toc: { 
      header: { 
        remove: true 
      } 
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "{/* START doctoc */}",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "{/* END doctoc generated TOC please keep comment here to allow auto update */}",
    ]
    , 'Header wasn\'t removed correctly'
  )
  t.end()
});

test('\nRemove mdx footer, no content', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.mdx', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "mdx", { 
    toc: { 
      footer: { 
        remove: true 
      } 
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "{/* START doctoc generated TOC please keep comment here to allow auto update */}",
      "{/* DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE */}",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "{/* END doctoc */}",
    ]
    , 'Footer wasn\'t removed correctly'
  )
  t.end()
});

test('\nSet a mdx header', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.mdx', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "mdx", { 
    toc: { 
      header: { 
        content: "My custom header content"
      } 
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "{/* START doctoc generated TOC please keep comment here to allow auto update */}",
      "My custom header content",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "{/* END doctoc generated TOC please keep comment here to allow auto update */}",
    ]
    , 'Header wasn\'t set correctly'
  )
  t.end()
});

test('\nSet a mdx footer', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.mdx', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "mdx", { 
    toc: { 
      footer: { 
        content: "My custom footer content"
      } 
    } 
  });

  t.same(
    transformedContent.wrappedToc.split('\n')
    , [
      "{/* START doctoc generated TOC please keep comment here to allow auto update */}",
      "{/* DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE */}",
      "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
      "",
      "- [Hello, world!](#hello-world)",
      "  - [Installation](#installation)",
       "  - [API](#api)",
      "  - [License](#license)",
      "",
      "My custom footer content",
      "{/* END doctoc generated TOC please keep comment here to allow auto update */}",
    ]
    , 'Footer wasn\'t set correctly'
  )
  t.end()
});
