var path  =  require('path'),
    fs    =  require('fs'),
    async =  require('async'),
    _     =  require('underscore'),
    file  =  require('./lib/file');

// TODO: from commandline
var dir = 'samples';

function isAbsolute(path) {
    if ('/' == path[0]) return true;
    if (':' == path[1] && '\\' == path[2]) return true;
}


var target = isAbsolute(dir) ? dir : path.join(__dirname, dir);

function transformAndSave(files, fcb) {
    console.log('Adding table of content to %s files.', files.length);

    async.forEach(
        files, 
        function (f, cb) {
            fs.readFile(f.path, 'utf8', function (err, content) {
                if (err) { console.log(err); cb();  return; }
                transform(f, content, cb);
            });
        },
        fcb);
}

function transform (f, content, cb) {
    console.log('transforming', f);
    console.log(content);
    cb();
}



file.findMarkdownFiles(target, function (files) {
    transformAndSave(files, function () { console.log('Everything is OK'); }); 
});

