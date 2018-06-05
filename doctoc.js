#!/usr/bin/env node

'use strict';

var path      =  require('path')
  , fs        =  require('fs')
  , minimist  =  require('minimist')
  , file      =  require('./lib/file')
  , transform =  require('./lib/transform')
  , md        =  require('markdown-to-ast')
  , files;

function cleanPath(path) {
  var homeExpanded = (path.indexOf('~') === 0) ? process.env.HOME + path.substr(1) : path;

  // Escape all spaces
  return homeExpanded.replace(/\s/g, '\\ ');
}

function transformAndSave(files, mode, maxHeaderLevel, title, notitle, entryPrefix, stdOut, mainToc, saveMainOnly) {
  console.log('\n==================\n');

  var transformed = files
    .map(function (x) {
      var content = fs.readFileSync(x.path, 'utf8')
        , result = transform(content, mode, maxHeaderLevel, title, notitle, entryPrefix, mainToc);
      result.path = x.path;
      return result;
    });
  var changed = transformed.filter(function (x) { return x.transformed; })
    , unchanged = transformed.filter(function (x) { return !x.transformed; })
    , toc = transformed.filter(function (x) { return x.toc; })

  if (stdOut && (!saveMainOnly || mainToc)) {
    toc.forEach(function (x) {
      console.log(x.toc)
    })
  }

  unchanged.forEach(function (x) {
    if (!saveMainOnly || mainToc) {
      console.log('"%s" is up to date', x.path);
    }
  });

  changed.forEach(function (x) {
    if (stdOut && (!saveMainOnly || mainToc)) {
      console.log('==================\n\n"%s" should be updated', x.path)
    } else if (!saveMainOnly || mainToc) {
      console.log('"%s" will be updated', x.path);
      fs.writeFileSync(x.path, x.data, 'utf8');
    }
  });

  if (mainToc === undefined) {
    // aggregate all tocs into a big one
    var toc = transformed.map(function (x) {
      // add paths to all the links
      return md.parse(x.toc).children.filter(function (y) {
        return y.type === md.Syntax.List;
      }).map(function (y) {
        var links = flattenSublists(y);
        return links;
      }).reduce(function (arr, arr1) {
        return arr.concat(arr1);
      }).map(function (link) {
        var text = '  '.repeat(link.level) + '- [' + link.name + '](' +
          x.path + link.link + ')';
        return text;
      }).join('\n');
    }).join('\n'); // Ensure there are newlines between each toc in a directory
    return toc + '\n';
  }
}

function flattenSublists(list, level) {
  var array = [];
  level = level || 0;
  list.children.forEach(function (y) {
    var link_node = y.children[0].children[0];
    var link = link_node.url;
    array.push({link: link, name: link_node.children[0].raw, level: level});
    // add subheadings
    if (y.children.length === 2) {
      array = array.concat(flattenSublists(y.children[1], level + 1));
    }
  });
  return array;
}

function printUsageAndExit(isErr) {

  var outputFunc = isErr ? console.error : console.info;

  outputFunc('Usage: doctoc [mode] [--entryprefix prefix] [--notitle | --title title] [--maxlevel level] <path> (where path is some path to a directory (e.g., .) or a file (e.g., README.md))');
  outputFunc('\nAvailable modes are:');
  for (var key in modes) {
    outputFunc('  --%s\t%s', key, modes[key]);
  }
  outputFunc('Defaults to \'' + mode + '\'.');

  process.exit(isErr ? 2 : 0);
}

var modes = {
    bitbucket : 'bitbucket.org'
  , nodejs    : 'nodejs.org'
  , github    : 'github.com'
  , gitlab    : 'gitlab.com'
  , ghost     : 'ghost.org'
}

var mode = modes['github'];

var argv = minimist(process.argv.slice(2)
    , { boolean: [ 'h', 'help', 'T', 'notitle', 's', 'stdout' ].concat(Object.keys(modes))
    , string: [ 'title', 't', 'maxlevel', 'm', 'entryprefix', 'main' ]
    , unknown: function(a) { return (a[0] == '-' ? (console.error('Unknown option(s): ' + a), printUsageAndExit(true)) : true); }
    });

if (argv.h || argv.help) {
  printUsageAndExit();
}

for (var key in modes) {
  if (argv[key]) {
    mode = modes[key];
  }
}

var title = argv.t || argv.title;
var notitle = argv.T || argv.notitle;
var entryPrefix = argv.entryprefix || '-';
var stdOut = argv.s || argv.stdout

var maxHeaderLevel = argv.m || argv.maxlevel;
if (maxHeaderLevel && isNaN(maxHeaderLevel) || maxHeaderLevel < 0) { console.error('Max. heading level specified is not a positive number: ' + maxHeaderLevel), printUsageAndExit(true); }

var mainToc = '';
for (var i = 0; i < argv._.length; i++) {
  var target = cleanPath(argv._[i])
    , stat = fs.statSync(target)

  if (stat.isDirectory()) {
    console.log ('\nDocToccing "%s" and its sub directories for %s.', target, mode);
    files = file.findMarkdownFiles(target);
  } else {
    console.log ('\nDocToccing single file "%s" for %s.', target, mode);
    files = [{ path: target }];
  }

  mainToc += transformAndSave(files, mode, maxHeaderLevel, title, notitle, entryPrefix, stdOut, undefined, /* saveMainOnly */ argv.main);
  console.log('\nEverything is OK.');
}

if (argv.main) {
  target = cleanPath(argv.main);
  console.log('\nDocToccing main TOC file "%s" for %s.', target, mode);
  transformAndSave([{ path: target }], mode, maxHeaderLevel, title, notitle, entryPrefix, stdOut, mainToc, /* saveMainOnly */ argv.main);
  console.log('\nEverything is OK.');
}
