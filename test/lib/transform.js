'use strict';
/*jshint asi: true */

var test = require('trap').test
  , transform = require('../../lib/transform')

function check(md, anchors) {
  test('transforming ' + md , function (t) {
    var res = transform(md)
    t.ok(res.transformed, 'transforms it')     
    console.log(require('util').inspect(res.data))
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
