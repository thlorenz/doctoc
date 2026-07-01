"use strict";
const { normalizeSyntax } = require("./utils/helpers");

var anchor = require("anchor-markdown-header"),
  getHtmlHeaders = require("./get-html-headers"),
  contentGenerator = require("./content-generation"),
  md = require("@textlint/markdown-to-ast");

const ROMAN_NUMERALS = {
  THOUSANDS: ["", "M", "MM", "MMM"],
  HUNDREDS: ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"],
  TENS: ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"],
  ONES: ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]
};

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

function getTocMarkers(docNodes, pragmaStyle, syntax, eol) {
  var matchesStartBySyntax = matchesStart(syntax);
  var matchesEndBySyntax = matchesEnd(syntax);
  var nodes = docNodes.children.filter(function (x) {
      return ((x.type === md.Syntax.Html || x.type === md.Syntax.HtmlBlock) && syntax === "html") || (x.type === md.Syntax.Paragraph && syntax === "jsx");
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

  var marker = contentGenerator.pragmaMarkers(syntax, pragmaStyle, eol);
  
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

function getMarkdownHeaders (lines, start, maxHeaderLevel, minHeaderLevel, syntax) {
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

  var excludeText = contentGenerator.excludeTag(syntax);

  return lines
    .children.filter(function (x, index, nodes) {
      if (index > 0 && nodes[index - 1].raw.trim() === excludeText) return false;
      return (x.type === md.Syntax.Header || x.type === md.Syntax.Html || x.type === md.Syntax.HtmlBlock) && x.range[1] > start;
    })
    .map(function (x) {
      if (x.type === md.Syntax.Html || x.type === md.Syntax.HtmlBlock) {
        var htmlNode = getHtmlHeaders({children: [x]}, start, maxHeaderLevel, minHeaderLevel, false)[0];
        return htmlNode ? {
          rank: htmlNode.rank,
          href: htmlNode.href,
          name: htmlNode.name,
          line: x.loc.start.line,
          node: x
        } : null;
      }
      else if (x.type == md.Syntax.Header && x.depth >= minHeaderLevel && (!maxHeaderLevel || x.depth <= maxHeaderLevel)) {
        return { rank :  x.depth
          , name :  extractText(x)
          , line :  x.loc.start.line
          , node :  x
          };
      }
      else {
        return null;
      }
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

function detectLineEnding(content, defaultEol) {
  var eol = '', newEol = '';

  for (var i = 0; i < content.length; i++) {
    if (content[i] === '\r') {
      if (content[i + 1] === '\n') {
        newEol = '\r\n';
        i++;
      }
      else { newEol = '\r'; }
    }
    else if (content[i] === '\n') { newEol = '\n'; }
    else { continue; }
    if (eol && eol != newEol) { return defaultEol; }
    eol = newEol;
  }

  return eol || defaultEol;
}

function determineSegment(style, num) {
  if (style === 'lowercase' || style === 'uppercase') {
    let columnName = '';
    const baseCharCode = style === 'uppercase' ? 65 : 97; // 'A' or 'a'

    while (num > 0) {
        num--;
        const remainder = num % 26;
        columnName = String.fromCharCode(baseCharCode + remainder) + columnName;
        num = Math.floor(num / 26);
    }
    return columnName;
  }
  else if (style === 'roman') {
    var numeral = ROMAN_NUMERALS.THOUSANDS[(num/1000)|0] +
      ROMAN_NUMERALS.HUNDREDS[(num%1000/100)|0] +
      ROMAN_NUMERALS.TENS[(num%100/10)|0] +
      ROMAN_NUMERALS.ONES[num%10];

    return numeral;
  }
  return undefined;
}

exports = module.exports = function transform(content, mode, maxHeaderLevel, minHeaderLevel, minTocItems, title, notitle, entryPrefix, processAll, updateOnly, syntax, options) {
  options ??= {};
  options.toc ??= {};
  options.toc.items ??= {};
  options.toc.items.indentation ??= {};
  options.toc.list ??= {};

  // TODO: replace with syntax ??= "html" in v3
  syntax = normalizeSyntax(syntax, "html");
  options.toc.items.indentation.style ??= 'space';
  options.toc.items.indentation.width ??= options.toc.items.indentation.style === 'tab' ? 1 : (
    mode === 'bitbucket.org' || mode === 'gitlab.com' ? 4 : 2
  );
  options.toc.list.format ??= 'unordered';
  var ordered = options.toc.list.format === 'ordered';
  options.toc.items.symbols ??= ordered ? undefined : String(entryPrefix || '-').split(',');
  options.toc.list.style ??= ordered ? 'number' : undefined

  var eol = '\n';
  eol = detectLineEnding(content, eol);
  var skipTag = contentGenerator.skipTag(syntax) + eol;
  var index = content.indexOf(skipTag);
  if (index === 0 || (index >= 0 && content[index-1] === eol)) return { transformed: false };

  mode = mode || "github.com";
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
  var tocs = getTocMarkers(docNodes, options?.toc?.pragma?.style, syntax, eol);

  if (!(tocs.positions?.length > 0) && updateOnly) {
    return { transformed: false };
  }

  var startLine = 0;
  var startPos = 0;
  var firstChild = docNodes.children.length > 0 ? docNodes.children[0] : undefined;
  var frontMatter = firstChild?.type === 'Json' || firstChild?.type === 'Toml' || firstChild?.type === 'Yaml';

  var hasBody = docNodes.children.length > (frontMatter ? 1 : 0);
  if (frontMatter && hasBody) {
    startLine = docNodes.children[1].loc.start.line - 1;
    startPos = docNodes.children[1].range[0];
  }
  // force it on to the next line after current content
  else if (frontMatter) {
    startLine = docNodes.children[0].loc.end.line;
    startPos = docNodes.range[1] + eol.length;
  }

  // adds in the empty line between end of content & new toc if missing
  if (frontMatter && docNodes.range[1] === docNodes.children[0].range[1]) {
    startPos = startPos + eol.length;
    content += eol;
  }
  
  // if there is no empty line between front matter & content add one
  if (frontMatter && hasBody && docNodes.children[0].loc.end.line + 1 == docNodes.children[1].loc.start.line) {
    content = content.substring(0, startPos) + eol + content.substring(startPos);
    startPos = startPos + eol.length;
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
  var headers = getMarkdownHeaders(docNodes, tocableStart, maxHeaderLevel, minHeaderLevel, syntax)
    .concat(getHtmlHeaders(docNodes, tocableStart, maxHeaderLevelHtml, minHeaderLevel, true));

  var initialNode = headers[0]?.node;
  if (!tocPosition.existing && options?.toc?.location?.toLowerCase() == 'before' && initialNode) {
    var insertPos = initialNode.range[0];
    tocPosition.start.range = [insertPos, insertPos];
    tocPosition.end.range = [insertPos, insertPos];
  }

  var toc = '';
  var wrappedToc;
  var minLines = options?.document?.lines?.min + startLine || startLine;
  if (tocPosition.existing) {
    minLines = minLines + tocPosition.end.loc.end.line - tocPosition.start.loc.start.line + 2;
  }
  
  headers = headers.filter(function (x) {
      return x.name && x.name?.length > 0;
    });

  if (headers.length >= minTocItems && docNodes.children[docNodes.children.length - 1].loc.end.line >= minLines) {
    var tocLines = [];
    var inferredTitle = determineTitle(docNodes, tocPosition, title, notitle, options?.toc?.header?.content);
    
    var allHeaders = processHeaders(headers, mode);
    var lowestRank = allHeaders.reduce((min, h) => Math.min(min, h.rank), Infinity);
    
    var indentation = options.toc.items.indentation.style === 'tab' ? '\t' : ' ';

    if (options?.toc?.header?.content) { tocLines.push(options.toc.header.content); }
    if (padTitle && inferredTitle) { tocLines.push(''); }
    if (inferredTitle) { tocLines.push(inferredTitle); }
    tocLines.push('');
    var symbolQty = options.toc.items.symbols?.length || 1;

    var count = [];
    var symbols = [];
    tocLines.push(...allHeaders
        .map(function (x) {
          var level = x.rank - lowestRank;
          var symbol;
          if (options.toc.list.format == 'ordered') {
            while (count.length < level) {
              count.push(1);
            }
            var index = (count[level] || 0) + 1;
            count[level] = index;
            if (index > 1) {
              count = count.slice(0, level + 1);
              symbols = symbols.slice(0, level + 1);
            }
          }
          if (options.toc.list.format == 'unordered') {
            symbol = options.toc.items.symbols[level % symbolQty].trim();
          }
          else if (options.toc.list.style === 'number') {
            symbol = count.join('.') + '.';
          }
          else {
            let segment = determineSegment(options.toc.list.style, count[level]);
            symbols[level] = segment;
            symbol = symbols.join('.') + '.';
          }
          return indentation.repeat(level * options.toc.items.indentation.width) + symbol + ' ' + x.anchor;
        }));

    tocLines.push('');
    if (options?.toc?.footer?.content) { tocLines.push(options.toc.footer.content); }

    toc = tocLines.join(eol);
  }

  var data = [];
  var wrappedToc = tocPosition.start.raw + eol + (toc != '' ? toc + eol : '') + tocPosition.end.raw;
  var transformed = !tocPosition?.existing || content.slice(tocPosition.start.range[0], tocPosition.end.range[1]) != wrappedToc;
  
  if (transformed) {
    if (tocPosition.start.range[0] > 0) { data.push(content.slice(0, tocPosition.start.range[0] - eol.length)); }
    data.push(wrappedToc);
    if (!tocPosition.existing && hasBody) { data.push(''); }
    data.push(content.slice(tocPosition.end.range[1] + (tocPosition.existing ? 1 : 0)));
  }
  return { transformed : transformed, data : data.join(eol), toc: toc, wrappedToc: wrappedToc };
};
