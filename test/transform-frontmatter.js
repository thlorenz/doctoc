'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform')

test('\ngiven a file that includes Json frontmatter', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-frontmatter-json.md', 'utf8');
  var res = transform(content);

  t.same(
      res.data
    , [ ';;;',
        'title: JSON Front Matter',
        ';;; ',
        '',
        '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Heading](#heading)',
        '',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        '',
        '# Heading',
        '',
        'Your regular Markdown content follows...',
        '' ].join('\n')  
    , 'generates correct toc for file with Json frontmatter'
  )

  t.end()
})

test('\ngiven a file that includes Toml frontmatter', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-frontmatter-toml.md', 'utf8');
  var res = transform(content);

  t.same(
      res.data
    , [ '+++',
        'title: TOML Front Matter',
        '+++ ',
        '',
        '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Heading](#heading)',
        '',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        '',
        '# Heading',
        '',
        'Your regular Markdown content follows...',
        '' ].join('\n')  
    , 'generates correct toc for file with Toml frontmatter'
  )

  t.end()
})

test('\ngiven a file that includes yaml frontmatter', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-frontmatter-yaml.md', 'utf8');
  var res = transform(content);

  t.same(
      res.data
    , [ '---',
        'title: Yaml Front Matter',
        '---',
        '',
        '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Heading](#heading)',
        '',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        '',
        '# Heading',
        '',
        'Your regular Markdown content follows...',
        '' ].join('\n')  
    , 'generates correct toc for file with yaml frontmatter'
  )

  t.end()
})

test('\ngiven a file that includes invalid frontmatter', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-frontmatter-invalid.md', 'utf8');
  var res = transform(content);

  t.same(
      res.data
    , [ '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Heading](#heading)',
        '',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        '',
        '+++',
        'title: Invalid Front Matter',
        '|||',
        '',
        '# Heading',
        '',
        'Your regular Markdown content follows...',
        '' ].join('\n')  
    , 'generates correct toc for file with invalid frontmatter'
  )

  t.end()
})

test('\ngiven a file that has only yaml frontmatter and empty line', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-frontmatter-blank.md', 'utf8');
  var res = transform(content.trim() + '\n');

  t.same(
      res.data
    , [ '---',
        'title: Yaml Front Matter',
        '---',
        '',
        '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        '' ].join('\n')  
    , 'generates correct toc for file with only yaml frontmatter'
  )

  t.end()
})

test('\ngiven a file that has only yaml frontmatter and no trailing whitespace', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-frontmatter-blank.md', 'utf8');
  var res = transform(content.trim());

  t.same(
      res.data
    , [ '---',
        'title: Yaml Front Matter',
        '---',
        '',
        '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        '' ].join('\n')  
    , 'generates correct toc for file with only yaml frontmatter'
  )

  t.end()
})

test('\ngiven a file that includes yaml frontmatter and process all', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-frontmatter-existing.md', 'utf8');
  var res = transform(contentmode, undefined, undefined, undefined, undefined, undefined, undefined, true);

  t.same(
      res.data
    , [ '---',
        'title: Yaml Front Matter',
        '---',
        '',
        '# Title',
        '',
        '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Title](#title)',
        '  - [Heading](#heading)',
        '',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        '',
        '## Heading',
        '',
        'Your regular Markdown content follows...',
        '' ].join('\n')  
    , 'generates correct toc for file with yaml frontmatter'
  )

  t.end()
})
