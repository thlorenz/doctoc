"use strict";

var anchor = require("anchor-markdown-header"),
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

function isString(y) {
  return typeof y === 'string';
}

function getTocMarkers(docNodes, pragmaStyle, syntax) {
  var matchesStartBySyntax = matchesStart(syntax);
  var matchesEndBySyntax = matchesEnd(syntax);
  var nodes = docNodes.children.filter(function (x) {
      return (x.type === md.Syntax.Html && syntax === "md") || (x.type === md.Syntax.Paragraph && syntax === "mdx");
    })
    .map(function (x) {
      if(matchesStartBySyntax(x.raw)){
        return { type: "start", node: x };
      }
      else if(matchesEndBySyntax(x.raw)){
        return { type: "end", node: x };
      }
      else {
        return null;
      }
    })
    .filter(notNull);

  var marker = contentGenerator.pragmaMarkers(syntax, pragmaStyle);
  
  // This finds the position of the existing toc markers
  var position = nodes.length < 2 ? null : {
    start: nodes.find(n => n.type === "start")?.node,
    end: nodes.find(n => n.type === "end")?.node,
  };
  if (!position) {
    return { marker: marker };
  }
  position.existing = position.start && position.end;
  if (pragmaStyle == "compact" && position?.existing) {
    position.start.raw = position.start.raw.replace(" generated TOC please keep comment here to allow auto update", "");
    position.end.raw = position.end.raw.replace(" generated TOC please keep comment here to allow auto update", "");
  }
  else if ((pragmaStyle == "legacy" || !pragmaStyle) && position?.existing) {
    // Replace the old START comment with the canonical two-line marker (START + DON'T EDIT).
    // Update range[1] to match so that determineTitle searches *after* both lines,
    // preventing the DON'T EDIT comment from being mistaken for a title.
    position.start.raw = marker.start;
    position.start.range[1] = position.start.range[0] + marker.start.length;
  }
  return { marker: marker, positions: [position] };
}

