'use strict';

var path = require('path'),
    fs = require('fs'),
    transform = require('./transform');

const markdownExts = ['.md', '.markdown'];
// const ignoredFiles = ['README.md'];
const ignoredFolders = ['.git', '.vscode', 'node_modules']
const tocHeader = '<!-- START doctoc generated TOC please keep comment here to allow auto update -->\n'
                + '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->\n'
                + 'Table of Contents\n\n',
      tocFooter = '\n<!-- END doctoc generated TOC please keep comment here to allow auto update -->'

function processFolder(path, folder) {
  let tocs = "";

  const folderPath = path + folder;

  if (fs.existsSync(`${folderPath}/README.md`)) {
    tocs = processFile(folderPath, 'README.md');
  }

  const children = getChildren(folderPath),
    folders = children[0],
    files = children[1];

  folders.forEach((childFolder) => {
    tocs += processFolder(folderPath + '/', childFolder);
  });

  files.forEach((file) => {
    if (!file.endsWith('README.md')) {
      tocs += processFile(folderPath, file);
    }
  });

  writeTocsToReadMe(folderPath, tocs);

  return prependNameOfFolder(folder, tocs);
}

function getChildren(folder) {
  let folders = [], files = [];

  var children = fs.readdirSync(folder);

  for (let index = 0; index < children.length; index++) {
    var childName = children[index];

    if (ignoredFolders.includes(childName)) {
      continue;
    }

    var filePathString = folder + '/' + childName;

    if (fs.statSync(filePathString).isDirectory()) {
      folders.push(childName);
    } else if (markdownExts.includes(path.extname(childName))) {
      files.push(childName);
    }
  }

  return [folders, files];
}

function processFile(path, file) {
  let toc = transform(fs.readFileSync(path + '/' + file, 'utf8'), 'github.com', 12).toc;

  if (!toc) {
    return '';
  }

  toc = toc.replace('Table of Contents\n\n', '');

  if (!file.endsWith('README.md')) {
    toc = toc.replace(/\(#([a-z0-9\-]+)\)/gm, `(./${file}#$1)`);
  }

  toc += "\n";

  return toc;
}

function writeTocsToReadMe(folder, tocs) {
  if (fs.existsSync(`${folder}/README.md`)) {
    console.log(`Writing to existing ${folder}/README.md`);
    let fileData = fs.readFileSync(`${folder}/README.md`, 'utf8').replace(/(Table of Contents\n).*(<!-- END)/gms, `$1\n${tocs}\n$2`);
    fs.writeFileSync(`${folder}/README.md`, fileData, 'utf8');
  } else {
    console.log(`Writing to non-existing ${folder}/README.md`);
    fileData = tocHeader + tocs + tocFooter;
    fs.writeFileSync(`${folder}/README.md`, fileData, 'utf8');
  }
}

function prependNameOfFolder(folder, tocs) {
  tocs = tocs.replace(/\((#[\d\w-]+)\)/gm, `(./README.md$1)`);
  return tocs.replace(/\(\.\/*((?:[\d\w]*\/)*[\d\w-\.]+#[\d\w-]+)\)/gm, `(./${folder}/$1)`);
}

module.exports = processFolder;