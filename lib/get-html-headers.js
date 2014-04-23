'use strict';

var htmlparser = require('htmlparser2');

function addLinenos(src, headers) {
  var current = 0, match, line;
  var lines = src.split('\n');

  return headers.map(function (x) {
    for (var lineno = current; lineno < lines.length; lineno++) {
      line = lines[lineno];
      if (new RegExp(x.text[0]).test(line)) {
        console.log(line)
        current = lineno + 1;
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

var go = module.exports = function (lines, md) {
  var acc = [], grabbing = null, text = [];

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
        acc.push({ text: text, tag: grabbing });
        grabbing = null;
        text = [];
      }
    }
  },
  { decodeEntities: true })

  parser.write(src);
  parser.end();

  acc = addLinenos(src, acc)
  acc = rankify(acc);
  return acc;
}

// Test
function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var fs = require('fs');
if (!module.parent && typeof window === 'undefined') {
  var src = fs.readFileSync(__dirname + '/../test/fixtures/readme-with-html.md', 'utf8');
  inspect(go(src));
}
