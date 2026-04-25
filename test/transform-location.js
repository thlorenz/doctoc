'use strict';
/*jshint asi: true */

var test = require('tap').test,
    fs = require('fs'),
    exec = require("child_process").exec;

test('\n', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-location.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, "md", { 
    toc: { 
      location: 'top'
    } 
  });

  t.same(
    transformedContent.data
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
      "<!-- END doctoc generated TOC please keep comment here to allow auto update -->",
    ].join('\n')
    , 'Pragma style is not legacy'
  )
  t.end()
});
