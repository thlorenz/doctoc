'use strict';
/*jshint asi: true */

var test = require('tap').test
  , transform = require('../lib/transform')

test('\ngiven a file that includes html with header tags', function (t) {
  var content = require('fs').readFileSync(__dirname + '/fixtures/readme-with-html.md', 'utf8');
  var headers = transform(content);

  t.deepEqual(
      headers.toc.split('\n')
    , [ '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*',
        '',
        '- [Installation](#installation)',
        '- [API](#api)',
        '\t\t- [dockops::Containers(docker) → {Object}](#dockopscontainersdocker-→-{object})',
        '\t\t\t- [Parameters:](#parameters)',
        '\t\t\t- [Returns:](#returns)',
        '\t\t- [dockops::Containers::activePorts(cb)](#dockopscontainersactiveportscb)',
        '\t\t\t- [Parameters:](#parameters-1)',
        '\t\t- [dockops::Containers::clean(id, cb)](#dockopscontainerscleanid-cb)',
        '\t\t\t- [Parameters:](#parameters-2)',
        '- [License](#license)',
        '' ]
    , 'generates correct toc for non html and html headers'
  )

  t.end()
})
