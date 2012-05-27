var path  =  require('path'),
    fs    =  require('fs'),
    async =  require('async'),
    _     =  require('underscore'),
    file  =  require('./lib/file');

// TODO: from commandline
var dir = 'tmp_samples';

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

function getMarkdownHtml(anchor) {
    return  null;
}

function addLink(header) {
    return _(header).extend({ 
        link:  '#' + header.title.trim().toLowerCase().replace(/ /g,'-')
    });
}

function getHashedHeaders (_lines) {
    // Find headers of the form '### xxxx xxx xx'
    return _lines
        .map(function (x) {
            var match = /^(\#{1,8})[ ]*(.+)$/.exec(x);
            if (match) {
                return { 
                    rank  :  match[1].length,
                    title :  match[2]
                };
            } else {
                return null;
            }
        })
        .filter(function (x) { return  x !== null; })
        .value();
}

function getUnderlinedHeaders (_lines) {
    // Find headers of the form
    // h1       h2
    // ==       --

   return []; 
}


function transform (f, content, cb) {
    var lines = content.split('\n'),
        _lines = _(lines).chain(),

        allHeaders = getHashedHeaders(_lines)
            .concat(getUnderlinedHeaders(_lines)),

        linkedHeaders = _(allHeaders).map(addLink);
        
    console.log(linkedHeaders); 
    cb();
}

file.findMarkdownFiles(target, function (files) {
    transformAndSave(files, function () { console.log('Everything is OK'); }); 
});

