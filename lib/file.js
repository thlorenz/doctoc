const { normalizeSyntax } = require("./utils/helpers");

var path = require("path"),
  fs = require("fs"),
  os = require("os"),
  log = require('loglevel');

var ignoredDirs  = ['.', '..', '.git', 'node_modules'];
var allowedExts = ['.mdx', '.md', '.markdown'];
var syntaxMapping = {
  '.mdx': 'jsx',
  '.md': 'html', 
  '.markdown': 'html',
};

function cleanPath(filePath) {
  return (filePath.indexOf('~') === 0) ? path.join(os.homedir(), filePath.substr(1)) : filePath;
}

function findRec(paths, syntax) {
  var results = [];
  var stack = [...paths];

  while (stack.length > 0) {
    var markdownFiles = [];
    var currentPath = stack.pop();
    var fileInfos = fs.readdirSync(currentPath, { withFileTypes: true });

    for (var fileInfo of fileInfos) {
      var fullPath = path.join(currentPath, fileInfo.name);

      if (fileInfo.isDirectory() && !ignoredDirs.includes(fileInfo.name)) {
        stack.push(fullPath);
      }

      if (fileInfo.isFile() && allowedExts.includes(path.extname(fileInfo.name)) &&
          (syntax === undefined || syntax === syntaxMapping[path.extname(fileInfo.name)])) {
        markdownFiles.push({
          path: fullPath,
          name: fileInfo.name,
          syntax: syntax ?? syntaxMapping[path.extname(fileInfo.name)]
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
  var target = cleanPath(dir);
  var stat = fs.statSync(target);
  // TODO: remove in v3
  syntax = normalizeSyntax(syntax);
  if (stat.isDirectory()) {
    log.debug('\nDocToccing "%s" and its sub directories', dir);
    return findRec([target], syntax);
  } else {
    log.debug('\nDocToccing single file "%s".', dir);
    return [{
      path: target,
      name: path.basename(target),
      syntax: syntax ?? syntaxMapping[path.extname(path.basename(target))]
    }];
  }
};
