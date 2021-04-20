'use strict';
/*jshint asi: true */

var test = require('tap').test
var processFolder = require('../lib/build-parent-toc')

function pickFileChange({ changeList, expectedPath }) {
  return changeList.find(({ path }) => path === expectedPath)
}

function assertPathChanges({ t, changeList, expectations }) {
  t.equals(expectations.length, changeList.length)

  expectations.forEach(({ expectedData, expectedPath }) => {
    const { data } = pickFileChange({ changeList, expectedPath }) ?? {};
    t.deepEqual(data, expectedData, expectedPath)
  })
}

test('\nBuild Parent Toc', function (t) {
  const { changeList } = processFolder({
    folder: 'test/fixtures/top-level-folder'
  });

  assertPathChanges({
    t,
    changeList,
    expectations: [
      {
        expectedPath: 'test/fixtures/top-level-folder/mid-level-folder/low-level-folder/README.md',
        expectedData: [
          '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
          '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
          '<details><summary>Full TOC</summary>',
          '',
          'Table of Contents',
          '',
          '- [This is a test document with a number](./test_file.20200412.md#this-is-a-test-document-with-a-number)',
          '',
          '- [This is a test document](./test_file.md#this-is-a-test-document)',
          '',
          '',
          '</details>',
          '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        ].join('\n'),
      },
      {
        expectedPath: 'test/fixtures/top-level-folder/mid-level-folder/README.md',
        expectedData: [
          '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
          '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
          '<details><summary>Full TOC</summary>',
          '',
          'Table of Contents',
          '',
          '- [This is a test document with a number](./low-level-folder/test_file.20200412.md#this-is-a-test-document-with-a-number)',
          '',
          '- [This is a test document](./low-level-folder/test_file.md#this-is-a-test-document)',
          '',
          '',
          '</details>',
          '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        ].join('\n'),
      },
      {
        expectedPath: 'test/fixtures/top-level-folder/README.md',
        expectedData: [
          '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
          '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
          '<details><summary>Full TOC</summary>',
          '',
          'Table of Contents',
          '',
          '- [Top-level README](#top-level-readme)',
          '',
          '- [This is a test document with a number](./mid-level-folder/low-level-folder/test_file.20200412.md#this-is-a-test-document-with-a-number)',
          '',
          '- [This is a test document](./mid-level-folder/low-level-folder/test_file.md#this-is-a-test-document)',
          '',
          '',
          '</details>',
          '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
          '',
          '# Top-level README',
        ].join('\n'),
      },
    ]
  })

  t.deepEqual(true, true)
  t.end()
})
