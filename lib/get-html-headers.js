"use strict";

var htmlparser = require("htmlparser2"),
  md = require("@textlint/markdown-to-ast");

function addLinenos(lines, headers) {
  var current = 0, line;

  return headers.map(function (x) {
    for (var lineno = current; lineno < lines.length; lineno++) {
      line = lines[lineno];
      if (new RegExp(x.text[0]).test(line)) {
        current = lineno;
        x.line = lineno;
        x.name = x.text.join("");
        return x;
      }
    }

    // in case we didn't find a matching line, which is odd,
    // we'll have to assume it's right on the next line
    x.line = ++current;
    x.name = x.text.join("");
    return x;
  });
}

function rankify(headers, max, min) {
  return headers
    .map(function (x) {
      x.rank = parseInt(x.tag.slice(1), 10);
      return x;
    })
    .filter(function (x) {
      return x.rank <= max && x.rank >= min;
    });
}

var go = (module.exports = function (lines, maxHeaderLevel, minHeaderLevel) {
  var source = md
    .parse(lines.join("\n"))
    .children.filter(function (node) {
      return node.type === md.Syntax.HtmlBlock || node.type === md.Syntax.Html;
    })
    .map(function (node) {
      return node.raw;
    })
    .join("\n");

  //var headers = [], grabbing = null, text = [];
  var headers = [],
    grabbing = [],
    text = [];

  var parser = new htmlparser.Parser(
    {
      onopentag: function (name, attr) {
        // Short circuit if we're already inside a pre
        if (grabbing[grabbing.length - 1] === "pre") return;

        if (name === "pre" || /h\d/.test(name)) {
          grabbing.push(name);
        }
      },
      ontext: function (text_) {
        // Explicitly skip pre tags, and implicitly skip all others
        if (grabbing.length === 0 || grabbing[grabbing.length - 1] === "pre")
          return;

        text.push(text_);
      },
      onclosetag: function (name) {
        if (grabbing.length === 0) return;
        if (grabbing[grabbing.length - 1] === name) {
          var tag = grabbing.pop();
          headers.push({ text: text, tag: tag });
          text = [];
        }
      },
    },
    { decodeEntities: true },
  );

  parser.write(source);
  parser.end();

  headers = addLinenos(lines, headers);
  // consider anything past h4 to small to warrant a link, may be made configurable in the future
  headers = rankify(headers, maxHeaderLevel, minHeaderLevel);
  return headers;
});
