'use strict';

var _      =  require('underscore')
  , anchor =  require('anchor-markdown-header');

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
      var match = /^(\#{1,8})[ ]*(.+)$/.exec(x);

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

        if (/^==+/.exec(line))      rank = 1;
        else if (/^--+/.exec(line)) rank = 2;
        else                        return null;

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

module.exports = function transform(content, mode) {
  var lines         =  content.split('\n')
    , _lines        =  _(lines).chain()

    , allHeaders    =  countHeaders(getHashedHeaders(_lines).concat(getUnderlinedHeaders(_lines)))
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

  var currentToc = _lines
    .first(linkedHeaders[0].line)
    .value()
    .join('\n');

  if (currentToc === toc) return { transformed: false };

  // Skip all lines up to first header since that is the old table of content
  var remainingContent = _lines
    .rest(linkedHeaders[0].line)
    .value()
    .join('\n');

  var data = toc + '\n' + remainingContent;

  return { transformed : true, data : data };
};
