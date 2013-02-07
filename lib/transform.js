'use strict';

var _     =  require('underscore');

function notNull(x) { return  x !== null; }

function addLink(header) {
    return _(header).extend({ 
      link:  '#' + 
        header.name
          .trim()
          .toLowerCase()
          .replace(/ /g,'-')
          .replace(/[\[\]`.,()*]/g,'')
    });
}

function getHashedHeaders (_lines) {
    // Find headers of the form '### xxxx xxx xx'
    return _lines
      .map(function (x, index) {
        var match = /^(\#{1,8})[ ]*(.+)$/.exec(x);
        
        return match 
          ? { rank :  match[1].length
            , name :  match[2]
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

module.exports = function transform(f, content) {
  var lines         =  content.split('\n')
    , _lines        =  _(lines).chain()

    , allHeaders    =  getHashedHeaders(_lines).concat(getUnderlinedHeaders(_lines))
    , lowestRank    =  _(allHeaders).chain().pluck('rank').min().value()
    , linkedHeaders =  _(allHeaders).map(addLink);

  if (linkedHeaders.length === 0) return { transformed: false };

  var toc = 
      '**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*'  
    + '\n\n'                                      
    + linkedHeaders.map(function (x) {
        var indent = _(_.range(x.rank - lowestRank))
          .reduce(function (acc, x) { return acc + '\t'; }, '');

        return indent + '- [' + x.name + '](' + x.link + ')';
      })
      .join('\n')                                     
    + '\n';

  var currentToc = _lines
    .first(linkedHeaders[0].line)
    .value()
    .join('\n');
    
  if (currentToc === toc) {
    console.log('"%s" is up to date', f.path);
    return { transformed: false };
  }

  console.log('"%s" will be updated', f.path);

  // Skip all lines up to first header since that is the old table of content
  var remainingContent = _lines
    .rest(linkedHeaders[0].line)
    .value()
    .join('\n');

  var data = toc + '\n' + remainingContent;

  return {
    transformed :  true,
    data    :  data,
    path    :  f.path
  };
};
