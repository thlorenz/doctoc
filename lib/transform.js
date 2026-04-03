"use strict";

var anchor = require("anchor-markdown-header"),
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
  header.anchor = anchor(header.name, mode, header.instance, header.href);
  return header;
}

function isString(y) {
  return typeof y === 'string';
}

function generateMarkers(lines, info, pragmaStyle, syntax){
  var start, end, header;

  if (pragmaStyle == "compact" && info.hasStart) {
    start = lines[info.startIdx];
    start = start.replace(" generated TOC please keep comment here to allow auto update", "");
    end = lines[info.endIdx];
    end = end.replace(" generated TOC please keep comment here to allow auto update", "");
  }
  else {
    var marker = contentGenerator.pragmaMarkers(syntax, pragmaStyle);
    start = marker.start;
    end = marker.end;
  }

  return { start, end };
}

function getMarkdownHeaders (lines, maxHeaderLevel, minHeaderLevel) {
  function extractText (header) {
    return header.children
      .map(function (x) {
        if (x.type === md.Syntax.Link || x.type === md.Syntax.LinkReference) {
          return extractText(x);
        }
        else if (x.type === md.Syntax.Image || x.type === md.Syntax.ImageReference) {
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

function countHeaders(headers, mode) {
  var instances = {};

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var name = header.href || anchor(header.name, mode).split('#')[1].slice(0, -1);

    if (header.href === undefined && Object.prototype.hasOwnProperty.call(instances, name)) {
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
  if (!info.hasStart) return defaultTitle;
  var readTitle = lines[info.startIdx + 2];
  var previousLine = lines[info.startIdx + 1];
  return readTitle != "" || previousLine.includes("END doctoc") ? readTitle : previousLine;
}

exports = module.exports = function transform(content, mode, maxHeaderLevel, minHeaderLevel, minTocItems, title, notitle, entryPrefix, processAll, updateOnly, syntax, options) {
  syntax = syntax || "md"
  var skipTag = contentGenerator.skipTag(syntax) + '\n';
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

  var { start, end } = generateMarkers(lines, info, options?.toc?.pragma?.style, syntax);

  if (options?.toc?.header?.content) {
    start = start + '\n' + options.toc.header.content;
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

  var allHeaders = countHeaders(headers, mode),
    lowestRank = allHeaders.reduce((min, h) => Math.min(min, h.rank), Infinity),
    linkedHeaders = allHeaders.map(h => addAnchor(mode, h));

  // 4 spaces required for proper indention on Bitbucket and GitLab
  var indentation = ' ';
  var indentationWidth = (mode === 'bitbucket.org' || mode === 'gitlab.com') ? 4 : 2;

  var toc = '';
  var wrappedToc;

  if (linkedHeaders.length >= minTocItems) {
    toc = 
      titlePadding
    + inferredTitle
    + titleSeparator
    + linkedHeaders
        .map(function (x) {
          return indentation.repeat((x.rank - lowestRank) * indentationWidth) + entryPrefix + ' ' + x.anchor;
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
