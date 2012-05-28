var path  =  require('path'),
    fs    =  require('fs'),
    async =  require('async'),
    _     =  require('underscore');

var markdownExts = ['.md', '.markdown'];
var ignoredDirs  = ['.', '..', '.git', 'node_modules'];

function separateFilesAndDirs(fileInfos) {
    return {
        directories :  _(fileInfos).filter(function (x) {
            return x.isDirectory() && !_(ignoredDirs).include(x.name);
        }),
        markdownFiles :  _(fileInfos).filter(function (x) { 
            return x.isFile() && _(markdownExts).include(path.extname(x.name)); 
        })
    };
}

function findRec(currentPath) {
    function getStat (entry) {
        var target = path.join(currentPath, entry),
            stat = fs.statSync(target);

        return  _(stat).extend({ 
            name: entry,
            path: target
        });
    }
    
    function process (fileInfos) {
        var res = separateFilesAndDirs(fileInfos);
        var tgts = _(res.directories).pluck('path');

        console.log('Processing: ', currentPath);

        if (res.markdownFiles.length > 0) 
            console.log('Found: \n  %s', _(res.markdownFiles).pluck('name').join('\n  '));
        if (tgts.length > 0) 
            console.log('Traversing into: \n  %s', tgts.join('\n  ')); 
        return { 
            markdownFiles: res.markdownFiles,
            subdirs     : tgts
        };
    }

    var stats                  =  _(fs.readdirSync(currentPath)).map(getStat),
        res                    =  process(stats),
        markdownsInSubdirs     =  _(res.subdirs).map(findRec),
        allMarkdownsHereAndSub =  res.markdownFiles.concat(markdownsInSubdirs);

    return allMarkdownsHereAndSub;
}

// Finds all markdown files in given directory and its sub-directories
// @param {String  } dir - the absolute directory to search in 
// @param {Function} cb   - will be called back with markdown files that were found
exports.findMarkdownFiles = function(dir) {
    return findRec(dir);
};

/* Example:
console.log('\033[2J'); // clear console

var res = findRec(path.join(__dirname, '..', 'samples'));
console.log('Result: ', res);
*/
