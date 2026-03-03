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

function legacyPragma(syntax){
  var start = commentedBlock(syntax, "START doctoc generated TOC please keep comment here to allow auto update");
  var header = commentedBlock(syntax, "DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE");
  var end = commentedBlock(syntax, "END doctoc generated TOC please keep comment here to allow auto update");

  return { start, end, header };
}

function commentedBlock(syntax, content) {
  var commentStart = commentTypes[syntax].start
  , commentEnd = commentTypes[syntax].end;
  return `${commentStart} ${content} ${commentEnd}`;
}

function escapedStartTag(syntax) {
  return commentTypes[syntax].escapedStart;
}

module.exports = {
  commentedBlock,
  escapedStartTag,
  legacyPragma
};
