'use strict';

var _             = require('underscore')
  , anchor        = require('anchor-markdown-header')
  , updateSection = require('update-section');

var start = '<!-- START doctoc generated TOC please keep comment here to allow auto update -->\n' +
            '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->'
  , end   = '<!-- END doctoc generated TOC please keep comment here to allow auto update -->'

function matchesStart(line) {
  return (/<!-- START doctoc generated TOC /).test(line);
}

function matchesEnd(line) {
  return (/<!-- END doctoc generated TOC /).test(line);
}

function notNull(x) { return  x !== null; }

function addAnchor(mode, header) {
  header.anchor = anchor(header.name, mode, header.instance);
  return header;
}


function getHashedHeaders (_lines) {
  var inCodeBlock = false;

  // Turn all headers into '## xxx' even if they were '## xxx ##'
  function normalize(header) {
    return header.replace(/[ #]+$/, '');
  }

  // Find headers of the form '### xxxx xxx xx [###]'
  return _lines
    .filter(function (x) {
      if (x.match(/^```/)) {
        inCodeBlock = !inCodeBlock;
      }
      return !inCodeBlock;
    })
    .map(function (x, index) {
      var match = /^(\#{1,8})[ ]*(.+)\r?$/.exec(x);

      return match 
        ? { rank :  match[1].length
          , name :  normalize(match[2])
          , line :  index
          }
        : null;
    })
    .filter(notNull)
    .value();
}

function getUnderlinedHeaders (_lines) {
    // Find headers of the form
    // h1       h2
    // ==       --

    return _lines
      .map(function (line, index, lines) {
        if (index === 0) return null;
        var rank;

        if (/^==+ *\r?$/.exec(line))      rank = 1;
        else if (/^--+ *\r?$/.exec(line)) rank = 2;
        else                              return null;

        return {
          rank  :  rank,
          name  :  lines[index - 1],
          line  :  index - 1
        };
      })
      .filter(notNull)
      .value();
}

function countHeaders (headers) {
  var instances = {};

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var name = header.name;

    if (instances.hasOwnProperty(name)) {
      instances[name]++;
    } else {
      instances[name] = 0;
    }

    header.instance = instances[name];
  }

  return headers;
}

exports = module.exports = function transform(content, mode) {
  var lines         =  content.split('\n')
    , _lines        =  _(lines).chain();
    
  mode = mode || 'github.com';

  var headers = getHashedHeaders(_lines).concat(getUnderlinedHeaders(_lines));

  headers.sort(function (a, b) {
    return a.line - b.line;
  });

  var allHeaders    =  countHeaders(headers)
    , lowestRank    =  _(allHeaders).chain().pluck('rank').min().value()
    , linkedHeaders =  _(allHeaders).map(addAnchor.bind(null, mode));

  if (linkedHeaders.length === 0) return { transformed: false };

  var toc =
      '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*'
    + '\n\n'
    + linkedHeaders
        .map(function (x) {
          var indent = _(_.range(x.rank - lowestRank))
            .reduce(function (acc, x) { return acc + '\t'; }, '');

          return indent + '- ' + x.anchor;
        })
        .join('\n')
    + '\n';

  var wrappedToc =  start + '\n' + toc + '\n' + end;
  var info = updateSection.parse(lines, matchesStart, matchesEnd);

  var currentToc = info.hasStart && lines.slice(info.startIdx, info.endIdx).join('\n');
  if (currentToc === toc) return { transformed: false };

  var data = updateSection(lines.join('\n'), wrappedToc, matchesStart, matchesEnd, true);
  return { transformed : true, data : data, toc: toc, wrappedToc: wrappedToc };
};

exports.start = start;
exports.end = end;
