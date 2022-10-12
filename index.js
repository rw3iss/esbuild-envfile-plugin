const fs = require("fs");

const ENV = process.env.NODE_ENV || "development";

function _findEnvFile(dir) {
    if (!fs.existsSync(dir)) return false;
    return fs.existsSync(`${dir}/.env.${ENV}`)
        ? `${dir}/.env.${ENV}`
        : fs.existsSync(`${dir}/.env`)
            ? `${dir}/.env`
            : _findEnvFile(path.resolve(dir, "../")); //undefined
}

module.exports = {
    name: "env",

    setup(build) {

        build.onResolve({ filter: /^env$/ }, async (args) => {
            return {
                path: _findEnvFile(args.pluginData.currentDir),
                //path: args.path,
                namespace: "env-ns",
            };
        });

        build.onLoad({ filter: /.*/, namespace: "env-ns" }, async (args) => {
            //let envPath = _findEnvFile(args.pluginData.currentDir)
            let envPath = args.path;
            let contents = JSON.stringify(process.env)

            if (envPath) {
                // read in .env file contents and combine with regular .env:
                let data = await fs.promises.readFile(envPath, "utf8")
                const buf = Buffer.from(data)
                const config = require("dotenv").parse(buf)
                contents = JSON.stringify({ ...process.env, ...config })
            }

            return {
                contents,
                loader: "json",
            };
        });
    }
};
