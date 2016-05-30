README to test doctoc with edge-case headers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Single Backticks](#single-backticks)
- [Multiple Backticks](#multiple-backticks)
- [code tag](#code-tag)
- [pre tag](#pre-tag)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Single Backticks
`<h2>not me single backticks</h2>`
`## nor me single backticks`

## Multiple Backticks
```
<h2>not me fenced</h2>
## nor me fenced
not even me fenced
------------------
```

## code tag
<code><h2>not me code</h2></code>
<code>## nor me code</code>

## pre tag
<pre>
    <h2>not me pre</h2>
    ## nor me pre
    not even me pre
    -------
</pre>
