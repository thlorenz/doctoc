var path = require("path"),
  fs = require("fs"),
  log = require('loglevel');

var ignoredDirs  = ['.', '..', '.git', 'node_modules'];
var extensions = {
  mdx: ['.mdx'],
  md: ['.md', '.markdown'],
};

function findRec(currentPath, syntax) {
  var fileInfos = fs.readdirSync(currentPath, { withFileTypes: true });
  var markdownFiles = fileInfos.filter(x =>
      x.isFile() && (extensions[syntax] || []).includes(path.extname(x.name))
    )
    .map(x => ({
      path: path.join(currentPath, x.name),
      name: x.name
    }));
  var markdownsInSubdirs = fileInfos.filter(x =>
      x.isDirectory() && !ignoredDirs.includes(x.name)
    )
    .map(d => findRec(path.join(currentPath, d.name), syntax));

  if (markdownFiles.length > 0)
    log.debug('\nFound %s in "%s"', markdownFiles.map(f => f.name).join(', '), currentPath);
  else
    log.trace('\nFound nothing in "%s"', currentPath);

  return markdownFiles.concat(markdownsInSubdirs).flat();
}

// Finds all markdown files in given directory and its sub-directories
// @param {String  } dir - the absolute directory to search in
exports.findMarkdownFiles = function (dir, syntax) {
  return findRec(dir, syntax);
};
