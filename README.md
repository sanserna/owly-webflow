# Owly Webflow

A set of utilities for Owly Webflow.

## Project setup

`npm install`

## Build for production

`npm run build`

## Rebuild the bundle when its source files change on disk

`npm run dev`

## Generate new package version

The package versioning follows [Semantic Versioning](https://semver.org/) specification and [npm-version](https://docs.npmjs.com/cli/v8/commands/npm-version) to bump the package version.

Any of the below commands will bump the corresponding version (`major | minor | patch`) and write the new data back to `package.json` and `package-lock.json`. Then runs the `build` script, and adds everything in the `dist` directory to the commit. After the commit, it pushes the new commit and tag up to the server.

`npm run release:patch`: Bump the `patch` version.

`npm run release:minor`: Bump the `minor` version.

`npm run release:major`: Bump the `major` version.
