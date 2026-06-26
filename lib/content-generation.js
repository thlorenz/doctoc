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
  return commentedBlock(syntax, "DOCTOC SKIP");
}

function excludeTag(syntax) {
  return commentedBlock(syntax, "DOCTOC EXCLUDE");
}

function escapedStartTag(syntax) {
  return commentTypes[syntax].escapedStart;
}

function tocFooter(footerOptions) {
  if (footerOptions.content === undefined) return [];
  var lines = Array(footerOptions.padding?.before ?? 0).fill('');
  lines.push(footerOptions.content);
  lines.push(...Array(footerOptions.padding?.after ?? 0).fill(''));
  return lines;
}

function tocHeader(headerOptions) {
  if (headerOptions.content === undefined) return [];
  var lines = Array(headerOptions.padding?.before ?? 0).fill('');
  lines.push(headerOptions.content);
  lines.push(...Array(headerOptions.padding?.after ?? 0).fill(''));
  return lines;
}

function tocTitle(titleOptions, existingTitle) {
  if (titleOptions.remove) return [];
  var lines = Array(titleOptions.padding?.before ?? 0).fill('');
  if (titleOptions.content){
    lines.push(titleOptions.content);
  }
  else if(existingTitle){
    lines.push(existingTitle);
  }
  else{
    lines.push('**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*');
  }
  lines.push(...Array(titleOptions.padding?.after ?? 0).fill(''));
  return lines;
}

module.exports = {
  commentedBlock,
  escapedStartTag,
  pragmaMarkers,
  skipTag,
  excludeTag,
  tocFooter,
  tocHeader,
  tocTitle
};
