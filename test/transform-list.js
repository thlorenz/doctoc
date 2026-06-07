test('\nNumerical ToC ', function (t) {
  var content = fs.readFileSync(__dirname + '/fixtures/readme-formatting.md', 'utf8');
  var transformedContent = transform(content, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { 
    { toc: { list: { style: 'number', format: 'ordered' } } }
  });

  t.same(
    transformedContent.toc,
    [
        '**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*',
        '',
        '1. [My Module](#my-module)',
        '  1.1. [API](#api)',
        '    1.1.1. [Method One](#method-one)',
        '    1.1.2. [Method Two](#method-two)',
        '      1.1.2.1. [Main Usage](#main-usage)',
        '  1.2. [Some More](#some-more)'
        ''
    ].join('\n'),
    'TOC is not correctly formatted'
  )
  t.end()
});
