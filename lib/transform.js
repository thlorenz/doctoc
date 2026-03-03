"use strict";

var _ = require("underscore"),
  anchor = require("anchor-markdown-header"),
  updateSection = require("update-section"),
  getHtmlHeaders = require("./get-html-headers"),
  contentGenerator = require("./content-generation"),
  md = require("@textlint/markdown-to-ast");

function matchesStart(syntax) {
  var commentEscapedStart = contentGenerator.escapedStartTag(syntax);
  return function(line){
    return new RegExp(`${commentEscapedStart} START doctoc `).test(line);
  }
}

function matchesEnd(syntax) {
  var commentEscapedStart = contentGenerator.escapedStartTag(syntax);
  return function(line){
    return new RegExp(`${commentEscapedStart} END doctoc `).test(line);
  }
}

function notNull(x) { return  x !== null; }

function addAnchor(mode, header) {
  header.anchor = anchor(header.name, mode, header.instance);
  return header;
}

function isString(y) {
  return typeof y === 'string';
}

function generateMarkers(lines, info, headerClean, footerClean, syntax){
  var start, end, legacyStart, legacyEnd, legacyHeader;

  if (!headerClean || !footerClean){
    var legacy = contentGenerator.legacyPragma(syntax);
    legacyStart = legacy.start;
    legacyEnd = legacy.end;
    legacyHeader = legacy.header;
  }
  if (headerClean && info.hasStart) {
    start = lines[info.startIdx];
    start = start.replace(" generated TOC please keep comment here to allow auto update", "");
  }
  else if (!headerClean) {
    start = legacyStart;
  }
  else {
    start = contentGenerator.commentedBlock(syntax, "START doctoc");
  }

  if (footerClean && info.hasStart) {
    end = lines[info.endIdx];
    end = end.replace(" generated TOC please keep comment here to allow auto update", "");
  }
  else if (!footerClean) {
    end = legacyEnd;
  }
  else {
    end = contentGenerator.commentedBlock(syntax, "END doctoc");
  }

  return { start, end, legacyHeader }
}

function getMarkdownHeaders (lines, maxHeaderLevel, minHeaderLevel) {
  function extractText (header) {
    return header.children
      .map(function (x) {
        if (x.type === md.Syntax.Link) {
          return extractText(x);
        }
        else if (x.type === md.Syntax.Image) {
          // Images (at least on GitHub, untested elsewhere) are given a hyphen
          // in the slug. We can achieve this behavior by adding an '*' to the
          // TOC entry. Think of it as a "magic char" that represents the image.
          return '*';
        }
        else {
          return x.raw;
        }
      })
      .join("");
  }

  return md
    .parse(lines.join("\n"))
    .children.filter(function (x) {
      return x.type === md.Syntax.Header;
    })
    .map(function (x) {
      return x.depth >= minHeaderLevel && (!maxHeaderLevel || x.depth <= maxHeaderLevel)
        ? { rank :  x.depth
          , name :  extractText(x)
          , line :  x.loc.start.line
          }
        : null;
    })
    .filter(notNull);
}

function countHeaders(headers) {
  var instances = {};

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var name = header.name;

    if (Object.prototype.hasOwnProperty.call(instances, name)) {
      // `instances.hasOwnProperty(name)` fails when there’s an instance named "hasOwnProperty".
      instances[name]++;
    } else {
      instances[name] = 0;
    }

    header.instance = instances[name];
  }

  return headers;
}

function getLinesToToc(lines, currentToc, info, processAll) {
  if (processAll || !currentToc) return lines;

  var tocableStart = 0;

  // when updating an existing toc, we only take the headers into account
  // that are below the existing toc
  if (info.hasEnd) tocableStart = info.endIdx + 1;

  return lines.slice(tocableStart);
}

// Use document context as well as command line args to infer the title
function determineTitle(title, notitle, lines, info) {
  var defaultTitle = '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*';

  if (notitle) return "";
  if (title) return title;
  return info.hasStart ? lines[info.startIdx + 2] : defaultTitle;
}

