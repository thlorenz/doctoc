"use strict";

var commentTypes = {
  md: {
    start: "<!--",
    end: "-->",
    escapedStart: "<!--",
  },
  mdx: {
    start: "{/*",
    end: "*/}",
    escapedStart: "{\/\\*",
  }
}

function pragmaMarkers(syntax, style, eol) {
  if (style == "compact") {
    return compactPragma(syntax);
  }
  else {
    return legacyPragma(syntax, eol);
  }
}

function legacyPragma(syntax, eol){
  var start = commentedBlock(syntax, "START doctoc generated TOC please keep comment here to allow auto update") +
    eol + commentedBlock(syntax, "DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE");
  var end = commentedBlock(syntax, "END doctoc generated TOC please keep comment here to allow auto update");

  return { start, end };
}

function compactPragma(syntax) {
  var start = commentedBlock(syntax, "START doctoc");
  var end = commentedBlock(syntax, "END doctoc");

  return { start, end };
}

function commentedBlock(syntax, content) {
  var commentStart = commentTypes[syntax].start
  , commentEnd = commentTypes[syntax].end;
  return `${commentStart} ${content} ${commentEnd}`;
}

function skipTag(syntax) {
  return commentedBlock(syntax, "DOCTOC SKIP")
}

function escapedStartTag(syntax) {
  return commentTypes[syntax].escapedStart;
}

module.exports = {
  commentedBlock,
  escapedStartTag,
  pragmaMarkers,
  skipTag
};
