const path = require("path");
const fs = require("fs");

const ENV = process.env.NODE_ENV || "development";

module.exports = {
    name: "env",

    setup(build) {
        function _findEnvFile(dir) {
            if (!fs.existsSync(dir)) return false;
            return fs.existsSync(`${dir}/.env.${ENV}`)
                ? `${dir}/.env.${ENV}`
                : fs.existsSync(`${dir}/.env`)
                ? `${dir}/.env`
                : undefined; // _findEnvFile(path.resolve(dir, "../")); // removed 6-3-22 RW, causing callstack issue #5
        }

        build.onResolve({ filter: /^env$/ }, async (args) => {
            // find a .env file in current directory or any parent:
            return {
                path: _findEnvFile(args.resolveDir),
                namespace: "env-ns",
            };
        });

        build.onLoad({ filter: /.*/, namespace: "env-ns" }, async (args) => {
            // read in .env file contents and combine with regular .env:
            let data = await fs.promises.readFile(args.path, "utf8");
            const buf = Buffer.from(data);
            const config = require("dotenv").parse(buf);

            return {
                contents: JSON.stringify({ ...process.env, ...config }),
                loader: "json",
            };
        });
    }
};
