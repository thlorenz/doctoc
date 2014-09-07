#!/usr/bin/env node

'use strict';

var path      =  require('path')
  , fs        =  require('fs')
  , file      =  require('./lib/file')
  , transform =  require('./lib/transform')
  , argv      =  process.argv
  , mode      =  'github.com'
  , output    =  'file'
  , files;

function cleanPath(path) {
  var homeExpanded = (path.indexOf('~') === 0) ? process.env.HOME + path.substr(1) : path;

  // Escape all spaces
  return homeExpanded.replace(/\s/g, '\\ ');
}

function transformAndSave(files, mode) {
  log('\n==================\n');
  
  var transformed = files
    .map(function (x) {
      var content = fs.readFileSync(x.path, 'utf8')
        , result = transform(content, mode);
      result.path = x.path;
      return result;
    });

  if (output != 'stdout') {
    var changed = transformed.filter(function (x) { return x.transformed; })
      , unchanged = transformed.filter(function (x) { return !x.transformed; });

    unchanged.forEach(function (x) {
      log('"%s" is up to date', x.path);
    });

    changed.forEach(function (x) { 
      log('"%s" will be updated', x.path);
      fs.writeFileSync(x.path, x.data, 'utf8'); 
    });
  } else {
    process.stdout.write(transformed[0].data);
  }
}

function log(msg) {
  if (output != 'stdout') {
    console.log(msg);
  }
}
function logError(msg) {
  process.stderr.write(msg + '\n');
}

if (argv.length < 3) {
  logError('Usage: doctoc <path> (where path is some path to a directory (i.e. .) or a file (i.e. README.md) )');
  process.exit(0);
}

var bitbucketIdx = argv.indexOf('--bitbucket');

if (~bitbucketIdx) {
  mode = 'bitbucket.org';
  argv.splice(bitbucketIdx, 1);
}


var stdoutIdx = argv.indexOf('--stdout');

if (~stdoutIdx) {
  output = 'stdout';
  argv.splice(stdoutIdx, 1);
}



var target = cleanPath(argv[2]),
  stat = fs.statSync(target);

if (stat.isDirectory()) {
  if (output == 'file') {
    log ('\nDocToccing "%s" and its sub directories for %s.', target, mode);
    files = file.findMarkdownFiles(target);
  } else {
    logError ('Error: --stdout flag can only be used with single files.');
  }

} else {
  log ('\nDocToccing single file "%s" for %s.', target, mode);
  files = [{ path: target }];
}

transformAndSave(files, mode);

log('\nEverything is OK.');

