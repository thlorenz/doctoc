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

function getMarkdownHtml(anchor) {
    return  null;
}

function notNull(x) { return  x !== null; }

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
            
            return match ?  { 
                    rank  :  match[1].length,
                    title :  match[2]
                } : null;
        })
        .filter(notNull)
        .value();
}

function getUnderlinedHeaders (_lines) {
    // Find headers of the form
    // h1       h2
    // ==       --
    
    return _lines
        .map(function (line, index, lines) {
            if (index === 0) return null;
            var rank = null;
                
            if (/^==+/.exec(line))      rank = 1;
            else if (/^--+/.exec(line)) rank =2;
            else                        return null;

            return {
                rank:   rank,
                title:  lines[index - 1]
            };
        })
        .filter(notNull)
        .value();
}

function transform (f, content, cb) {
    var lines = content.split('\n'),
        _lines = _(lines).chain(),

        allHeaders = getHashedHeaders(_lines).concat(getUnderlinedHeaders(_lines)),
        linkedHeaders = _(allHeaders).map(addLink);

    console.log(f.name);    
    console.log(linkedHeaders); 
    cb();
}

file.findMarkdownFiles(target, function (files) {
    transformAndSave(files, function () { console.log('Everything is OK'); }); 
});