exports = module.exports = function transform(content, mode, maxHeaderLevel, minHeaderLevel, minTocItems, title, notitle, entryPrefix, processAll, updateOnly, syntax, options) {
  syntax = syntax || "md"
  var skipTag = contentGenerator.commentedBlock(syntax, "DOCTOC SKIP") + '\n';
  var matchesStartBySyntax = matchesStart(syntax);
  var matchesEndBySyntax = matchesEnd(syntax);
  var index = content.indexOf(skipTag);
  if (index === 0 || (index >= 0 && content[index-1] === '\n')) return { transformed: false };

  mode = mode || "github.com";
  entryPrefix = entryPrefix || "-";
  minHeaderLevel = minHeaderLevel || 1;

  if (isNaN(minTocItems) || minTocItems < 1){
    minTocItems = 1;
  }

  var padTitle = options?.toc?.title?.padding?.before > 0;
  if (options?.toc?.title?.padding?.before === undefined){
    padTitle = notitle || false;
  }

  // only limit *HTML* headings by default
  var maxHeaderLevelHtml = maxHeaderLevel || 4;

  var lines = content.split('\n')
    , info = updateSection.parse(lines, matchesStartBySyntax, matchesEndBySyntax)

  if (!info.hasStart && updateOnly) {
    return { transformed: false };
  }

  var { start, end, legacyHeader } = generateMarkers(lines, info, options?.toc?.header?.remove, options?.toc?.footer?.remove, syntax);

  if (options?.toc?.header?.content) {
    start = start + '\n' + options.toc.header.content;
  }
  else if (legacyHeader && options?.toc?.header?.remove != true) {
    start = start + '\n' + legacyHeader;
  }

  if (options?.toc?.footer?.content) {
    end = options.toc.footer.content + '\n' + end;
  }

  var inferredTitle = determineTitle(title, notitle, lines, info);

  var titleSeparator = inferredTitle ? '\n\n' : '\n';
  var titlePadding = padTitle && inferredTitle ? '\n' : '';

  var currentToc = info.hasStart && lines.slice(info.startIdx, info.endIdx + 1).join('\n')
    , linesToToc = getLinesToToc(lines, currentToc, info, processAll);

  var headers = getMarkdownHeaders(linesToToc, maxHeaderLevel, minHeaderLevel)
    .concat(getHtmlHeaders(linesToToc, maxHeaderLevelHtml, minHeaderLevel))

  headers.sort(function (a, b) {
    return a.line - b.line;
  });

  var allHeaders    =  countHeaders(headers)
    , lowestRank    =  _(allHeaders).chain().pluck('rank').min().value()
    , linkedHeaders =  _(allHeaders).map(addAnchor.bind(null, mode));

  // 4 spaces required for proper indention on Bitbucket and GitLab
  var indentation = (mode === 'bitbucket.org' || mode === 'gitlab.com') ? '    ' : '  ';

  var toc = '';
  var wrappedToc;

  if (linkedHeaders.length >= minTocItems) {
    toc = 
      titlePadding
    + inferredTitle
    + titleSeparator
    + linkedHeaders
        .map(function (x) {
          var indent = _(_.range(x.rank - lowestRank))
            .reduce(function (acc, x) { return acc + indentation; }, '');

          return indent + entryPrefix + ' ' + x.anchor;
        })
        .join('\n')
    + '\n';
    wrappedToc = start + '\n' + toc + '\n' + end;
  }
  else {
    wrappedToc =  start + '\n' + end;
  }

  var data;
  if (currentToc != wrappedToc){
    data = updateSection(lines.join('\n'), wrappedToc, matchesStartBySyntax, matchesEndBySyntax, true);
  }
  return { transformed : currentToc != wrappedToc, data : data, toc: toc, wrappedToc: wrappedToc };
};
