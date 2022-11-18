const path = require("path");
const fs = require("fs");

const ENV = process.env.NODE_ENV || "development";

function _findEnvFile(dir) {
    if (!fs.existsSync(dir)) return undefined;

    if (fs.existsSync(`${dir}/.env.${ENV}`)) {
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

            if (envPath) {
                // read in .env file contents and combine with regular .env:
                let data = await fs.promises.readFile(envPath, "utf8");
                const buf = Buffer.from(data);
                config = require("dotenv").parse(buf);
            }

            return {
                // let dotenv override system environment variables
                contents: JSON.stringify({ ...process.env, ...config }),
                loader: "json",
            };
        });
    },
};
