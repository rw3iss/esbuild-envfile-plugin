const path = require("path");
const fs = require("fs");

const ENV = process.env.NODE_ENV || "development";

function _findEnvFile(dir) {
    try {
        if (!fs.existsSync(dir)) {
            return undefined;
        } else if (fs.existsSync(`${dir}/.env.${ENV}`)) {
            return `${dir}/.env.${ENV}`;
        } else if (fs.existsSync(`${dir}/.env`)) {
            return `${dir}/.env`;
        } else {
            const next = path.resolve(dir, "../");
            if (next === dir) {
                // at root now, exit
                return undefined;
            } else {
                return _findEnvFile(next);
            }
        }
    } catch(e) {
        console.warn("Exception in esbuild-envfile-plugin _findEnvFile():", e);
    }
}

module.exports = {
    name: "env",

    setup(build) {
        build.onResolve({ filter: /^env$/ }, async (args) => {
            return {
                path: args.path,
                pluginData: {
                    ...args.pluginData,
                    envPath: _findEnvFile(args.resolveDir),
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
                } catch(e) {
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
