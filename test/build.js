const envFilePlugin = require('./build/envfilePlugin.js');
const esbuild = require('esbuild');
const dotenv = require('dotenv');

const { getNormalizedEnvVars } = require('./utils');

// Config: relative to where npm command is run:
const APP_BASE = './src';
const ENTRY_FILE = 'index.js';
const OUTPUT_DIR = 'build';
const OUTPUT_FILE = 'app.js';
const IS_DEV = true;
const TARGET = 'es2020';

// load in environment variables as global defines for the to use
dotenv.config({ path: `.env${process.env.NODE_ENV ? `${process.env.NODE_ENV}` : ``}` })

const { define } = getNormalizedEnvVars();

function build(entryFile, outFile) {
    console.log('build() ', entryFile, '=>', outFile)
    require('esbuild').build({
        entryPoints: [entryFile],
        outfile: outFile,
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