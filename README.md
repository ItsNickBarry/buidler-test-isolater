# Buidler Test Isolater

Reinitialize the Buidler Runtime Environment before each Mocha test.

## Installation

```bash
yarn add --dev https://github.com/ItsNickBarry/buidler-test-isolater
```

## Usage

Load plugin in Buidler config:

```javascript
usePlugin('buidler-test-isolater');
```

This plugin is intended for use in combination with the `buidler-ganache` plugin when testing against a forked network.  Re-initializing the network before each test prevents errors such as the following:

```
Error: Returned error: project ID does not have access to archive state
```

This plugin is not compatible with Mocha `describe`-level [exclusive tests](https://mochajs.org/#exclusive-tests).

Isolated tests are run via a temporary file `.buidler_test_isolater_tmp.js` created in the buidler `tests` directory.  This file is deleted upon test completion, but may not be removed if test execution halts unexpectedly; therefore, it should be added to the `.gitignore` file or deleted manually.
