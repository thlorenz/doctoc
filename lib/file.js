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

function findRec(currentPath, cb) {

    function getStat (entry, cb) {
        var target = path.join(currentPath, entry);
        fs.stat(target, function (err, stat) {
            if (err) { cb(err); return; }

            cb(null, _(stat).extend({ 
                name: entry,
                path: target
            }));
        });
    }
    
    async.waterfall(
        [
            function getAllEntries (cb) {
                fs.readdir(currentPath, cb);
            },

            function gatherStats (entries, cb) {
                async.map(entries, getStat, cb);
            },
            
            function extractMarkdownsAndRecurse (fileInfos, cb) {
                var res = separateFilesAndDirs(fileInfos);
                var tgts = _(res.directories).pluck('path');

                async.map(
                    tgts, 
                    function (x, cb) {
                        process.nextTick(function () { findRec(x, cb); }); 
                    }, 
                    function (markdownFilesInSubdirs) { 
                        var accumulatedRes = _(res.markdownFiles)
                            .concat(markdownFilesInSubdirs);
                        cb(accumulatedRes); 
                    }
                );
            }
        ], 
        function (accumulatedRes) { 
            // last one is undefined, so we filter it out (don't know how that got in there in the first place
            cb(_(accumulatedRes).filter(function (x) { return x !== undefined; }));
        }
    );
}

// Finds all markdown files in given directory and its sub-directories
// @param {String  } dir - the absolute directory to search in 
// @param {Function} cb   - will be called back with markdown files that were found
exports.findMarkdownFiles = function(dir, cb) {
    findRec(dir, cb);
};

// Example:
// findRec(path.join(__dirname, '..', 'samples'), function (res) { console.log('done: ', res); });
