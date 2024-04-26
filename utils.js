const findEnvFile = (dir, rootPath, env) => {
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
            return findEnvFile(next, rootPath, env);
        }
        return undefined;
    } catch (e) {
        console.warn("Exception in esbuild-envfile-plugin findEnvFile():", e);
    }
}

module.exports = {
    findEnvFile
}