# Repository Guidelines

## Project Structure & Module Organization

This is a Joplin plugin built from TypeScript. `src/index.ts` is the plugin entry point, and `src/manifest.json` holds the plugin ID, version, and metadata. Put plugin assets and any future content scripts under `src/`; list compiled extra scripts in `plugin.config.json`. The `api/` directory contains Joplin API type declarations used by the source. `webpack.config.js` is the generator-managed build configuration. Builds produce `dist/` and the distributable `.jpl` plus metadata in `publish/`.

## Build, Test, and Development Commands

- `npm ci`: install the locked development dependencies. Its `prepare` script also runs a build.
- `npm run dist`: compile TypeScript, copy assets, and create the archive in `publish/`.
- `npx tsc --noEmit`: check TypeScript types without writing output.
- `npm run updateVersion`: increment the patch version in `package.json` and `src/manifest.json`; use only when preparing a release.

For a local check, build the plugin and load the generated `.jpl` in Joplin's plugin settings. See `GENERATOR_DOC.md` for generator and packaging details.

## Coding Style & Naming Conventions

Follow the existing TypeScript style in `src/`: tabs for indentation, single quotes, semicolons, and camelCase identifiers. Name new source files for their role (for example, `typstRenderer.ts`). Keep Joplin integration in the plugin entry point or focused modules imported from it. Preserve the tab-indented JSON style of the manifest. No formatter or lint command is configured in `package.json`; avoid broad formatting changes.

## Testing Guidelines

There is currently no automated test suite or coverage requirement. For behavior changes, run `npx tsc --noEmit` and `npm run dist`, then exercise the affected action in Joplin. If tests are added, place them beside the relevant source or in a `test/` directory, name them `*.test.ts`, and add a documented `npm test` script.

## Commit & Pull Request Guidelines

This checkout has no Git history, so no established commit format can be verified. Use short, imperative subjects such as `Add Typst rendering command`. Pull requests should explain the user-facing change, note the Joplin version used for manual checks, list the commands run, and include screenshots when the UI changes. Keep generated `publish/` artifacts aligned with source and manifest changes when a release archive is part of the pull request.
