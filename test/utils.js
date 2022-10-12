var fs = require("fs");

module.exports = {

    getNormalizedEnvVars: () => {
        const define = {};
        const defineNoQuotes = {};

        for (const k in process.env) {
            // Bypass windows errors
            if (k === 'CommonProgramFiles(x86)' || k === 'ProgramFiles(x86)') {
                continue;
            }

            define[`process.env.${k}`] = JSON.stringify(process.env[k]);
            defineNoQuotes[`process.env.${k}`] = process.env[k];
        }

        return { define, defineNoQuotes };
    },

    mkDirSync: (dir) => {
        if (fs.existsSync(dir)) {
            return;
        }

        try {
            fs.mkdirSync(dir);
        } catch (err) {
            if (err.code == 'ENOENT') {
                mkdirSync(path.dirname(dir))
                mkdirSync(dir)
            }
        }
    }

}
