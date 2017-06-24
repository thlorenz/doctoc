'use strict'
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform')

test('\nwith explicit flag content is not transformed', function (t) {
  var content = [
    '# Header one',
    '## Header two'
  ].join('\n')
  var result = transform(content, null, null, null, false, null, true)
  t.deepEqual(result, {transformed: false}, 'because no `START doctoc` found')
  t.end()
})

test('\nwith explicit flag content is transformed', function (t) {
  var content = [
    '<!-- START doctoc -->',
    '<!-- END doctoc -->',
    '# Header one',
    '## Header two'
  ].join('\n')
  var result = transform(content, null, null, null, false, null, true)

  t.deepEqual(
    result.toc.split('\n'), [
      '# Header one',
      '',
      '- [Header one](#header-one)',
      '  - [Header two](#header-two)',
      ''
    ], 'because `START doctoc` and `END doctoc` found'
  )
  t.end()
})

test('\nwithout explicit flag content is transformed', function (t) {
  var content = [
    '# Header one',
    '## Header two'
  ].join('\n')
  var result = transform(content, null, null, null, false, null, false)

  t.deepEqual(
    result.toc.split('\n'), [
      '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
      '',
      '- [Header one](#header-one)',
      '  - [Header two](#header-two)',
      ''
    ], 'because `START doctoc` and `END doctoc` found'
  )
  t.end()
})

test('\nwithout explicit flag content is transformed', function (t) {
  var content = [
    '<!-- START doctoc -->',
    '<!-- END doctoc -->',
    '# Header one',
    '## Header two'
  ].join('\n')
  var result = transform(content, null, null, null, false, null, false)

  t.deepEqual(
    result.toc.split('\n'), [
      '# Header one',
      '',
      '- [Header one](#header-one)',
      '  - [Header two](#header-two)',
      ''
    ], 'when `START doctoc` and `END doctoc` found'
  )
  t.end()
})
