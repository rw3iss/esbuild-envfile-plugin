const path = require("path");
const fs = require("fs");

const DEFAULT_ENV = process.env.NODE_ENV || "development";

function _findEnvFile(dir, rootPath, env) {
    try {
        if (fs.existsSync(`${dir}/.env.${env}`)) {
            return `${dir}/.env.${env}`;
        } else if (fs.existsSync(`${dir}/.env`)) {
            return `${dir}/.env`;
        } else if (dir && dir != '/') {
            if (dir === rootPath) {
                // stop at project root
                return undefined;
            }
            const next = path.resolve(dir, "../");
            return _findEnvFile(next, rootPath, env);
        }
        return undefined;
    } catch (e) {
        console.warn("Exception in esbuild-envfile-plugin _findEnvFile():", e);
    }
}

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
                    envPath: _findEnvFile(args.resolveDir, rootPath, env),
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
            }

            return {
                contents,
                loader: "json",
            };
        });
    },
};
