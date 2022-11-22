//const envFilePlugin = require('esbuild-envfile-plugin');
const envFilePlugin = require('../index.js'); // use for "live" testing :)
const dotenv = require('dotenv');
const path = require('path');
const { getNormalizedEnvDefines } = require('./utils');

// Config: relative to where npm command is run:
const APP_BASE = './src';
const ENTRY_FILE = 'index.js';
const OUTPUT_DIR = 'build';
const OUTPUT_FILE = 'app.js';
const TARGET = 'es2020';

// try to use dotenv to load in custom local env vars to existing node runtime env vars:
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.local';
dotenv.config({ path: envFile })

// collect all new env vars wrapped in quotes for passage to build define
const { define } = getNormalizedEnvDefines();

function build(entryFile, outFile) {
    console.log('build() ', entryFile, '=>', outFile)
    require('esbuild').build({
        entryPoints: [path.resolve(entryFile)],
        outfile: path.resolve(outFile),
        platform: 'node',
        bundle: true,
        target: TARGET,
        logLevel: 'silent',
        plugins: [envFilePlugin],
        define
    })
        .then(r => { console.log("Build succeeded.") })
        .catch((e) => {
            console.log("Error building:", e.message);
            process.exit(1)
        })
}

build(`${APP_BASE}/${ENTRY_FILE}`, `${OUTPUT_DIR}/${OUTPUT_FILE}`);