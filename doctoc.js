#!/usr/bin/env node

'use strict';

var path      =  require('path')
  , fs        =  require('fs')
  , minimist  =  require('minimist')
  , file      =  require('./lib/file')
  , transform =  require('./lib/transform')
  , files;

function cleanPath(path) {
  var homeExpanded = (path.indexOf('~') === 0) ? process.env.HOME + path.substr(1) : path;

  // Escape all spaces
  return homeExpanded.replace(/\s/g, '\\ ');
}

function transformAndSave(files, options) {
  console.log('\n==================\n');

  files.forEach(function (x) {
    var content = fs.readFileSync(x.path, 'utf8')
    
    if (options.minLines) {
      var lines = content.split('\n')
      if(lines.length < options.minLines) {
        console.log('"%s" will be ignored', x.path);
        return;
      }
    } 
    
    var result = transform(content, options);

    if (result.toc && options.stdOut) {
      console.log(result.toc)
    }

    if(result.transformed) {
      if(options.stdOut) {
        console.log('==================\n\n"%s" should be updated', x.path)
      } else {
        console.log('"%s" will be updated', x.path);
        fs.writeFileSync(x.path, result.data, 'utf8');
      }
    } else {
      console.log('"%s" is up to date', x.path);
    } 
  });
}

function printUsageAndExit(isErr) {

  var outputFunc = isErr ? console.error : console.info;

  outputFunc('Usage: doctoc [mode] [--entryprefix prefix] [--notitle | --title title] [--maxlevel level] [--minlines lines] <path> (where path is some path to a directory (e.g., .) or a file (e.g., README.md))');
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
  , { boolean: [ 'h', 'help', 'T', 'notitle', 's', 'stdout'].concat(Object.keys(modes))
    , string: [ 'title', 't', 'maxlevel', 'm', 'entryprefix', 'minlines', 'l' ]
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
if (maxHeaderLevel) {
  maxHeaderLevel = parseInt(maxHeaderLevel);

  if(isNaN(maxHeaderLevel) || maxHeaderLevel < 0) {
    console.error('Max. heading level specified is not a positive number: ' + maxHeaderLevel);
    printUsageAndExit(true);
  }
}

var minLines = argv.minlines || argv.l;
if (minLines) {
  minLines = parseInt(minLines);

  if (isNaN(minLines) || minLines < 1) {
    console.error('Min. lines specified is not a positive number: ' + minLines);
    printUsageAndExit(true);
  }
} else {
  minLines = 30;
}

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

  transformAndSave(files, {
    mode: mode,
    maxHeaderLevel: maxHeaderLevel,
    title: title,
    notitle: notitle,
    entryPrefix: entryPrefix,
    stdOut: stdOut,
    minLines: minLines
  });

  console.log('\nEverything is OK.');
}

module.exports.transform = transform;
