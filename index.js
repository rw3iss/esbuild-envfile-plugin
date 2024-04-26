const path = require("path");
const fs = require("fs");
const { findEnvFile } = require("./utils");

const DEFAULT_ENV = process.env.NODE_ENV || "development";

module.exports = {
    name: "env",

    setup(build) {
        build.onResolve({ filter: /^env$/ }, async (args) => {
            const rootPath = path.resolve('.');
            const env = ((build.initialOptions?.define || {})['process.env.NODE_ENV'] || DEFAULT_ENV).replace(/"/g, '');
            return {
                path: args.path,
                pluginData: {
                    ...args.pluginData,
                    envPath: findEnvFile(args.resolveDir, rootPath, env),
                },
                namespace: "env-ns",
            };
        });

        build.onLoad({ filter: /.*/, namespace: "env-ns" }, async (args) => {
            let envPath = args.pluginData?.envPath;
            let config = {};
            let contents = '{}';

            if (envPath) {
                try {
                    // read in .env file contents and combine with regular .env:
                    let data = await fs.promises.readFile(envPath, "utf8");
                    const buf = Buffer.from(data);
                    config = require("dotenv").parse(buf);
                    contents = JSON.stringify({ ...process.env, ...config });
                } catch (e) {
                    console.warn('Exception in esbuild-envfile-plguin build.onLoad():', e);
                }
            } else {
                contents = JSON.stringify(process.env);
            }

            return {
                contents,
                loader: "json",
            };
        });
    },
};