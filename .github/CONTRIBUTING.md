# Contributing to vscode-httpyac

From opening a bug report to creating a pull request: every contribution is appreciated and welcome. If you're planning to implement a new feature or change the api please create an issue first. 

## Issues

If you just want some help or a detail question about httpyac, please check the
[httpyac (ZW edition) wiki](https://github.com/ZeroWiggliness/httpyac/wiki). Questions
that include an example and/or the full error message are more likely to receive responses.

**If you have discovered a bug or have a feature suggestion, please [create an issue on GitHub](https://github.com/ZeroWiggliness/vscode-httpyac/issues/new).**
**Please note that httpyac provides a [plugin interface.](https://github.com/ZeroWiggliness/httpyac/wiki)**

## Submitting Changes

After getting some feedback, push to your fork and submit a pull request. We may suggest some changes or improvements or alternatives, but for small changes your pull request should be accepted quickly. 
If there is no issue, an explanatory comment would be helpful.
Pull request titles must follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat: ...`, `fix: ...`), which is checked by the `PR Lint` workflow.
The pull request executes [Github action `Continuous Integration`](https://github.com/ZeroWiggliness/vscode-httpyac/blob/main/.github/workflows/ci.yml), which must pass successfully.

## Development Setup

This project uses [NodeJS LTS](https://nodejs.org/en/download/) and npm v7 for development. As development editor I recommend VS Code (but VSCodium should work).

``` sh
# install dependencies
npm i

# compile 
npm run compile

# watch
npm run watch
```

## Debug

1. Open project in VS Code
2. Run `npm run watch` in Terminal
3. Start Debug Launch Configuration `launch` (`F5`).
4. A new VSCode Editor with active extension should open

### Debug VS Code Extension + httpyac 

2. Open Terminal in httpac and execute `npm link` and `npm run watch`
2. Open project in VS Code
3. Run `npm link httpyac` and `npm run watch` in Terminal
4. Start Debug Launch Configuration `launch with httpyac` (`F5`).
5. A new VSCode Editor with active extension should open