function getMarkdownHeaders (lines, start, maxHeaderLevel, minHeaderLevel) {
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

  return lines
    .children.filter(function (x) {
      return x.type === md.Syntax.Header && x.range[1] > start;
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

function processHeaders(headers, mode) {
  var instances = {};

  headers.sort(function (a, b) {
    return a.line - b.line;
  });

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var anchorLink = anchor(header.name, mode, 0, header.href);
    var name = header.href || anchorLink.split('#')[1].slice(0, -1);

    if (header.href === undefined && Object.prototype.hasOwnProperty.call(instances, name)) {
      // `instances.hasOwnProperty(name)` fails when there’s an instance named "hasOwnProperty".
      instances[name]++;
    } else {
      instances[name] = 0;
    }

    header.anchor = instances[name] > 0 ? anchor(header.name, mode, instances[name], header.href) : anchorLink;
  }

  return headers;
}

// When updating an existing TOC, try to preserve the title that was there before.
// Falls back to CLI args (--title, --notitle) or the default title for new TOCs.
function determineTitle(nodes, tocPosition, title, notitle, header) {
  var defaultTitle = '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*';

  if (notitle) return "";
  if (title) return title;
  if (!tocPosition?.existing) return defaultTitle;

  // Find the TOC's list node so we know where the title region ends
  var listStartIdx = nodes.children.filter(function (x) {
    return x.type === md.Syntax.List && x.range[0] > tocPosition.start.range[0] && x.range[1] < tocPosition.end.range[1];
  })
  .map(function (x) { return x.range[0]; })?.[0];

  // Look for paragraph nodes between the start marker and the list — the last one is the title.
  // Uses range[1] (end of start marker) to skip the marker itself and the DON'T EDIT comment,
  // which are both covered by the start marker's range (see getTocMarkers).
  var paragraphs = nodes.children.filter(function (x) {
    return x.range[0] >= tocPosition.start.range[1] && x.range[1] < listStartIdx;
  });
  var title = paragraphs?.[paragraphs.length - 1]?.raw;

  // If the inferred title matches --toc-header-content, suppress it to avoid duplication
  if (title && header?.includes(title)) return "";
  return title || "";
}

exports = module.exports = function transform(content, mode, maxHeaderLevel, minHeaderLevel, minTocItems, title, notitle, entryPrefix, processAll, updateOnly, syntax, options) {
  syntax = syntax || "md";
  var skipTag = contentGenerator.skipTag(syntax) + '\n';
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

  var docNodes = md.parse(content);
  var tocs = getTocMarkers(docNodes, options?.toc?.pragma?.style, syntax);

  if (!(tocs.positions?.length > 0) && updateOnly) {
    return { transformed: false };
  }

  var startPos = 0;
  var frontMatter = false;
  if (docNodes.children[0]?.type === 'Yaml') {
    frontMatter = true;
  }
  else if(docNodes.children[0]?.type === 'Paragraph' && docNodes.children[0].raw.startsWith('+++') && docNodes.children[0].raw.trim().endsWith('+++')) {
    frontMatter = true;
  }
  else if(docNodes.children[0]?.type === 'Paragraph' && docNodes.children[0].raw.startsWith(';;;') && docNodes.children[0].raw.trim().endsWith(';;;')) {
    frontMatter = true;
  }
  if (frontMatter && docNodes.children.length > 1) {
    startPos = docNodes.children[1].range[0];
  }
  else if (frontMatter) {
    startPos = docNodes.children[0].range[1] + 1;
  }
  if (frontMatter && docNodes.range[1] === docNodes.children[0].range[1]){
    content += '\n';
    startPos++;
  }
  
  if (!(tocs.positions?.length > 0)) {
    var insertPos = startPos;
    tocs.positions = [{
      end: {
        range: [insertPos, insertPos],
        raw: tocs.marker.end,
      },
      start: {
        range: [insertPos, insertPos],
        raw: tocs.marker.start,
      },
      existing: false
    }];
  }

  var tocPosition = tocs.positions[0];
  var tocableStart = !processAll ? tocPosition.end.range[1] : startPos;
  var headers = getMarkdownHeaders(docNodes, tocableStart, maxHeaderLevel, minHeaderLevel)
    .concat(getHtmlHeaders(docNodes, tocableStart, maxHeaderLevelHtml, minHeaderLevel));

  var toc = '';
  var wrappedToc;

  if (headers.length >= minTocItems) {
    if (options?.toc?.header?.content) {
      toc = options.toc.header.content + '\n';
    }

    var inferredTitle = determineTitle(docNodes, tocPosition, title, notitle, options?.toc?.header?.content);
    
    var allHeaders = processHeaders(headers, mode);
    var lowestRank = allHeaders.reduce((min, h) => Math.min(min, h.rank), Infinity);
    
    var indentation = ' ';
    var indentationWidth = options?.toc?.items?.indentation?.width;
    // remove this fallback based on mode in v3
    if(indentationWidth === undefined){
      // 4 spaces required for proper indention on Bitbucket and GitLab
      indentationWidth = (mode === 'bitbucket.org' || mode === 'gitlab.com') ? 4 : 2;
    }
    
    if (inferredTitle) {
      toc = toc + (padTitle ? '\n' : '') + inferredTitle + '\n';
    }

    toc = toc + '\n'
    + allHeaders
        .map(function (x) {
          return indentation.repeat((x.rank - lowestRank) * indentationWidth) + entryPrefix + ' ' + x.anchor;
        })
        .join('\n')
    + '\n';
    
    if (options?.toc?.footer?.content) {
      toc = toc + '\n' + options.toc.footer.content;
    }
  }

  var data = [];
  var wrappedToc = tocPosition.start.raw + '\n' + (toc != '' ? toc + '\n' : '') + tocPosition.end.raw;
  var transformed = !tocPosition?.existing || content.slice(tocPosition.start.range[0], tocPosition.end.range[1]) != wrappedToc;
  
  if (transformed) {
    if (tocPosition.start.range[0] > 0) { data.push(content.slice(0, tocPosition.start.range[0] - 1)); }
    data.push(wrappedToc);
    if (!tocPosition.existing) { data.push(''); }
    data.push(content.slice(tocPosition.end.range[1] + (tocPosition.existing ? 1 : 0)));
  }
  return { transformed : transformed, data : data.join('\n'), toc: toc, wrappedToc: wrappedToc };
};
