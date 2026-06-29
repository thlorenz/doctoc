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
  return tocPart(footerOptions?.padding, footerOptions?.content);
}

function tocHeader(headerOptions) {
  return tocPart(headerOptions?.padding, headerOptions?.content);
}

function tocTitle(titleOptions, existingTitle) {
  if (titleOptions?.remove || (existingTitle === "" && !titleOptions?.content)) return [];
  var content;
  if (titleOptions?.content){
    content = titleOptions.content;
  }
  else if(existingTitle){
    content = existingTitle;
  }
  else{
    content = '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*';
  }
  return tocPart(titleOptions?.padding, content);
}

function tocPart(padding, content){
  if (content === undefined) return [];
  var lines = Array(Number(padding?.before ?? 0)).fill('');
  lines.push(content);
  lines.push(...Array(Number(padding?.after ?? 0)).fill(''));
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
