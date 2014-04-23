'use strict';

var htmlparser = require('htmlparser2');

function addLinenos(lines, headers) {
  var current = 0, line;

  return headers.map(function (x) {
    for (var lineno = current; lineno < lines.length; lineno++) {
      line = lines[lineno];
      if (new RegExp(x.text[0]).test(line)) {
        current = lineno;
        x.line = lineno;
        x.name = x.text.join('');
        return x
      }
    }
  })
}

function rankify(headers) {
  return headers.map(function (x) {
    x.rank = parseInt(x.tag.slice(1), 10);
    return x;
  })
}

var go = module.exports = function (lines) {
  var md = lines.join('\n');
  var headers = [], grabbing = null, text = [];

  var parser = new htmlparser.Parser({
    onopentag: function (name, attr) {
      if ((/h\d/).test(name)) {
        grabbing = name;
      }
    },
    ontext: function (text_) {
      if (!grabbing) return;
      text.push(text_);
    },
    onclosetag: function (name) {
      if (!grabbing) return;
      if (grabbing === name) {
        headers.push({ text: text, tag: grabbing });
        grabbing = null;
        text = [];
      }
    }
  },
  { decodeEntities: true })

  parser.write(md);
  parser.end();

  headers = addLinenos(lines, headers)
  headers = rankify(headers);
  return headers;
}
