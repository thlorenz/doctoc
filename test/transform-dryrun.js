'use strict';
/*jshint asi: true */

var test = require('tap').test,
    fs = require('fs'),
    exec = require("child_process").exec;

test('\nshould exit with a error code due to --dryrun option', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-out_of_date_toc.md --dryrun', function (error, stdout, stderr) {
      if (error) {
        t.same(error.code, 1, 'process exited with error code 1 as expected');
        t.end('process did have an error');
      } else {
        t.fail('process did not produce an error: ' + error);
        t.end();
      }
    })
})

test('\nshould exit with an error code due to invalid option', function (t) {

    exec('node doctoc.js test/fixtures/readme-syntax.md --dryrun --random', function (error, stdout, stderr) {
      if (error) {
        t.same(error.code, 2, 'process exited with error code 2 as expected');
        t.end('process has invalid option');
      } else {
        t.fail('process did not produce an error: ' + error);
        t.end();
      }
    })
})

test('\nshould exit with an error code due to invalid syntax', function (t) {

    exec('node doctoc.js test/fixtures/readme-syntax.md --dryrun --syntax github', function (error, stdout, stderr) {
      if (error) {
        t.same(error.code, 2, 'process exited with error code 2 as expected');
        t.end('process has invalid syntax');
      } else {
        t.fail('process did not produce an error: ' + error);
        t.end();
      }
    })
})

test('\nhelp should not produce an error code', function (t) {

    exec('node doctoc.js test/fixtures/readme-syntax.md --dryrun --help', function (error, stdout, stderr) {
      if (error) {
        t.fail('help process produced an error: ' + error);
        t.end();
      } else {
        t.end();
      }
    })
})

test('\nshould exit with no error code with --dryrun, --github and --update-only options', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-custom-title.md --dryrun --github --update-only', function (error, stdout, stderr) {
      if (error) {
        t.fail('process produced an unexpected error: ' + error);
        t.end()
      } else {
        t.end('process did not have an error');
      }
    })
})

test('\nshould exit with no error code with --dryrun, --github and --update-only options', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-notitle.md --dryrun --github --update-only', function (error, stdout, stderr) {
      if (error) {
        t.fail('process produced an unexpected error: ' + error);
        t.end()
      } else {
        t.end('process did not have an error');
      }
    })
})

test('\nshould exit no error code when not using --dryrun and using --all for out of date toc', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-out_of_date_toc.md --stdout --all', function (error, stdout, stderr) {
      if (error) {
        t.fail('process produced an unexpected error: ' + error);
        t.end()
      } else {
        t.end('process did not have an error');
      }
    })
})

test('\nshould exit with no error code', function (t) {

    exec('node doctoc.js test/fixtures/readme-with-custom-title.md', function (error, stdout, stderr) {
      if (error) {
        t.fail('process produced an unexpected error: ' + error);
        t.end()
      } else {
        t.end('process did not have an error');
      }
    })
})
