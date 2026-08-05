"use strict";

var htmlparser = require("htmlparser2"),
  md = require("@textlint/markdown-to-ast");

function validMdHtmlHeader (html, maxHeaderLevel, nested) {
  if (nested === undefined) return true;
  if (html[0] !== '<' || html[1] !== 'h') return nested;
  var position = html.indexOf('<h', 3);
  if (nested ? position === -1 : position !== -1) return false;
  const level = html[2];
  if (!html.endsWith('</h' + level + '>')) return nested;
  if (nested) return true;
  return Number(level) <= (maxHeaderLevel || 4);
}

function processNode(node){
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
          grabbing.push({ tagName: name, line: currentLine, tagId: attr.id, start: parser.startIndex + node.range[0] });
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
      onclosetag: function (name, isImplied) {
        if (isImplied) return;
        if (grabbing.length === 0) return;
        if (grabbing[grabbing.length - 1].tagName === name) {
          var tag = grabbing.pop();
          var end = parser.endIndex + node.range[0];
          headers.push({
            text: text, 
            tagName: tag.tagName, 
            href: tag.tagId, 
            rank: parseInt(tag.tagName.slice(1), 10),
            node: { range: [tag.start, end],loc: node.loc },
            line: node.loc.start.line,
            name: text.join("")
          });
          text = [];
        }
      },
    },
    { decodeEntities: true },
  );

  parser.write(node.raw);
  parser.end();
  return headers;
}

var go = (module.exports = function (nodes, start, maxHeaderLevel, minHeaderLevel, nested) {
  var headers = nodes.children.filter(function (node) {
      return (node.type === md.Syntax.HtmlBlock || node.type === md.Syntax.Html) && validMdHtmlHeader(node.raw, maxHeaderLevel, nested) && node.range[1] > start;
    })
    .map(function (node) {
      return processNode(node);
    }).flat();

  // consider anything past h4 to small to warrant a link, may be made configurable in the future
  headers = headers.filter(function (x) {
    return x.rank <= (maxHeaderLevel || 4);
  });
  return headers;
});
