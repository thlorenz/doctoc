#!/usr/bin/env node

'use strict';

var path      =  require('path')
  , fs        =  require('fs')
  , file      =  require('./lib/file')
  , transform =  require('./lib/transform')
  , argv      =  process.argv
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

var modes = [ 
  [ 'bitbucket', 'bitbucket.org' ]
, [ 'nodejs'   , 'nodejs.org'    ]
, [ 'github'   , 'github.com'    ]
, [ 'gitlab'   , 'gitlab.com'    ]
, [ 'ghost'    , 'ghost.org'     ]
];

var mode = 'github.com'

if (argv.length < 3) {
  logError('Usage: doctoc [mode] <path> (where path is some path to a directory (i.e. .) or a file (i.e. README.md) )');
  logError('\nAvailable modes are:');
  for (var i = 0; i < modes.length; i++) {
    logError('  --%s\t%s', modes[i][0], modes[i][1]);
  }
  logError('Defaults to \'github.com\'.')
  process.exit(0);
}

for (var i = 0; i < modes.length; i++) {
  var idx = argv.indexOf('--' + modes[i][0]);
  if (~idx) {
    mode = modes[i][1];
    argv.splice(idx, 1);
    break;
  }
}

var target = cleanPath(argv[2])
  , stat = fs.statSync(target)

var stdoutIdx = argv.indexOf('--stdout');

if (~stdoutIdx) {
  output = 'stdout';
  argv.splice(stdoutIdx, 1);
}




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
