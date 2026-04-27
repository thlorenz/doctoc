#!/usr/bin/env node

"use strict";

var path = require("path"),
  fs = require("fs"),
  os = require("os"),
  minimist = require("minimist"),
  file = require("./lib/file"),
  transform = require("./lib/transform"),
  log = require('loglevel'),
  files;

function cleanPath(filePath) {
  var homeExpanded = (filePath.indexOf('~') === 0) ? path.join(os.homedir(), filePath.substr(1)) : filePath;

  return homeExpanded;
}

function transformAndSave(files, mode, maxHeaderLevel, minHeaderLevel, minTocItems, title, notitle, entryPrefix, processAll, stdOut, updateOnly, syntax, dryRun, options) {
  if (processAll) {
    log.debug('--all flag is enabled. Including headers before the TOC location.');
  }

  if (updateOnly) {
    log.debug('--update-only flag is enabled. Only updating files that already have a TOC.');
  }

  log.debug('\n==================\n');

  var transformed = files
    .map(function (x) {
      var content = fs.readFileSync(x.path, 'utf8')
        , result = transform(content, mode, maxHeaderLevel, minHeaderLevel, minTocItems, title, notitle, entryPrefix, processAll, updateOnly, syntax, options);
      result.path = x.path;
      return result;
    });
  var changed = transformed.filter(function (x) { return x.transformed; }),
    unchanged = transformed.filter(function (x) { return !x.transformed; }),
    toc = transformed.filter(function (x) { return x.toc; });

  if (stdOut) {
    toc.forEach(function (x) {
      console.log(x.toc);
    });
  }

  unchanged.forEach(function (x) {
    if (stdOut) {
      console.log('==================\n\n"%s" is up to date', x.path);
    }
    else {
      log.debug('"%s" is up to date', x.path);
    }
  });

  changed.forEach(function (x) {
    if (stdOut) {
      console.log('==================\n\n"%s" should be updated', x.path);
    } else if (dryRun) {
      log.warn('"%s" should be updated but wasn\'t due to dry run.', x.path);
    }
    else {
      log.info('"%s" will be updated', x.path);
      fs.writeFileSync(x.path, x.data, "utf8");
    }
  });
  if (dryRun && changed.length > 0) {
    process.exitCode = 1;
  }
}

function printUsageAndExit(isErr) {
  var outputFunc = isErr ? log.error : log.info;

  outputFunc('Usage: doctoc [mode] [--entryprefix prefix] [--notitle | --title title] [--maxlevel level] [--minlevel level] [--mintocitems qty] [--toc-location location] [--toc-pragma-style style] [--toc-header-content content] [--toc-footer-content content] [--toc-items-indentation-width width] [--all] [--loglevel level] [--update-only] [--syntax (' + supportedSyntaxes.join("|") + ')] <path> (where path is some path to a directory (e.g., .) or a file (e.g., README.md))');
  outputFunc('\nAvailable modes are:');
  for (var key in modes) {
    outputFunc("  --%s\t%s", key, modes[key]);
  }
  outputFunc("Defaults to '" + mode + "'.");

  process.exit(isErr ? 2 : 0);
}

var supportedSyntaxes = ['md', 'mdx'];
var modes = {
  bitbucket: "bitbucket.org",
  nodejs: "nodejs.org",
  github: "github.com",
  gitlab: "gitlab.com",
  ghost: "ghost.org",
};

var mode = modes["github"];

var argv = minimist(process.argv.slice(2),
    {
      boolean: [ 'h', 'help', 'T', 'notitle', 's', 'stdout', 'all' , 'u', 'update-only', 'd', 'dryrun'].concat(Object.keys(modes)),
      string: [ 'title', 't', 'maxlevel', 'm', 'minlevel', 'entryprefix', 'syntax', 'mintocitems', 'toc-location', 'toc-title-padding-before', 'toc-header-content', 'toc-footer-content', 'toc-pragma-style', 'toc-items-indentation-width', 'document-lines-min', 'l', 'loglevel' ],
      unknown: function(a) { return (a[0] == '-' ? (console.error('Unknown option(s): ' + a), printUsageAndExit(true)) : true); }
    });

var logLevel = argv.l || argv.loglevel || "info";

try {
  log.setLevel(logLevel, false);
}
catch (e) {
  console.error('Unknown log level: ' + logLevel);
  console.error('Supported options: trace, debug, info, warn, error');
  process.exitCode = 2;
  return;
}

if (argv.h || argv.help) {
  log.setLevel("info");
  printUsageAndExit();
}

if (argv['syntax'] !== undefined && !supportedSyntaxes.includes(argv['syntax'])) {
  log.error('Unknown syntax:', argv['syntax']);
  log.error('Supported options:', supportedSyntaxes.join(", "));
  process.exit(2);
  return;
}
for (var key in modes) {
  if (argv[key]) {
    mode = modes[key];
  }
}

