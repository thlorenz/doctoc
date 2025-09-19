# Repository Guidelines

## Dos and Don'ts

- Do rely on `package.json` for scripts and dependencies and stick with `npm`; avoid swapping in other package managers.
- Do run targeted test files with `node test/<file>.js` while iterating, then finish with `npm test` before publishing.
- Do preserve the existing `var` + `require` style and spacing in `lib/` and `doctoc.js`; skip wholesale refactors to ES modules.
- Do update `README.md` when CLI flags or behavior change; avoid duplicating information that already lives there.
- Don’t introduce new runtime dependencies without checking whether helpers in `lib/` already cover the need.
- Don’t alter the doctoc wrapper comments (`<!-- START/END doctoc ... -->`); reuse the helpers in `lib/transform.js` to modify TOCs.

## Project Structure and Module Organization

- `doctoc.js` is the CLI entry point that parses flags and delegates to the transform helpers.
- Core logic lives in `lib/`, including `lib/transform.js` for TOC generation, `lib/file.js` for recursive markdown discovery, and `lib/get-html-headers.js` for HTML heading support.
- Tests sit in `test/`; each `test/*.js` file is a Tap script, with markdown fixtures under `test/fixtures/`.
- Continuous integration is defined in `.github/workflows/node.js.yml`, running installs and tests across Node 14.x, 16.x, 18.x, 20.x, and 22.x.
- `package.json` (and `package-lock.json`) tracks dependencies and the `npm test` script; treat it as the source of truth for tool versions.
- `README.md` documents user-facing behavior and options; align any feature work with the explanations there.

## Build, Test, and Development Commands

- Install dependencies with `npm install`; this is required before executing the CLI or tests.
- Run the full suite via `npm test`, which iterates `node test/*.js` in order (see `package.json`).
- Execute a focused test with `node test/transform-stdout.js` (or another file in `test/`).
- Preview CLI output without editing files by running `node doctoc.js README.md --stdout` from the repository root.
- When adjusting fixtures, refer to paths such as `test/fixtures/readme-with-code.md` to keep references accurate.

## Coding Style and Naming Conventions

- JavaScript is CommonJS with `'use strict';` headers; keep using `require` and `module.exports` as in the existing modules.
- Maintain two-space indentation and the aligned spacing around `=` and commas found in variable declarations (e.g., `var path      = require('path')`).
- Prefer single-quoted strings and follow the local convention for optional semicolons; match the surrounding file when in doubt.
- Comments use `//` or `/* */` with concise en-US phrasing; keep Tap assertion messages descriptive but short.
- Add helpers to `lib/` when sharing logic between CLI and tests; avoid duplicating parsing or formatting code.
- Keep CLI option names and defaults synchronized between `doctoc.js` and the documentation in `README.md`.

## Testing Guidelines

- Tests use Tap; follow the pattern in `test/transform.js` with `require('tap').test` blocks for new cases.
- Place reusable markdown samples in `test/fixtures/` to keep test files compact and readable.
- For CLI-focused behavior, model new checks on `test/transform-stdout.js` to validate stdout.
- Run `node test/<file>.js` while developing, then `npm test` to confirm the entire suite before opening a PR.
- Update existing fixtures and expectations when TOC formatting rules change, ensuring assertions still mirror real output.

## Commit and Pull Request Guidelines

- Use short, imperative subject lines similar to `Add Node.js v20 and v22 CI environment` from the history.
- Keep each commit focused on one change; include a brief body explaining the why when behavior shifts or dependencies move.
- Ensure `npm test` succeeds locally; CI mirrors that command in `.github/workflows/node.js.yml`.
- Reference related issues or PRs in commit bodies when applicable, and refresh `README.md` for user-visible changes.
- Share before/after snippets or screenshots only when demonstrating CLI output changes that impact users.

## Safety and Permissions

- Ask before adding dependencies, deleting files, or modifying CI configuration; those changes have wider impact.
- Avoid sweeping refactors, mass formatting, or switching module systems without explicit approval.
- You may list and read files, and run targeted commands like `node test/<file>.js` or `npm test`, without extra confirmation.
- Do not run destructive git commands (`git reset --hard`, force pushes) or modify published artifacts from this repository.
- When scope is unclear, propose a plan or ask for clarification before editing large areas of the codebase.
- Keep secrets and credentials out of fixtures, tests, and documentation; this project does not require environment-based secrets.
