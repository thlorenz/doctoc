#!/usr/bin/env node

'use strict';

var path      =  require('path')
  , fs        =  require('fs')
  , os        =  require('os')
  , minimist  =  require('minimist')
  , file      =  require('./lib/file')
  , transform =  require('./lib/transform')
  , files;

function cleanPath(filepath) {
  var homeExpanded = (filepath.indexOf('~') === 0) ? path.join(os.homedir(), filepath.substr(1)) : filepath;

  return homeExpanded;
}

function transformAndSave(files, mode, maxHeaderLevel, minHeaderLevel, title, notitle, entryPrefix, processAll, stdOut, updateOnly, syntax, dryRun) {
  if (processAll) {
    console.log('--all flag is enabled. Including headers before the TOC location.')
  }

  if (updateOnly) {
    console.log('--update-only flag is enabled. Only updating files that already have a TOC.')
  }

  console.log('\n==================\n');

  var transformed = files
    .map(function (x) {
      var content = fs.readFileSync(x.path, 'utf8')
        , result = transform(content, mode, maxHeaderLevel, minHeaderLevel, title, notitle, entryPrefix, processAll, updateOnly, syntax);
      result.path = x.path;
      return result;
    });
  var changed = transformed.filter(function (x) { return x.transformed; })
    , unchanged = transformed.filter(function (x) { return !x.transformed; })
    , toc = transformed.filter(function (x) { return x.toc; })

  if (stdOut) {
    toc.forEach(function (x) {
      console.log(x.toc)
    })
  }

  unchanged.forEach(function (x) {
    if (stdOut) {
      console.log('==================\n\n"%s" is up to date', x.path)
    }
    else {
      console.log('"%s" is up to date', x.path);
    }
  });

  changed.forEach(function (x) {
    if (stdOut) {
      console.log('==================\n\n"%s" should be updated', x.path)
    } else if (dryRun) {
      console.log('"%s" should be updated but wasn\'t due to dry run.', x.path);
    }
    else {
      console.log('"%s" will be updated', x.path);
      fs.writeFileSync(x.path, x.data, 'utf8');
    }
  });
  if (dryRun && changed.length > 0) {
    process.exitCode = 1;
  }
}

function printUsageAndExit(isErr) {

  var outputFunc = isErr ? console.error : console.info;

  outputFunc('Usage: doctoc [mode] [--entryprefix prefix] [--notitle | --title title] [--maxlevel level] [--minlevel level] [--all] [--update-only] [--syntax (' + supportedSyntaxes.join("|") + ')] <path> (where path is some path to a directory (e.g., .) or a file (e.g., README.md))');
  outputFunc('\nAvailable modes are:');
  for (var key in modes) {
    outputFunc('  --%s\t%s', key, modes[key]);
  }
  outputFunc('Defaults to \'' + mode + '\'.');

  process.exit(isErr ? 2 : 0);
}

var supportedSyntaxes = ['md', 'mdx'];
var modes = {
    bitbucket : 'bitbucket.org'
  , nodejs    : 'nodejs.org'
  , github    : 'github.com'
  , gitlab    : 'gitlab.com'
  , ghost     : 'ghost.org'
}

var mode = modes['github'];

var argv = minimist(process.argv.slice(2)
    , { boolean: [ 'h', 'help', 'T', 'notitle', 's', 'stdout', 'all' , 'u', 'update-only', 'd', 'dryrun'].concat(Object.keys(modes))
    , string: [ 'title', 't', 'maxlevel', 'm', 'minlevel', 'entryprefix', 'syntax' ]
    , unknown: function(a) { return (a[0] == '-' ? (console.error('Unknown option(s): ' + a), printUsageAndExit(true)) : true); }
    });

if (argv.h || argv.help) {
  printUsageAndExit();
}

if (argv['syntax'] !== undefined && !supportedSyntaxes.includes(argv['syntax'])) {
  console.error('Unknown syntax:', argv['syntax']);
  console.error('Supported options:', supportedSyntaxes.join(", "));
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
var processAll = argv.all;
var stdOut = argv.s || argv.stdout || false;
var updateOnly = argv.u || argv['update-only'];
var syntax = argv['syntax'] || 'md';
var dryRun = argv.d || argv.dryrun || false;

var maxHeaderLevel = argv.m || argv.maxlevel;
if (maxHeaderLevel && isNaN(maxHeaderLevel)) { console.error('Max. heading level specified is not a number: ' + maxHeaderLevel), printUsageAndExit(true); }

var minHeaderLevel = argv.minlevel || 1;
if (minHeaderLevel && isNaN(minHeaderLevel) || minHeaderLevel < 0) { console.error('Min. heading level specified is not a positive number: ' + minHeaderLevel), printUsageAndExit(true); }
else if (minHeaderLevel && minHeaderLevel > 2) { console.error('Min. heading level: ' + minHeaderLevel + ' is not currently supported as greater than 2'), printUsageAndExit(true); }

if (maxHeaderLevel && maxHeaderLevel < minHeaderLevel) { console.error('Max. heading level: ' + maxHeaderLevel + ' is less than the defined Min. heading level: ' + minHeaderLevel), printUsageAndExit(true); }

if (argv._.length > 1 && stdOut) {
  console.error('--stdout cannot be used to process multiple files/directories. Use --dryrun instead.');
  process.exitCode = 2;
  return;
}

for (var i = 0; i < argv._.length; i++) {
  var target = cleanPath(argv._[i])
    , stat = fs.statSync(target);

  if (stat.isDirectory() && stdOut) {
    console.error('--stdout cannot be used to process a directory. Use --dryrun instead.');
    process.exitCode = 2;
    return;
  }

  if (stat.isDirectory()) {
    console.log ('\nDocToccing "%s" and its sub directories for %s.', target, mode);
    files = file.findMarkdownFiles(target, syntax);
  } else {
    console.log ('\nDocToccing single file "%s" for %s.', target, mode);
    files = [{ path: target }];
  }

  transformAndSave(files, mode, maxHeaderLevel, minHeaderLevel, title, notitle, entryPrefix, processAll, stdOut, updateOnly, syntax, dryRun);

  if (dryRun && process.exitCode === 1) {
    console.log('\nDocumentation tables of contents are out of date.');
  }
  else {
    console.log('\nEverything is OK.');
  }
}

module.exports.transform = transform;
