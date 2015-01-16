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
  - [Update existing doctoc TOCs effortlessly](#update-existing-doctoc-tocs-effortlessly)
  - [Adding toc to a single file](#adding-toc-to-a-single-file)
    - [Example](#example)
  - [Using doctoc to generate links compatible with other sites](#using-doctoc-to-generate-links-compatible-with-other-sites)
    - [Example](#example-1)
  - [Specifying location of toc](#specifying-location-of-toc)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Installation

    npm install -g doctoc

## Usage

### Adding toc to all files in a directory and sub directories

Go into the directory that contains you local git project and type:
    
    doctoc .

This will update all markdown files in the current directory and all its
subdirectories with a table of content that will point at the anchors generated
by the markdown parser. Doctoc defaults to using the GitHub parser, but other [modes can be specified](#using-doctoc-to-generate-links-compatible-with-other-sites).

### Update existing doctoc TOCs effortlessly

If you already have a TOC inserted by doctoc, it will automatically be updated by running the command (rather than inserting a duplicate toc).

### Adding toc to a single file

If you want to convert only a specific file, do:

    doctoc /path/to/file

#### Example

    doctoc README.md

### Using doctoc to generate links compatible with other sites

In order to add a table of contents whose links are compatible other sites add the appropriate mode flag:

Available modes are:

```
--bitbucket bitbucket.org
--nodejs    nodejs.org
--github    github.com
--gitlab    gitlab.com
--ghost     ghost.org
```

#### Example

    doctoc README.md --bitbucket

### Specifying location of toc

By default, doctoc places the toc at the top of the file. You can indicate to have it placed elsewhere with the following format:

```
<!-- START doctoc -->
<!-- END doctoc -->
```

You place this code directly in your .md file. For example:

```
// my_new_post.md
Here we are, introducing the post. It's going to be great!
But first: a TOC for easy reference.

<!-- START doctoc -->
<!-- END doctoc -->

# Section One

Here we'll discuss...

```

Running doctoc will insert the toc to that location.