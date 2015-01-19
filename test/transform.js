'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform')

function inspect(obj, depth) {
  console.log(require('util').inspect(obj, false, depth || 5, true));
}

function check(md, anchors, mode) {
  test('transforming ' + md , function (t) {
    var res = transform(md, mode)

    // remove wrapper
    var data = res.data.split('\n');

    // rig our expected value to include the wrapper
    var startLines = transform.start.split('\n')
      , anchorLines = anchors.split('\n')
      , endLines = transform.end.split('\n')
      , mdLines = md.split('\n')

    var rig = startLines
      .concat(anchorLines.slice(0, -2))
      .concat(endLines)
      .concat('')
      .concat(mdLines);

    t.ok(res.transformed, 'transforms it');
    t.deepEqual(data, rig, 'generates correct anchors')
    t.end()
  })
}
//function check() {}

check(
    [ '# My Module'
    , 'Some text here'
    , '## API'
    , '### Method One'
    , 'works like this'
    , '### Method Two'
    , '#### Main Usage'
    , 'some main usage here'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [My Module](#my-module)\n'
    ,   '  - [API](#api)\n'
    ,     '    - [Method One](#method-one)\n'
    ,     '    - [Method Two](#method-two)\n'
    ,         '      - [Main Usage](#main-usage)\n\n\n'
    ].join('')
)

check(
    [ '# My Module using \\r\\n line endings'
    , 'Some text here'
    , '## API'
    , '### Method One'
    , 'works like this'
    , '### Method Two'
    , '#### Main Usage'
    , 'some main usage here'
    ].join('\r\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [My Module using \\r\\n line endings](#my-module-using-\\r\\n-line-endings)\n'
    ,   '  - [API](#api)\n'
    ,     '    - [Method One](#method-one)\n'
    ,     '    - [Method Two](#method-two)\n'
    ,         '      - [Main Usage](#main-usage)\n\n\n'
    ].join('')
)

check(
    [ 'My Module'
    , '========='
    , 'Some text here'
    , 'API'
    , '---------'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [My Module](#my-module)\n'
    ,   '  - [API](#api)\n\n\n'
    ].join('')
)

check(
    [ '# My Module #'
    , 'Some text here'
    , '## API ##'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [My Module](#my-module)\n'
    ,   '  - [API](#api)\n\n\n'
    ].join('')
)

check(
    [ '## Title should be included'
    , ''
    , '```js'
    , 'function foo () {'
    , '  // ## This title should be ignored'
    , '}'
    , '## This title should also be ignored'
    , '```'
    , ''
    , '## Title should also be included'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [Title should be included](#title-should-be-included)\n'
    , '- [Title should also be included](#title-should-also-be-included)\n\n\n'
    ].join('')
)

check(
    [ '# Repeating A Title'
    , ''
    , '# Repeating A Title'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [Repeating A Title](#repeating-a-title)\n'
    , '- [Repeating A Title](#repeating-a-title-1)\n\n\n'
    ].join('')
)

check(
    [ '## Header'
    , 'some content'
    , '-- preceded by two dashes but has content, therefore "some content" should not be header'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n',
      '- [Header](#header)\n\n\n',
    ].join('')
)

check(
    [ '# Different Kinds'
    , ''
    , 'In the Right Order'
    , '=================='
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [Different Kinds](#different-kinds)\n'
    , '- [In the Right Order](#in-the-right-order)\n\n\n'
    ].join('')
)

check(
    [ 'Different Kinds 2'
    , '==============='
    , ''
    , '# In the Right Order 2'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [Different Kinds 2](#different-kinds-2)\n'
    , '- [In the Right Order 2](#in-the-right-order-2)\n\n\n'
    ].join('')
)

test('transforming when old toc exists', function (t) {
  var md = [ 
      '# Header above'
    , ''
    , 'The above header should be ignored since it is above the existing toc'
    , ''
    , '<!-- START doctoc generated TOC please keep comment here to allow auto update -->'
    , '<!-- DON\'T EDIT THIS SECTION INSTEAD RE-RUN doctoc TO UPDATE -->'
    , '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*'
    , ''
    , '- [OldHeader](#oldheader)'
    , ''
    , '<!-- END doctoc generated TOC please keep comment here to allow auto update -->' 
    , '## Header'
    , 'some content'
    , ''
    ].join('\n')

  var res = transform(md)

  t.ok(res.transformed, 'transforms it')     

  t.deepEqual(
      res.toc.split('\n')
    , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
      '',
      '- [Header](#header)',
      '' ]
    , 'replaces old toc' 
  )
  
  t.deepEqual(
      res.wrappedToc.split('\n')
    , [ '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Header](#header)',
        '',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->' 
      ]
    , 'wraps old toc'
  )

  t.deepEqual(
      res.data.split('\n')
    , [ '# Header above',
        '',
        'The above header should be ignored since it is above the existing toc',
        '',
        '<!-- START doctoc generated TOC please keep comment here to allow auto update -->',
        '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->',
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '- [Header](#header)',
        '',
        '<!-- END doctoc generated TOC please keep comment here to allow auto update -->',
        '## Header',
        'some content',
        '' ]
    , 'updates the content with the new toc and ignores header before existing toc'
  ) 
  t.end()
})

// bigbucket.org
check(
    [ '# My Module'
    , 'Some text here'
    , '## API'
    , '### Method One'
    , 'works like this'
    , '### Method Two'
    , '#### Main Usage'
    , 'some main usage here'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*\n\n'
    , '- [My Module](#markdown-header-my-module)\n'
    ,   '    - [API](#markdown-header-api)\n'
    ,     '        - [Method One](#markdown-header-method-one)\n'
    ,     '        - [Method Two](#markdown-header-method-two)\n'
    ,         '            - [Main Usage](#markdown-header-main-usage)\n\n\n'
    ].join('')
  , 'bitbucket.org'
)
