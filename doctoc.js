#!/usr/bin/env node

'use strict';

var path    =  require('path')
  , fs    =  require('fs')
  , _     =  require('underscore')
  , file    =  require('./lib/file')
  , transform =  require('./lib/transform')
  , argv    =  process.argv
  , files;

function cleanPath(path) {
  var homeExpanded = (path.indexOf('~') === 0) ? process.env.HOME + path.substr(1) : path;

  // Escape all spaces
  return homeExpanded.replace(/\s/g, '\\ ');
}

function transformAndSave(files) {
  console.log('\n==================\n');
  
  _(files)
    .chain()
    .map(function (x) {
      var content = fs.readFileSync(x.path, 'utf8');
      return transform(x, content);
    })
    .filter(function (x) { return x.transformed; })
    .each(function (x) { 
      fs.writeFileSync(x.path, x.data, 'utf8'); 
    });
}

if (argv.length !== 3) {
  console.log('Usage: doctoc <path> (where path is some path to a directory (i.e. .) or a file (i.e. README.md) )');
  process.exit(0);
}

var target = cleanPath(argv[2]),
  stat = fs.statSync(target);

if (stat.isDirectory()) {
  console.log ('\nDocToccing "%s" and its sub directories.', target);
  files = file.findMarkdownFiles(target);
} else {
  console.log ('\nDocToccing single file "%s".', target);
  files = [{ path: target }];
}

transformAndSave(files);

console.log('\nEverything is OK.');

