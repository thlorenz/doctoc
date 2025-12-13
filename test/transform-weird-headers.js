'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform');

test('\ngiven a file with edge-case header names', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-weird-headers.md', 'utf8');
  var headers = transform(content);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '## Table of Contents',
        '',
        '- [hasOwnProperty](#hasownproperty)',
        '- [something else](#something-else)',
        '' ]
    , 'generates a correct toc when headers are weird'
  )

  t.end()
})

test('\nnameless table headers', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-nameless-table-headers.md', 'utf8');
  var headers = transform(content);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Heading One](#heading-one)',
        '  - [Subheading 2](#subheading-2)',
        '' ]
    , 'generates a correct toc when readme has nameless table headers'
  )

  t.end()
})

test('\nemoji-first header names', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-emoji-headers.md', 'utf8');
  var headers = transform(content);

  t.same(
      headers.toc.split('\n')
    , [ '',
        '- [🔴 or 🟡 - At Risk](#-or----at-risk)',
        '- [🔄 Still Need Updates](#-still-need-updates)',
        '  - [⏱ Past-Due Items](#-past-due-items)',
        '- [➡ ETA Changes This Week](#-eta-changes-this-week)',
        '- [🚀 Shipped this week](#-shipped-this-week)',
        '- [🛠 Availability repair items](#-availability-repair-items)',
        '- [🎟 Support Tickets](#-support-tickets)',
        '- [🔬 Team-by-team Breakdown: Hello](#-team-by-team-breakdown-hello)',
        '' ]
    , 'generates a correct toc when readme has emojis as the first character for headings'
  )

  t.end()
})


test('\nformatted headers', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-formatted-headers.md', 'utf8');
  var headers = transform(content);

  t.same(
      headers.toc.split('\n')
    , [ '',
        '- [foo _bar_](#foo-bar)',
        '- [foo **baz**](#foo-baz)',
        '- [foo ~baf~](#foo-baf)',
        '- [bar_foo](#bar_foo)',
        '- [baz_foo_](#baz_foo_)',
        '- [_foo_bax_](#foo_bax)',
        '' ]
    , 'generates a correct toc when readme includes formatting in the heading title'
  )

  t.end()
})

test('\nrandom md characters', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-special-characters.md', 'utf8');
  var headers = transform(content);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Title with backslash `\\`](#title-with-backslash-)',
        '- [4 § Toimielimet](#4-%C2%A7-toimielimet)',
        '- [Урок 8. Кроссплатформенность и виртуализация](#%D1%83%D1%80%D0%BE%D0%BA-8-%D0%BA%D1%80%D0%BE%D1%81%D1%81%D0%BF%D0%BB%D0%B0%D1%82%D1%84%D0%BE%D1%80%D0%BC%D0%B5%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D1%8C-%D0%B8-%D0%B2%D0%B8%D1%80%D1%82%D1%83%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F)',
        '- [Interface: SOME\\_NAME<\\>](#interface-some_name)',
        '- [Version 1.10.5](#version-1105)',
        '- [Version 1.10.6](#version-1106)',
        '- [`TEXT 1`](#text-1)',
        '- [`TEXT 2 ...`](#text-2-)',
        '- [MikroTik hAP ac²](#mikrotik-hap-ac)',
        '- [acclk dac %d:[0,acclk_dac_max):dac](#acclk-dac-d0acclk_dac_maxdac)',
        '- [Övningsuppgifter](#%C3%B6vningsuppgifter)',
        '- [Sections](#sections)',
        '- [Тест](#%D1%82%D0%B5%D1%81%D1%82)',
        '- [There\'s an error here](#theres-an-error-here)',
        '- [Replace .gitlab-ci.yml](#replace-gitlab-ciyml)',
        '- [`this identifier`](#this-identifier)',
        '- [Header & noise](#header--noise)',
        '- [CJK。](#cjk)',
        '- [¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿Latin 1](#%C2%AA%C2%B5%C2%BAlatin-1)',
        '' ]
    , 'generates a correct toc when readme has nameless table headers'
  )

  t.end()
})