var title = argv.t || argv.title;
var notitle = argv.T || argv.notitle;
var entryPrefix = argv.entryprefix || '-';
var minTocItems = argv.mintocitems || 1;
if (minTocItems && (isNaN(minTocItems) || minTocItems <= 0)) { log.error('Min. TOC items specified is not a positive number: ' + minTocItems), printUsageAndExit(true); }
var processAll = argv.all;
var stdOut = argv.s || argv.stdout || false;
var updateOnly = argv.u || argv['update-only'];
var syntax = argv['syntax'] || 'md';
var dryRun = argv.d || argv.dryrun || false;

var padBeforeTitle = argv['toc-title-padding-before'];
if (padBeforeTitle && isNaN(padBeforeTitle) || padBeforeTitle < 0) { console.error('Padding before title specified is not a positive number: ' + padBeforeTitle), printUsageAndExit(true); }
else if (padBeforeTitle && padBeforeTitle > 1) { console.error('Padding before title: ' + padBeforeTitle + ' is not currently supported as greater than 1'), printUsageAndExit(true); }

var maxHeaderLevel = argv.m || argv.maxlevel;
if (maxHeaderLevel && isNaN(maxHeaderLevel)) { log.error('Max. heading level specified is not a number: ' + maxHeaderLevel), printUsageAndExit(true); }

var minHeaderLevel = argv.minlevel || 1;
if (minHeaderLevel && isNaN(minHeaderLevel) || minHeaderLevel < 0) { log.error('Min. heading level specified is not a positive number: ' + minHeaderLevel), printUsageAndExit(true); }
else if (minHeaderLevel && minHeaderLevel > 2) { log.error('Min. heading level: ' + minHeaderLevel + ' is not currently supported as greater than 2'), printUsageAndExit(true); }

if (maxHeaderLevel && maxHeaderLevel < minHeaderLevel) { log.error('Max. heading level: ' + maxHeaderLevel + ' is less than the defined Min. heading level: ' + minHeaderLevel), printUsageAndExit(true); }

var indentWidth = argv['toc-items-indentation-width'];
if (indentWidth !== undefined && isNaN(indentWidth)) { log.error('ToC indentation width: ' + indentWidth + ' is not a number'), printUsageAndExit(true); }
else if (indentWidth === undefined) { indentWidth = (mode === 'bitbucket.org' || mode === 'gitlab.com') ? 4 : 2; }

var minLines = argv['document-lines-min'] || 0;
if (isNaN(minLines)) { log.error('Document min lines: ' + minLines + ' is not a number'), printUsageAndExit(true); }

var location = argv['toc-location'] || 'top';
if (location != 'top' && location != 'before') { log.error('Location specified is not valid: ' + location), printUsageAndExit(true); }

var options = {
  document: {
    lines: {
      min: Number(minLines) || 0,
    }
  },
  toc: {
    pragma: {
      style: argv['toc-pragma-style'] || 'legacy',
    },
    header: {
      content: argv['toc-header-content'],
    },
    items: {
      indentation:{
        width: indentWidth,
      }
    },
    location: location,
    title: {
      padding: {
        before: padBeforeTitle ?? (notitle ? 1 : 0),
      }
    },
    footer: {
      content: argv['toc-footer-content'],
    }
  }
}

if (options.toc.pragma.style != "legacy" && options.toc.pragma.style != "compact"){ log.error('TOC pragma style is not supported: ' + options.toc.pragma.style), printUsageAndExit(true); }

if (argv._.length > 1 && stdOut) {
  console.error('--stdout cannot be used to process multiple files/directories. Use --dryrun instead.');
  process.exitCode = 2;
  return;
}

for (var i = 0; i < argv._.length; i++) {
  var target = cleanPath(argv._[i]),
    stat = fs.statSync(target);

  if (stat.isDirectory() && stdOut) {
    console.error('--stdout cannot be used to process a directory. Use --dryrun instead.');
    process.exitCode = 2;
    return;
  }

  if (stat.isDirectory()) {
    log.debug('\nDocToccing "%s" and its sub directories for %s.', target, mode);
    files = file.findMarkdownFiles(target, syntax);
  } else {
    log.debug('\nDocToccing single file "%s" for %s.', target, mode);
    files = [{ path: target }];
  }

  transformAndSave(files, mode, maxHeaderLevel, minHeaderLevel, minTocItems, title, notitle, entryPrefix, processAll, stdOut, updateOnly, syntax, dryRun, options);

  if (dryRun && process.exitCode === 1) {
    log.warn('\nDocumentation tables of contents are out of date.');
  }
  else {
    log.info('\nEverything is OK.');
  }
}

module.exports.transform = transform;
