var path = require("path"),
  fs = require("fs"),
  log = require('loglevel');

var ignoredDirs  = ['.', '..', '.git', 'node_modules'];
var extensions = {
  mdx: ['.mdx'],
  md: ['.md', '.markdown'],
};

function findRec(paths, syntax) {
  var allowedExts = extensions[syntax] || [];
  var results = [];
  var stack = paths;

  while (stack.length > 0) {
    var markdownFiles = [];
    var currentPath = stack.pop();
    var fileInfos = fs.readdirSync(currentPath, { withFileTypes: true });

    for (var fileInfo of fileInfos) {
      var fullPath = path.join(currentPath, fileInfo.name);

      if (fileInfo.isDirectory() && !ignoredDirs.includes(fileInfo.name)) {
        stack.push(fullPath);
      }

      if (fileInfo.isFile() && allowedExts.includes(path.extname(fileInfo.name)) {
        markdownFiles.push({
          path: fullPath,
          name: fileInfo.name
        });
      }
    }

    if (markdownFiles.length > 0)
      log.debug('\nFound %s in "%s"', markdownFiles.map(f => f.name).join(', '), currentPath);
    else
      log.trace('\nFound nothing in "%s"', currentPath);

    results.push(...markdownFiles);
  }

  return results;
}

// Finds all markdown files in given directory and its sub-directories
// @param {String  } dir - the absolute directory to search in
exports.findMarkdownFiles = function (dir, syntax) {
  return findRec([dir], syntax);
};
