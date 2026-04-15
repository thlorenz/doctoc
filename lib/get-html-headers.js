"use strict";

var htmlparser = require("htmlparser2"),
  md = require("@textlint/markdown-to-ast");

function addLinenos(lines, headers) {
  var current = 0, line;

  return headers.map(function (x) {
    for (var lineno = current; lineno < lines.children.length; lineno++) {
      line = lines.children[lineno];
      if (new RegExp(x.text[0]).test(line.raw)) {
        x.line = line.loc.start.line;
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

var go = (module.exports = function (nodes, start, maxHeaderLevel, minHeaderLevel) {
  var source = nodes
    .children.filter(function (node) {
      return (node.type === md.Syntax.HtmlBlock || node.type === md.Syntax.Html) && node.range[1] > start;
    })
    .map(function (node) {
      return node.raw;
    })
    .join("\n");

  //var headers = [], grabbing = null, text = [];
  var currentLine = 1,
    headers = [],
    grabbing = [],
    text = [];

  var parser = new htmlparser.Parser(
    {
      onopentag: function (name, attr) {
        // Short circuit if we're already inside a pre
        if (grabbing[grabbing.length - 1]?.tagName === "pre") return;

        if (name === "pre" || /h\d/.test(name)) {
          grabbing.push({ tagName: name, line: currentLine, tagId: attr.id });
        }
      },
      ontext: function (text_) {
        // Count newlines
        let newlines = text_.match(/\n/g);
        if (newlines) currentLine += newlines.length;

        // Explicitly skip pre tags, and implicitly skip all others
        if (grabbing.length === 0 || grabbing[grabbing.length - 1].tagName === "pre")
          return;

        // Only accept text on the SAME LINE as the opening <hX> otherwise discard it
        let top = grabbing[grabbing.length - 1];
        if (currentLine === top.line) {
          text.push(text_);
        }
        else{
          grabbing.pop();
        }
      },
      onclosetag: function (name) {
        if (grabbing.length === 0) return;
        if (grabbing[grabbing.length - 1].tagName === name) {
          var tag = grabbing.pop();
          headers.push({ text: text, tagName: tag.tagName, href: tag.tagId, rank: parseInt(tag.tagName.slice(1), 10) });
          text = [];
        }
      },
    },
    { decodeEntities: true },
  );

  parser.write(source);
  parser.end();

  headers = addLinenos(nodes, headers);
  // consider anything past h4 to small to warrant a link, may be made configurable in the future
  headers = headers.filter(function (x) {
    return x.rank <= maxHeaderLevel && x.rank >= minHeaderLevel;
  });
  return headers;
});
