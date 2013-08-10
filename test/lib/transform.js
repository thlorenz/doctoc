'use strict';
/*jshint asi: true */

var test = require('trap').test
  , transform = require('../../lib/transform')

function inspect(obj, depth) {
  console.log(require('util').inspect(obj, false, depth || 5, true));
}

function check(md, anchors, mode) {
  test('transforming ' + md , function (t) {
    var res = transform(md, mode)
    t.ok(res.transformed, 'transforms it')     
    t.equal(res.data, anchors + md, 'generates correct anchors')
  })
}

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
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [My Module](#my-module)\n'
    ,   '\t- [API](#api)\n'
    ,     '\t\t- [Method One](#method-one)\n'
    ,     '\t\t- [Method Two](#method-two)\n'
    ,         '\t\t\t- [Main Usage](#main-usage)\n\n'
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
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [My Module using \\r\\n line endings](#my-module-using-\\r\\n-line-endings)\n'
    ,   '\t- [API](#api)\n'
    ,     '\t\t- [Method One](#method-one)\n'
    ,     '\t\t- [Method Two](#method-two)\n'
    ,         '\t\t\t- [Main Usage](#main-usage)\n\n'
    ].join('')
)

check(
    [ 'My Module'
    , '========='
    , 'Some text here'
    , 'API'
    , '---------'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [My Module](#my-module)\n'
    ,   '\t- [API](#api)\n\n'
    ].join('')
)

check(
    [ '# My Module #'
    , 'Some text here'
    , '## API ##'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [My Module](#my-module)\n'
    ,   '\t- [API](#api)\n\n'
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
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [Title should be included](#title-should-be-included)\n'
    , '- [Title should also be included](#title-should-also-be-included)\n\n'
    ].join('')
)

check(
    [ '# Repeating A Title'
    , ''
    , '# Repeating A Title'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [Repeating A Title](#repeating-a-title)\n'
    , '- [Repeating A Title](#repeating-a-title-1)\n\n'
    ].join('')
)

check(
    [ '## Header'
    , 'some content'
    , '-- preceded by two dashes but has content, therefore "some content" should not be header'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n',
      '- [Header](#header)\n\n',
    ].join('')
)

check(
    [ '# Different Kinds'
    , ''
    , 'In the Right Order'
    , '=================='
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [Different Kinds](#different-kinds)\n'
    , '- [In the Right Order](#in-the-right-order)\n\n'
    ].join('')
)

check(
    [ 'Different Kinds 2'
    , '==============='
    , ''
    , '# In the Right Order 2'
    ].join('\n')
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [Different Kinds 2](#different-kinds-2)\n'
    , '- [In the Right Order 2](#in-the-right-order-2)\n\n'
    ].join('')
)

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
  , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*\n\n'
    , '- [My Module](#markdown-header-my-module)\n'
    ,   '\t- [API](#markdown-header-api)\n'
    ,     '\t\t- [Method One](#markdown-header-method-one)\n'
    ,     '\t\t- [Method Two](#markdown-header-method-two)\n'
    ,         '\t\t\t- [Main Usage](#markdown-header-main-usage)\n\n'
    ].join('')
  , 'bitbucket.org'
)
