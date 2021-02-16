# How to use:

## Description:
This package is a plugin for esbuild. When used, it will look for a .env file in the current project file's directory, or any parent, until it finds one.
It will combine the found .env variables with the system-wide process.env variables, which can all be used from the project file.
It uses the 'dotenv' package to parse the .env file (the package isn't loaded into your project, only into the esbuild script).

## Installation:
npm install esbuild esbuild-envfile-plugin dotenv --save-dev

## In esbuild script:
```
import envFilePlugin from 'esbuild-envfile-plugin';
```

## Usage in project:
```
import { SOME_ENV_VARIABLE } from 'env';
// or:
import * as env from 'env';
//env.SOME_ENV_VARIABLE;
```

## Example esbuild script:

```
// Config: relative to where npm command is run:
const APP_BASE = 'src';
const ENTRY_FILE = 'index.ts';
const OUTPUT_DIR = 'build';
const OUTPUT_FILE = 'app.js';
const IS_DEV = true;
const TARGET = 'es2018';

function build(entryFile, outFile) {
    require('esbuild').build({
        entryPoints: [entryFile],
        outfile: outFile,
        platform: 'node',
        bundle: true,
        define: { "process.env.NODE_ENV": IS_DEV ? "\"development\"" : "\"product\"" },
        target: TARGET,
        logLevel: 'silent'
        plugins: [envFilePlugin]   // <**************** USAGE ****************
    })
    .then(r => { console.log("Build succeeded.") })
    .catch((e) => {
        console.log("Error building:", e.message);
        process.exit(1)
    })
}

build(`${APP_BASE}/${ENTRY_FILE}`, `${OUTPUT_DIR}/${OUTPUT_FILE}`);
```
