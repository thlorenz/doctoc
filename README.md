# DocToc [![build status](https://secure.travis-ci.org/thlorenz/doctoc.png)](http://travis-ci.org/thlorenz/doctoc)

[![NPM](https://nodei.co/npm/doctoc.png?downloads=true&stars=true)](https://nodei.co/npm/doctoc/)

Generates table of contents for markdown files inside local git repository. Links are compatible with anchors generated
by github or other sites via a command line flag.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation](#installation)
- [Usage](#usage)
  - [Adding toc to all files in a directory and sub directories](#adding-toc-to-all-files-in-a-directory-and-sub-directories)
  - [Adding toc to a single file](#adding-toc-to-a-single-file)
    - [Example](#example)
  - [Using doctoc to generate links compatible with other sites](#using-doctoc-to-generate-links-compatible-with-other-sites)
    - [Example](#example-1)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Installation

    npm install -g doctoc

## Usage

### Adding toc to all files in a directory and sub directories

Go into the directory that contains you local git project and type:
    
    doctoc .

This will update all markdown files in the current directory and all its
subdirectories with a table of content that will point at the anchors generated
by the github markdown parser.

### Adding toc to a single file

If you want to convert only a specific file, do:

    doctoc /path/to/file

To output result to stdout, instead of a file, do:

    doctoc --stdout /path/to/file

#### Example

    doctoc README.md

### Using doctoc to generate links compatible with other sites

In order to add a table of contents whose links are compatible other sites add the appropriate mode flag:

Available modes are:

```
--bitbucket	bitbucket.org
--nodejs	  nodejs.org
--github	  github.com
--gitlab	  gitlab.com
--ghost	    ghost.org
```

#### Example

    doctoc README.md --bitbucket
