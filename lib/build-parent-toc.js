'use strict';

var path = require('path'),
    fs = require('fs'),
    transform = require('./transform');

const markdownExts = ['.md', '.markdown'];
// const ignoredFiles = ['README.md'];
const ignoredFolders = ['.git', '.vscode', 'node_modules']
const tocHeader = '<!-- START doctoc generated TOC please keep comment here to allow auto update -->\n'
                + '<!-- DON\'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->\n',
      tocTitle = 'Table of Contents\n\n',
      tocFooter = '\n<!-- END doctoc generated TOC please keep comment here to allow auto update -->'

function processFolder({
  folder,
  mode = "github.com",
  path = "",
}) {
  let toc = "";
  const changeList = [];
  const folderPath = path + folder;

  if (fs.existsSync(`${folderPath}/README.md`)) {
    toc = processFile(folderPath, 'README.md');
  }

  const [folders, files] = getChildren(folderPath);

  folders.forEach((childFolder) => {
    const { toc: childToc, changeList: childChangeList } = processFolder({
      path: folderPath + '/',
      folder: childFolder,
    });

    changeList.push(...childChangeList);
    toc += childToc;
  });

  files.forEach((file) => {
    if (!file.endsWith('README.md')) {
      toc += processFile(folderPath, file, mode);
    }
  });

  changeList.push(...generateReadmeChange(folderPath, toc));
  toc = prependNameOfFolder(folder, toc);

  return {
    changeList,
    toc,
  }
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

function processFile(path, file, mode) {
  let toc = transform(fs.readFileSync(path + '/' + file, 'utf8'), mode, 12).toc;

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

function generateReadmeChange(folder, toc) {
  if (!toc) {
    return []
  }

  const detailsOpenBlock = '<details><summary>Full TOC</summary>\n';
  const detailsCloseBlock = '</details>'

  const path = `${folder}/README.md`;
  if (fs.existsSync(path)) {
    const data = fs.readFileSync(path, 'utf8')
      .replace(/(Table of Contents\n).*(<!-- END)/gms, `${detailsOpenBlock}\n$1\n${toc}\n${detailsCloseBlock}\n$2`);

    return [{ path, data }]
  } else {
    const data = `${tocHeader}${detailsOpenBlock}\n${tocTitle}${toc}\n${detailsCloseBlock}${tocFooter}`
    return [{ path, data }]
  }
}

function prependNameOfFolder(folder, toc) {
  // replace relative links to links to the readme
  toc = toc.replace(/\((#[\w-\.]+)\)/gm, `(./README.md$1)`);

  // replace existing links from the child toc to include the
  // full folder
  return toc.replace(/\(\.\/*((?:[\w-\.]+\/)*[\w-\.]+\.md#[\w-]+)\)/gm, `(./${folder}/$1)`);
}

module.exports = processFolder;
