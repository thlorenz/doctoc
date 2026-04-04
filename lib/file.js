var path = require("path"),
  fs = require("fs"),
  log = require('loglevel');

var ignoredDirs  = ['.', '..', '.git', 'node_modules'];
var extensions = {
  mdx: ['.mdx'],
  md: ['.md', '.markdown'],
};

function separateFilesAndDirs(fileInfos, syntax) {
  return {
    directories: fileInfos.filter(x =>
      x.isDirectory() && !ignoredDirs.includes(x.name)
    ),
    markdownFiles: fileInfos.filter(x =>
      x.isFile() && (extensions[syntax] || []).includes(path.extname(x.name))
    ),
  };
}

function findRec(currentPath, syntax) {
  function getStat(entry) {
    var target = path.join(currentPath, entry),
      stat = fs.statSync(target);

    return Object.assign(stat, {
      name: entry,
      path: target,
    });
  }

  function process (fileInfos) {
    var res = separateFilesAndDirs(fileInfos, syntax);
    var tgts = res.directories.map(d => d.path);

    if (res.markdownFiles.length > 0)
      log.debug('\nFound %s in "%s"', res.markdownFiles.map(f => f.name).join(', '), currentPath);
    else
      log.trace('\nFound nothing in "%s"', currentPath);

    return {
      markdownFiles: res.markdownFiles,
      subdirs: tgts
    };
  }

  var stats = fs.readdirSync(currentPath).map(getStat),
    res = process(stats),
    markdownsInSubdirs = res.subdirs.map((subdir)=> findRec(subdir, syntax)),
    allMarkdownsHereAndSub = res.markdownFiles.concat(markdownsInSubdirs);

  return allMarkdownsHereAndSub.flat();
}

// Finds all markdown files in given directory and its sub-directories
// @param {String  } dir - the absolute directory to search in
exports.findMarkdownFiles = function (dir, syntax) {
  return findRec(dir, syntax);
};
