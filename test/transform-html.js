'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform')

test('\ngiven a file that includes html with header tags and maxHeaderNo 8', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-html.md', 'utf8');
  var headers = transform(content, 'github.com', 8);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*',
        '',
        '- [Installation](#installation)',
        '- [API](#api)',
        '    - [dockops::Containers(docker) → {Object}](#dockopscontainersdocker-→-object)',
        '      - [Parameters:](#parameters)',
        '      - [Returns:](#returns)',
        '    - [dockops::Containers::activePorts(cb)](#dockopscontainersactiveportscb)',
        '      - [Parameters:](#parameters-1)',
        '    - [dockops::Containers::clean(id, cb)](#dockopscontainerscleanid-cb)',
        '      - [Parameters:](#parameters-2)',
        '- [License](#license)',
        '' ]
    , 'generates correct toc for non html and html headers'
  )

  t.end()
})

test('\ngiven a file that includes html with header tags using default maxHeaderNo', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-html.md', 'utf8');
  var headers = transform(content);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*',
        '',
        '- [Installation](#installation)',
        '- [API](#api)',
        '    - [dockops::Containers(docker) → {Object}](#dockopscontainersdocker-→-object)',
        '    - [dockops::Containers::activePorts(cb)](#dockopscontainersactiveportscb)',
        '    - [dockops::Containers::clean(id, cb)](#dockopscontainerscleanid-cb)',
        '- [License](#license)',
        '' ]
    , 'generates correct toc for non html and html headers omitting headers larger than maxHeaderNo'
  )
  t.end()
})
