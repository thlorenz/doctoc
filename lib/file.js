var path  =  require('path')
 ,  fs  =  require('fs')
 ,  _   =  require('underscore');

var ignoredDirs  = ['.', '..', '.git', 'node_modules'];
var extensions = {
  mdx: ['.mdx'],
  md: ['.md', '.markdown'],
}
function separateFilesAndDirs(fileInfos, syntax) {
  return {
    directories :  _(fileInfos).filter(function (x) {
      return x.isDirectory() && !_(ignoredDirs).include(x.name);
    }),
    markdownFiles :  _(fileInfos).filter(function (x) {
      return x.isFile() && _(extensions[syntax]).include(path.extname(x.name));
    })
  };
}

function findRec(currentPath, syntax) {
  function getStat (entry) {
    var target = path.join(currentPath, entry),
      stat = fs.statSync(target);

    return  _(stat).extend({
      name: entry,
      path: target
    });
  }

  function process (fileInfos) {
    var res = separateFilesAndDirs(fileInfos, syntax);
    var tgts = _(res.directories).pluck('path');

    if (res.markdownFiles.length > 0)
      console.log('\nFound %s in "%s"', _(res.markdownFiles).pluck('name').join(', '), currentPath);
    else
      console.log('\nFound nothing in "%s"', currentPath);

    return {
      markdownFiles :  res.markdownFiles,
      subdirs     :  tgts
    };
  }

  var stats                  =  _(fs.readdirSync(currentPath)).map(getStat)
    , res                    =  process(stats)
    , markdownsInSubdirs     =  _(res.subdirs).map((subdir)=> findRec(subdir, syntax))
    , allMarkdownsHereAndSub =  res.markdownFiles.concat(markdownsInSubdirs);

  return _(allMarkdownsHereAndSub).flatten();
}

// Finds all markdown files in given directory and its sub-directories
// @param {String  } dir - the absolute directory to search in
exports.findMarkdownFiles = function(dir, syntax) {
  return findRec(dir, syntax);
};

/* Example:
console.log('\033[2J'); // clear console

var res = findRec(path.join(__dirname, '..', 'samples'));
console.log('Result: ', res);
*/
