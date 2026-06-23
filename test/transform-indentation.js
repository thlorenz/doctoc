'use strict';
/*jshint asi: true */

var test = require('tap').test,
  transform = require('../lib/transform');

test('\ngiven spaces should be used for indentation', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.md', 'utf8');
  var headers = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
    toc: {
        items: {
            indentation: {
                style: 'space',
            }
        }
    }
  });

  t.same(
    headers.toc,
    [
        "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
        "",
        "- [Hello, world!](#hello-world)",
        "  - [Installation](#installation)",
        "  - [API](#api)",
        "  - [License](#license)",
        "",
    ].join('\n'),
    'generates correct toc for space indented items'
  )

  t.end()
})

test('\ngiven tabs should be used for indentation', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-syntax.md', 'utf8');
  var headers = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
    toc: {
        items: {
            indentation: {
                style: 'tab',
                width: 1,
            }
        }
    }
  });

  t.same(
    headers.toc,
    [
        "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*",
        "",
        "- [Hello, world!](#hello-world)",
        "\t- [Installation](#installation)",
        "\t- [API](#api)",
        "\t- [License](#license)",
        "",
    ].join('\n'),
    'generates correct toc for tab indented items'
  )

  t.end()
})
